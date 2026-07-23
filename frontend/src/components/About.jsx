import React from 'react';
import { translations } from '../utils/translations';

const About = ({ lang }) => {
  const t = translations[lang];

  return (
    <section className="about section-pad" id="about">
      <div className="container">
        <div className="section-header">
          <p className="section-label">{t.aboutLabel}</p>
          <h2 className="section-title">{t.aboutTitle}<em>{t.aboutTitleEm}</em></h2>
          <p className="section-subtitle">{t.aboutSubtitle}</p>
        </div>

        <div className="about-grid">
          <div className="about-image-wrap">
            <div className="about-img-frame" style={{
              height: '420px',
              background: 'linear-gradient(135deg, var(--beige-light), var(--rose-gold-pale), var(--beige))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '16px',
              padding: '32px',
              textAlign: 'center',
              borderRadius: 'var(--radius-lg)',
              border: '2px dashed var(--rose-gold-light)'
            }}>
              <span style={{ fontSize: '4rem', color: 'var(--rose-gold)' }}>✿</span>
              <h3 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.6rem',
                fontWeight: '600',
                color: 'var(--text-dark)'
              }}>
                {t.aboutStudio}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', maxWidth: '280px' }}>
                {t.aboutNoImage}
              </p>
            </div>
            <div className="about-badge">
              {t.aboutBadge}
            </div>
          </div>

          <div className="about-content">
            <p className="about-text">
              {t.aboutText1}
            </p>
            <p className="about-text">
              {t.aboutText2}
            </p>
            <p className="about-text">
              {t.aboutText3}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
