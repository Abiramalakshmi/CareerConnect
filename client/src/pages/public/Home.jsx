import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { fetchJobs } from '../../services/jobService';
import JobList from '../../components/JobList';

export default function Home() {
  const { isSignedIn, isOnboarded, role, loading } = useAuth();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [latest, setLatest] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetchJobs({ page: 1, pageSize: 5 })
      .then((result) => {
        if (!cancelled) setLatest(result.jobs);
      })
      .catch((err) => console.error(err));
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div className="page text-muted">Loading...</div>;

  // Signed-in users skip the landing page: onboarding if they haven't
  // chosen a role yet, otherwise their dashboard.
  if (isSignedIn) {
    if (!isOnboarded) return <Navigate to="/onboarding" replace />;
    return (
      <Navigate to={role === 'candidate' ? '/candidate/dashboard' : '/recruiter/dashboard'} replace />
    );
  }

  function handleSearch(e) {
    e.preventDefault();
    const query = new URLSearchParams();
    if (keyword.trim()) query.set('keyword', keyword.trim());
    if (location.trim()) query.set('location', location.trim());
    navigate(`/jobs?${query.toString()}`);
  }

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
          <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            Find your first role, or your next hire.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted">
            CareerConnect lists fresher and entry-level openings, and gives recruiters one place
            to read every application.
          </p>

          <form onSubmit={handleSearch} className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-[1fr_12rem_auto]">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Job title or company"
              aria-label="Job title or company"
              className="field"
            />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City"
              aria-label="City"
              className="field"
            />
            <button type="submit" className="btn btn-primary">
              Search jobs
            </button>
          </form>
        </div>
      </section>

      <section className="page">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-xl font-semibold">Latest openings</h2>
          <Link to="/jobs" className="link text-sm">
            See all jobs
          </Link>
        </div>
        {latest.length === 0 ? (
          <p className="text-muted">No jobs are open right now. Check back soon.</p>
        ) : (
          <JobList jobs={latest} />
        )}
      </section>

      <section className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Hiring?</h2>
            <p className="mt-1 max-w-xl text-muted">
              Post a role, read applications, and move each candidate from applied to hired.
            </p>
          </div>
          <Link to="/sign-up" className="btn btn-primary shrink-0">
            Create a recruiter account
          </Link>
        </div>
      </section>
    </>
  );
}
