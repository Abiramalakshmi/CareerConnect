import { getUserByClerkId } from '../services/profileService.js';

// Wraps a route so it only proceeds if the signed-in user has the given
// role. Must run after requireClerkAuth + attachAuthContext (needs
// req.clerkUserId). Attaches req.dbUser (the app's own users row,
// including its internal id) for controllers to use downstream.
export function requireRole(requiredRole) {
  return async function (req, res, next) {
    try {
      const user = await getUserByClerkId(req.clerkUserId);

      if (!user) {
        return res.status(403).json({ error: 'Complete onboarding before accessing this resource' });
      }

      if (user.role !== requiredRole) {
        return res.status(403).json({ error: `This action requires the ${requiredRole} role` });
      }

      req.dbUser = user;
      next();
    } catch (err) {
      next(err);
    }
  };
}
