import { supabase } from '../config/supabase.js';

const DEFAULT_PAGE_SIZE = 10;

// Lists open jobs with optional keyword/location/type/experience filters,
// paginated using Supabase's range().
export async function listJobs({
  keyword,
  location,
  jobType,
  experienceLevel,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
}) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('jobs')
    .select('*', { count: 'exact' })
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (keyword) {
    query = query.or(`title.ilike.%${keyword}%,company.ilike.%${keyword}%`);
  }
  if (location) {
    query = query.ilike('location', `%${location}%`);
  }
  if (jobType) {
    query = query.eq('job_type', jobType);
  }
  if (experienceLevel) {
    query = query.eq('experience_level', experienceLevel);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    jobs: data,
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function getJobById(id) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Maps the camelCase fields the frontend sends into the snake_case
// columns the jobs table actually has, dropping anything undefined so
// partial updates (e.g. just changing status) don't null out other fields.
function mapJobInput(body) {
  const {
    title, company, description, requirements, location,
    jobType, workMode, experienceLevel, salaryMin, salaryMax, deadline, status,
  } = body;

  // The form sends "" for optional fields left empty. Postgres CHECK constraints
  // reject "" on the enum columns (job_type, work_mode, experience_level), so
  // blanks are stored as NULL instead. undefined still means "leave unchanged".
  const blankToNull = (v) => (v === '' ? null : v);

  const mapped = {
    title,
    company,
    description,
    requirements: blankToNull(requirements),
    location: blankToNull(location),
    job_type: blankToNull(jobType),
    work_mode: blankToNull(workMode),
    experience_level: blankToNull(experienceLevel),
    salary_min: salaryMin,
    salary_max: salaryMax,
    deadline: blankToNull(deadline),
    status,
  };

  return Object.fromEntries(Object.entries(mapped).filter(([, v]) => v !== undefined));
}

export async function createJob(recruiterId, body) {
  const jobData = mapJobInput(body);

  const { data, error } = await supabase
    .from('jobs')
    .insert({ recruiter_id: recruiterId, ...jobData })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listJobsByRecruiter(recruiterId) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('recruiter_id', recruiterId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Ownership is enforced at the query level (eq recruiter_id) so a
// recruiter can never edit/close/delete someone else's job, even if
// they somehow guess a valid job id.
export async function updateJob(jobId, recruiterId, body) {
  const updates = mapJobInput(body);

  const { data, error } = await supabase
    .from('jobs')
    .update(updates)
    .eq('id', jobId)
    .eq('recruiter_id', recruiterId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data; // null if not found or not owned by this recruiter
}

// Blocks deletion if candidates have already applied — deleting would
// silently wipe out their applications too (the DB has ON DELETE CASCADE
// as a safety net, but that's not a decision this endpoint should make
// silently on the recruiter's behalf). Closing the job is the intended
// path once there are real applicants.
export async function deleteJob(jobId, recruiterId) {
  const { count, error: countError } = await supabase
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .eq('job_id', jobId);

  if (countError) throw countError;

  if (count > 0) {
    const err = new Error(
      `This job has ${count} application${count === 1 ? '' : 's'}. Close it instead of deleting so applicants aren't affected.`,
    );
    err.status = 409;
    throw err;
  }

  const { data, error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', jobId)
    .eq('recruiter_id', recruiterId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}
