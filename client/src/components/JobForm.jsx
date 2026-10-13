import { useState } from 'react';
import { JOB_TYPES, WORK_MODES, EXPERIENCE_LEVELS } from '../constants/jobOptions';
import { sentence } from '../utils/format';
import Field from './Field';

const DEFAULT_VALUES = {
  title: '',
  company: '',
  description: '',
  requirements: '',
  location: '',
  jobType: '',
  workMode: '',
  experienceLevel: '',
  salaryMin: '',
  salaryMax: '',
  deadline: '',
};

export default function JobForm({ initialValues, onSubmit, submitLabel = 'Save' }) {
  const [values, setValues] = useState({ ...DEFAULT_VALUES, ...initialValues });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  function update(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!values.title.trim() || !values.company.trim() || !values.description.trim()) {
      setError('Title, company and description are required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        ...values,
        // null (not undefined) so clearing a salary on an edit actually clears it.
        salaryMin: values.salaryMin ? Number(values.salaryMin) : null,
        salaryMax: values.salaryMax ? Number(values.salaryMax) : null,
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'The job was not saved. Try again in a moment.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">The role</h2>
        <Field label="Job title" id="title">
          <input
            id="title"
            type="text"
            required
            value={values.title}
            onChange={(e) => update('title', e.target.value)}
            className="field"
          />
        </Field>
        <Field label="Company" id="company">
          <input
            id="company"
            type="text"
            required
            value={values.company}
            onChange={(e) => update('company', e.target.value)}
            className="field"
          />
        </Field>
        <Field label="Location" id="location">
          <input
            id="location"
            type="text"
            value={values.location}
            onChange={(e) => update('location', e.target.value)}
            className="field"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Job type" id="jobType">
            <select
              id="jobType"
              value={values.jobType}
              onChange={(e) => update('jobType', e.target.value)}
              className="field"
            >
              <option value="">Not specified</option>
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>{sentence(t)}</option>
              ))}
            </select>
          </Field>
          <Field label="Work mode" id="workMode">
            <select
              id="workMode"
              value={values.workMode}
              onChange={(e) => update('workMode', e.target.value)}
              className="field"
            >
              <option value="">Not specified</option>
              {WORK_MODES.map((m) => (
                <option key={m} value={m}>{sentence(m)}</option>
              ))}
            </select>
          </Field>
          <Field label="Experience level" id="experienceLevel">
            <select
              id="experienceLevel"
              value={values.experienceLevel}
              onChange={(e) => update('experienceLevel', e.target.value)}
              className="field"
            >
              <option value="">Not specified</option>
              {EXPERIENCE_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>{sentence(lvl)}</option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Details</h2>
        <Field label="Description" id="description" hint="What the person will do day to day.">
          <textarea
            id="description"
            required
            rows={6}
            value={values.description}
            onChange={(e) => update('description', e.target.value)}
            className="field"
          />
        </Field>
        <Field label="Requirements" id="requirements" hint="Skills or experience you are looking for.">
          <textarea
            id="requirements"
            rows={4}
            value={values.requirements}
            onChange={(e) => update('requirements', e.target.value)}
            className="field"
          />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Pay and deadline</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Salary from" id="salaryMin" hint="Optional">
            <input
              id="salaryMin"
              type="number"
              min="0"
              value={values.salaryMin}
              onChange={(e) => update('salaryMin', e.target.value)}
              className="field"
            />
          </Field>
          <Field label="Salary up to" id="salaryMax" hint="Optional">
            <input
              id="salaryMax"
              type="number"
              min="0"
              value={values.salaryMax}
              onChange={(e) => update('salaryMax', e.target.value)}
              className="field"
            />
          </Field>
          <Field label="Apply by" id="deadline" hint="Optional">
            <input
              id="deadline"
              type="date"
              value={values.deadline}
              onChange={(e) => update('deadline', e.target.value)}
              className="field"
            />
          </Field>
        </div>
      </section>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <button type="submit" disabled={submitting} className="btn btn-primary">
        {submitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
