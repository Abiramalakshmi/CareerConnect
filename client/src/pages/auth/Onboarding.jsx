import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { submitOnboarding } from '../../services/profileService';
import { useAuth } from '../../hooks/useAuth';

const ROLES = [
  {
    value: 'candidate',
    title: "I'm looking for a job",
    description: 'Search openings, apply with your resume, and follow each application.',
  },
  {
    value: 'recruiter',
    title: "I'm hiring",
    description: 'Post jobs, read applications, and move candidates through your process.',
  },
];

export default function Onboarding() {
  const { user } = useUser();
  const { refetchProfile } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleContinue() {
    if (!selectedRole || !user) return;

    setSubmitting(true);
    setError(null);

    try {
      await submitOnboarding({
        name: user.fullName ?? user.username ?? 'Unnamed User',
        email: user.primaryEmailAddress?.emailAddress,
        role: selectedRole,
      });

      await refetchProfile();
      navigate(selectedRole === 'candidate' ? '/candidate/dashboard' : '/recruiter/dashboard');
    } catch (err) {
      if (err.response?.status === 409) {
        // Already onboarded (a double click, or a second tab). The home route
        // sends them to whichever dashboard matches the role already on file.
        await refetchProfile();
        navigate('/', { replace: true });
        return;
      }
      console.error(err);
      setError('We could not set up your account. Try again in a moment.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-14">
      <h1 className="text-3xl font-bold">How will you use CareerConnect?</h1>
      <p className="mt-2 text-muted">Your choice decides which tools you see.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2" role="radiogroup" aria-label="Account type">
        {ROLES.map((r) => {
          const selected = selectedRole === r.value;
          return (
            <button
              key={r.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setSelectedRole(r.value)}
              className={`rounded-lg border p-5 text-left transition-colors ${
                selected ? 'border-brand bg-brand-tint' : 'border-line bg-surface hover:border-ink'
              }`}
            >
              <span className="block font-semibold">{r.title}</span>
              <span className="mt-1 block text-sm text-muted">{r.description}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={!selectedRole || submitting}
        onClick={handleContinue}
        className="btn btn-primary mt-8"
      >
        {submitting ? 'Setting up your account...' : 'Continue'}
      </button>
    </div>
  );
}
