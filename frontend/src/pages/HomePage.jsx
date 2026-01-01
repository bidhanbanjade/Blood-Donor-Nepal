import Header from '../components/Header';
import Hero from '../components/Hero';
import Statistics from '../components/Statistics';
import HowItWorks from '../components/HowItWorks';
import CTABanner from '../components/CTABanner';
import Footer from '../components/Footer';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <Header />
      <Hero />
      <Statistics />
      <HowItWorks />
      <CTABanner />
      <Footer />
    </div>
  );
};

export default HomePage;

