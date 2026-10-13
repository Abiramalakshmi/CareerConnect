import { sentence } from '../utils/format';

const DOT = {
  applied: 'bg-muted',
  under_review: 'bg-warning',
  shortlisted: 'bg-success',
  hired: 'bg-success',
  rejected: 'bg-danger',
};

export default function StatusBadge({ status }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium">
      <span className={`h-2 w-2 rounded-full ${DOT[status] || DOT.applied}`} aria-hidden="true" />
      {sentence(status)}
    </span>
  );
}
