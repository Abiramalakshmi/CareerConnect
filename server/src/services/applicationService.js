import { supabase } from '../config/supabase.js';
import { getJobById } from './jobService.js';
import { APPLICATION_STATUSES } from '../utils/validators.js';

// Applies a candidate to a job using whatever resume is currently on
// their profile. Duplicate applications are blocked by the database's
// unique (job_id, candidate_id) constraint — Postgres error code 23505
// is caught here and turned into a clean 409 instead of a raw DB error.
export async function applyToJob(candidateId, jobId, { coverLetter, resumePath }) {
  if (!resumePath) {
    const err = new Error('Upload a resume to your profile before applying');
    err.status = 400;
    throw err;
  }

  const job = await getJobById(jobId);
  if (!job) {
    const err = new Error('Job not found');
    err.status = 404;
    throw err;
  }
  if (job.status !== 'open') {
    const err = new Error('This job is no longer accepting applications');
    err.status = 400;
    throw err;
  }

  const { data, error } = await supabase
    .from('applications')
    .insert({
      job_id: jobId,
      candidate_id: candidateId,
      resume_path: resumePath,
      cover_letter: coverLetter || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      const dupErr = new Error('You have already applied to this job');
      dupErr.status = 409;
      throw dupErr;
    }
    throw error;
  }

  return data;
}

export async function listApplicationsByCandidate(candidateId) {
  const { data, error } = await supabase
    .from('applications')
    .select('*, job:jobs(title, company, location, status)')
    .eq('candidate_id', candidateId)
    .order('applied_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Ownership check: only the recruiter who posted this job can see its applicants.
export async function listApplicantsForJob(jobId, recruiterId) {
  const job = await getJobById(jobId);
  if (!job || job.recruiter_id !== recruiterId) {
    const err = new Error('Job not found or not owned by you');
    err.status = 404;
    throw err;
  }

  const { data, error } = await supabase
    .from('applications')
    .select('*, candidate:users(name, email, phone, skills, education, resume_path)')
    .eq('job_id', jobId)
    .order('applied_at', { ascending: false });

  if (error) throw error;
  return { job, applications: data };
}

export async function updateApplicationStatus(applicationId, recruiterId, status) {
  if (!APPLICATION_STATUSES.includes(status)) {
    const err = new Error(`Invalid status: ${status}`);
    err.status = 400;
    throw err;
  }

  // Fetch alongside the parent job to verify this recruiter actually owns it.
  const { data: application, error: fetchError } = await supabase
    .from('applications')
    .select('*, jobs(recruiter_id)')
    .eq('id', applicationId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!application || application.jobs.recruiter_id !== recruiterId) {
    const err = new Error('Application not found or not owned by you');
    err.status = 404;
    throw err;
  }

  const { data, error } = await supabase
    .from('applications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', applicationId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Withdraw is implemented as a hard delete rather than a status change.
// This keeps the unique (job_id, candidate_id) constraint from permanently
// blocking a future re-application — once withdrawn, the slot is free
// again if the candidate wants to apply to this job later.
export async function withdrawApplication(applicationId, candidateId) {
  const { data, error } = await supabase
    .from('applications')
    .delete()
    .eq('id', applicationId)
    .eq('candidate_id', candidateId)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    const err = new Error('Application not found or not owned by you');
    err.status = 404;
    throw err;
  }

  return data;
}

// Recruiters view the resume that was attached AT APPLICATION TIME
// (stored on the application row), not the candidate's current resume —
// so this doesn't depend on the candidate's own auth/profile access.
export async function getApplicantResumeUrl(applicationId, recruiterId) {
  const { data: application, error: fetchError } = await supabase
    .from('applications')
    .select('resume_path, jobs(recruiter_id)')
    .eq('id', applicationId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!application || application.jobs.recruiter_id !== recruiterId) {
    const err = new Error('Application not found or not owned by you');
    err.status = 404;
    throw err;
  }

  if (!application.resume_path) return null;

  const { data, error } = await supabase.storage
    .from('resumes')
    .createSignedUrl(application.resume_path, 60 * 5);

  if (error) throw error;
  return data.signedUrl;
}
