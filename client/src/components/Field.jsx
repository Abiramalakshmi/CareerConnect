// A label, one input, and optional helper text. Pass the input as children
// and give both the same id so the label is clickable and read by screen readers.
export default function Field({ label, id, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
