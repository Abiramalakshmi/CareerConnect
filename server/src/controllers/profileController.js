import {
  getUserByClerkId,
  createUserProfile,
  updateUserProfile,
  uploadResume,
  getResumeSignedUrl,
} from '../services/profileService.js';

// GET /api/users/me
// Used by the frontend on every app load to decide: signed in but not
// onboarded -> send to /onboarding; onboarded -> send to their dashboard.
export async function getMe(req, res, next) {
  try {
    const user = await getUserByClerkId(req.clerkUserId);

    if (!user) {
      return res.status(404).json({ onboarded: false });
    }

    return res.status(200).json({ onboarded: true, user });
  } catch (err) {
    next(err);
  }
}

// POST /api/users/onboard
// Body: { name, email, role }
export async function onboardUser(req, res, next) {
  try {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: 'name, email, and role are required' });
    }

    const user = await createUserProfile({
      clerkUserId: req.clerkUserId,
      name,
      email,
      role,
    });

    return res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/users/me
// Body: any subset of { name, phone, location, summary, skills, education }
export async function updateMe(req, res, next) {
  try {
    const user = await updateUserProfile(req.clerkUserId, req.body);
    return res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}

// POST /api/users/me/resume — multipart/form-data, field name "resume"
export async function uploadMyResume(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const user = await uploadResume(req.clerkUserId, req.file.buffer, req.file.mimetype);
    return res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}

// GET /api/users/me/resume — returns a short-lived signed URL
export async function getMyResumeUrl(req, res, next) {
  try {
    const url = await getResumeSignedUrl(req.clerkUserId);

    if (!url) {
      return res.status(404).json({ error: 'No resume uploaded yet' });
    }

    return res.status(200).json({ url });
  } catch (err) {
    next(err);
  }
}
