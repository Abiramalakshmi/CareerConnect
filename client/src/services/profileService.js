import api from './api';

export async function fetchMyProfile() {
  const res = await api.get('/users/me');
  return res.data; // { onboarded, user? }
}

export async function submitOnboarding({ name, email, role }) {
  const res = await api.post('/users/onboard', { name, email, role });
  return res.data; // { user }
}

export async function updateMyProfile(fields) {
  const res = await api.patch('/users/me', fields);
  return res.data.user;
}

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append('resume', file);

  const res = await api.post('/users/me/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.user;
}

export async function fetchResumeUrl() {
  const res = await api.get('/users/me/resume');
  return res.data.url;
}
