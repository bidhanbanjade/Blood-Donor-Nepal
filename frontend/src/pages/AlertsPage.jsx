import { useEffect, useState } from 'react';
import Header from '../components/Header';
import api from '../services/api';
import './AlertsPage.css';

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
          <h1>Emergency Alerts</h1>
          <p>Track active and recently published blood requests.</p>
        </header>

        <section className="alerts-card">
          {loading ? <p>Loading alerts...</p> : null}
          {error ? <p className="alerts-error">{error}</p> : null}
          {!loading && !error ? (
            <ul className="alerts-list">
              {alerts.map((alert) => (
                <li key={alert.id}>
                  <h3>
                    {alert.bloodType} | {alert.urgency.toUpperCase()} | {alert.status}
                  </h3>
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
