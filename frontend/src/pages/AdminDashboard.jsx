import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import DashboardState from '../components/DashboardState';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const alertsPerPage = 8;
  const [inventory, setInventory] = useState([]);
  const [donors, setDonors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [alertSort, setAlertSort] = useState('newest');
  const [alertPage, setAlertPage] = useState(1);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [alertForm, setAlertForm] = useState({
    bloodType: 'O+',
    urgency: 'high',
    message: '',
    radiusKm: 10,
    latitude: 27.7172,
    longitude: 85.324,
  });
  const [feedback, setFeedback] = useState('');

  const loadData = async () => {
    const [invRes, donorRes, hospitalRes, historyRes] = await Promise.all([
      api.get('/inventory'),
      api.get('/donors'),
      api.get('/hospitals'),
      api.get('/alerts/history'),
    ]);
    setInventory(invRes.data);
    setDonors(donorRes.data);
    setHospitals(hospitalRes.data);
    setAlertHistory(historyRes.data);
  };

  useEffect(() => {
    loadData()
      .then(() => setStatus('ready'))
      .catch(() => {
        setError('Failed to load admin data');
        setStatus('error');
      });
  }, []);

  const inventorySummary = useMemo(() => {
    const summary = {};
    for (const item of inventory) {
      summary[item.bloodType] = (summary[item.bloodType] || 0) + Number(item.unitsAvailable || 0);
    }
    return summary;
  }, [inventory]);

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

  const triggerAlert = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/alerts/trigger', alertForm);
      const historyRes = await api.get('/alerts/history');
      setAlertHistory(historyRes.data);
      setFeedback(`Alert sent. Matched donors: ${res.data.matchedDonors}`);
    } catch (error) {
      setFeedback(error.response?.data?.error || 'Could not trigger alert');
    }
  };

  if (status === 'loading') {
    return (
      <main className="admin-dashboard">
        <DashboardState type="loading" message="Loading admin dashboard..." />
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="admin-dashboard">
        <DashboardState type="error" message={error} />
      </main>
    );
  }

  return (
    <main className="admin-dashboard">
      <header className="admin-hero">
        <h1>Admin Dashboard</h1>
        <p>Monitor inventory and trigger urgent alerts.</p>
      </header>

      <section className="tile-grid">
        {Object.entries(inventorySummary).map(([type, units]) => (
          <article className="tile" key={type}>
            <h3>{type}</h3>
            <p>{units} units</p>
          </article>
        ))}
      </section>

      <section className="panel">
        <h3>Trigger Alert</h3>
        <form className="alert-form" onSubmit={triggerAlert}>
          <select
            value={alertForm.bloodType}
            onChange={(e) => setAlertForm((prev) => ({ ...prev, bloodType: e.target.value }))}
          >
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
          <select
            value={alertForm.urgency}
            onChange={(e) => setAlertForm((prev) => ({ ...prev, urgency: e.target.value }))}
          >
            {['low', 'medium', 'high', 'critical'].map((urgency) => (
              <option key={urgency}>{urgency}</option>
            ))}
          </select>
          <input
            value={alertForm.radiusKm}
            type="number"
            min="1"
            onChange={(e) => setAlertForm((prev) => ({ ...prev, radiusKm: Number(e.target.value) }))}
          />
          <textarea
            placeholder="Alert message"
            value={alertForm.message}
            onChange={(e) => setAlertForm((prev) => ({ ...prev, message: e.target.value }))}
          />
          <button type="submit">Send Alert</button>
        </form>
        <p>{feedback}</p>
      </section>

      <section className="lists">
        <article className="panel">
          <h3>Donors</h3>
          <ul>
            {donors.map((donor) => (
              <li key={donor.id}>{donor.user?.fullName || donor.id}</li>
            ))}
          </ul>
        </article>
        <article className="panel">
          <h3>Hospitals</h3>
          <ul>
            {hospitals.map((hospital) => (
              <li key={hospital.id}>{hospital.name}</li>
            ))}
          </ul>
        </article>
        <article className="panel">
          <h3>Alert History</h3>
          <div className="history-controls">
            <select value={alertSort} onChange={(e) => setAlertSort(e.target.value)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="urgency">Urgency high to low</option>
              <option value="status">Status (A-Z)</option>
            </select>
            <p>
              Showing {pagedAlertHistory.length} of {sortedAlertHistory.length} alerts
            </p>
          </div>
          <ul>
            {pagedAlertHistory.map((alert) => (
              <li key={alert.id}>
                {alert.createdAt?.slice(0, 10)} - {alert.bloodType} - {alert.urgency} - {alert.status}
              </li>
            ))}
          </ul>
          <div className="history-pagination">
            <button type="button" onClick={() => setAlertPage((prev) => Math.max(1, prev - 1))} disabled={alertPage === 1}>
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
        </article>
      </section>
    </main>
  );
};

export default AdminDashboard;
