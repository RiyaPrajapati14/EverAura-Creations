import React, { useState, useEffect } from 'react';

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
          <span className="logo-ganesha" aria-hidden="true">🕉</span>
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
