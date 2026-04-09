import { useEffect, useMemo, useState } from 'react';
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
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('');

  const donorNavItems = useMemo(
    () => [
      { key: 'overview', label: 'Overview', path: '/donor-dashboard' },
      { key: 'profile', label: 'Profile', path: '/donor-dashboard/profile' },
      { key: 'eligibility', label: 'Eligibility', path: '/donor-dashboard/eligibility' },
      { key: 'history', label: 'Donation History', path: '/donor-dashboard/history' },
      { key: 'feedback', label: 'Feedback', path: '/donor-dashboard/feedback' },
    ],
    []
  );

  const activeSection = useMemo(() => {
    const exact = donorNavItems.find((item) => item.path === location.pathname);
    return exact ? exact.key : 'overview';
  }, [location.pathname, donorNavItems]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const me = await api.get('/auth/me');
        setProfile(me.data);

        const donorProfileRes = await api.get('/donors/me');
        const matchedDonorProfile = donorProfileRes.data;
        setDonorProfile(matchedDonorProfile || null);

        if (matchedDonorProfile) {
          const donationsRes = await api.get(`/donations?donorId=${matchedDonorProfile.id}`);
          setDonations(donationsRes.data);
        }

        setStatus('ready');
      } catch (err) {
        setError(err.response?.data?.error || 'Could not load donor dashboard');
        setStatus('error');
      }
    };

    loadData();
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
          <p>{nextEligibleDate === 'Eligible now' ? 'Ready' : 'Soon'}</p>
          <small>Next: {nextEligibleDate}</small>
        </article>
      </section>
    </>
  );

  const renderProfile = () => (
    <section className="donor-card">
      <h3>My Profile</h3>
      <div className="donor-profile-grid">
        <p><strong>Name:</strong> {profile?.fullName || 'N/A'}</p>
        <p><strong>Email:</strong> {profile?.email || 'N/A'}</p>
        <p><strong>Role:</strong> {profile?.role || 'N/A'}</p>
        <p><strong>Blood Type:</strong> {donorProfile?.bloodType || 'N/A'}</p>
      </div>
    </section>
  );

  const renderEligibility = () => (
    <section className="donor-card">
      <h3>Eligibility Status</h3>
      <p className="donor-lead-value">{nextEligibleDate}</p>
      <p>Total donations logged: {donations.length}</p>
      <p>Minimum wait between donations: {donationCooldownDays} days.</p>
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
