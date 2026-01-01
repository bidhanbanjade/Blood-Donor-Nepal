import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-column">
          <div className="footer-item">
            <div className="footer-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#DC2626"/>
              </svg>
            </div>
            <div className="footer-content">
              <h3 className="footer-title">Available in Major Cities</h3>
              <p className="footer-text">Kathmandu . Pokhara . Biratnagar . And more....</p>
            </div>
          </div>
        </div>
        <div className="footer-column">
          <div className="footer-item">
            <div className="footer-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 4C18.21 4 20 5.79 20 8C20 10.21 18.21 12 16 12C13.79 12 12 10.21 12 8C12 5.79 13.79 4 16 4ZM16 6C14.9 6 14 6.9 14 8C14 9.1 14.9 10 16 10C17.1 10 18 9.1 18 8C18 6.9 17.1 6 16 6Z" fill="#DC2626"/>
                <path d="M8 4C10.21 4 12 5.79 12 8C12 10.21 10.21 12 8 12C5.79 12 4 10.21 4 8C4 5.79 5.79 4 8 4ZM8 6C6.9 6 6 6.9 6 8C6 9.1 6.9 10 8 10C9.1 10 10 9.1 10 8C10 6.9 9.1 6 8 6Z" fill="#DC2626"/>
                <path d="M16 14C18.67 14 22 15.33 22 18V20H10V18C10 15.33 13.33 14 16 14ZM16 16C14.9 16 12.5 16.5 12.5 18V18.5H19.5V18C19.5 16.5 17.1 16 16 16Z" fill="#DC2626"/>
                <path d="M8 14C10.67 14 14 15.33 14 18V20H2V18C2 15.33 5.33 14 8 14ZM8 16C6.9 16 4.5 16.5 4.5 18V18.5H11.5V18C11.5 16.5 9.1 16 8 16Z" fill="#DC2626"/>
              </svg>
            </div>
            <div className="footer-content">
              <h3 className="footer-title">Growing Network</h3>
              <p className="footer-text">More cities coming soon</p>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-copyright">
          © 2025 Blood Donor Nepal. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

