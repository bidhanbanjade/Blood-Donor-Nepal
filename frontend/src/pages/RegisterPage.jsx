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
    location: '',
    latitude: '',
    longitude: '',
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
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [locationNotice, setLocationNotice] = useState('');

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

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported in this browser.');
      return;
    }

    setFetchingLocation(true);
    setLocationNotice('Requesting location permission...');
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          latitude: String(position.coords.latitude.toFixed(6)),
          longitude: String(position.coords.longitude.toFixed(6)),
        }));
        setLocationNotice('Location captured from your device.');
        setFetchingLocation(false);
      },
      (geoError) => {
        if (geoError.code === 1) {
          setError('Location permission denied. Please allow access or enter coordinates manually.');
        } else if (geoError.code === 2) {
          setError('Unable to detect your location right now. Please try again.');
        } else {
          setError('Location request timed out. Please try again or enter coordinates manually.');
        }
        setLocationNotice('');
        setFetchingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  };

  if (otpSent) {
    return (
      <main className="register-page">
        <div className="register-background" aria-hidden="true">
          <span className="register-connector connector-top-left" />
          <span className="register-connector connector-top-right" />
          <span className="register-connector connector-bottom-left" />
          <span className="register-connector connector-bottom-right" />
          <span className="register-connector-node node-top-left" />
          <span className="register-connector-node node-top-right" />
          <span className="register-connector-node node-bottom-left" />
          <span className="register-connector-node node-bottom-right" />
          <span className="register-blood-drop drop-one" />
          <span className="register-blood-drop drop-two" />
          <span className="register-blood-drop drop-three" />
          <span className="register-blood-drop drop-four" />
        </div>
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

    const hasLatitude = form.latitude.trim() !== '';
    const hasLongitude = form.longitude.trim() !== '';

    if (hasLatitude !== hasLongitude) {
      setError('Please provide both latitude and longitude.');
      return;
    }

    if (hasLatitude && hasLongitude) {
      const latNum = Number(form.latitude);
      const lonNum = Number(form.longitude);

      if (!Number.isFinite(latNum) || latNum < -90 || latNum > 90) {
        setError('Latitude must be a valid number between -90 and 90.');
        return;
      }

      if (!Number.isFinite(lonNum) || lonNum < -180 || lonNum > 180) {
        setError('Longitude must be a valid number between -180 and 180.');
        return;
      }
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

      if (form.location.trim()) {
        payload.city = form.location.trim();
      }

      if (hasLatitude && hasLongitude) {
        payload.latitude = Number(form.latitude);
        payload.longitude = Number(form.longitude);
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
      <div className="register-background" aria-hidden="true">
        <span className="register-connector connector-top-left" />
        <span className="register-connector connector-top-right" />
        <span className="register-connector connector-bottom-left" />
        <span className="register-connector connector-bottom-right" />
        <span className="register-connector-node node-top-left" />
        <span className="register-connector-node node-top-right" />
        <span className="register-connector-node node-bottom-left" />
        <span className="register-connector-node node-bottom-right" />
        <span className="register-blood-drop drop-one" />
        <span className="register-blood-drop drop-two" />
        <span className="register-blood-drop drop-three" />
        <span className="register-blood-drop drop-four" />
        <span className="register-blood-drop drop-five" />
        <span className="register-blood-drop drop-six" />
      </div>

      <section className="register-shell">
        <div className="register-mark-wrap">
          <div className="register-showcase-mark">Create Account</div>
          <div className="register-mark-icon" aria-hidden="true">
            <span />
          </div>
        </div>

        <h1>Create Account</h1>
        <p className="register-subtitle">Set your details to start using Blood Donor Nepal.</p>

        <form onSubmit={handleSubmit} className="register-form" aria-live="polite">
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
              <div className="email-verify-row">
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

            <label htmlFor="location">
              Location (City)
              <input
                id="location"
                name="location"
                type="text"
                value={form.location}
                onChange={handleChange}
                placeholder="Kathmandu"
                autoComplete="address-level2"
              />
            </label>
          </div>

          <div className="register-grid two-col">
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

            <div className="location-access-card" role="group" aria-label="Location permission">
              <span className="location-access-label">Coordinates</span>
              <button
                type="button"
                className="geo-btn"
                onClick={handleUseCurrentLocation}
                disabled={fetchingLocation || submitting}
              >
                {fetchingLocation ? 'Detecting location...' : 'Use Current Location'}
              </button>
              {locationNotice ? <p className="geo-note">{locationNotice}</p> : null}
            </div>
          </div>

          <div className="register-grid two-col">
            <label htmlFor="latitude">
              Latitude
              <input
                id="latitude"
                name="latitude"
                type="text"
                value={form.latitude}
                onChange={handleChange}
                placeholder="27.717245"
                inputMode="decimal"
              />
            </label>

            <label htmlFor="longitude">
              Longitude
              <input
                id="longitude"
                name="longitude"
                type="text"
                value={form.longitude}
                onChange={handleChange}
                placeholder="85.323959"
                inputMode="decimal"
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

        <div className="register-divider">
          <span>Quick Access</span>
        </div>

        <div className="register-showcase-links">
          <Link to="/">Back to Home</Link>
          <Link to="/search">Explore Search</Link>
        </div>

        <p className="register-login-link">
          Already registered? <Link to="/login">Sign in here</Link>
        </p>
      </section>
    </main>
  );
};

export default RegisterPage;
