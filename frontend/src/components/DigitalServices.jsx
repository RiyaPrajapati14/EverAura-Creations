import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { translations } from '../utils/translations';

const DigitalServices = ({ lang }) => {
  const t = translations[lang];

  const digitalItems = [
    {
      icon: '📷',
      fallbackGrad: 'linear-gradient(135deg, #3d2314, #8b6343, #b8734a)'
    },
    {
      icon: '🎥',
      fallbackGrad: 'linear-gradient(135deg, #2c1810, #5c3d22, #d4956e)'
    },
    {
      icon: '🖼️',
      fallbackGrad: 'linear-gradient(135deg, #4a2e1a, #8b6343, #c49a72)'
    },
    {
      icon: '✉️',
      fallbackGrad: 'linear-gradient(135deg, #5c3d22, #b8734a, #e8d5bc)'
    },
    {
      icon: '📢',
      fallbackGrad: 'linear-gradient(135deg, #3d2314, #6b4c32, #d4956e)'
    },
    {
      icon: '🪪',
      fallbackGrad: 'linear-gradient(135deg, #2c1810, #8b6343, #b8734a)'
    },
    {
      icon: '🪔',
      fallbackGrad: 'linear-gradient(135deg, #4a2e1a, #b8734a, #f0ddd1)'
    },
    {
      icon: '✏️',
      fallbackGrad: 'linear-gradient(135deg, #3d2314, #5c3d22, #c49a72)'
    }
  ].map((item, idx) => ({
    ...item,
    title: t.digitalItems[idx]?.title || '',
    desc: t.digitalItems[idx]?.desc || '',
    tag: t.digitalItems[idx]?.tag || ''
  }));

  return (
    <section className="digital section-pad" id="digital">
      <div className="container">
        <div className="section-header">
          <p className="section-label">{t.digitalLabel}</p>
          <h2 className="section-title">{t.digitalTitle}<em>{t.digitalTitleEm}</em></h2>
          <p className="section-subtitle">{t.digitalSubtitle}</p>
        </div>

        {/* Animation Videos Highlight Card */}
        <div className="animation-card">
          <div className="animation-card-inner">
            <div className="animation-left">
              <div className="anim-icon-wrap">🎬</div>
              <h3>{t.digitalAnimFor}</h3>
              <p className="anim-subtitle">{t.digitalAnimSub}</p>
            </div>
            <div className="animation-occasions">
              <div className="occasion-tag"><span>🎂</span> {t.digitalOccasions.birthday}</div>
              <div className="occasion-tag"><span>🍼</span> {t.digitalOccasions.babyShower}</div>
              <div className="occasion-tag"><span>💍</span> {t.digitalOccasions.wedding}</div>
              <div className="occasion-tag"><span>📅</span> {t.digitalOccasions.dateAnnounce}</div>
              <div className="occasion-tag"><span>💌</span> {t.digitalOccasions.saveDate}</div>
              <div className="occasion-tag"><span>✉️</span> {t.digitalOccasions.invitations}</div>
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
