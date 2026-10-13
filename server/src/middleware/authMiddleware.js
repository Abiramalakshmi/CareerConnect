import { requireAuth, getAuth } from '@clerk/express';

// Verifies the Clerk session token on the request and rejects with 401
// if it's missing or invalid. Clerk's own middleware handles this check.
export const requireClerkAuth = requireAuth();

// Runs after requireClerkAuth. Pulls the verified Clerk user id out of
// the request and attaches it as req.clerkUserId, so controllers never
// have to know how Clerk stores things internally. If we ever swap
// auth providers, this is the only file that needs to change.
export function attachAuthContext(req, res, next) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.clerkUserId = userId;
  next();
}
