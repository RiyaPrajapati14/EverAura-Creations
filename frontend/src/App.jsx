import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustBar from './components/TrustBar';
import About from './components/About';
import HandmadeServices from './components/HandmadeServices';
import DigitalServices from './components/DigitalServices';
import SloganBanner from './components/SloganBanner';
import Gallery from './components/Gallery';
import HowToOrder from './components/HowToOrder';
import Reviews from './components/Reviews';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import ChatbotWidget from './components/Chatbot/ChatbotWidget';
import StudioAdmin from './components/Admin/StudioAdmin';

function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  return (
    <div className="app-container">
      <Navbar />
      <Hero />
      <TrustBar />
      <About />
      <HandmadeServices />
      <DigitalServices />
      <SloganBanner />
      <Gallery />
      <HowToOrder />
      <Reviews />
      <Footer onOpenAdmin={() => setIsAdminOpen(true)} />
      <BackToTop />

      {/* Floating AI Order Assistant & Nadiad Studio Command Center */}
      <ChatbotWidget />
      <StudioAdmin isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </div>
  );
}

export default App;
