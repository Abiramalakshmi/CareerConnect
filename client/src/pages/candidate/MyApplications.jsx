import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyApplications, withdrawApplication } from '../../services/applicationService';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../utils/format';

// Withdraw is offered while an application is still open. Once it is
// hired or rejected, withdrawing doesn't mean anything.
const WITHDRAWABLE_STATUSES = ['applied', 'under_review', 'shortlisted'];

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [withdrawingId, setWithdrawingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyApplications();
      setApplications(data);
    } catch (err) {
      console.error(err);
      setError('Your applications could not be loaded. Try again in a moment.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleWithdraw(app) {
    if (
      !confirm(
        `Withdraw your application for "${app.job?.title}"? You can apply again later if the job is still open.`,
      )
    ) {
      return;
    }

    setWithdrawingId(app.id);
    try {
      await withdrawApplication(app.id);
      load();
    } catch (err) {
      console.error(err);
      alert('The application was not withdrawn. Try again in a moment.');
    } finally {
      setWithdrawingId(null);
    }
  }

  if (loading) return <div className="page text-muted">Loading...</div>;
  if (error) return <div className="page text-danger">{error}</div>;

  return (
    <div className="page max-w-3xl">
      <h1 className="text-3xl font-bold">My applications</h1>

      {applications.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-line bg-surface px-5 py-10 text-center">
          <p className="font-medium">You haven't applied to any jobs yet.</p>
          <Link to="/jobs" className="btn btn-primary mt-4">
            Browse jobs
          </Link>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
          {applications.map((app) => (
            <div key={app.id} className="flex items-start justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <Link to={`/jobs/${app.job_id}`} className="font-semibold hover:underline">
                  {app.job?.title}
                </Link>
                <p className="text-sm text-muted">{app.job?.company}</p>
                <p className="mt-1 text-xs text-muted">Applied {formatDate(app.applied_at)}</p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-2">
                <StatusBadge status={app.status} />
                {WITHDRAWABLE_STATUSES.includes(app.status) && (
                  <button
                    type="button"
                    onClick={() => handleWithdraw(app)}
                    disabled={withdrawingId === app.id}
                    className="text-xs text-danger underline disabled:opacity-50"
                  >
                    {withdrawingId === app.id ? 'Withdrawing...' : 'Withdraw'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
