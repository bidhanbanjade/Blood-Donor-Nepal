import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './RegisterPage.css';

const getRoleRedirectPath = (role) => {
  if (role === 'admin') {
    return '/admin-dashboard';
  }

  if (role === 'donor') {
    return '/donor-dashboard';
  }

  if (role === 'receiver') {
    return '/search';
  }

  return '/';
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { user, register, loading } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'donor',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user) {
      navigate(getRoleRedirectPath(user.role), { replace: true });
    }
  }, [loading, user, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.fullName || !form.email || !form.role || !form.password) {
      setError('Full name, email, role, and password are required.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        role: form.role,
        password: form.password,
      };

      if (form.phone.trim()) {
        payload.phone = form.phone.trim();
      }

      const result = await register(payload);
      navigate(getRoleRedirectPath(result.user.role), { replace: true });
    } catch (submitError) {
      setError(submitError.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="register-page">
      <section className="register-shell">
        <aside className="register-showcase" aria-label="Blood Donor Nepal registration overview">
          <div className="register-showcase-mark">Create Account</div>
          <h2>Join the network that saves lives every day.</h2>
          <p>
            Register as a donor or receiver to access life-saving tools for search, alerts, and
            emergency response.
          </p>
          <ul>
            <li>Fast account setup</li>
            <li>Instant role-based dashboard access</li>
            <li>Search, alerts, and chatbot support</li>
          </ul>
          <div className="register-showcase-links">
            <Link to="/">Back to Home</Link>
            <Link to="/login">Already have an account?</Link>
          </div>
        </aside>

        <section className="register-card" aria-live="polite">
          <h1>Create Account</h1>
          <p className="register-subtitle">Set your details to start using Blood Donor Nepal.</p>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="register-grid two-col">
              <label htmlFor="fullName">
                Full Name
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  autoComplete="name"
                />
              </label>

              <label htmlFor="role">
                Role
                <select id="role" name="role" value={form.role} onChange={handleChange}>
                  <option value="donor">Donor</option>
                  <option value="receiver">Receiver</option>
                </select>
              </label>
            </div>

            <div className="register-grid two-col">
              <label htmlFor="email">
                Email
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  autoComplete="email"
                />
              </label>

              <label htmlFor="phone">
                Phone (Optional)
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+977..."
                  autoComplete="tel"
                />
              </label>
            </div>

            <div className="register-grid two-col">
              <label htmlFor="password">
                Password
                <div className="password-field">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
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
              </label>

              <label htmlFor="confirmPassword">
                Confirm Password
                <div className="password-field">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>
            </div>

            {error ? <p className="register-error">{error}</p> : null}

            <button type="submit" className="submit-btn" disabled={submitting || loading}>
              {submitting ? 'Creating account...' : loading ? 'Checking session...' : 'Create Account'}
            </button>
          </form>

          <p className="register-login-link">
            Already registered? <Link to="/login">Sign in here</Link>
          </p>
        </section>
      </section>
    </main>
  );
};

export default RegisterPage;
