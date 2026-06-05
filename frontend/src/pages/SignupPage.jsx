import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/constants';
import { validateEmail, validatePassword, validateName } from '../utils/validators';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    if (nameErr || emailErr || passErr) {
      setErrors({ name: nameErr, email: emailErr, password: passErr });
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      await signup({ name: name.trim(), email, password });
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>📓 Proj.io</h1>
          <p>Start your project notebook</p>
        </div>

        {serverError && (
          <div style={{ padding: '0.75rem', background: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>
            {serverError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <label className="input-label" htmlFor="signup-name">Name</label>
            <input
              id="signup-name"
              type="text"
              className={`input-field ${errors.name ? 'input-error' : ''}`}
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
            {errors.name && <p className="input-error-message">{errors.name}</p>}
          </div>

          <div>
            <label className="input-label" htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              type="email"
              className={`input-field ${errors.email ? 'input-error' : ''}`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            {errors.email && <p className="input-error-message">{errors.email}</p>}
          </div>

          <div>
            <label className="input-label" htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              className={`input-field ${errors.password ? 'input-error' : ''}`}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            {errors.password && <p className="input-error-message">{errors.password}</p>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to={ROUTES.LOGIN}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
