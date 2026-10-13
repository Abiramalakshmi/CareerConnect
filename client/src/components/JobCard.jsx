import { Link } from 'react-router-dom';
import { formatSalary, sentence } from '../utils/format';

// One row in a job list. Wrap rows in <JobList> so they share a single border.
export default function JobCard({ job }) {
  const salary = formatSalary(job.salary_min, job.salary_max);

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="flex items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-brand-tint/50"
    >
      <div className="min-w-0">
        <h3 className="truncate text-base font-semibold">{job.title}</h3>
        <p className="text-sm text-muted">{job.company}</p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          {job.location && <span>{job.location}</span>}
          {job.work_mode && <span>{sentence(job.work_mode)}</span>}
          {job.experience_level && <span>{sentence(job.experience_level)}</span>}
          {salary && <span>{salary}</span>}
        </div>
      </div>
      {job.job_type && <span className="chip shrink-0">{sentence(job.job_type)}</span>}
    </Link>
  );
}
