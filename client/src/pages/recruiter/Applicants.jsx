import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  fetchApplicantsForJob,
  updateApplicationStatus,
  fetchApplicantResumeUrl,
} from '../../services/applicationService';
import { formatDate, sentence } from '../../utils/format';

const STATUS_OPTIONS = ['applied', 'under_review', 'shortlisted', 'hired', 'rejected'];

export default function Applicants() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApplicantsForJob(jobId);
      setJob(data.job);
      setApplications(data.applications);
    } catch (err) {
      console.error(err);
      setError('The applicants could not be loaded. Try again in a moment.');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStatusChange(applicationId, status) {
    setUpdatingId(applicationId);
    try {
      await updateApplicationStatus(applicationId, status);
      await load();
    } catch (err) {
      console.error(err);
      alert('The status was not updated. Try again in a moment.');
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleViewResume(applicationId) {
    try {
      const url = await fetchApplicantResumeUrl(applicationId);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error(err);
      alert('The resume could not be opened. Try again in a moment.');
    }
  }

  if (loading && !job) return <div className="page text-muted">Loading...</div>;
  if (error) return <div className="page text-danger">{error}</div>;

  const count = applications.length;

  return (
    <div className="page">
      <Link to="/recruiter/jobs" className="text-sm text-muted underline hover:text-ink">
        Back to my jobs
      </Link>

      <h1 className="mt-4 text-3xl font-bold">{job?.title}</h1>
      <p className="mt-1 text-muted">
        {count} {count === 1 ? 'applicant' : 'applicants'}
      </p>

      {count === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-line bg-surface px-5 py-10 text-center">
          <p className="font-medium">No applications yet.</p>
          <p className="mt-1 text-sm text-muted">They will appear here as candidates apply.</p>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
          {applications.map((app) => {
            const c = app.candidate;
            const education = [c?.education?.degree, c?.education?.institution, c?.education?.year]
              .filter(Boolean)
              .join(', ');

            return (
              <div key={app.id} className="space-y-3 px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold">{c?.name}</h3>
                    <p className="text-sm text-muted">
                      {[c?.email, c?.phone].filter(Boolean).join(', ')}
                    </p>
                    <p className="mt-1 text-xs text-muted">Applied {formatDate(app.applied_at)}</p>
                  </div>

                  <div>
                    <label htmlFor={`status-${app.id}`} className="sr-only">
                      Application status
                    </label>
                    <select
                      id={`status-${app.id}`}
                      value={app.status}
                      disabled={updatingId === app.id}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className="field w-44"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{sentence(s)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {education && <p className="text-sm">{education}</p>}

                {c?.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {c.skills.map((skill) => (
                      <span key={skill} className="chip">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {app.cover_letter && (
                  <details className="text-sm">
                    <summary className="cursor-pointer font-medium">Cover letter</summary>
                    <p className="mt-2 whitespace-pre-line leading-relaxed">{app.cover_letter}</p>
                  </details>
                )}

                {app.resume_path && (
                  <button
                    type="button"
                    onClick={() => handleViewResume(app.id)}
                    className="btn btn-secondary btn-sm"
                  >
                    View resume
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
