import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import DashboardState from '../components/DashboardState';
import { useAuth } from '../hooks/useAuth';
import './HospitalDashboard.css';

const HospitalDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const alertsPerPage = 8;
  const [profile, setProfile] = useState(null);
  const [donors, setDonors] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [alertSort, setAlertSort] = useState('newest');
  const [alertPage, setAlertPage] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [alertForm, setAlertForm] = useState({
    bloodType: 'O+',
    urgency: 'high',
    radiusKm: 10,
    message: 'Urgent blood required at hospital.',
  });
  const [donorFilters, setDonorFilters] = useState({
    bloodType: 'all',
    city: 'all',
    eligibility: 'eligible',
  });
  const [status, setStatus] = useState('loading');

  const loadData = async () => {
    const [hospitalRes, donorRes, historyRes] = await Promise.all([
      api.get('/hospitals/me'),
      api.get('/donors'),
      api.get('/alerts/history'),
    ]);

    setProfile(hospitalRes.data);
    setDonors(donorRes.data);
    setAlertHistory(historyRes.data);
  };

  useEffect(() => {
    loadData()
      .then(() => setStatus('ready'))
      .catch((loadError) => {
        setError(loadError.response?.data?.error || 'Failed to load hospital dashboard data.');
        setStatus('error');
      });
  }, []);

  const cityOptions = useMemo(() => {
    const cities = Array.from(new Set(donors.map((donor) => donor.city).filter(Boolean)));
    return ['all', ...cities];
  }, [donors]);

  const filteredDonors = useMemo(() => {
    return donors.filter((donor) => {
      if (donorFilters.bloodType !== 'all' && donor.bloodType !== donorFilters.bloodType) {
        return false;
      }

      if (donorFilters.city !== 'all' && donor.city !== donorFilters.city) {
        return false;
      }

      if (donorFilters.eligibility === 'eligible' && !donor.isEligible) {
        return false;
      }

      if (donorFilters.eligibility === 'not_eligible' && donor.isEligible) {
        return false;
      }

      return true;
    });
  }, [donors, donorFilters]);

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

  const triggerAlert = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const payload = {
        bloodType: alertForm.bloodType,
        urgency: alertForm.urgency,
        radiusKm: alertForm.radiusKm,
        message: alertForm.message,
      };

      const response = await api.post('/alerts/trigger', payload);
      setMessage(`Alert sent. Matched donors: ${response.data.matchedDonors}`);
      const historyRes = await api.get('/alerts/history');
      setAlertHistory(historyRes.data);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to trigger alert.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (status === 'loading') {
    return (
      <main className="hospital-dashboard">
        <DashboardState type="loading" message="Loading hospital dashboard..." />
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="hospital-dashboard">
        <DashboardState type="error" message={error} />
      </main>
    );
  }

  return (
    <main className="hospital-dashboard">
      <header className="hospital-hero">
        <div className="hospital-hero-top">
          <h1>Hospital Dashboard</h1>
          <button type="button" className="hospital-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <p>Coordinate urgent blood requests and review donor availability.</p>
      </header>

      <section className="hospital-grid">
        <article className="hospital-card">
          <h3>Hospital Profile</h3>
          <p>Name: {profile?.name}</p>
          <p>City: {profile?.city || 'N/A'}</p>
          <p>Contact: {profile?.contactPhone || 'N/A'}</p>
          <p>Address: {profile?.address}</p>
        </article>

        <article className="hospital-card">
          <h3>Trigger Emergency Alert</h3>
          <form className="hospital-form" onSubmit={triggerAlert}>
            <select
              value={alertForm.bloodType}
              onChange={(event) => setAlertForm((prev) => ({ ...prev, bloodType: event.target.value }))}
            >
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              value={alertForm.urgency}
              onChange={(event) => setAlertForm((prev) => ({ ...prev, urgency: event.target.value }))}
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
              value={alertForm.radiusKm}
              onChange={(event) =>
                setAlertForm((prev) => ({ ...prev, radiusKm: Number(event.target.value) || 1 }))
              }
            />

            <textarea
              value={alertForm.message}
              onChange={(event) => setAlertForm((prev) => ({ ...prev, message: event.target.value }))}
            />

            <button type="submit">Send Alert</button>
          </form>
        </article>
      </section>

      <section className="hospital-card">
        <h3>Donor Matching</h3>
        <div className="hospital-filters">
          <select
            value={donorFilters.bloodType}
            onChange={(event) => setDonorFilters((prev) => ({ ...prev, bloodType: event.target.value }))}
          >
            <option value="all">All blood types</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={donorFilters.city}
            onChange={(event) => setDonorFilters((prev) => ({ ...prev, city: event.target.value }))}
          >
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city === 'all' ? 'All cities' : city}
              </option>
            ))}
          </select>

          <select
            value={donorFilters.eligibility}
            onChange={(event) => setDonorFilters((prev) => ({ ...prev, eligibility: event.target.value }))}
          >
            <option value="eligible">Eligible only</option>
            <option value="not_eligible">Not eligible only</option>
            <option value="all">All donors</option>
          </select>
        </div>

        <p>Matching donors: {filteredDonors.length}</p>
        <ul className="hospital-list">
          {filteredDonors.slice(0, 15).map((donor) => (
            <li key={donor.id}>
              {donor.user?.fullName || 'Unknown'} - {donor.bloodType} - {donor.city || 'N/A'} -{' '}
              {donor.isEligible ? 'Eligible' : 'Not eligible'}
            </li>
          ))}
        </ul>
      </section>

      <section className="hospital-card">
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
        <ul className="hospital-list">
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

      {message ? <p className="hospital-message">{message}</p> : null}
    </main>
  );
};

export default HospitalDashboard;
