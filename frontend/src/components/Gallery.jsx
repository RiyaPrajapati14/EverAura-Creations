import React from 'react';

const galleryCards = [
  {
    tag: 'Wedding',
    title: 'Wedding Welcome Boards',
    desc: 'Elegant calligraphy boards for your special day',
    fallbackGrad: 'linear-gradient(135deg, #f0ddd1, #e8c5a8, #d4956e)',
    icon: '💍'
  },
  {
    tag: 'Wedding Decor',
    title: 'Wedding Items & Decor',
    desc: 'Decorated platters & ceremony essentials',
    fallbackGrad: 'linear-gradient(135deg, #fdf0e8, #f5d5b8, #e8b882)',
    icon: '💎'
  },
  {
    tag: 'Baby Shower',
    title: 'Baby Shower Decorations',
    desc: 'Sweet handmade setups for your little miracle',
    fallbackGrad: 'linear-gradient(135deg, #f5e8f5, #e8c5d8, #d4a8c4)',
    icon: '🍼'
  },
  {
    tag: 'Resin Art',
    title: 'Resin Art & Keepsakes',
    desc: 'Coasters and memory frames with dried florals',
    fallbackGrad: 'linear-gradient(135deg, #e8f0f5, #c5d8e8, #a8c4d4)',
    icon: '🎨'
  },
  {
    tag: 'Gifts',
    title: 'Personalized Gifts',
    desc: 'Custom name boards and handcrafted frames',
    fallbackGrad: 'linear-gradient(135deg, #f5f0e8, #e8d5c5, #d4b8a8)',
    icon: '🎁'
  },
  {
    tag: 'Posters',
    title: 'Pre-Wedding & Invitations',
    desc: 'Bespoke designs telling your unique story',
    fallbackGrad: 'linear-gradient(135deg, #f8e8e8, #f0c5c5, #d4a8a8)',
    icon: '✉️'
  }
];

const Gallery = () => {
  return (
    <section className="gallery section-pad" id="gallery">
      <div className="container">
        <div className="section-header">
          <p className="section-label">Our Creations</p>
          <h2 className="section-title">Product <em>Gallery</em></h2>
          <p className="section-subtitle">A glimpse into our world of handcrafted &amp; digital wonders</p>
        </div>

        <div className="gallery-grid">
          {galleryCards.map((item, idx) => (
            <div className="gallery-card" key={idx}>
              <div
                className="gallery-img-wrap"
                style={{
                  background: item.fallbackGrad,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '12px',
                  padding: '24px',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <span style={{ fontSize: '3.5rem' }}>{item.icon}</span>
                <span style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: 'var(--text-dark)'
                }}>
                  {item.title}
                </span>
                <span style={{
                  fontSize: '0.82rem',
                  color: 'var(--text-light)',
                  background: 'rgba(255, 255, 255, 0.75)',
                  padding: '4px 14px',
                  borderRadius: '20px',
                  fontWeight: '500',
                  border: '1px dashed var(--rose-gold)'
                }}>
                  No Image Available
                </span>
                <div className="gallery-overlay">
                  <span className="gallery-tag">{item.tag}</span>
                </div>
              </div>
              <div className="gallery-info">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
