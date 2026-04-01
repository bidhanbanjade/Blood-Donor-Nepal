import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [donors, setDonors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
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
    const [invRes, donorRes, hospitalRes] = await Promise.all([
      api.get('/inventory'),
      api.get('/donors'),
      api.get('/hospitals'),
    ]);
    setInventory(invRes.data);
    setDonors(donorRes.data);
    setHospitals(hospitalRes.data);
  };

  useEffect(() => {
    loadData().catch(() => setFeedback('Failed to load admin data'));
  }, []);

  const inventorySummary = useMemo(() => {
    const summary = {};
    for (const item of inventory) {
      summary[item.bloodType] = (summary[item.bloodType] || 0) + Number(item.unitsAvailable || 0);
    }
    return summary;
  }, [inventory]);

  const triggerAlert = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/alerts/trigger', alertForm);
      setFeedback(`Alert sent. Matched donors: ${res.data.matchedDonors}`);
    } catch (error) {
      setFeedback(error.response?.data?.error || 'Could not trigger alert');
    }
  };

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
      </section>
    </main>
  );
};

export default AdminDashboard;
