import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyJobs, deleteJob, updateJob } from '../../services/jobService';
import { formatDate } from '../../utils/format';

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyJobs();
      setJobs(data);
    } catch (err) {
      console.error(err);
      setError('Your jobs could not be loaded. Try again in a moment.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleToggleStatus(job) {
    try {
      await updateJob(job.id, { status: job.status === 'open' ? 'closed' : 'open' });
      load();
    } catch (err) {
      console.error(err);
      alert('The job status was not changed. Try again in a moment.');
    }
  }

  async function handleDelete(job) {
    if (!confirm(`Delete "${job.title}"? This cannot be undone.`)) return;
    try {
      await deleteJob(job.id);
      load();
    } catch (err) {
      console.error(err);
      // The server explains why, e.g. "close it instead" when applicants exist.
      alert(err.response?.data?.error || 'The job was not deleted. Try again in a moment.');
    }
  }

  if (loading) return <div className="page text-muted">Loading...</div>;
  if (error) return <div className="page text-danger">{error}</div>;

  return (
    <div className="page">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">My jobs</h1>
        <Link to="/recruiter/jobs/new" className="btn btn-primary">
          Post a job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-line bg-surface px-5 py-10 text-center">
          <p className="font-medium">You haven't posted any jobs yet.</p>
          <p className="mt-1 text-sm text-muted">Posted jobs appear here and on the public jobs page.</p>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
          {jobs.map((job) => (
            <div key={job.id} className="flex flex-wrap items-start justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="truncate font-semibold">{job.title}</h3>
                  <span className={job.status === 'open' ? 'chip chip-success' : 'chip chip-muted'}>
                    {job.status === 'open' ? 'Open' : 'Closed'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {[job.location, `Posted ${formatDate(job.created_at)}`].filter(Boolean).join(', ')}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link to={`/recruiter/jobs/${job.id}/applicants`} className="btn btn-primary btn-sm">
                  Applicants
                </Link>
                <Link to={`/recruiter/jobs/${job.id}/edit`} className="btn btn-secondary btn-sm">
                  Edit
                </Link>
                <button type="button" onClick={() => handleToggleStatus(job)} className="btn btn-secondary btn-sm">
                  {job.status === 'open' ? 'Close' : 'Reopen'}
                </button>
                <button type="button" onClick={() => handleDelete(job)} className="btn btn-danger btn-sm">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
