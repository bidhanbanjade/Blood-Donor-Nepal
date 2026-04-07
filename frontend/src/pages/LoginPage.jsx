import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './LoginPage.css';

const getRoleRedirectPath = (role) => {
  if (role === 'admin') {
    return '/admin-dashboard';
  }

  if (role === 'donor') {
    return '/donor-dashboard';
  }

  return '/';
};

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, login, loading } = useAuth();
  const [loginMethod, setLoginMethod] = useState('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user) {
      navigate(getRoleRedirectPath(user.role), { replace: true });
    }
  }, [loading, user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!identifier || !password) {
      setError('Email/phone and password are required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload =
        loginMethod === 'email'
          ? { email: identifier.trim(), password }
          : { phone: identifier.trim(), password };
      const result = await login(payload);
      navigate(getRoleRedirectPath(result.user.role), { replace: true });
    } catch (submitError) {
      setError(submitError.response?.data?.error || 'Login failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-shell">
        <aside className="login-showcase" aria-label="Blood Donor Nepal login overview">
          <div className="login-showcase-mark">Blood Donor Nepal</div>
          <h2>Welcome back to the emergency response network.</h2>
          <p>
            Sign in to coordinate donor outreach, monitor urgent requests, and keep blood inventory
            moving where it is needed most.
          </p>
          <ul>
            <li>Area-based donor search</li>
            <li>Urgent alert management</li>
            <li>Role-specific dashboards</li>
          </ul>
          <div className="login-showcase-links">
            <Link to="/">Back to Home</Link>
            <Link to="/search">Explore Search Page</Link>
          </div>
        </aside>

        <section className="login-card" aria-live="polite">
          <h1>Sign In</h1>
          <p className="login-subtitle">Use your account credentials to continue.</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-methods" role="group" aria-label="Choose login method">
              <button
                type="button"
                className={loginMethod === 'email' ? 'method-btn active' : 'method-btn'}
                onClick={() => {
                  setLoginMethod('email');
                  setIdentifier('');
                }}
              >
                Email
              </button>
              <button
                type="button"
                className={loginMethod === 'phone' ? 'method-btn active' : 'method-btn'}
                onClick={() => {
                  setLoginMethod('phone');
                  setIdentifier('');
                }}
              >
                Phone
              </button>
            </div>

            <label htmlFor="identifier">{loginMethod === 'email' ? 'Email' : 'Phone Number'}</label>
            <input
              id="identifier"
              type={loginMethod === 'email' ? 'email' : 'tel'}
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder={loginMethod === 'email' ? 'admin@example.com' : '+977...'}
              autoComplete={loginMethod === 'email' ? 'email' : 'tel'}
            />

            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password123"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {error ? <p className="login-error">{error}</p> : null}

            <button type="submit" disabled={submitting || loading} className="submit-btn">
              {submitting ? 'Signing in...' : loading ? 'Checking session...' : 'Sign In'}
            </button>
          </form>

          <div className="login-hints">
            <p className="login-hints-title">Quick test users</p>
            <p>Admin: admin@example.com</p>
            <p>Donor: donor@example.com</p>
          </div>

          <p className="login-register-link">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </section>
      </section>
    </main>
  );
};

export default LoginPage;
