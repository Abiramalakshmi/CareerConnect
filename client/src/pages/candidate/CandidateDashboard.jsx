import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { fetchMyApplications } from '../../services/applicationService';
import StatusBadge from '../../components/StatusBadge';

export default function CandidateDashboard() {
  const { profile } = useAuth();
  const [applications, setApplications] = useState(null); // null while loading

  useEffect(() => {
    let cancelled = false;
    fetchMyApplications()
      .then((apps) => {
        if (!cancelled) setApplications(apps);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setApplications([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const firstName = profile?.name?.split(' ')[0];

  // Things worth doing next, shown only while they still apply.
  const todo = [];
  if (profile && !profile.resume_path) {
    todo.push({ text: 'Upload your resume. You need one to apply.', to: '/candidate/profile', cta: 'Add resume' });
  }
  if (profile && !profile.skills?.length) {
    todo.push({ text: 'List your skills so recruiters can see them.', to: '/candidate/profile', cta: 'Add skills' });
  }
  if (applications && applications.length === 0) {
    todo.push({ text: "You haven't applied to any jobs yet.", to: '/jobs', cta: 'Browse jobs' });
  }

  const recent = (applications || []).slice(0, 3);

  return (
    <div className="page">
      <h1 className="text-3xl font-bold">{firstName ? `Welcome back, ${firstName}` : 'Welcome back'}</h1>

      {todo.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold">Next steps</h2>
          <div className="mt-3 divide-y divide-line rounded-lg border border-line bg-surface">
            {todo.map((item) => (
              <div key={item.cta} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <p className="text-sm">{item.text}</p>
                <Link to={item.to} className="btn btn-secondary btn-sm">
                  {item.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section className="mt-8">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">Recent applications</h2>
            <Link to="/candidate/applications" className="link text-sm">
              See all
            </Link>
          </div>
          <div className="mt-3 divide-y divide-line rounded-lg border border-line bg-surface">
            {recent.map((app) => (
              <div key={app.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{app.job?.title}</p>
                  <p className="text-sm text-muted">{app.job?.company}</p>
                </div>
                <StatusBadge status={app.status} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
