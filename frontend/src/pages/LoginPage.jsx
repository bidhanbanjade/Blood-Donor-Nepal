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
      <div className="login-background" aria-hidden="true">
        <span className="bg-connector connector-top-left" />
        <span className="bg-connector connector-top-right" />
        <span className="bg-connector connector-bottom-left" />
        <span className="bg-connector connector-bottom-right" />
        <span className="connector-node node-top-left" />
        <span className="connector-node node-top-right" />
        <span className="connector-node node-bottom-left" />
        <span className="connector-node node-bottom-right" />
        <span className="blood-drop drop-one" />
        <span className="blood-drop drop-two" />
        <span className="blood-drop drop-three" />
        <span className="blood-drop drop-four" />
        <span className="blood-drop drop-five" />
        <span className="blood-drop drop-six" />
        <span className="blood-drop drop-seven" />
      </div>

      <section className="login-shell" aria-live="polite">
        <div className="login-mark-wrap">
          <div className="login-showcase-mark">Blood Donor Nepal</div>
          <div className="login-mark-icon" aria-hidden="true">
            <span />
          </div>
        </div>

        <h1>Welcome Back</h1>
        <p className="login-subtitle">
          Sign in to manage donor outreach, urgent alerts, and blood requests.
        </p>

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

        <div className="login-divider">
          <span>Quick Access</span>
        </div>

        <div className="login-showcase-links">
          <Link to="/">Back to Home</Link>
          <Link to="/search">Explore Search</Link>
        </div>

        <p className="login-register-link">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
};

export default LoginPage;
