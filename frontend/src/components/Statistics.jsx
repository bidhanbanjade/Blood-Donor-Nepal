import { useEffect, useState } from 'react';
import api from '../services/api';
import './Statistics.css';

const Statistics = () => {
  const [summary, setSummary] = useState({
    registeredDonors: 0,
    donations: 0,
    publicRequests: 0,
    alerts: 0,
    citiesCovered: 0,
  });

  useEffect(() => {
    let cancelled = false;

    const loadSummary = async () => {
      try {
        const response = await api.get('/stats/summary');
        if (!cancelled) {
          setSummary({
            registeredDonors: Number(response.data.registeredDonors || 0),
            donations: Number(response.data.donations || 0),
            publicRequests: Number(response.data.publicRequests || 0),
            alerts: Number(response.data.alerts || 0),
            citiesCovered: Number(response.data.citiesCovered || 0),
          });
        }
      } catch (_) {
        if (!cancelled) {
          setSummary({
            registeredDonors: 0,
            donations: 0,
            publicRequests: 0,
            alerts: 0,
            citiesCovered: 0,
          });
        }
      }
    };

    loadSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  const formatCount = (value) => new Intl.NumberFormat('en-US').format(value);

  const cards = [
    {
      number: formatCount(summary.registeredDonors),
      label: 'Registered Donors',
      note: 'Currently active in the network',
    },
    {
      number: formatCount(summary.publicRequests),
      label: 'Public Requests',
      note: 'Anonymous requests submitted',
    },
    {
      number: formatCount(summary.alerts),
      label: 'Alerts Issued',
      note: 'Admin-triggered alerts sent',
    },
    {
      number: formatCount(summary.donations),
      label: 'Donations Recorded',
      note: 'Logged in the platform history',
    },
    {
      number: formatCount(summary.citiesCovered),
      label: 'Cities Covered',
      note: 'Places with registered activity',
    },
  ];

  return (
    <section className="statistics">
      <div className="statistics-heading">
        <p className="statistics-eyebrow">Live Snapshot</p>
        <h2>Platform activity at a glance</h2>
      </div>
      <div className="statistics-container">
        {cards.map((card) => (
          <div className="stat-item" key={card.label}>
            <div className="stat-number">{card.number}</div>
            <div className="stat-label">{card.label}</div>
            <div className="stat-note">{card.note}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Statistics;


