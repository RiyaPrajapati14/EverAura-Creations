import React, { useState, useEffect } from 'react';

const CreamFlowerIcon = () => (
  <svg width="30" height="30" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle', filter: 'drop-shadow(0 2px 6px rgba(184,115,74,0.3))', flexShrink: 0, marginRight: '8px' }}>
    <defs>
      <radialGradient id="navCreamBg" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="70%" stopColor="#fdf8f2" />
        <stop offset="100%" stopColor="#f5ece0" />
      </radialGradient>
      <linearGradient id="navRoseGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d4956e" />
        <stop offset="50%" stopColor="#b8734a" />
        <stop offset="100%" stopColor="#8b6343" />
      </linearGradient>
      <linearGradient id="navPetal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="60%" stopColor="#fdf8f2" />
        <stop offset="100%" stopColor="#e8d5bc" />
      </linearGradient>
    </defs>
    <rect x="24" y="24" width="464" height="464" rx="110" fill="url(#navCreamBg)" stroke="url(#navRoseGold)" strokeWidth="16" />
    <g fill="url(#navPetal)" stroke="#b8734a" strokeWidth="4">
      <path d="M 256,256 C 210,130 210,70 256,70 C 302,70 302,130 256,256 Z" />
      <path d="M 256,256 C 210,130 210,70 256,70 C 302,70 302,130 256,256 Z" transform="rotate(45 256 256)" />
      <path d="M 256,256 C 210,130 210,70 256,70 C 302,70 302,130 256,256 Z" transform="rotate(90 256 256)" />
      <path d="M 256,256 C 210,130 210,70 256,70 C 302,70 302,130 256,256 Z" transform="rotate(135 256 256)" />
      <path d="M 256,256 C 210,130 210,70 256,70 C 302,70 302,130 256,256 Z" transform="rotate(180 256 256)" />
      <path d="M 256,256 C 210,130 210,70 256,70 C 302,70 302,130 256,256 Z" transform="rotate(225 256 256)" />
      <path d="M 256,256 C 210,130 210,70 256,70 C 302,70 302,130 256,256 Z" transform="rotate(270 256 256)" />
      <path d="M 256,256 C 210,130 210,70 256,70 C 302,70 302,130 256,256 Z" transform="rotate(315 256 256)" />
    </g>
    <circle cx="256" cy="256" r="54" fill="#fdf8f2" stroke="url(#navRoseGold)" strokeWidth="6" />
    <circle cx="256" cy="256" r="32" fill="url(#navRoseGold)" />
    <path d="M 256,244 C 251,236 240,236 236,244 C 232,252 242,262 256,270 C 270,262 280,252 276,244 C 272,236 261,236 256,244 Z" fill="#ffffff" />
  </svg>
);

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 60) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Active section tracking
      const sections = ['home', 'about', 'services', 'digital', 'gallery', 'reviews', 'order'];
      for (const sec of sections) {
        const el = document.getElementById(sec);
        if (el) {
          const top = el.offsetTop - 120;
          if (window.scrollY >= top) {
            setActiveSection(sec);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e, targetId) => {
    e.preventDefault();
    setNavOpen(false);
    const target = document.getElementById(targetId);
    if (target) {
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
      <div className="nav-container">
        <a href="#home" className="nav-logo" onClick={(e) => handleLinkClick(e, 'home')}>
          <CreamFlowerIcon />
          <span className="logo-text">EverAura Creations</span>
        </a>
        
        <button
          className="nav-toggle"
          id="navToggle"
          aria-label="Toggle navigation"
          onClick={() => setNavOpen(!navOpen)}
        >
          <span style={navOpen ? { transform: 'translateY(7px) rotate(45deg)' } : {}}></span>
          <span style={navOpen ? { opacity: 0 } : {}}></span>
          <span style={navOpen ? { transform: 'translateY(-7px) rotate(-45deg)' } : {}}></span>
        </button>

        <ul className={`nav-links ${navOpen ? 'open' : ''}`} id="navLinks">
          <li>
            <a
              href="#home"
              className={activeSection === 'home' ? 'active' : ''}
              onClick={(e) => handleLinkClick(e, 'home')}
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="#about"
              className={activeSection === 'about' ? 'active' : ''}
              onClick={(e) => handleLinkClick(e, 'about')}
            >
              About
            </a>
          </li>
          <li>
            <a
              href="#services"
              className={activeSection === 'services' ? 'active' : ''}
              onClick={(e) => handleLinkClick(e, 'services')}
            >
              Services
            </a>
          </li>
          <li>
            <a
              href="#digital"
              className={activeSection === 'digital' ? 'active' : ''}
              onClick={(e) => handleLinkClick(e, 'digital')}
            >
              Digital
            </a>
          </li>
          <li>
            <a
              href="#gallery"
              className={activeSection === 'gallery' ? 'active' : ''}
              onClick={(e) => handleLinkClick(e, 'gallery')}
            >
              Gallery
            </a>
          </li>
          <li>
            <a
              href="#reviews"
              className={activeSection === 'reviews' ? 'active' : ''}
              onClick={(e) => handleLinkClick(e, 'reviews')}
            >
              Reviews
            </a>
          </li>
          <li>
            <a
              href="#how-to-order"
              className="nav-cta"
              onClick={(e) => handleLinkClick(e, 'how-to-order')}
            >
              How to Order
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
