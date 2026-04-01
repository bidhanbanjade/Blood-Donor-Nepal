import Header from '../components/Header';
import Hero from '../components/Hero';
import Statistics from '../components/Statistics';
import HowItWorks from '../components/HowItWorks';
import CTABanner from '../components/CTABanner';
import Footer from '../components/Footer';
import MapView from '../components/MapView';
import ChatWidget from '../components/ChatWidget';
import api from '../services/api';
import { useEffect, useState } from 'react';
import './HomePage.css';

const HomePage = () => {
  const [nearbyBanks, setNearbyBanks] = useState([]);

  useEffect(() => {
    const loadNearbyBanks = async () => {
      try {
        const response = await api.get('/blood-banks/search?lat=27.7172&lng=85.324&radius=25');
        setNearbyBanks(response.data.results || []);
      } catch (_) {
        setNearbyBanks([]);
      }
    };

    loadNearbyBanks();
  }, []);

  return (
    <div className="home-page">
      <Header />
      <Hero />
      <Statistics />
      <HowItWorks />
      <section className="home-enhancements">
        <div>
          <h2>Nearby Blood Banks</h2>
          <MapView bloodBanks={nearbyBanks} />
        </div>
        <ChatWidget />
      </section>
      <CTABanner />
      <Footer />
    </div>
  );
};

export default HomePage;

