import { useState } from 'react';
import './OTPInput.css';

const OTPInput = ({ recipient, purpose, onVerified, onCancel, onResend, devOtpHint = '' }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recipient, code: otp, purpose }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'OTP verification failed');
        return;
      }

      onVerified(true);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    try {
      await onResend();
      setOtp('');
      setError('');
    } catch (err) {
      setError('Failed to resend OTP');
    }
  };

  return (
    <div className="otp-input-container">
      <div className="otp-card">
        <h3>Verify Your Email</h3>
        <p>Enter the 6-digit code sent to {recipient}</p>
        {devOtpHint ? <p className="otp-dev-hint">{devOtpHint}</p> : null}

        <input
          type="text"
          maxLength="6"
          value={otp}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '');
            setOtp(val);
          }}
          placeholder="000000"
          className="otp-code-input"
          disabled={loading}
        />

        {error && <p className="otp-error">{error}</p>}

        <div className="otp-actions">
          <button
            type="button"
            className="otp-verify-btn"
            onClick={handleVerify}
            disabled={loading || otp.length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          <button
            type="button"
            className="otp-cancel-btn"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>

        <div className="otp-resend">
          <p>Didn't receive the code?</p>
          {resendCooldown > 0 ? (
            <span>Resend in {resendCooldown}s</span>
          ) : (
            <button
              type="button"
              className="otp-resend-btn"
              onClick={handleResend}
              disabled={loading}
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPInput;
