import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import OTPInput from '../components/OTPInput';
import api from '../services/api';
import './RegisterPage.css';

const getRoleRedirectPath = (role) => {
  if (role === 'admin') {
    return '/admin-dashboard';
  }

  if (role === 'donor') {
    return '/donor-dashboard';
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
    bloodType: 'O+',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState('');

  useEffect(() => {
    if (!loading && user) {
      navigate(getRoleRedirectPath(user.role), { replace: true });
    }
  }, [loading, user, navigate]);

  const handleRequestOTP = async () => {
    if (!form.email) {
      setError('Email is required to verify.');
      return;
    }

    setSendingOTP(true);
    setError('');

    try {
      const response = await api.post('/otp/send', {
        email: form.email.trim(),
        purpose: 'signup',
      });
      const hint = response.data?.devOtp ? `Development OTP: ${response.data.devOtp}` : '';
      setDevOtpHint(hint);
      setOtpSent(true);
    } catch (err) {
      setDevOtpHint('');
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setSendingOTP(false);
    }
  };

  const handleOTPVerified = () => {
    setOtpSent(false);
    setEmailVerified(true);
    setDevOtpHint('');
    setError('');
  };

  const handleResendOTP = async () => {
    return handleRequestOTP();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'email') {
      setEmailVerified(false);
      setDevOtpHint('');
    }
  };

  if (otpSent) {
    return (
      <main className="register-page">
        <OTPInput
          recipient={form.email}
          purpose="signup"
          devOtpHint={devOtpHint}
          onVerified={handleOTPVerified}
          onCancel={() => {
            setOtpSent(false);
            setError('');
          }}
          onResend={handleResendOTP}
        />
      </main>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.fullName || !form.email || !form.password) {
      setError('Full name, email, and password are required.');
      return;
    }

    if (!emailVerified) {
      setError('Please verify your email with OTP before creating your account.');
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
        role: 'donor',
        password: form.password,
      };

      payload.bloodType = form.bloodType;

      if (form.phone.trim()) {
        payload.phone = form.phone.trim();
      }

      const result = await register(payload);
      navigate(getRoleRedirectPath(result.user.role), { replace: true });
    } catch (submitError) {
      const apiError = submitError.response?.data;
      if (Array.isArray(apiError?.errors) && apiError.errors.length > 0) {
        setError(apiError.errors[0].msg || 'Registration failed. Please check your input.');
      } else {
        setError(apiError?.error || 'Registration failed. Please try again.');
      }
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
            Register as a donor to access life-saving tools for alerts and emergency response.
          </p>
          <ul>
            <li>Fast account setup</li>
            <li>Instant donor dashboard access</li>
            <li>Alerts and chatbot support</li>
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

              <label htmlFor="bloodType">
                Blood Type
                <select id="bloodType" name="bloodType" value={form.bloodType} onChange={handleChange}>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="register-grid two-col">
              <label htmlFor="email">
                Email
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    autoComplete="email"
                    disabled={emailVerified}
                  />
                  {!emailVerified ? (
                    <button
                      type="button"
                      className="email-verify-btn"
                      onClick={handleRequestOTP}
                      disabled={sendingOTP || !form.email || submitting}
                    >
                      {sendingOTP ? 'Sending...' : 'Verify'}
                    </button>
                  ) : (
                    <span className="email-verified-badge">Verified</span>
                  )}
                </div>
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
