import { useEffect, useState } from 'react';
import Header from '../components/Header';
import api from '../services/api';
import './AlertsPage.css';

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
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const response = await api.get('/alerts/public');
        setAlerts(response.data || []);
      } catch (loadError) {
        setError(loadError.response?.data?.error || 'Could not load alerts right now.');
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, []);

  return (
    <main className="alerts-page">
      <Header />
      <section className="alerts-content">
        <header className="alerts-hero">
          <span className="alerts-kicker">Public Blood Request Feed</span>
          <h1>Emergency Alerts</h1>
          <p>
            Track active and recently published blood requests from hospitals, blood banks, and
            verified platform operators.
          </p>
          <div className="alerts-meta">
            <span>Live Feed</span>
            <span>{alerts.length} Alerts</span>
            <span>Nepal Coverage</span>
          </div>
        </header>

        <section className="alerts-card">
          <div className="alerts-list-header">
            <h2>Recent Alerts</h2>
            <span className="alerts-count">{alerts.length}</span>
          </div>

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
                    Source: {alert.hospital?.name || alert.bloodBank?.name || 'Platform Admin'} |{' '}
                    {new Date(alert.createdAt).toLocaleString()}
                  </small>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </section>
    </main>
  );
};

export default AlertsPage;
