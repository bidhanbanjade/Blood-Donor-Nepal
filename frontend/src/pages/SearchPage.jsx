import { useState } from 'react';
import Header from '../components/Header';
import LeafletDonorMap from '../components/LeafletDonorMap';
import api from '../services/api';
import './SearchPage.css';

const defaultCenter = { lat: 27.7172, lng: 85.324 };

const SearchPage = () => {
  const [filters, setFilters] = useState({
    lat: defaultCenter.lat,
    lng: defaultCenter.lng,
    radius: 10,
    bloodType: '',
    eligible: true,
  });
  const [donors, setDonors] = useState([]);
  const [searchCenter, setSearchCenter] = useState(defaultCenter);
  const [searchRadiusKm, setSearchRadiusKm] = useState(10);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runSearch = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        lat: String(filters.lat),
        lng: String(filters.lng),
        radius: String(filters.radius),
        eligible: String(filters.eligible),
      });

      if (filters.bloodType) {
        params.set('bloodType', filters.bloodType);
      }

      const response = await api.get(`/donors/search/nearby?${params.toString()}`);
      setDonors(response.data.results || []);
      setSearchCenter({ lat: Number(filters.lat), lng: Number(filters.lng) });
      setSearchRadiusKm(Number(filters.radius));
    } catch (searchError) {
      setDonors([]);
      setError(searchError.response?.data?.error || 'Could not fetch donors for this area.');
    } finally {
      setLoading(false);
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported on this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));

        setFilters((prev) => ({
          ...prev,
          lat,
          lng,
        }));

        setUserLocation({ lat, lng });
        setSearchCenter({ lat, lng });
      },
      () => setError('Could not detect your current location.')
    );
  };

  return (
    <main className="search-page">
      <Header />
      <section className="search-content">
        <header className="search-hero">
          <span className="search-hero-kicker">Live Geographic Matching</span>
          <h1>Find Donors Near Any Location in Nepal</h1>
          <p>
            Set a center point, choose blood group filters, and instantly view nearby donors on an
            interactive map.
          </p>
          <div className="search-hero-tags">
            <span>Map + Radius</span>
            <span>Phone & Email</span>
            <span>Eligibility Filter</span>
          </div>
        </header>

        <section className="search-layout">
          <article className="search-card">
            <h3>Search Filters</h3>
            <form className="search-form" onSubmit={runSearch}>
              <div className="field-grid">
                <label>
                  Latitude
                  <input
                    type="number"
                    step="0.000001"
                    value={filters.lat}
                    onChange={(event) => setFilters((prev) => ({ ...prev, lat: event.target.value }))}
                  />
                </label>

                <label>
                  Longitude
                  <input
                    type="number"
                    step="0.000001"
                    value={filters.lng}
                    onChange={(event) => setFilters((prev) => ({ ...prev, lng: event.target.value }))}
                  />
                </label>
              </div>

              <div className="field-grid">
                <label>
                  Radius (km)
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={filters.radius}
                    onChange={(event) => setFilters((prev) => ({ ...prev, radius: event.target.value }))}
                  />
                </label>

                <label>
                  Blood Type
                  <select
                    value={filters.bloodType}
                    onChange={(event) => setFilters((prev) => ({ ...prev, bloodType: event.target.value }))}
                  >
                    <option value="">All blood types</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="eligible-toggle">
                <input
                  type="checkbox"
                  checked={filters.eligible}
                  onChange={(event) => setFilters((prev) => ({ ...prev, eligible: event.target.checked }))}
                />
                Eligible donors only
              </label>

              <div className="search-actions">
                <button type="button" className="btn-light" onClick={useMyLocation}>
                  Use My Location
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Searching...' : 'Search Donors'}
                </button>
              </div>
            </form>
            {error ? <p className="search-error">{error}</p> : null}
          </article>

          <article className="search-card">
            <h3>Map View</h3>
            <LeafletDonorMap
              donors={donors}
              center={searchCenter}
              radiusKm={searchRadiusKm}
              userLocation={userLocation}
            />
          </article>
        </section>

        <section className="search-card">
          <div className="results-header-row">
            <h3>Matched Donors</h3>
            <span className="results-count">{donors.length}</span>
          </div>

          {loading ? <p className="results-muted">Searching nearby donors...</p> : null}

          {!loading && donors.length === 0 ? (
            <p className="results-muted">No donors found yet. Adjust the radius or blood type and try again.</p>
          ) : null}

          <ul className="donor-results">
            {donors.map((donor) => (
              <li key={donor.id}>
                <div>
                  <strong>{donor.user?.fullName || 'Unknown Donor'}</strong>
                  <p>
                    {donor.bloodType} | {donor.distanceKm} km away | {donor.city || 'Unknown city'}
                  </p>
                </div>
                <div className="donor-contact-actions">
                  {donor.user?.phone ? (
                    <a href={`tel:${donor.user.phone}`} className="contact-btn">
                      Call
                    </a>
                  ) : null}
                  {donor.user?.email ? (
                    <a href={`mailto:${donor.user.email}`} className="contact-btn secondary">
                      Email
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </section>
    </main>
  );
};

export default SearchPage;
