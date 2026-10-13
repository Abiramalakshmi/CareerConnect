import api from './api';

export async function applyToJob(jobId, coverLetter) {
  const res = await api.post('/applications', { jobId, coverLetter });
  return res.data.application;
}

export async function fetchMyApplications() {
  const res = await api.get('/applications/mine');
  return res.data.applications;
}

export async function fetchApplicantsForJob(jobId) {
  const res = await api.get(`/applications/job/${jobId}`);
  return res.data; // { job, applications }
}

export async function updateApplicationStatus(applicationId, status) {
  const res = await api.patch(`/applications/${applicationId}/status`, { status });
  return res.data.application;
}

export async function fetchApplicantResumeUrl(applicationId) {
  const res = await api.get(`/applications/${applicationId}/resume`);
  return res.data.url;
}

export async function withdrawApplication(applicationId) {
  const res = await api.delete(`/applications/${applicationId}`);
  return res.data.application;
}
