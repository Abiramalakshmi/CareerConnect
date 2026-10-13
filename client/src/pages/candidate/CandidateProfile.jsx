import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { updateMyProfile, uploadResume, fetchResumeUrl } from '../../services/profileService';
import Field from '../../components/Field';

export default function CandidateProfile() {
  const { profile, refetchProfile, loading: authLoading } = useAuth();

  const [form, setForm] = useState({
    phone: '',
    location: '',
    summary: '',
    skills: '',
    educationDegree: '',
    educationInstitution: '',
    educationYear: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [resumeError, setResumeError] = useState(null);

  // Prefill the form once the profile has loaded.
  useEffect(() => {
    if (!profile) return;
    setForm({
      phone: profile.phone || '',
      location: profile.location || '',
      summary: profile.summary || '',
      skills: (profile.skills || []).join(', '),
      educationDegree: profile.education?.degree || '',
      educationInstitution: profile.education?.institution || '',
      educationYear: profile.education?.year || '',
    });
  }, [profile]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      await updateMyProfile({
        phone: form.phone,
        location: form.location,
        summary: form.summary,
        skills: form.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        education: {
          degree: form.educationDegree,
          institution: form.educationInstitution,
          year: form.educationYear,
        },
      });
      await refetchProfile();
      setSaved(true);
    } catch (err) {
      console.error(err);
      setError('Your profile was not saved. Try again in a moment.');
    } finally {
      setSaving(false);
    }
  }

  async function handleResumeUpload(e) {
    e.preventDefault();
    if (!resumeFile) return;

    setUploading(true);
    setResumeError(null);

    try {
      await uploadResume(resumeFile);
      await refetchProfile();
      setResumeFile(null);
      e.target.reset();
    } catch (err) {
      console.error(err);
      setResumeError('The upload failed. Check that the file is a PDF under 5 MB.');
    } finally {
      setUploading(false);
    }
  }

  async function handleViewResume() {
    try {
      const url = await fetchResumeUrl();
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error(err);
      setResumeError('The resume could not be opened. Try again in a moment.');
    }
  }

  if (authLoading) return <div className="page text-muted">Loading...</div>;

  return (
    <div className="page max-w-3xl">
      <h1 className="text-3xl font-bold">Your profile</h1>
      <p className="mt-1 text-muted">Recruiters see this when you apply to their jobs.</p>

      <form onSubmit={handleSave} className="mt-8 space-y-8">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">About you</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phone" id="phone">
              <input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                className="field"
              />
            </Field>
            <Field label="Location" id="location">
              <input
                id="location"
                type="text"
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
                className="field"
              />
            </Field>
          </div>
          <Field label="Summary" id="summary" hint="Two or three sentences about your background and goals.">
            <textarea
              id="summary"
              rows={4}
              value={form.summary}
              onChange={(e) => update('summary', e.target.value)}
              className="field"
            />
          </Field>
          <Field label="Skills" id="skills" hint="Separate skills with commas.">
            <input
              id="skills"
              type="text"
              value={form.skills}
              onChange={(e) => update('skills', e.target.value)}
              placeholder="React, Node.js, SQL"
              className="field"
            />
          </Field>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Education</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Degree" id="degree">
              <input
                id="degree"
                type="text"
                value={form.educationDegree}
                onChange={(e) => update('educationDegree', e.target.value)}
                className="field"
              />
            </Field>
            <Field label="Institution" id="institution">
              <input
                id="institution"
                type="text"
                value={form.educationInstitution}
                onChange={(e) => update('educationInstitution', e.target.value)}
                className="field"
              />
            </Field>
            <Field label="Graduation year" id="year">
              <input
                id="year"
                type="text"
                inputMode="numeric"
                value={form.educationYear}
                onChange={(e) => update('educationYear', e.target.value)}
                className="field"
              />
            </Field>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Saving...' : 'Save profile'}
          </button>
          {saved && (
            <p role="status" className="text-sm text-success">
              Profile saved.
            </p>
          )}
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
        </div>
      </form>

      <section className="mt-10 space-y-4 border-t border-line pt-8">
        <h2 className="text-lg font-semibold">Resume</h2>

        {profile?.resume_path ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm">A resume is on file. Upload a new PDF to replace it.</p>
            <button type="button" onClick={handleViewResume} className="btn btn-secondary btn-sm">
              View current resume
            </button>
          </div>
        ) : (
          <p className="text-sm text-muted">No resume yet. Add a PDF so you can apply to jobs.</p>
        )}

        <form onSubmit={handleResumeUpload} className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept="application/pdf"
            aria-label="Choose a PDF resume"
            onChange={(e) => setResumeFile(e.target.files[0] || null)}
            className="text-sm file:mr-3 file:rounded-md file:border file:border-line file:bg-surface file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:border-ink"
          />
          <button type="submit" disabled={!resumeFile || uploading} className="btn btn-primary btn-sm">
            {uploading ? 'Uploading...' : profile?.resume_path ? 'Replace resume' : 'Upload resume'}
          </button>
        </form>
        <p className="text-xs text-muted">PDF only, up to 5 MB.</p>

        {resumeError && (
          <p role="alert" className="text-sm text-danger">
            {resumeError}
          </p>
        )}
      </section>
    </div>
  );
}
