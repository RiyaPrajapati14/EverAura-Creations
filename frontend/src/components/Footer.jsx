import React from 'react';

const Footer = ({ onOpenAdmin }) => {
  const scrollTo = (e, id) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (target) {
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container">
          <div>
            <div className="footer-logo">
              <span className="footer-ganesha" aria-hidden="true">🕉</span>
              <span className="logo-text">EverAura Creations</span>
            </div>
            <p className="footer-tagline">&ldquo; You Imagine, We Create! &rdquo;</p>
            <p className="footer-slogan">Handmade Gifts &amp; Digital Creations for Every Occasion</p>
            <div className="footer-ornament" aria-hidden="true">♥ ♥ ♥</div>
          </div>

          <div className="footer-links-grid">
            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#home" onClick={(e) => scrollTo(e, 'home')}>Home</a></li>
                <li><a href="#about" onClick={(e) => scrollTo(e, 'about')}>About Us</a></li>
                <li><a href="#services" onClick={(e) => scrollTo(e, 'services')}>Handmade Services</a></li>
                <li><a href="#digital" onClick={(e) => scrollTo(e, 'digital')}>Digital Services</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Explore More</h4>
              <ul>
                <li><a href="#gallery" onClick={(e) => scrollTo(e, 'gallery')}>Product Gallery</a></li>
                <li><a href="#how-to-order" onClick={(e) => scrollTo(e, 'how-to-order')}>How to Order</a></li>
                <li><a href="#reviews" onClick={(e) => scrollTo(e, 'reviews')}>Testimonials</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Connect With Us</h4>
              <ul>
                <li><span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>✨ 24/7 AI Order Assistant Available</span></li>
                <li><span style={{ color: 'rgba(255,255,255,0.7)' }}>📍 Physical Delivery: Nadiad, Gujarat Only</span></li>
                <li><span style={{ color: 'rgba(255,255,255,0.7)' }}>🌐 Digital Services Worldwide</span></li>
                <li><span style={{ color: 'rgba(255,255,255,0.7)' }}>💌 Custom Requests Welcome</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <p>&copy; {new Date().getFullYear()} EverAura Creations. All Rights Reserved.</p>
          <p className="footer-love">Made with ♥ in Nadiad for Special Moments</p>
          <button
            onClick={onOpenAdmin}
            style={{
              background: 'transparent',
              border: '1px solid rgba(232, 168, 124, 0.3)',
              color: 'var(--rose-gold)',
              padding: '4px 12px',
              borderRadius: '16px',
              cursor: 'pointer',
              fontSize: '0.78rem',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(232, 168, 124, 0.15)'}
            onMouseOut={(e) => e.target.style.background = 'transparent'}
          >
            🔒 Studio Admin
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
