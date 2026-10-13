import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { fetchMyJobs } from '../../services/jobService';
import { formatDate } from '../../utils/format';

export default function RecruiterDashboard() {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState(null); // null while loading

  useEffect(() => {
    let cancelled = false;
    fetchMyJobs()
      .then((data) => {
        if (!cancelled) setJobs(data);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setJobs([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const firstName = profile?.name?.split(' ')[0];
  const open = (jobs || []).filter((j) => j.status === 'open').length;
  const closed = (jobs || []).length - open;
  const recent = (jobs || []).slice(0, 3);

  return (
    <div className="page">
      <h1 className="text-3xl font-bold">{firstName ? `Welcome back, ${firstName}` : 'Welcome back'}</h1>

      {jobs && jobs.length === 0 && (
        <div className="mt-8 rounded-lg border border-dashed border-line bg-surface px-5 py-10 text-center">
          <p className="font-medium">You haven't posted a job yet.</p>
          <p className="mt-1 text-sm text-muted">Post your first opening to start receiving applications.</p>
          <Link to="/recruiter/jobs/new" className="btn btn-primary mt-4">
            Post a job
          </Link>
        </div>
      )}

      {jobs && jobs.length > 0 && (
        <section className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-muted">
              You have {open} open {open === 1 ? 'job' : 'jobs'} and {closed} closed.
            </p>
            <Link to="/recruiter/jobs/new" className="btn btn-primary">
              Post a job
            </Link>
          </div>

          <div className="mt-4 divide-y divide-line rounded-lg border border-line bg-surface">
            {recent.map((job) => (
              <div key={job.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{job.title}</p>
                  <p className="text-sm text-muted">Posted {formatDate(job.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={job.status === 'open' ? 'chip chip-success' : 'chip chip-muted'}>
                    {job.status === 'open' ? 'Open' : 'Closed'}
                  </span>
                  <Link to={`/recruiter/jobs/${job.id}/applicants`} className="btn btn-secondary btn-sm">
                    Applicants
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <Link to="/recruiter/jobs" className="link mt-3 inline-block text-sm">
            See all your jobs
          </Link>
        </section>
      )}
    </div>
  );
}
