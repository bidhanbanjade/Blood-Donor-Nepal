import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './DonorDonatePage.css';

const DONATED_ALERT_IDS_KEY = 'donated-alert-ids';
const DONATED_REQUEST_IDS_KEY = 'donated-request-ids';

const storeDonatedId = (kind, id) => {
  const storageKey = kind === 'request' ? DONATED_REQUEST_IDS_KEY : DONATED_ALERT_IDS_KEY;
  try {
    const raw = window.localStorage.getItem(storageKey);
    const ids = raw ? JSON.parse(raw) : [];
    const nextIds = new Set(Array.isArray(ids) ? ids : []);
    nextIds.add(id);
    window.localStorage.setItem(storageKey, JSON.stringify([...nextIds]));
  } catch (_) {
    // Ignore storage errors and continue with navigation.
  }
};

const DonorDonatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const donationTarget = location.state?.donationTarget || null;
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [donorEligible, setDonorEligible] = useState(true);

  const donatedAtText = useMemo(() => {
    if (!donationTarget?.createdAt) {
      return 'N/A';
    }
    return new Date(donationTarget.createdAt).toLocaleString();
  }, [donationTarget?.createdAt]);

  useEffect(() => {
    const loadEligibility = async () => {
      try {
        const res = await api.get('/donors/me');
        setDonorEligible(Boolean(res.data?.isEligible));
      } catch (_) {
        setDonorEligible(true);
      }
    };

    loadEligibility();
  }, []);

  if (!donationTarget) {
    return (
      <main className="donor-donate-page">
        <section className="donor-donate-card">
          <h1>Donation Details Not Found</h1>
          <p>Please open this page from a Donate button on the alerts page.</p>
          <Link to="/alerts" className="donor-donate-link-btn">Back to Alerts</Link>
        </section>
      </main>
    );
  }

  const handleConfirmDonate = async () => {
    if (!donorEligible) {
      setStatus('You are currently not eligible to donate.');
      return;
    }

    try {
      setSaving(true);
      setStatus('');
      const payload = donationTarget.kind === 'alert' ? { alertId: donationTarget.id } : {};
      await api.post('/donations/self', payload);
      storeDonatedId(donationTarget.kind, donationTarget.id);
      navigate('/alerts', {
        replace: true,
        state: {
          donatedTarget: {
            kind: donationTarget.kind,
            id: donationTarget.id,
          },
        },
      });
    } catch (error) {
      setStatus(error.response?.data?.error || 'Could not confirm donation right now.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="donor-donate-page">
      <section className="donor-donate-card">
        <h1>Confirm Donation</h1>
        <p>Review alert details before confirming your donation.</p>

        <div className="donor-donate-grid">
          <p><strong>Blood Group Needed:</strong> {donationTarget.bloodType || 'N/A'}</p>
          <p><strong>Units Needed:</strong> {donationTarget.unitsNeeded ?? 'N/A'}</p>
          <p><strong>Location:</strong> {donationTarget.location || 'N/A'}</p>
          <p><strong>Urgency:</strong> {donationTarget.urgency || 'N/A'}</p>
          <p><strong>Contact Number:</strong> {donationTarget.phone || 'N/A'}</p>
          <p><strong>Requested At:</strong> {donatedAtText}</p>
          {donationTarget.requesterName ? (
            <p><strong>Requester:</strong> {donationTarget.requesterName}</p>
          ) : null}
        </div>

        <div className="donor-donate-message">
          <strong>Message:</strong>
          <p>{donationTarget.message || 'No message provided.'}</p>
        </div>

        {status ? <p className="donor-donate-status">{status}</p> : null}
        {!donorEligible ? <p className="donor-donate-status">You are currently not eligible to donate.</p> : null}

        <div className="donor-donate-actions">
          <button
            type="button"
            className="donor-donate-confirm-btn"
            onClick={handleConfirmDonate}
            disabled={saving || !donorEligible}
          >
            {saving ? 'Confirming...' : 'Confirm Donate'}
          </button>
          <button type="button" className="donor-donate-cancel-btn" onClick={() => navigate('/alerts')}>
            Cancel
          </button>
          {donationTarget.phone ? (
            <a className="donor-donate-call-btn" href={`tel:${donationTarget.phone}`}>Call Requester</a>
          ) : null}
        </div>
      </section>
    </main>
  );
};

export default DonorDonatePage;
