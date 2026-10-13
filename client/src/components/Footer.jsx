export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto max-w-5xl px-5 py-6 text-sm text-muted">
        © {new Date().getFullYear()} CareerConnect
      </div>
    </footer>
  );
}
