import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import NewsletterSignup from './pages/NewsletterSignup';
import PodcastPage from './pages/PodcastPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PodcastCollection from './pages/PodcastCollection';

function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/newsletter" element={<NewsletterSignup />} />
      <Route path="/podcasts" element={<PodcastCollection />} />
      <Route path="/podcast/:channelName" element={<PodcastPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
    </Routes>
  );
}

export default App;