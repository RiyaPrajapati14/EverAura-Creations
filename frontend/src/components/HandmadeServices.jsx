import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

const handmadeItems = [
  {
    icon: '🪧',
    title: 'Wedding Welcome Boards',
    desc: 'Stunning hand-lettered welcome boards that set the perfect tone for your big day.',
    tag: 'Wedding Calligraphy',
    fallbackGrad: 'linear-gradient(135deg, #f0ddd1, #e8c5a8, #d4956e)'
  },
  {
    icon: '📸',
    title: 'Pre-Wedding Posters',
    desc: 'Beautifully designed posters to celebrate your love story before the wedding.',
    tag: 'Pre-Wedding',
    fallbackGrad: 'linear-gradient(135deg, #f8e8e8, #f0c5c5, #d4a8a8)'
  },
  {
    icon: '🎨',
    title: 'Resin Art',
    desc: 'Unique resin art pieces, coasters, trays, and keepsakes with embedded florals.',
    tag: 'Resin Keepsakes',
    fallbackGrad: 'linear-gradient(135deg, #e8f0f5, #c5d8e8, #a8c4d4)'
  },
  {
    icon: '🎁',
    title: 'Personalized Gifts & Decorations',
    desc: 'Custom gifts — name boards, photo frames, and decorative keepsakes made with love.',
    tag: 'Handcrafted Gifts',
    fallbackGrad: 'linear-gradient(135deg, #f5f0e8, #e8d5c5, #d4b8a8)'
  },
  {
    icon: '💌',
    title: 'Customized Cards & Gift Hampers',
    desc: 'Handcrafted thank-you cards, greeting cards, and beautifully curated gift hampers.',
    tag: 'Luxury Hampers',
    fallbackGrad: 'linear-gradient(135deg, #f5e8f5, #e8c5d8, #d4a8c4)'
  },
  {
    icon: '💍',
    title: 'Wedding Items, Decor & More',
    desc: 'Ring ceremony setups, bridal decor, and all handmade wedding essentials.',
    tag: 'Ceremony Decor',
    fallbackGrad: 'linear-gradient(135deg, #fdf0e8, #f5d5b8, #e8b882)'
  }
];

const HandmadeServices = () => {
  return (
    <section className="services section-pad" id="services">
      <div className="container">
        <div className="section-header">
          <p className="section-label">Category 1 — Interactive Slider</p>
          <h2 className="section-title">Handmade Gifts &amp; <em>Customized Creations</em></h2>
          <p className="section-subtitle">Every piece handcrafted right here in Nadiad with patience, love, and attention to detail. Swipe or drag to explore!</p>
        </div>

        <div className="slider-wrap">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={28}
            slidesPerView={3}
            navigation={true}
            pagination={{ clickable: true, dynamicBullets: true }}
            autoplay={{
              delay: 3800,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            breakpoints={{
              0: { slidesPerView: 1, spaceBetween: 20 },
              640: { slidesPerView: 2, spaceBetween: 24 },
              1024: { slidesPerView: 3, spaceBetween: 28 }
            }}
            className="swiper-container-custom"
          >
            {handmadeItems.map((item, idx) => (
              <SwiperSlide key={idx}>
                <div className="slider-card">
                  <div
                    className="slider-img-wrap"
                    style={{
                      background: item.fallbackGrad,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: '10px',
                      padding: '24px',
                      textAlign: 'center',
                      position: 'relative'
                    }}
                  >
                    <span className="slider-badge">{item.tag}</span>
                    <span style={{ fontSize: '3.2rem', marginTop: '16px' }}>{item.icon}</span>
                    <span style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '1.2rem',
                      fontWeight: '600',
                      color: 'var(--text-dark)'
                    }}>
                      {item.title}
                    </span>
                    <span style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-light)',
                      background: 'rgba(255, 255, 255, 0.8)',
                      padding: '4px 12px',
                      borderRadius: '16px',
                      border: '1px dashed var(--rose-gold)'
                    }}>
                      No Image Available
                    </span>
                  </div>
                  <div className="slider-content">
                    <h3 className="slider-title">{item.title}</h3>
                    <p className="slider-desc">{item.desc}</p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default HandmadeServices;
