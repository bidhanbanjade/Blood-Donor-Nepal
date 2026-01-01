import './HowItWorks.css';

const HowItWorks = () => {
  const features = [
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="3" fill="none"/>
          <path d="M18 24L22 28L30 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: 'Find Donors',
      description: 'Search for blood donors by location and blood type.'
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 4C22.9 4 22 4.9 22 6V8.5C17.2 9.2 13 11.6 13 14.5V18L11 19V21H37V19L35 18V14.5C35 11.6 30.8 9.2 26 8.5V6C26 4.9 25.1 4 24 4Z" fill="currentColor"/>
          <circle cx="36" cy="8" r="4" fill="#DC2626"/>
        </svg>
      ),
      title: 'Emergency Alerts',
      description: 'Get notified about urgent blood needs in your area.'
    },
    {
      icon: (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 4C14.6 4 7 10.1 7 17.8C7 22.4 9.4 26.5 12.8 29V35L18.5 31.5C19.3 31.7 20.1 31.8 21 31.8C30.4 31.8 38 25.7 38 18C38 10.3 30.4 4 24 4Z" fill="currentColor"/>
          <path d="M18 20C19.1 20 20 19.1 20 18C20 16.9 19.1 16 18 16C16.9 16 16 16.9 16 18C16 19.1 16.9 20 18 20Z" fill="white"/>
          <path d="M24 20C25.1 20 26 19.1 26 18C26 16.9 25.1 16 24 16C22.9 16 22 16.9 22 18C22 19.1 22.9 20 24 20Z" fill="white"/>
          <path d="M30 20C31.1 20 32 19.1 32 18C32 16.9 31.1 16 30 16C28.9 16 28 16.9 28 18C28 19.1 28.9 20 30 20Z" fill="white"/>
        </svg>
      ),
      title: 'AI Chatbot',
      description: 'Get instant answers about blood donation.'
    }
  ];

  return (
    <section className="how-it-works">
      <div className="how-it-works-container">
        <h2 className="section-title">How it Works</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

