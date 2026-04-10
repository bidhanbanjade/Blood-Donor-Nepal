import { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import LeafletDonorMap from '../components/LeafletDonorMap';
import api from '../services/api';
import './SearchPage.css';

const CITIES = [
  { name: 'Kathmandu', label: 'Kathmandu Valley', lat: 27.7172, lng: 85.324, zoom: 13 },
  { name: 'Butwal', label: 'Butwal', lat: 27.7006, lng: 83.4483, zoom: 14 },
  { name: 'Pokhara', label: 'Pokhara', lat: 28.2096, lng: 83.9856, zoom: 13 },
  { name: 'Chitwan', label: 'Chitwan', lat: 27.5291, lng: 84.3542, zoom: 13 },
];

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const SearchPage = () => {
  const [activeCity, setActiveCity] = useState(CITIES[0]);
  const [bloodType, setBloodType] = useState('');
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedDonor, setSelectedDonor] = useState(null);

  const searchDonors = useCallback(async (city, type) => {
    setLoading(true);
    setError('');
    setSelectedDonor(null);

    try {
      const params = new URLSearchParams({
        lat: String(city.lat),
        lng: String(city.lng),
        radius: '20',
        eligible: 'true',
      });
      if (type) params.set('bloodType', type);

      const response = await api.get(`/donors/search/nearby?${params.toString()}`);
      setDonors(response.data.results || []);
    } catch {
      setDonors([]);
      setError('Could not load donors for this area.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    searchDonors(activeCity, bloodType);
  }, [activeCity, bloodType, searchDonors]);

  const handleCityChange = (city) => {
    setActiveCity(city);
    setSelectedDonor(null);
  };

  return (
    <main className="search-page">
      <Header />

      <section className="search-content">
        <header className="search-hero">
          <span className="search-hero-kicker">Live Donor Map</span>
          <h1>Find Blood Donors Fast</h1>
          <p>Select a city and blood type to instantly see available donors on the map.</p>
        </header>

        {/* City Tabs */}
        <div className="city-tabs">
          {CITIES.map((city) => (
            <button
              key={city.name}
              className={`city-tab ${activeCity.name === city.name ? 'active' : ''}`}
              onClick={() => handleCityChange(city)}
            >
              <span className="city-tab-icon">📍</span>
              {city.label}
            </button>
          ))}
        </div>

        {/* Blood Type Filter */}
        <div className="blood-filter-bar">
          <span className="blood-filter-label">Blood Type:</span>
          <div className="blood-pills">
            <button
              className={`blood-pill ${bloodType === '' ? 'active' : ''}`}
              onClick={() => setBloodType('')}
            >
              All
            </button>
            {BLOOD_TYPES.map((type) => (
              <button
                key={type}
                className={`blood-pill ${bloodType === type ? 'active' : ''}`}
                onClick={() => setBloodType(type)}
              >
                {type}
              </button>
            ))}
          </div>
          {loading && <span className="blood-filter-loading">Searching...</span>}
          {!loading && (
            <span className="blood-filter-count">
              {donors.length} donor{donors.length !== 1 ? 's' : ''} found
            </span>
          )}
        </div>

        {error && <p className="search-error">{error}</p>}

        {/* Map */}
        <div className="map-wrapper">
          <LeafletDonorMap
            donors={donors}
            center={{ lat: activeCity.lat, lng: activeCity.lng }}
            zoom={activeCity.zoom}
            onDonorSelect={setSelectedDonor}
            selectedDonorId={selectedDonor?.id}
          />

          {/* Donor Detail Panel */}
          {selectedDonor && (
            <div className="donor-panel">
              <button className="donor-panel-close" onClick={() => setSelectedDonor(null)}>✕</button>
              <div className="donor-panel-badge" data-type={selectedDonor.bloodType}>
                {selectedDonor.bloodType}
              </div>
              <h2 className="donor-panel-name">{selectedDonor.user?.fullName || 'Anonymous Donor'}</h2>
              <div className="donor-panel-meta">
                <span>📍 {selectedDonor.city || activeCity.label}</span>
                <span>📏 {selectedDonor.distanceKm} km away</span>
                <span className="donor-panel-eligible">✅ Eligible to donate</span>
              </div>
              <div className="donor-panel-actions">
                {selectedDonor.user?.phone && (
                  <a href={`tel:${selectedDonor.user.phone}`} className="donor-action-btn call">
                    📞 Call Now
                    <small>{selectedDonor.user.phone}</small>
                  </a>
                )}
                {selectedDonor.user?.email && (
                  <a href={`mailto:${selectedDonor.user.email}`} className="donor-action-btn email">
                    ✉️ Send Email
                    <small>{selectedDonor.user.email}</small>
                  </a>
                )}
              </div>
              {!selectedDonor.user?.phone && !selectedDonor.user?.email && (
                <p className="donor-panel-no-contact">Contact info not available.</p>
              )}
            </div>
          )}
        </div>

        {/* Donor List */}
        {donors.length > 0 && (
          <section className="donor-list-section">
            <h3>All Donors in {activeCity.label}</h3>
            <ul className="donor-results">
              {donors.map((donor) => (
                <li
                  key={donor.id}
                  className={selectedDonor?.id === donor.id ? 'selected' : ''}
                  onClick={() => setSelectedDonor(donor)}
                >
                  <div
                    className="donor-list-badge"
                    data-type={donor.bloodType}
                  >
                    {donor.bloodType}
                  </div>
                  <div className="donor-list-info">
                    <strong>{donor.user?.fullName || 'Anonymous Donor'}</strong>
                    <p>{donor.distanceKm} km away · {donor.city || activeCity.label}</p>
                  </div>
                  <div className="donor-contact-actions">
                    {donor.user?.phone && (
                      <a
                        href={`tel:${donor.user.phone}`}
                        className="contact-btn"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Call
                      </a>
                    )}
                    {donor.user?.email && (
                      <a
                        href={`mailto:${donor.user.email}`}
                        className="contact-btn secondary"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Email
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {!loading && donors.length === 0 && (
          <div className="no-donors">
            <p>No {bloodType || ''} donors found in {activeCity.label}.</p>
            <p>Try a different city or blood type.</p>
          </div>
        )}
      </section>
    </main>
  );
};

export default SearchPage;
