import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">Save Lives, Donate Blood</h1>
        <p className="hero-subtitle">
          Connecting blood donors with those in need across Nepal.
        </p>
        <div className="hero-buttons">
          <Link to="/search" className="btn btn-primary">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M15 15L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Find Donors
          </Link>
          <Link to="/alerts" className="btn btn-secondary">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2C8.9 2 8 2.9 8 4V5.5C5.2 6.2 3 8.6 3 11.5V15L2 16V17H18V16L17 15V11.5C17 8.6 14.8 6.2 12 5.5V4C12 2.9 11.1 2 10 2Z" fill="currentColor"/>
            </svg>
            View Alerts
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;

