import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import logoMark from '../assets/bdn-logo.svg';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();

  const getDashboardPath = () => {
    if (!user) {
      return null;
    }

    if (user.role === 'admin') {
      return '/admin-dashboard';
    }

    if (user.role === 'donor') {
      return '/donor-dashboard';
    }

    if (user.role === 'receiver') {
      return '/search';
    }

    return '/';
  };

  const dashboardPath = getDashboardPath();

  return (
    <header className="header">
      <nav className="header-nav">
        <div className="header-logo">
          <div className="logo-icon">
            <img src={logoMark} alt="Blood Donor Nepal logo" className="brand-logo" />
          </div>
          <span className="logo-text">Blood Donor Nepal</span>
        </div>
        <div className="header-links">
          <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2L3 7V17H8V12H12V17H17V7L10 2Z" fill="currentColor"/>
            </svg>
            Home
          </NavLink>
          <NavLink to="/search" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M15 15L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Search
          </NavLink>
          <NavLink to="/alerts" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2C8.9 2 8 2.9 8 4V5.5C5.2 6.2 3 8.6 3 11.5V15L2 16V17H18V16L17 15V11.5C17 8.6 14.8 6.2 12 5.5V4C12 2.9 11.1 2 10 2Z" fill="currentColor"/>
              <circle cx="15" cy="4" r="3" fill="#DC2626"/>
            </svg>
            Alerts
          </NavLink>
          <NavLink to="/chatbot" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 2C5.6 2 2 5.1 2 9C2 11.4 3.2 13.5 5 14.8V18L8.5 15.5C9.1 15.6 9.6 15.7 10.2 15.7C14.6 15.7 18.2 12.6 18.2 8.6C18.2 4.6 14.6 2 10 2Z" fill="currentColor"/>
            </svg>
            Chatbot
          </NavLink>
          {dashboardPath ? (
            <Link to={dashboardPath} className="nav-link">
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="nav-link">
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;


