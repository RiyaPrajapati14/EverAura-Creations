import React from 'react';
import { translations } from '../utils/translations';

const Reviews = ({ lang }) => {
  const t = translations[lang];

  return (
    <section className="reviews section-pad" id="reviews">
      <div className="container">
        <div className="section-header">
          <p className="section-label">{t.reviewsLabel}</p>
          <h2 className="section-title">{t.reviewsTitle}<em>{t.reviewsTitleEm}</em></h2>
          <p className="section-subtitle">{t.reviewsSubtitle}</p>
        </div>

        <div style={{
          maxWidth: '720px',
          margin: '0 auto',
          background: 'var(--white)',
          borderRadius: 'var(--radius-lg)',
          padding: '48px 36px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-soft)',
          border: '1px dashed var(--rose-gold)'
        }}>
          <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '16px', color: 'var(--rose-gold)' }}>♥</span>
          <h3 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.8rem',
            fontWeight: '600',
            color: 'var(--text-dark)',
            marginBottom: '12px'
          }}>
            {t.reviewsSoonTitle}
          </h3>
          <p style={{
            fontSize: '0.98rem',
            color: 'var(--text-mid)',
            lineHeight: '1.8',
            marginBottom: '24px'
          }}>
            {t.reviewsSoonText}
          </p>
          <div style={{
            display: 'inline-block',
            background: 'var(--rose-gold-pale)',
            color: 'var(--rose-gold)',
            padding: '10px 24px',
            borderRadius: '50px',
            fontSize: '0.88rem',
            fontWeight: '600',
            letterSpacing: '0.05em'
          }}>
            {t.reviewsSoonBadge}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
