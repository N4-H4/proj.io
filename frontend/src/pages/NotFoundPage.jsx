import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

export default function NotFoundPage() {
  return (
    <div className="auth-page">
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📓</div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
          404
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', marginBottom: '1.5rem' }}>
          This page has been torn out of the notebook.
        </p>
        <Link to={ROUTES.DASHBOARD} className="btn btn-primary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
