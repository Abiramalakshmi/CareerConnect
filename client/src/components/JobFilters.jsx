import { JOB_TYPES, EXPERIENCE_LEVELS } from '../constants/jobOptions';
import { sentence } from '../utils/format';

export default function JobFilters({ filters, onChange }) {
  function update(field, value) {
    onChange({ ...filters, [field]: value });
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <input
        type="text"
        value={filters.location || ''}
        onChange={(e) => update('location', e.target.value)}
        placeholder="Location"
        aria-label="Filter by location"
        className={`field ${filters.location ? 'border-brand bg-brand-tint' : ''}`}
      />

      <select
        value={filters.jobType || ''}
        onChange={(e) => update('jobType', e.target.value)}
        aria-label="Filter by job type"
        className={`field ${filters.jobType ? 'border-brand bg-brand-tint' : ''}`}
      >
        <option value="">Any job type</option>
        {JOB_TYPES.map((t) => (
          <option key={t} value={t}>{sentence(t)}</option>
        ))}
      </select>

      <select
        value={filters.experienceLevel || ''}
        onChange={(e) => update('experienceLevel', e.target.value)}
        aria-label="Filter by experience level"
        className={`field ${filters.experienceLevel ? 'border-brand bg-brand-tint' : ''}`}
      >
        <option value="">Any experience level</option>
        {EXPERIENCE_LEVELS.map((lvl) => (
          <option key={lvl} value={lvl}>{sentence(lvl)}</option>
        ))}
      </select>
    </div>
  );
}
