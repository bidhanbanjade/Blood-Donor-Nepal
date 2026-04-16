import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import DashboardState from '../components/DashboardState';
import { useAuth } from '../hooks/useAuth';
import './AdminDashboard.css';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const alertsPerPage = 8;
  const [inventory, setInventory] = useState([]);
  const [donors, setDonors] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [publicRequests, setPublicRequests] = useState([]);
  const [alertSort, setAlertSort] = useState('newest');
  const [alertPage, setAlertPage] = useState(1);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [alertForm, setAlertForm] = useState({
    bloodType: 'O+',
    urgency: 'high',
    message: '',
    radiusKm: 10,
    latitude: 27.7172,
    longitude: 85.324,
  });
  const [feedback, setFeedback] = useState('');

  const totalUnits = useMemo(
    () => inventory.reduce((sum, item) => sum + Number(item.unitsAvailable || 0), 0),
    [inventory]
  );

  const criticalAlerts = useMemo(
    () => alertHistory.filter((alert) => alert.urgency === 'critical').length,
    [alertHistory]
  );

  const navItems = useMemo(
    () => [
      { key: 'overview', label: 'Overview', path: '/admin-dashboard' },
      { key: 'inventory', label: 'Inventory', path: '/admin-dashboard/inventory' },
      { key: 'trigger-alert', label: 'Trigger Alert', path: '/admin-dashboard/trigger-alert' },
      { key: 'donors', label: 'Donors', path: '/admin-dashboard/donors' },
      { key: 'alert-history', label: 'Alert History', path: '/admin-dashboard/alert-history' },
      { key: 'public-requests', label: 'Public Requests', path: '/admin-dashboard/public-requests' },
    ],
    []
  );

  const activeSection = useMemo(() => {
    const exact = navItems.find((item) => item.path === location.pathname);
    return exact ? exact.key : 'overview';
  }, [location.pathname, navItems]);

  const loadData = useCallback(async ({ silent = false } = {}) => {
    try {
      const [invRes, donorRes, historyRes, publicReqRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/donors'),
        api.get('/alerts/history'),
        api.get('/public-requests/public'),
      ]);
      setInventory(invRes.data);
      setDonors(donorRes.data);
      setAlertHistory(historyRes.data);
      setPublicRequests(publicReqRes.data);
      setLastUpdated(new Date().toLocaleTimeString());
      setError('');
      setStatus('ready');
    } catch (loadError) {
      if (!silent) {
        setError('Failed to load admin data');
        setStatus('error');
      }
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadData({ silent: true });
    }, 5000);

    const handleVisible = () => {
      if (document.visibilityState === 'visible') {
        loadData({ silent: true });
      }
    };

    document.addEventListener('visibilitychange', handleVisible);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisible);
    };
  }, [loadData]);

  const donorAvailabilitySummary = useMemo(() => {
    const summary = Object.fromEntries(BLOOD_TYPES.map((type) => [type, 0]));
    for (const donor of donors) {
      const bloodType = donor?.bloodType;
      if (bloodType && Object.prototype.hasOwnProperty.call(summary, bloodType)) {
        summary[bloodType] += 1;
      }
    }
    return summary;
  }, [donors]);

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
      await loadData({ silent: true });
      setFeedback(`Alert sent. Matched donors: ${res.data.matchedDonors}`);
    } catch (error) {
      setFeedback(error.response?.data?.error || 'Could not trigger alert');
    }
  };

  const handleDeleteDonor = async (donor) => {
    const donorName = donor.user?.fullName || 'this donor';
    const confirmed = window.confirm(`Remove ${donorName} permanently?`);

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/donors/${donor.id}`);
      await loadData({ silent: true });
      setFeedback(`Removed donor: ${donorName}`);
    } catch (error) {
      setFeedback(error.response?.data?.error || 'Could not remove donor');
    }
  };

  const handleDeleteAlert = async (alert) => {
    const confirmed = window.confirm(`Delete alert ${alert.bloodType} from ${alert.createdAt?.slice(0, 10)}?`);

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/alerts/${alert.id}`);
      await loadData({ silent: true });
      setFeedback('Alert removed successfully.');
    } catch (error) {
      setFeedback(error.response?.data?.error || 'Could not remove alert');
    }
  };

  const handleDeletePublicRequest = async (request) => {
    const dateText = request.createdAt?.slice(0, 10) || 'unknown date';
    const confirmed = window.confirm(
      `Delete public request from ${request.fullName || 'unknown user'} on ${dateText}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/public-requests/${request.id}`);
      await loadData({ silent: true });
      setFeedback('Public blood request removed successfully.');
    } catch (error) {
      setFeedback(error.response?.data?.error || 'Could not remove public blood request');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleHome = () => {
    navigate('/');
  };

  const goToSection = (sectionPath) => {
    navigate(sectionPath);
  };

  const renderOverview = () => (
    <>
      <header className="admin-hero">
        <h2>Dashboard</h2>
        <p>Plan, prioritize, and coordinate response across all blood requests.</p>
        <small>{`Live data \u2022 auto-refresh every 5s${lastUpdated ? ` \u2022 last updated ${lastUpdated}` : ''}`}</small>
      </header>

      <section className="stat-grid">
        <article className="stat-card stat-card-primary">
          <h3>Total Units</h3>
          <p>{totalUnits}</p>
          <small>Available across inventory</small>
        </article>
        <article className="stat-card">
          <h3>Donors</h3>
          <p>{donors.length}</p>
          <small>Registered and visible</small>
        </article>
        <article className="stat-card">
          <h3>Alerts</h3>
          <p>{alertHistory.length}</p>
          <small>Total alerts tracked</small>
        </article>
        <article className="stat-card">
          <h3>Critical</h3>
          <p>{criticalAlerts}</p>
          <small>Urgent active cases</small>
        </article>
      </section>
    </>
  );

  const renderInventory = () => (
    <section className="panel">
      <h3>Donors by Blood Type</h3>
      <div className="stat-grid">
        {Object.entries(donorAvailabilitySummary).map(([type, donorCount]) => (
          <article key={type} className="stat-card">
            <h3>{type}</h3>
            <p>{donorCount}</p>
            <small>Donors available</small>
          </article>
        ))}
      </div>
    </section>
  );

  const renderTriggerAlert = () => (
    <article className="panel">
      <h3>Trigger Alert</h3>
      <form className="alert-form" onSubmit={triggerAlert}>
        <div className="alert-form-grid">
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
            placeholder="Radius (km)"
            onChange={(e) => setAlertForm((prev) => ({ ...prev, radiusKm: Number(e.target.value) }))}
          />
        </div>
        <textarea
          placeholder="Alert message"
          value={alertForm.message}
          onChange={(e) => setAlertForm((prev) => ({ ...prev, message: e.target.value }))}
        />
        <button type="submit">Send Alert</button>
      </form>
      {feedback && <p className="panel-feedback">{feedback}</p>}
    </article>
  );

  const renderDonors = () => (
    <article className="panel">
      <h3>Donors</h3>
      <ul className="admin-donor-list">
        {donors.map((donor) => (
          <li key={donor.id} className="admin-donor-row">
            <div>
              <strong>{donor.user?.fullName || donor.id}</strong>
              <p>{donor.user?.email || 'No email'} | {donor.bloodType}</p>
            </div>
            <button type="button" className="admin-delete-btn" onClick={() => handleDeleteDonor(donor)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
    </article>
  );

  const renderAlertHistory = () => (
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
          Showing {pagedAlertHistory.length} of {sortedAlertHistory.length}
        </p>
      </div>
      <ul className="alert-history-list">
        {pagedAlertHistory.map((alert) => (
          <li key={alert.id} className="alert-history-row">
            <span>
              {alert.createdAt?.slice(0, 10)} - {alert.bloodType} - {alert.urgency} - {alert.status}
            </span>
            <button type="button" className="admin-delete-btn" onClick={() => handleDeleteAlert(alert)}>
              Remove
            </button>
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
    </article>
  );

  const renderPublicRequests = () => (
    <article className="panel">
      <h3>Public Blood Requests</h3>
      <p className="history-note">Open requests submitted from the public alerts page.</p>
      <ul className="admin-donor-list">
        {publicRequests.map((request) => (
          <li key={request.id} className="admin-donor-row">
            <div>
              <strong>{request.fullName || 'Unknown requester'}</strong>
              <p>
                {request.bloodType} | {request.urgency} | {request.city || 'Unknown city'}
              </p>
              <p>
                {request.phone || 'No phone'} | {request.createdAt?.slice(0, 10)}
              </p>
            </div>
            <button
              type="button"
              className="admin-delete-btn"
              onClick={() => handleDeletePublicRequest(request)}
            >
              Remove
            </button>
          </li>
        ))}
        {publicRequests.length === 0 && (
          <li className="admin-donor-row">
            <div>
              <strong>No public requests right now</strong>
              <p>New requests will appear here automatically.</p>
            </div>
          </li>
        )}
      </ul>
    </article>
  );

  const renderActivePage = () => {
    if (activeSection === 'inventory') {
      return renderInventory();
    }

    if (activeSection === 'trigger-alert') {
      return renderTriggerAlert();
    }

    if (activeSection === 'donors') {
      return renderDonors();
    }

    if (activeSection === 'alert-history') {
      return renderAlertHistory();
    }

    if (activeSection === 'public-requests') {
      return renderPublicRequests();
    }

    return renderOverview();
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
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-brand">
            <span className="admin-brand-mark" aria-hidden="true">+</span>
            <div>
              <h1>Blood Admin</h1>
              <p>Control Center</p>
            </div>
          </div>

          <p className="admin-sidebar-label">Menu</p>

          <nav className="admin-nav" aria-label="Admin sections">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`admin-nav-btn${activeSection === item.key ? ' active' : ''}`}
                onClick={() => goToSection(item.path)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="admin-sidebar-note">
            <strong>Admin Tip</strong>
            <p>Use "Trigger Alert" to instantly notify matching donors by urgency and blood type.</p>
          </div>

          <div className="admin-sidebar-actions">
            <button type="button" className="admin-home-btn" onClick={handleHome}>
              Back to Home
            </button>
            <button type="button" className="admin-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </aside>

        <div className="admin-workspace">
          <header className="admin-topbar">
            <input
              type="search"
              className="admin-search"
              placeholder="Search alerts, donors, or blood groups"
            />
            <div className="admin-user-chip">
              <span className="admin-avatar">A</span>
              <span>Admin</span>
            </div>
          </header>

          {renderActivePage()}
        </div>
      </div>
    </main>
  );
};

export default AdminDashboard;
