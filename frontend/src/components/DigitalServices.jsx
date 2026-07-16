import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

const digitalItems = [
  {
    icon: '📷',
    title: 'Instagram Posts',
    desc: 'Eye-catching post designs tailored to your brand or occasion to drive high engagement.',
    tag: 'Social Branding',
    fallbackGrad: 'linear-gradient(135deg, #3d2314, #8b6343, #b8734a)'
  },
  {
    icon: '🎥',
    title: 'Instagram Reels (Making)',
    desc: 'Creative, high-retention and engaging reels crafted with dynamic effects to boost your reach.',
    tag: 'Video Reels',
    fallbackGrad: 'linear-gradient(135deg, #2c1810, #5c3d22, #d4956e)'
  },
  {
    icon: '🖼️',
    title: 'Instagram Poster Designs',
    desc: 'Stunning, high-conversion poster designs that make your social media presence unforgettable.',
    tag: 'Social Media Art',
    fallbackGrad: 'linear-gradient(135deg, #4a2e1a, #8b6343, #c49a72)'
  },
  {
    icon: '✉️',
    title: 'Invitation Cards (Digital)',
    desc: 'Elegant digital invitations for weddings, birthdays, baby showers, and grand corporate events.',
    tag: 'E-Invitations',
    fallbackGrad: 'linear-gradient(135deg, #5c3d22, #b8734a, #e8d5bc)'
  },
  {
    icon: '📢',
    title: 'Business Posters & Flyers',
    desc: 'Professional, impactful marketing designs that make your business and products stand out immediately.',
    tag: 'Marketing Design',
    fallbackGrad: 'linear-gradient(135deg, #3d2314, #6b4c32, #d4956e)'
  },
  {
    icon: '🪪',
    title: 'Business Visiting Cards',
    desc: 'Smart, sleek, and stylish visiting card designs for executives, entrepreneurs, and professionals.',
    tag: 'Smart Identity',
    fallbackGrad: 'linear-gradient(135deg, #2c1810, #8b6343, #b8734a)'
  },
  {
    icon: '🪔',
    title: 'Festival Posters',
    desc: 'Vibrant and festive custom poster designs for every celebration, holiday, and brand greetings.',
    tag: 'Festive Graphics',
    fallbackGrad: 'linear-gradient(135deg, #4a2e1a, #b8734a, #f0ddd1)'
  },
  {
    icon: '✏️',
    title: 'All Types of Creative Designs',
    desc: 'From custom vector logos to web banners — we bring your complete creative vision to life digitally.',
    tag: 'Custom Studio',
    fallbackGrad: 'linear-gradient(135deg, #3d2314, #5c3d22, #c49a72)'
  }
];

const DigitalServices = () => {
  return (
    <section className="digital section-pad" id="digital">
      <div className="container">
        <div className="section-header">
          <p className="section-label">Category 2 — Interactive Slider</p>
          <h2 className="section-title">Digital Creations &amp; <em>Animation Services</em></h2>
          <p className="section-subtitle">Professional digital designs &amp; animations for every celebration and brand. Swipe through our digital catalog!</p>
        </div>

        {/* Animation Videos Highlight Card */}
        <div className="animation-card">
          <div className="animation-card-inner">
            <div className="animation-left">
              <div className="anim-icon-wrap">🎬</div>
              <h3>Animation Videos For</h3>
              <p className="anim-subtitle">Personalized video creations for every occasion</p>
            </div>
            <div className="animation-occasions">
              <div className="occasion-tag"><span>🎂</span> Birthday</div>
              <div className="occasion-tag"><span>🍼</span> Baby Shower Ceremony</div>
              <div className="occasion-tag"><span>💍</span> Wedding</div>
              <div className="occasion-tag"><span>📅</span> Date Announcement</div>
              <div className="occasion-tag"><span>💌</span> Save the Date</div>
              <div className="occasion-tag"><span>✉️</span> Invitations &amp; More</div>
            </div>
          </div>
        </div>

        {/* Digital Services Swiper Image Slider */}
        <div className="slider-wrap">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={28}
            slidesPerView={4}
            navigation={true}
            pagination={{ clickable: true, dynamicBullets: true }}
            autoplay={{
              delay: 3400,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            breakpoints={{
              0: { slidesPerView: 1, spaceBetween: 20 },
              640: { slidesPerView: 2, spaceBetween: 24 },
              1024: { slidesPerView: 3, spaceBetween: 28 },
              1280: { slidesPerView: 4, spaceBetween: 28 }
            }}
            className="swiper-container-custom"
          >
            {digitalItems.map((item, idx) => (
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
                      gap: '8px'
                    }}
                  >
                    <span className="slider-badge">{item.tag}</span>
                    <span style={{ fontSize: '4.5rem', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}>
                      {item.icon}
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

export default DigitalServices;
