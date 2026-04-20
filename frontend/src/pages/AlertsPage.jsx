import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import './AlertsPage.css';

const DONATED_ALERT_IDS_KEY = 'donated-alert-ids';
const DONATED_REQUEST_IDS_KEY = 'donated-request-ids';

const readStoredIds = (storageKey) => {
  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch (_) {
    return new Set();
  }
};

const writeStoredId = (storageKey, id) => {
  const ids = readStoredIds(storageKey);
  ids.add(id);
  window.localStorage.setItem(storageKey, JSON.stringify([...ids]));
};

const formatUrgency = (urgency = '') => urgency.toUpperCase();

const getUrgencyClass = (urgency = '') => {
  const normalized = urgency.toLowerCase();
  if (normalized === 'critical') return 'critical';
  if (normalized === 'high') return 'high';
  if (normalized === 'medium') return 'medium';
  return 'low';
};

const getStatusClass = (status = '') => {
  const normalized = status.toLowerCase();
  if (normalized === 'active') return 'active';
  if (normalized === 'sent') return 'sent';
  return 'closed';
};

const AlertsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDonor = user?.role === 'donor';
  const [alerts, setAlerts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestError, setRequestError] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [requestSuccess, setRequestSuccess] = useState('');
  const [donorActionMessage, setDonorActionMessage] = useState('');
  const [donorEligible, setDonorEligible] = useState(true);
  const [requestForm, setRequestForm] = useState({
    fullName: '',
    phone: '',
    bloodType: 'O+',
    urgency: 'high',
    unitsNeeded: 1,
    city: '',
  });

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const calls = [
          api.get('/alerts/public'),
          api.get('/public-requests/public'),
        ];

        if (isDonor) {
          calls.push(api.get('/donors/me'));
        }

        const responses = await Promise.all(calls);
        const alertsResponse = responses[0];
        const requestsResponse = responses[1];
        const donorProfileResponse = responses[2];
        const donatedAlertIds = readStoredIds(DONATED_ALERT_IDS_KEY);
        const donatedRequestIds = readStoredIds(DONATED_REQUEST_IDS_KEY);
        setAlerts((alertsResponse.data || []).filter((item) => !donatedAlertIds.has(item.id)));
        setRequests((requestsResponse.data || []).filter((item) => !donatedRequestIds.has(item.id)));
        if (donorProfileResponse?.data) {
          setDonorEligible(Boolean(donorProfileResponse.data.isEligible));
        }
      } catch (loadError) {
        setError(loadError.response?.data?.error || 'Could not load alerts right now.');
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, [isDonor]);

  useEffect(() => {
    const donatedTarget = location.state?.donatedTarget;
    if (!donatedTarget?.id) {
      return;
    }

    if (donatedTarget.kind === 'alert') {
      writeStoredId(DONATED_ALERT_IDS_KEY, donatedTarget.id);
      setAlerts((prev) => prev.filter((item) => item.id !== donatedTarget.id));
    }

    if (donatedTarget.kind === 'request') {
      writeStoredId(DONATED_REQUEST_IDS_KEY, donatedTarget.id);
      setRequests((prev) => prev.filter((item) => item.id !== donatedTarget.id));
    }

    setDonorActionMessage('Donation recorded successfully.');
    navigate(location.pathname, { replace: true });
  }, [location.pathname, location.state, navigate]);

  const handleRequestChange = (event) => {
    const { name, value } = event.target;
    setRequestForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitPublicRequest = async (event) => {
    event.preventDefault();
    setRequestLoading(true);
    setRequestError('');
    setRequestSuccess('');
    setRequestMessage('');

    try {
      await api.post('/public-requests', {
        ...requestForm,
        unitsNeeded: Number(requestForm.unitsNeeded),
        message: requestMessage,
      });

      setRequestSuccess('Your blood request was submitted.');
      setRequestForm({
        fullName: '',
        phone: '',
        bloodType: 'O+',
        urgency: 'high',
        unitsNeeded: 1,
        city: '',
      });
      setRequestMessage('');

      const requestsResponse = await api.get('/public-requests/public');
      setRequests(requestsResponse.data || []);
    } catch (submitError) {
      setRequestError(submitError.response?.data?.errors?.[0]?.msg || submitError.response?.data?.error || 'Could not submit blood request.');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleDonateAlert = (alert) => {
    if (!donorEligible) {
      setDonorActionMessage('You are currently not eligible to donate.');
      return;
    }

    navigate('/donor-dashboard/donate', {
      state: {
        donationTarget: {
          kind: 'alert',
          id: alert.id,
          bloodType: alert.bloodType,
          urgency: alert.urgency,
          message: alert.message,
          unitsNeeded: alert.unitsNeeded || null,
          location: alert.bloodBank?.city || alert.hospital?.city || null,
          phone: null,
          createdAt: alert.createdAt,
        },
      },
    });
  };

  const handleDonateRequest = (request) => {
    if (!donorEligible) {
      setDonorActionMessage('You are currently not eligible to donate.');
      return;
    }

    navigate('/donor-dashboard/donate', {
      state: {
        donationTarget: {
          kind: 'request',
          id: request.id,
          bloodType: request.bloodType,
          urgency: request.urgency,
          message: request.message,
          unitsNeeded: request.unitsNeeded || null,
          location: request.city || null,
          phone: request.phone || null,
          createdAt: request.createdAt,
          requesterName: request.fullName || null,
        },
      },
    });
  };

  return (
    <main className="alerts-page">
      <Header />
      <section className="alerts-content">
        <header className="alerts-hero">
          <span className="alerts-kicker">Public Blood Request Feed</span>
          <h1>Emergency Alerts</h1>
          <p>
            Anyone can submit a blood request here. Donors and admins can view the latest public requests below.
          </p>
          <div className="alerts-meta">
            <span>Live Feed</span>
            <span>{alerts.length} Alerts</span>
            <span>Nepal Coverage</span>
          </div>
        </header>

        <section className="alerts-card public-request-card">
          <div className="alerts-list-header">
            <h2>Public Blood Request Form</h2>
            <span className="alerts-count">New</span>
          </div>

          <form className="public-request-form" onSubmit={submitPublicRequest}>
            <div className="public-request-grid two-col">
              <label>
                Full Name
                <input name="fullName" value={requestForm.fullName} onChange={handleRequestChange} placeholder="Patient or requester name" />
              </label>
              <label>
                Phone
                <input name="phone" value={requestForm.phone} onChange={handleRequestChange} placeholder="98xxxxxxxx" />
              </label>
            </div>

            <div className="public-request-grid three-col">
              <label>
                Blood Type
                <select name="bloodType" value={requestForm.bloodType} onChange={handleRequestChange}>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>
              <label>
                Urgency
                <select name="urgency" value={requestForm.urgency} onChange={handleRequestChange}>
                  {['low', 'medium', 'high', 'critical'].map((level) => <option key={level} value={level}>{level}</option>)}
                </select>
              </label>
              <label>
                Units Needed
                <input name="unitsNeeded" type="number" min="1" max="20" value={requestForm.unitsNeeded} onChange={handleRequestChange} />
              </label>
            </div>

            <div className="public-request-grid one-col">
              <label>
                City
                <input name="city" value={requestForm.city} onChange={handleRequestChange} placeholder="Kathmandu" />
              </label>
              <label>
                Message
                <textarea value={requestMessage} onChange={(e) => setRequestMessage(e.target.value)} placeholder="Describe the blood need and request details." rows="4" />
              </label>
            </div>

            {requestError ? <p className="alerts-error">{requestError}</p> : null}
            {requestSuccess ? <p className="alerts-success">{requestSuccess}</p> : null}

            <button className="public-request-submit" type="submit" disabled={requestLoading}>
              {requestLoading ? 'Submitting...' : 'Submit Blood Request'}
            </button>
          </form>
        </section>

        <section className="alerts-card">
          <div className="alerts-list-header">
            <h2>Recent Alerts</h2>
            <span className="alerts-count">{alerts.length}</span>
          </div>

          {isDonor && donorActionMessage ? <p className="alerts-success">{donorActionMessage}</p> : null}
          {isDonor && !donorEligible ? (
            <p className="alerts-error">You are currently marked not eligible to donate.</p>
          ) : null}

          {loading ? <p className="alerts-muted">Loading alerts...</p> : null}
          {error ? <p className="alerts-error">{error}</p> : null}
          {!loading && !error && alerts.length === 0 ? (
            <p className="alerts-muted">No public alerts right now. Please check again shortly.</p>
          ) : null}

          {!loading && !error ? (
            <ul className="alerts-list">
              {alerts.map((alert) => (
                <li key={alert.id}>
                  <div className="alert-top-row">
                    <h3>{alert.bloodType} Blood Needed</h3>
                    <div className="alert-badges">
                      <span className={`alert-badge urgency ${getUrgencyClass(alert.urgency)}`}>
                        {formatUrgency(alert.urgency)}
                      </span>
                      <span className={`alert-badge status ${getStatusClass(alert.status)}`}>
                        {alert.status}
                      </span>
                    </div>
                  </div>
                  <p>{alert.message}</p>
                  <small>
                    Source: Platform Admin |{' '}
                    {new Date(alert.createdAt).toLocaleString()}
                  </small>
                  {isDonor ? (
                    <div className="alert-actions">
                      <button
                        type="button"
                        className="donate-btn"
                        onClick={() => handleDonateAlert(alert)}
                        disabled={!donorEligible}
                      >
                        Donate
                      </button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="alerts-card">
          <div className="alerts-list-header">
            <h2>Recent Public Requests</h2>
            <span className="alerts-count">{requests.length}</span>
          </div>

          {!loading && requests.length === 0 ? (
            <p className="alerts-muted">No public blood requests yet.</p>
          ) : null}

          <ul className="alerts-list">
            {requests.map((request) => (
              <li key={request.id}>
                <div className="alert-top-row">
                  <h3>{request.bloodType} Blood Request</h3>
                  <div className="alert-badges">
                    <span className={`alert-badge urgency ${getUrgencyClass(request.urgency)}`}>
                      {formatUrgency(request.urgency)}
                    </span>
                    <span className="alert-badge status active">Open</span>
                  </div>
                </div>
                <p>{request.message}</p>
                <small>
                  {request.fullName} | {request.phone} {request.city ? `| ${request.city}` : ''} | {request.unitsNeeded} unit(s)
                </small>
                {isDonor ? (
                  <div className="alert-actions">
                    <button
                      type="button"
                      className="donate-btn"
                      onClick={() => handleDonateRequest(request)}
                      disabled={!donorEligible}
                    >
                      Donate
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
};

export default AlertsPage;
