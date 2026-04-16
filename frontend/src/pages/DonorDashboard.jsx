import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { feedbackService } from '../services/feedbackService';
import FeedbackRating from '../components/FeedbackRating';
import DashboardState from '../components/DashboardState';
import { useAuth } from '../hooks/useAuth';
import './DonorDashboard.css';

const donationCooldownDays = 56;

const DonorDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [donorProfile, setDonorProfile] = useState(null);
  const [donations, setDonations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    bloodType: 'O+',
    city: '',
  });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('');
  const [profileSaveStatus, setProfileSaveStatus] = useState('');
  const [eligibilityValue, setEligibilityValue] = useState(true);
  const [eligibilitySaving, setEligibilitySaving] = useState(false);
  const [eligibilityStatus, setEligibilityStatus] = useState('');
  const [donateActionStatus, setDonateActionStatus] = useState('');

  const donorNavItems = useMemo(
    () => [
      { key: 'overview', label: 'Overview', path: '/donor-dashboard' },
      { key: 'profile', label: 'Profile', path: '/donor-dashboard/profile' },
      { key: 'eligibility', label: 'Eligibility', path: '/donor-dashboard/eligibility' },
      { key: 'history', label: 'Donation History', path: '/donor-dashboard/history' },
      { key: 'alerts', label: 'Alerts', path: '/donor-dashboard/alerts' },
      { key: 'feedback', label: 'Feedback', path: '/donor-dashboard/feedback' },
    ],
    []
  );

  const activeSection = useMemo(() => {
    const exact = donorNavItems.find((item) => item.path === location.pathname);
    return exact ? exact.key : 'overview';
  }, [location.pathname, donorNavItems]);

  const loadData = useCallback(async () => {
    try {
      const me = await api.get('/auth/me');
      setProfile(me.data);

      const donorProfileRes = await api.get('/donors/me');
      const matchedDonorProfile = donorProfileRes.data;
      setDonorProfile(matchedDonorProfile || null);
      setEligibilityValue(Boolean(matchedDonorProfile?.isEligible));
      setProfileForm({
        fullName: me.data?.fullName || '',
        phone: me.data?.phone || '',
        bloodType: matchedDonorProfile?.bloodType || 'O+',
        city: matchedDonorProfile?.city || '',
      });

      if (matchedDonorProfile) {
        const donationsRes = await api.get(`/donations?donorId=${matchedDonorProfile.id}`);
        setDonations(donationsRes.data);
      }

      const alertsRes = await api.get('/alerts/public');
      setAlerts(alertsRes.data || []);

      setStatus('ready');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load donor dashboard');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const intervalId = window.setInterval(async () => {
      try {
        const alertsRes = await api.get('/alerts/public');
        setAlerts(alertsRes.data || []);
      } catch (_) {
        // Keep previous alert list if a refresh call fails.
      }
    }, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const nextEligibleDate = useMemo(() => {
    if (!donations.length) {
      return 'Eligible now';
    }

    const latest = new Date(donations[0].donationDate);
    const next = new Date(latest);
    next.setDate(next.getDate() + donationCooldownDays);

    const now = new Date();
    if (next <= now) {
      return 'Eligible now';
    }

    return next.toLocaleDateString();
  }, [donations]);

  const totalUnitsDonated = useMemo(
    () => donations.reduce((sum, item) => sum + Number(item.unitsDonated || 0), 0),
    [donations]
  );

  const donorAvailabilityStatus = useMemo(
    () => (donorProfile?.isEligible ? 'Eligible to donate' : 'Not eligible right now'),
    [donorProfile?.isEligible]
  );

  const handleFeedback = async (payload) => {
    if (!donorProfile) {
      setFeedbackStatus('Cannot submit feedback: donor profile not found.');
      return;
    }

    try {
      const latestDonationId = donations.length > 0 ? donations[0].id : null;
      await feedbackService.createFeedback({
        donorId: donorProfile.id,
        donationId: latestDonationId,
        rating: payload.rating,
        comment: payload.comment,
      });
      setFeedbackStatus('Feedback submitted successfully.');
    } catch (submitError) {
      setFeedbackStatus(submitError.response?.data?.error || 'Failed to submit feedback.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleProfileInputChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    if (!donorProfile?.id) {
      setProfileSaveStatus('Cannot update profile right now.');
      return;
    }

    try {
      setProfileSaveStatus('');

      const userPayload = {
        fullName: profileForm.fullName.trim(),
        phone: profileForm.phone.trim(),
      };

      const donorPayload = {
        bloodType: profileForm.bloodType,
        city: profileForm.city.trim(),
      };

      const [userRes, donorRes] = await Promise.all([
        api.put('/auth/me', userPayload),
        api.put(`/donors/${donorProfile.id}`, donorPayload),
      ]);

      setProfile(userRes.data.user);
      setDonorProfile(donorRes.data);
      setProfileSaveStatus('Profile updated successfully.');
    } catch (saveError) {
      setProfileSaveStatus(saveError.response?.data?.error || 'Could not update profile.');
    }
  };

  const handleEligibilitySave = async () => {
    if (!donorProfile?.id) {
      setEligibilityStatus('Cannot update eligibility right now.');
      return;
    }

    try {
      setEligibilitySaving(true);
      setEligibilityStatus('');
      const res = await api.put(`/donors/${donorProfile.id}`, {
        isEligible: eligibilityValue,
      });
      setDonorProfile(res.data);
      setEligibilityStatus('Eligibility updated successfully.');
    } catch (saveError) {
      setEligibilityStatus(saveError.response?.data?.error || 'Could not update eligibility.');
    } finally {
      setEligibilitySaving(false);
    }
  };

  const handleDonateNow = async () => {
    if (!donorProfile?.id) {
      setDonateActionStatus('Donor profile not found.');
      return;
    }

    try {
      setDonateActionStatus('');
      await api.post('/donations/self');
      await loadData();
      setDonateActionStatus('Donation recorded. Overview updated.');
    } catch (donateError) {
      setDonateActionStatus(donateError.response?.data?.error || 'Could not record donation.');
    }
  };

  const handleHome = () => {
    navigate('/');
  };

  const goToSection = (path) => {
    navigate(path);
  };

  const renderOverview = () => (
    <>
      <header className="donor-hero">
        <h2>Donor Dashboard</h2>
        <p>Track your impact, monitor eligibility, and stay ready for emergencies.</p>
      </header>

      <section className="donor-stat-grid">
        <article className="donor-stat-card donor-stat-card-primary">
          <h3>Total Donations</h3>
          <p>{donations.length}</p>
          <small>All-time contributions</small>
        </article>
        <article className="donor-stat-card">
          <h3>Units Donated</h3>
          <p>{totalUnitsDonated}</p>
          <small>Total units donated</small>
        </article>
        <article className="donor-stat-card">
          <h3>Blood Type</h3>
          <p>{donorProfile?.bloodType || 'N/A'}</p>
          <small>Registered donor type</small>
        </article>
        <article className="donor-stat-card">
          <h3>Eligibility</h3>
          <p>{donorProfile?.isEligible ? 'Ready' : 'Paused'}</p>
          <small>{`Availability: ${donorAvailabilityStatus}`}</small>
        </article>
      </section>
    </>
  );

  const renderProfile = () => (
    <section className="donor-card">
      <h3>My Profile</h3>
      <form className="donor-profile-form" onSubmit={handleProfileSave}>
        <div className="donor-profile-grid">
          <label>
            <span>Full Name</span>
            <input
              type="text"
              name="fullName"
              value={profileForm.fullName}
              onChange={handleProfileInputChange}
              required
            />
          </label>
          <label>
            <span>Email</span>
            <input type="email" value={profile?.email || ''} disabled />
          </label>
          <label>
            <span>Phone</span>
            <input
              type="text"
              name="phone"
              value={profileForm.phone}
              onChange={handleProfileInputChange}
              placeholder="+977..."
            />
          </label>
          <label>
            <span>Blood Type</span>
            <select name="bloodType" value={profileForm.bloodType} onChange={handleProfileInputChange}>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>City / Place</span>
            <input
              type="text"
              name="city"
              value={profileForm.city}
              onChange={handleProfileInputChange}
              placeholder="Kathmandu"
            />
          </label>
          <label>
            <span>Role</span>
            <input type="text" value={profile?.role || 'donor'} disabled />
          </label>
        </div>
        <div className="donor-profile-actions">
          <button type="submit">Save Profile</button>
          {profileSaveStatus ? <p>{profileSaveStatus}</p> : null}
        </div>
      </form>
    </section>
  );

  const renderEligibility = () => (
    <section className="donor-card">
      <h3>Eligibility Status</h3>
      <p className="donor-lead-value">{donorAvailabilityStatus}</p>
      <p>Total donations logged: {donations.length}</p>
      <p>Minimum wait between donations: {donationCooldownDays} days.</p>
      <p>Next date by donation interval: {nextEligibleDate}</p>
      <div className="eligibility-controls">
        <label htmlFor="donorEligibility" className="eligibility-label">
          Donor Availability
        </label>
        <select
          id="donorEligibility"
          value={eligibilityValue ? 'eligible' : 'not-eligible'}
          onChange={(event) => setEligibilityValue(event.target.value === 'eligible')}
        >
          <option value="eligible">Eligible to donate</option>
          <option value="not-eligible">Not eligible right now</option>
        </select>
        <button type="button" onClick={handleEligibilitySave} disabled={eligibilitySaving}>
          {eligibilitySaving ? 'Saving...' : 'Save Eligibility'}
        </button>
        {eligibilityStatus ? <p className="eligibility-status">{eligibilityStatus}</p> : null}
      </div>
    </section>
  );

  const renderHistory = () => (
    <section className="donor-card">
      <h3>Donation History</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Blood Type</th>
              <th>Units</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((item) => (
              <tr key={item.id}>
                <td>{item.donationDate}</td>
                <td>{item.bloodType}</td>
                <td>{item.unitsDonated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderAlerts = () => (
    <section className="donor-card">
      <h3>All Alerts</h3>
      {alerts.length === 0 ? (
        <p>No alerts available right now.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Blood Type</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id}>
                  <td>{alert.createdAt?.slice(0, 10) || '-'}</td>
                  <td>{alert.bloodType}</td>
                  <td>
                    <span className={`donor-alert-urgency donor-alert-urgency-${alert.urgency}`}>
                      {alert.urgency}
                    </span>
                  </td>
                  <td>{alert.status}</td>
                  <td>{alert.message}</td>
                  <td>
                    <button type="button" className="donor-alert-donate-btn" onClick={handleDonateNow}>
                      Donate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {donateActionStatus ? <p className="eligibility-status">{donateActionStatus}</p> : null}
    </section>
  );

  const renderFeedback = () => (
    <section className="donor-card">
      <h3>Donation Feedback</h3>
      <FeedbackRating onSubmit={handleFeedback} />
      {feedbackStatus ? <p className="feedback-status">{feedbackStatus}</p> : null}
    </section>
  );

  const renderActivePage = () => {
    if (activeSection === 'profile') {
      return renderProfile();
    }

    if (activeSection === 'eligibility') {
      return renderEligibility();
    }

    if (activeSection === 'history') {
      return renderHistory();
    }

    if (activeSection === 'alerts') {
      return renderAlerts();
    }

    if (activeSection === 'feedback') {
      return renderFeedback();
    }

    return renderOverview();
  };

  if (status === 'loading') {
    return (
      <main className="donor-dashboard">
        <DashboardState type="loading" message="Loading donor dashboard..." />
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="donor-dashboard error">
        <DashboardState type="error" message={error} />
      </main>
    );
  }

  return (
    <main className="donor-dashboard">
      <div className="donor-shell">
        <aside className="donor-sidebar">
          <div className="donor-sidebar-brand">
            <span className="donor-brand-mark" aria-hidden="true">+</span>
            <div>
              <h1>Donor Hub</h1>
              <p>My Dashboard</p>
            </div>
          </div>

          <p className="donor-sidebar-label">Menu</p>

          <nav className="donor-nav" aria-label="Donor sections">
            {donorNavItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`donor-nav-btn${activeSection === item.key ? ' active' : ''}`}
                onClick={() => goToSection(item.path)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="donor-sidebar-actions">
            <button type="button" className="dashboard-home-btn" onClick={handleHome}>
              Back to Home
            </button>
            <button type="button" className="dashboard-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </aside>

        <div className="donor-workspace">
          <header className="donor-topbar">
            <input
              type="search"
              className="donor-search"
              placeholder="Search donations or profile details"
            />
            <div className="donor-user-chip">
              <span className="donor-avatar">D</span>
              <span>{profile?.fullName || 'Donor'}</span>
            </div>
          </header>

          {renderActivePage()}
        </div>
      </div>
    </main>
  );
};

export default DonorDashboard;
