import React from 'react';

const About = () => {
  return (
    <section className="about section-pad" id="about">
      <div className="container">
        <div className="section-header">
          <p className="section-label">Our Story</p>
          <h2 className="section-title">Where Imagination Meets <em>Craftsmanship</em></h2>
          <p className="section-subtitle">Crafting personalized gifts and digital creations with care and devotion</p>
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
                EverAura Studio — Nadiad
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', maxWidth: '280px' }}>
                [ No Image Available — Real studio and workshop photos coming soon ]
              </p>
            </div>
            <div className="about-badge">
              ♥ Nadiad Home Studio
            </div>
          </div>

          <div className="about-content">
            <p className="about-text">
              Welcome to <strong>EverAura Creations</strong> — a newly started home-based craft studio located right here in <strong>Nadiad, Gujarat</strong>. Our business was founded on a simple, heartfelt belief: every special moment deserves to be celebrated with creativity and a genuine personal touch.
            </p>
            <p className="about-text">
              As a growing beginner business, we pour our heart and soul into every single order. Whether it's a hand-lettered welcome board for your dream wedding, a custom resin keepsake holding precious memories, or a vibrant animation video for your little one's birthday — we ensure unmatched personal attention and care.
            </p>
            <p className="about-text">
              We specialize in physical artisan treasures (delivered exclusively across <strong>Nadiad</strong>) as well as high-impact digital designs and invitations delivered online worldwide. Whatever you imagine, we create with warmth and dedication!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
