import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import DashboardState from '../components/DashboardState';
import { useAuth } from '../hooks/useAuth';
import './BloodBankDashboard.css';

const BloodBankDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const alertsPerPage = 8;
  const lowStockThreshold = 5;
  const [profile, setProfile] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [alertSort, setAlertSort] = useState('newest');
  const [alertPage, setAlertPage] = useState(1);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [stockForm, setStockForm] = useState({ bloodType: 'O+', unitsAvailable: 10 });
  const [urgentForm, setUrgentForm] = useState({
    bloodType: 'O+',
    urgency: 'high',
    radiusKm: 12,
    message: 'Urgent blood bank request for immediate donation.',
  });

  const loadDashboard = async () => {
    const profileRes = await api.get('/blood-banks/me');
    const [inventoryRes, historyRes] = await Promise.all([
      api.get(`/inventory?bloodBankId=${profileRes.data.id}`),
      api.get('/alerts/history'),
    ]);

    setProfile(profileRes.data);
    setInventory(inventoryRes.data);
    setAlertHistory(historyRes.data);
  };

  useEffect(() => {
    loadDashboard()
      .then(() => setStatus('ready'))
      .catch((loadError) => {
        setError(loadError.response?.data?.error || 'Failed to load dashboard data.');
        setStatus('error');
      });
  }, []);

  const maxUnits = useMemo(() => {
    if (!inventory.length) {
      return 1;
    }
    return Math.max(...inventory.map((item) => Number(item.unitsAvailable || 0)), 1);
  }, [inventory]);

  const lowStockItems = useMemo(() => {
    return inventory.filter((item) => Number(item.unitsAvailable || 0) <= lowStockThreshold);
  }, [inventory]);

  const thresholdPercent = useMemo(() => {
    return Math.min(100, Math.max(0, Math.round((lowStockThreshold / maxUnits) * 100)));
  }, [lowStockThreshold, maxUnits]);

  const sortedAlertHistory = useMemo(() => {
    const urgencyRank = { critical: 4, high: 3, medium: 2, low: 1 };
    const sorted = [...alertHistory];

    if (alertSort === 'oldest') {
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      return sorted;
    }

    if (alertSort === 'urgency') {
      sorted.sort((a, b) => (urgencyRank[b.urgency] || 0) - (urgencyRank[a.urgency] || 0));
      return sorted;
    }

    if (alertSort === 'status') {
      sorted.sort((a, b) => String(a.status || '').localeCompare(String(b.status || '')));
      return sorted;
    }

    sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sorted;
  }, [alertHistory, alertSort]);

  const totalAlertPages = Math.max(1, Math.ceil(sortedAlertHistory.length / alertsPerPage));

  const pagedAlertHistory = useMemo(() => {
    const start = (alertPage - 1) * alertsPerPage;
    return sortedAlertHistory.slice(start, start + alertsPerPage);
  }, [sortedAlertHistory, alertPage]);

  useEffect(() => {
    setAlertPage(1);
  }, [alertSort, alertHistory.length]);

  const updateStock = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      await api.post('/inventory', stockForm);
      await loadDashboard();
      setMessage('Inventory updated successfully.');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to update inventory.');
    }
  };

  const sendUrgentRequest = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const response = await api.post('/blood-banks/urgent-request', urgentForm);
      const historyRes = await api.get('/alerts/history');
      setAlertHistory(historyRes.data);
      setMessage(`Urgent request sent. Matched donors: ${response.data.matchedDonors}`);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to send urgent request.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (status === 'loading') {
    return (
      <main className="bloodbank-dashboard">
        <DashboardState type="loading" message="Loading blood bank dashboard..." />
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="bloodbank-dashboard">
        <DashboardState type="error" message={error} />
      </main>
    );
  }

  return (
    <main className="bloodbank-dashboard">
      <header className="bloodbank-hero">
        <div className="bloodbank-hero-top">
          <h1>Blood Bank Dashboard</h1>
          <button type="button" className="bloodbank-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <p>Manage inventory and publish urgent requests to nearby eligible donors.</p>
      </header>

      <section className="bloodbank-grid">
        <article className="bloodbank-card">
          <h3>Blood Bank Profile</h3>
          <p>Name: {profile?.name || 'Loading...'}</p>
          <p>City: {profile?.city || 'N/A'}</p>
          <p>Address: {profile?.address || 'N/A'}</p>
          <p>Contact: {profile?.contactPhone || 'N/A'}</p>
        </article>

        <article className="bloodbank-card">
          <h3>Update Inventory</h3>
          <form className="bloodbank-form" onSubmit={updateStock}>
            <select
              value={stockForm.bloodType}
              onChange={(event) => setStockForm((prev) => ({ ...prev, bloodType: event.target.value }))}
            >
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="0"
              value={stockForm.unitsAvailable}
              onChange={(event) =>
                setStockForm((prev) => ({ ...prev, unitsAvailable: Number(event.target.value) || 0 }))
              }
            />

            <button type="submit">Save Stock</button>
          </form>
        </article>
      </section>

      <section className="bloodbank-card">
        <h3>Current Inventory</h3>
        <ul className="bloodbank-list">
          {inventory.map((item) => (
            <li key={item.id}>
              {item.bloodType}: {item.unitsAvailable} units ({item.availabilityFlag ? 'Available' : 'Unavailable'})
            </li>
          ))}
        </ul>
      </section>

      <section className="bloodbank-card">
        <h3>Inventory Chart</h3>
        <div className="chart-legend">
          <span className="legend-item">
            <span className="legend-swatch legend-stock" /> Current stock level
          </span>
          <span className="legend-item">
            <span className="legend-swatch legend-threshold" /> Low-stock threshold ({lowStockThreshold} units)
          </span>
        </div>
        <div className="bloodbank-chart">
          {inventory.map((item) => {
            const units = Number(item.unitsAvailable || 0);
            const width = Math.max(6, Math.round((units / maxUnits) * 100));

            return (
              <div className="chart-row" key={`chart-${item.id}`}>
                <span className="chart-label">{item.bloodType}</span>
                <div className="chart-track">
                  <div className="chart-threshold-marker" style={{ left: `${thresholdPercent}%` }} />
                  <div className="chart-bar" style={{ width: `${width}%` }} />
                </div>
                <span className="chart-value">{units}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bloodbank-card low-stock-card">
        <h3>Low Stock Warnings</h3>
        {lowStockItems.length === 0 ? (
          <p>All blood types are above low-stock threshold ({lowStockThreshold} units).</p>
        ) : (
          <ul className="bloodbank-list">
            {lowStockItems.map((item) => (
              <li key={`warn-${item.id}`}>
                Warning: {item.bloodType} has only {item.unitsAvailable} units.
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bloodbank-card">
        <h3>Urgent Request</h3>
        <form className="bloodbank-form" onSubmit={sendUrgentRequest}>
          <select
            value={urgentForm.bloodType}
            onChange={(event) => setUrgentForm((prev) => ({ ...prev, bloodType: event.target.value }))}
          >
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={urgentForm.urgency}
            onChange={(event) => setUrgentForm((prev) => ({ ...prev, urgency: event.target.value }))}
          >
            {['low', 'medium', 'high', 'critical'].map((urgency) => (
              <option key={urgency} value={urgency}>
                {urgency}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            value={urgentForm.radiusKm}
            onChange={(event) =>
              setUrgentForm((prev) => ({ ...prev, radiusKm: Number(event.target.value) || 1 }))
            }
          />

          <textarea
            value={urgentForm.message}
            onChange={(event) => setUrgentForm((prev) => ({ ...prev, message: event.target.value }))}
          />

          <button type="submit">Send Urgent Request</button>
        </form>
      </section>

      <section className="bloodbank-card">
        <h3>Alert History</h3>
        <div className="history-controls">
          <select value={alertSort} onChange={(event) => setAlertSort(event.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="urgency">Urgency high to low</option>
            <option value="status">Status (A-Z)</option>
          </select>
          <p>
            Showing {pagedAlertHistory.length} of {sortedAlertHistory.length} alerts
          </p>
        </div>
        <ul className="bloodbank-list">
          {pagedAlertHistory.map((alert) => (
            <li key={alert.id}>
              {alert.createdAt?.slice(0, 10)} - {alert.bloodType} - {alert.urgency} - {alert.status}
            </li>
          ))}
        </ul>
        <div className="history-pagination">
          <button
            type="button"
            onClick={() => setAlertPage((prev) => Math.max(1, prev - 1))}
            disabled={alertPage === 1}
          >
            Previous
          </button>
          <span>
            Page {alertPage} of {totalAlertPages}
          </span>
          <button
            type="button"
            onClick={() => setAlertPage((prev) => Math.min(totalAlertPages, prev + 1))}
            disabled={alertPage >= totalAlertPages}
          >
            Next
          </button>
        </div>
      </section>

      {message ? <p className="bloodbank-message">{message}</p> : null}
    </main>
  );
};

export default BloodBankDashboard;
