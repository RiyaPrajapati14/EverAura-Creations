import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustBar from './components/TrustBar';
import About from './components/About';
import HandmadeServices from './components/HandmadeServices';
import DigitalServices from './components/DigitalServices';
import SloganBanner from './components/SloganBanner';
import Gallery from './components/Gallery';
import HowToOrder from './components/HowToOrder';
import OrderForm from './components/OrderForm';
import Reviews from './components/Reviews';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import ChatbotWidget from './components/Chatbot/ChatbotWidget';
import StudioAdmin from './components/Admin/StudioAdmin';

function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('ea_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('ea_lang', lang);
  }, [lang]);

  return (
    <div className="app-container">
      <Navbar lang={lang} setLang={setLang} />
      <Hero lang={lang} />
      <TrustBar lang={lang} />
      <About lang={lang} />
      <HandmadeServices lang={lang} />
      <DigitalServices lang={lang} />
      <SloganBanner lang={lang} />
      <Gallery lang={lang} />
      <HowToOrder lang={lang} />
      <OrderForm lang={lang} />
      <Reviews lang={lang} />
      <Footer lang={lang} onOpenAdmin={() => setIsAdminOpen(true)} />
      <BackToTop />

      {/* Floating AI Order Assistant & Nadiad Studio Command Center */}
      <ChatbotWidget lang={lang} setLang={setLang} />
      <StudioAdmin isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </div>
  );
}

export default App;
