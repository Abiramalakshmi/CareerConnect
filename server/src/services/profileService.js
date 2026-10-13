import { supabase } from '../config/supabase.js';

const VALID_ROLES = ['candidate', 'recruiter'];

// Returns the user's row from the `users` table, or null if they
// haven't completed onboarding yet.
export async function getUserByClerkId(clerkUserId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Creates the user's row the first time they pick a role. Guards
// against invalid roles and duplicate onboarding attempts.
export async function createUserProfile({ clerkUserId, name, email, role }) {
  if (!VALID_ROLES.includes(role)) {
    const err = new Error(`Invalid role: ${role}`);
    err.status = 400;
    throw err;
  }

  const existing = await getUserByClerkId(clerkUserId);
  if (existing) {
    const err = new Error('User is already onboarded');
    err.status = 409;
    throw err;
  }

  const { data, error } = await supabase
    .from('users')
    .insert({ clerk_user_id: clerkUserId, name, email, role })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Only these fields are ever editable via the profile form — role,
// email, clerk_user_id, resume_path etc. are managed elsewhere and
// can never be overwritten through this endpoint.
const EDITABLE_PROFILE_FIELDS = ['name', 'phone', 'location', 'summary', 'skills', 'education'];

export async function updateUserProfile(clerkUserId, updates) {
  const payload = Object.fromEntries(
    Object.entries(updates).filter(
      ([key, value]) => EDITABLE_PROFILE_FIELDS.includes(key) && value !== undefined,
    ),
  );

  const { data, error } = await supabase
    .from('users')
    .update(payload)
    .eq('clerk_user_id', clerkUserId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Uploads (or replaces) the candidate's resume in the private "resumes"
// bucket at a fixed path per user, then records that path on their row.
// Fixed path + upsert means "replace resume" is just uploading again.
export async function uploadResume(clerkUserId, fileBuffer, mimeType) {
  const path = `${clerkUserId}/resume.pdf`;

  const { error: uploadError } = await supabase.storage
    .from('resumes')
    .upload(path, fileBuffer, { contentType: mimeType, upsert: true });

  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from('users')
    .update({ resume_path: path })
    .eq('clerk_user_id', clerkUserId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// The bucket is private, so viewing/downloading requires a short-lived
// signed URL rather than a public link.
export async function getResumeSignedUrl(clerkUserId) {
  const user = await getUserByClerkId(clerkUserId);
  if (!user?.resume_path) return null;

  const { data, error } = await supabase.storage
    .from('resumes')
    .createSignedUrl(user.resume_path, 60 * 5); // valid for 5 minutes

  if (error) throw error;
  return data.signedUrl;
}
