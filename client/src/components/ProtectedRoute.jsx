import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Wrap any page that needs a signed-in user.
// requiredRole: 'candidate' | 'recruiter' | undefined (any onboarded user)
// skipOnboardCheck: true for the /onboarding page itself, so a not-yet-onboarded
// user isn't redirected to the very page they're already on.
export default function ProtectedRoute({ children, requiredRole, skipOnboardCheck = false }) {
  const { isSignedIn, isOnboarded, role, loading } = useAuth();

  if (loading) {
    return <div className="page text-muted">Loading...</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  const home = role === 'candidate' ? '/candidate/dashboard' : '/recruiter/dashboard';

  if (skipOnboardCheck) {
    // Already onboarded users shouldn't see the onboarding screen again.
    if (isOnboarded) return <Navigate to={home} replace />;
    return children;
  }

  if (!isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to={home} replace />;
  }

  return children;
}
