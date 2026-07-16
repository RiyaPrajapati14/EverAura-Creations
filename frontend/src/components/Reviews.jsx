import React from 'react';

const Reviews = () => {
  return (
    <section className="reviews section-pad" id="reviews">
      <div className="container">
        <div className="section-header">
          <p className="section-label">Testimonials</p>
          <h2 className="section-title">What Our <em>Clients Say</em></h2>
          <p className="section-subtitle">Real feedback and experiences from our valued customers</p>
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
            Client Reviews Are Coming Soon!
          </h3>
          <p style={{
            fontSize: '0.98rem',
            color: 'var(--text-mid)',
            lineHeight: '1.8',
            marginBottom: '24px'
          }}>
            We are a growing, newly started home-based craft studio located in <strong>Nadiad, Gujarat</strong>. As we create more special memories and deliver our customized handmade and digital orders, genuine reviews and ratings from our customers will be showcased right here.
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
            ✦ Be among our very first happy customers in Nadiad! ✦
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
