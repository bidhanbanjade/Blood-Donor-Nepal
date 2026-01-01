import { Link } from 'react-router-dom';
import './CTABanner.css';

const CTABanner = () => {
  return (
    <section className="cta-banner">
      <div className="cta-content">
        <div className="cta-icon">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M32 8C28 8 25 11 25 14.5C25 17 26.5 19 28.5 21.5C30 23.5 32 26 32 28.5C32 26 33.5 23.5 35 21.5C37 19 38.5 17 38.5 14.5C38.5 11 35.5 8 32 8Z" fill="white"/>
            <path d="M32 16C34.5 16 36.5 18 36.5 20.5C36.5 22 35.5 23.5 34 25C33 26 32 27.5 32 29C32 27.5 31 26 30 25C28.5 23.5 27.5 22 27.5 20.5C27.5 18 29.5 16 32 16Z" fill="#DC2626"/>
          </svg>
        </div>
        <h2 className="cta-title">Every Donation Counts</h2>
        <p className="cta-subtitle">
          Join thousands of donors making a difference in Nepal.
        </p>
        <Link to="/register" className="btn-cta">
          Get Started
        </Link>
      </div>
    </section>
  );
};

export default CTABanner;

