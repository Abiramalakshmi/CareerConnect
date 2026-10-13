import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted">This page doesn't exist, or it has moved.</p>
      <Link to="/" className="btn btn-primary mt-6">
        Go to the home page
      </Link>
    </div>
  );
}
