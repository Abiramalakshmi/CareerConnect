import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchJobById } from '../../services/jobService';
import { applyToJob, fetchMyApplications } from '../../services/applicationService';
import { useAuth } from '../../hooks/useAuth';
import StatusBadge from '../../components/StatusBadge';
import { formatSalary, formatDate, sentence } from '../../utils/format';

export default function JobDetails() {
  const { id } = useParams();
  const { isSignedIn, role, profile, loading: authLoading } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // The candidate's existing application for this job, if any.
  const [myApplication, setMyApplication] = useState(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchJobById(id);
        if (!cancelled) setJob(data);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError('This job could not be loaded. It may have been removed.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Check whether the signed-in candidate has already applied here.
  useEffect(() => {
    if (!isSignedIn || role !== 'candidate') return;

    let cancelled = false;
    fetchMyApplications()
      .then((apps) => {
        if (cancelled) return;
        const existing = apps.find((a) => a.job_id === id);
        if (existing) setMyApplication(existing);
      })
      .catch((err) => console.error(err));

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, role, id]);

  async function handleApplySubmit(e) {
    e.preventDefault();
    setApplying(true);
    setApplyError(null);

    try {
      const application = await applyToJob(id, coverLetter);
      setMyApplication(application);
      setShowApplyForm(false);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 409) {
        setApplyError('You have already applied to this job.');
      } else if (err.response?.data?.error) {
        setApplyError(err.response.data.error);
      } else {
        setApplyError('Your application was not sent. Try again in a moment.');
      }
    } finally {
      setApplying(false);
    }
  }

  if (loading) return <div className="page text-muted">Loading...</div>;
  if (error) return <div className="page text-danger">{error}</div>;
  if (!job) return <div className="page text-muted">Job not found.</div>;

  const facts = [
    ['Location', job.location],
    ['Work mode', job.work_mode && sentence(job.work_mode)],
    ['Job type', job.job_type && sentence(job.job_type)],
    ['Experience', job.experience_level && sentence(job.experience_level)],
    ['Salary', formatSalary(job.salary_min, job.salary_max)],
    ['Apply by', formatDate(job.deadline)],
  ].filter(([, value]) => value);

  const isCandidate = isSignedIn && role === 'candidate';

  return (
    <div className="page">
      <Link to="/jobs" className="text-sm text-muted underline hover:text-ink">
        Back to all jobs
      </Link>

      <header className="mt-4">
        <h1 className="text-3xl font-bold sm:text-4xl">{job.title}</h1>
        <p className="mt-1 text-lg text-muted">{job.company}</p>
      </header>

      <div className="mt-8 grid gap-10 md:grid-cols-[1fr_20rem]">
        <div className="max-w-prose space-y-8">
          <section>
            <h2 className="text-lg font-semibold">About the role</h2>
            <p className="mt-2 whitespace-pre-line leading-relaxed">{job.description}</p>
          </section>

          {job.requirements && (
            <section>
              <h2 className="text-lg font-semibold">What you need</h2>
              <p className="mt-2 whitespace-pre-line leading-relaxed">{job.requirements}</p>
            </section>
          )}
        </div>

        <aside className="h-fit space-y-5 rounded-lg border border-line bg-surface p-5">
          <dl className="space-y-3 text-sm">
            {facts.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-muted">{label}</dt>
                <dd className="text-right font-medium">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="border-t border-line pt-5">
            {!authLoading && !isSignedIn && (
              <>
                <Link to="/sign-in" className="btn btn-primary w-full">
                  Sign in to apply
                </Link>
                <p className="mt-2 text-sm text-muted">
                  New here?{' '}
                  <Link to="/sign-up" className="underline">
                    Create an account
                  </Link>
                </p>
              </>
            )}

            {isSignedIn && role === 'recruiter' && (
              <p className="text-sm text-muted">
                You're signed in as a recruiter, so you can't apply to jobs.
              </p>
            )}

            {isCandidate && myApplication && (
              <div>
                <p className="text-sm text-muted">Your application</p>
                <div className="mt-1">
                  <StatusBadge status={myApplication.status} />
                </div>
                <Link to="/candidate/applications" className="mt-3 inline-block text-sm underline">
                  View all your applications
                </Link>
              </div>
            )}

            {isCandidate && !myApplication && job.status !== 'open' && (
              <p className="text-sm text-muted">This job is closed to new applications.</p>
            )}

            {isCandidate && !myApplication && job.status === 'open' && !showApplyForm && (
              <button
                type="button"
                onClick={() => setShowApplyForm(true)}
                className="btn btn-primary w-full"
              >
                Apply now
              </button>
            )}

            {isCandidate && !myApplication && job.status === 'open' && showApplyForm && (
              <form onSubmit={handleApplySubmit} className="space-y-3">
                <div>
                  <label htmlFor="cover-letter" className="label">
                    Cover letter (optional)
                  </label>
                  <textarea
                    id="cover-letter"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={5}
                    className="field"
                    placeholder="Say why this role fits you."
                  />
                </div>

                {profile && !profile.resume_path ? (
                  <p className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm">
                    You need a resume before you can apply.{' '}
                    <Link to="/candidate/profile" className="underline">
                      Add one to your profile
                    </Link>
                    .
                  </p>
                ) : (
                  <p className="text-sm text-muted">Your profile resume will be attached.</p>
                )}

                {applyError && <p className="text-sm text-danger">{applyError}</p>}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={applying || !profile?.resume_path}
                    className="btn btn-primary flex-1"
                  >
                    {applying ? 'Sending...' : 'Send application'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowApplyForm(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
