import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-top">
        <Link to="/" className="header-top-link">Home</Link>
      </div>
      <nav className="header-nav">
        <div className="header-logo">
          <div className="logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 4C12.5 4 9.5 7 9.5 10.5C9.5 13 11 15 13 17.5C14.5 19.5 16 22 16 24.5C16 22 17.5 19.5 19 17.5C21 15 22.5 13 22.5 10.5C22.5 7 19.5 4 16 4Z" fill="#DC2626"/>
              <path d="M16 8C18.5 8 20.5 10 20.5 12.5C20.5 14 19.5 15.5 18 17C17 18 16 19.5 16 21C16 19.5 15 18 14 17C12.5 15.5 11.5 14 11.5 12.5C11.5 10 13.5 8 16 8Z" fill="white"/>
            </svg>
          </div>
          <span className="logo-text">Blood Donor Nepal</span>
        </div>
        <div className="header-links">
          <Link to="/" className="nav-link active">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2L3 7V17H8V12H12V17H17V7L10 2Z" fill="currentColor"/>
            </svg>
            Home
          </Link>
          <Link to="/search" className="nav-link">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M15 15L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Search
          </Link>
          <Link to="/alerts" className="nav-link">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2C8.9 2 8 2.9 8 4V5.5C5.2 6.2 3 8.6 3 11.5V15L2 16V17H18V16L17 15V11.5C17 8.6 14.8 6.2 12 5.5V4C12 2.9 11.1 2 10 2Z" fill="currentColor"/>
              <circle cx="15" cy="4" r="3" fill="#DC2626"/>
            </svg>
            Alerts
          </Link>
          <Link to="/chatbot" className="nav-link">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2C5.6 2 2 5.1 2 9C2 11.4 3.2 13.5 5 14.8V18L8.5 15.5C9.1 15.6 9.6 15.7 10.2 15.7C14.6 15.7 18.2 12.6 18.2 8.6C18.2 4.6 14.6 2 10 2Z" fill="currentColor"/>
            </svg>
            Chatbot
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;

