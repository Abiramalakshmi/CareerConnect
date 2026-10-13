// "full-time" -> "full time", "under_review" -> "under review"
export function labelize(value) {
  return value ? String(value).replace(/[-_]/g, ' ') : '';
}

// Sentence case: "Full time", "Under review"
export function sentence(value) {
  const text = labelize(value);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatSalary(min, max) {
  if (!min && !max) return null;
  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
  if (min && max) return `${fmt(min)} to ${fmt(max)}`;
  return min ? `From ${fmt(min)}` : `Up to ${fmt(max)}`;
}

export function formatDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
