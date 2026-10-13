import api from './api';

export async function fetchJobs(filters = {}) {
  // Drop empty/undefined values so we don't send "location=" as a real filter.
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''),
  );
  const res = await api.get('/jobs', { params });
  return res.data; // { jobs, total, page, pageSize, totalPages }
}

export async function fetchJobById(id) {
  const res = await api.get(`/jobs/${id}`);
  return res.data.job;
}

// Recruiter-only endpoints — the interceptor from useAuth() attaches the
// Clerk token, and the backend's requireRole('recruiter') enforces access.
export async function createJob(jobData) {
  const res = await api.post('/jobs', jobData);
  return res.data.job;
}

export async function fetchMyJobs() {
  const res = await api.get('/jobs/mine');
  return res.data.jobs;
}

export async function updateJob(id, jobData) {
  const res = await api.patch(`/jobs/${id}`, jobData);
  return res.data.job;
}

export async function deleteJob(id) {
  const res = await api.delete(`/jobs/${id}`);
  return res.data.job;
}
