import { Link, NavLink } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import { useAuth } from '../hooks/useAuth';

const linkClass = ({ isActive }) =>
  isActive ? 'font-medium text-brand' : 'text-muted hover:text-ink';

export default function Navbar() {
  const { isSignedIn, isOnboarded, role, loading } = useAuth();
  const ready = !loading;

  return (
    <header className="border-b border-line bg-surface">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="h-5 w-5 rounded bg-brand" aria-hidden="true" />
          CareerConnect
        </Link>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <NavLink to="/jobs" className={linkClass}>
            Jobs
          </NavLink>

          {ready && !isSignedIn && (
            <>
              <NavLink to="/sign-in" className={linkClass}>
                Sign in
              </NavLink>
              <Link to="/sign-up" className="btn btn-primary">
                Sign up
              </Link>
            </>
          )}

          {ready && isSignedIn && isOnboarded && role === 'candidate' && (
            <>
              <NavLink to="/candidate/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/candidate/applications" className={linkClass}>
                My applications
              </NavLink>
              <NavLink to="/candidate/profile" className={linkClass}>
                Profile
              </NavLink>
            </>
          )}

          {ready && isSignedIn && isOnboarded && role === 'recruiter' && (
            <>
              <NavLink to="/recruiter/dashboard" className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/recruiter/jobs" className={linkClass}>
                My jobs
              </NavLink>
            </>
          )}

          {ready && isSignedIn && <UserButton afterSignOutUrl="/" />}
        </div>
      </nav>
    </header>
  );
}
