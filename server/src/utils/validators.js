// Central place for the enum values the frontend's dropdowns already
// restrict to — this guards the API itself, since a select element only
// protects the UI, not a direct API call (Postman, curl, etc.).
export const JOB_TYPES = ['full-time', 'part-time', 'internship', 'contract'];
export const WORK_MODES = ['on-site', 'remote', 'hybrid'];
export const EXPERIENCE_LEVELS = ['fresher', 'entry-level', 'experienced'];
export const USER_ROLES = ['candidate', 'recruiter'];
export const APPLICATION_STATUSES = ['applied', 'under_review', 'shortlisted', 'hired', 'rejected'];

// partial: true skips checking fields that weren't sent at all (for PATCH,
// where omitting a field should mean "leave it alone", not "invalid").
export function validateJobInput(body, { partial = false } = {}) {
  const errors = [];

  if ((!partial || body.jobType !== undefined) && body.jobType && !JOB_TYPES.includes(body.jobType)) {
    errors.push(`jobType must be one of: ${JOB_TYPES.join(', ')}`);
  }

  if ((!partial || body.workMode !== undefined) && body.workMode && !WORK_MODES.includes(body.workMode)) {
    errors.push(`workMode must be one of: ${WORK_MODES.join(', ')}`);
  }

  if (
    (!partial || body.experienceLevel !== undefined)
    && body.experienceLevel
    && !EXPERIENCE_LEVELS.includes(body.experienceLevel)
  ) {
    errors.push(`experienceLevel must be one of: ${EXPERIENCE_LEVELS.join(', ')}`);
  }

  if (body.salaryMin && body.salaryMax && Number(body.salaryMin) > Number(body.salaryMax)) {
    errors.push('salaryMin cannot be greater than salaryMax');
  }

  return errors;
}
