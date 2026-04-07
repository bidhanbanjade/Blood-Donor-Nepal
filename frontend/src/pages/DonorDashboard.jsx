import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { feedbackService } from '../services/feedbackService';
import FeedbackRating from '../components/FeedbackRating';
import DashboardState from '../components/DashboardState';
import { useAuth } from '../hooks/useAuth';
import './DonorDashboard.css';

const donationCooldownDays = 56;

const DonorDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [donorProfile, setDonorProfile] = useState(null);
  const [donations, setDonations] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('');

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
      <header className="dashboard-hero">
        <div className="dashboard-hero-top">
          <h1>Donor Dashboard</h1>
          <div className="dashboard-hero-actions">
            <button type="button" className="dashboard-home-btn" onClick={handleHome}>
              Back to Home
            </button>
            <button type="button" className="dashboard-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
        <p>Track your donations and stay ready for emergencies.</p>
      </header>

      <section className="profile-grid">
        <article className="card">
          <h3>Profile</h3>
          <p>Name: {profile?.fullName}</p>
          <p>Email: {profile?.email}</p>
          <p>Role: {profile?.role}</p>
        </article>

        <article className="card">
          <h3>Eligibility Countdown</h3>
          <p>Next eligibility: {nextEligibleDate}</p>
          <p>Total donations: {donations.length}</p>
        </article>
      </section>

      <section className="card">
        <h3>Donation History</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Blood Type</th>
                <th>Blood Bank</th>
                <th>Units</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((item) => (
                <tr key={item.id}>
                  <td>{item.donationDate}</td>
                  <td>{item.bloodType}</td>
                  <td>{item.bloodBank?.name || 'N/A'}</td>
                  <td>{item.unitsDonated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <FeedbackRating onSubmit={handleFeedback} />
      {feedbackStatus ? <p className="feedback-status">{feedbackStatus}</p> : null}
    </main>
  );
};

export default DonorDashboard;
