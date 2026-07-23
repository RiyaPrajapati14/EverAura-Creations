import React from 'react';
import { translations } from '../utils/translations';

const Footer = ({ lang, onOpenAdmin }) => {
  const t = translations[lang];

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
            <p className="footer-tagline">{t.footerTagline}</p>
            <p className="footer-slogan">{t.footerSlogan}</p>
            <div className="footer-ornament" aria-hidden="true">♥ ♥ ♥</div>
          </div>

          <div className="footer-links-grid">
            <div className="footer-col">
              <h4>{t.footerCol1}</h4>
              <ul>
                <li><a href="#home" onClick={(e) => scrollTo(e, 'home')}>{t.navHome}</a></li>
                <li><a href="#about" onClick={(e) => scrollTo(e, 'about')}>{t.navAbout}</a></li>
                <li><a href="#services" onClick={(e) => scrollTo(e, 'services')}>{t.navServices}</a></li>
                <li><a href="#digital" onClick={(e) => scrollTo(e, 'digital')}>{t.navDigital}</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>{t.footerCol2}</h4>
              <ul>
                <li><a href="#gallery" onClick={(e) => scrollTo(e, 'gallery')}>{t.navGallery}</a></li>
                <li><a href="#how-to-order" onClick={(e) => scrollTo(e, 'how-to-order')}>{t.navHowToOrder}</a></li>
                <li><a href="#reviews" onClick={(e) => scrollTo(e, 'reviews')}>{t.navReviews}</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>{t.footerCol3}</h4>
              <ul>
                <li><span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>{t.footerInfo1}</span></li>
                <li><span style={{ color: 'rgba(255,255,255,0.7)' }}>{t.footerInfo2}</span></li>
                <li><span style={{ color: 'rgba(255,255,255,0.7)' }}>{t.footerInfo3}</span></li>
                <li><span style={{ color: 'rgba(255,255,255,0.7)' }}>{t.footerInfo4}</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <p>&copy; {new Date().getFullYear()} {t.footerRights}</p>
          <p className="footer-love">{t.footerLove}</p>
          <button
            type="button"
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
            {t.footerAdmin}
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
