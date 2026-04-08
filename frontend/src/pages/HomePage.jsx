import Header from '../components/Header';
import Hero from '../components/Hero';
import Statistics from '../components/Statistics';
import HowItWorks from '../components/HowItWorks';
import CTABanner from '../components/CTABanner';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <Header />
      <Hero />
      <Statistics />
      <HowItWorks />
      <section className="home-enhancements">
        <div>
          <h2>Need help right now?</h2>
          <p>Use the assistant for eligibility checks, donation FAQs, and emergency guidance.</p>
          <ChatWidget />
        </div>
      </section>
      <CTABanner />
      <Footer />
    </div>
  );
};

export default HomePage;

