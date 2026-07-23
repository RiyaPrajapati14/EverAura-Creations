import React from 'react';
import { translations } from '../utils/translations';

const TrustBar = ({ lang }) => {
  const t = translations[lang];

  return (
    <section className="trust-bar">
      <div className="container">
        <div className="trust-grid">
          <div className="trust-item">
            <span className="trust-icon">♥</span>
            <div>
              <p className="trust-title">{t.trustLove}</p>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon">✦</span>
            <div>
              <p className="trust-title">{t.trustQuality}</p>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon">📍</span>
            <div>
              <p className="trust-title">{t.trustDelivery}</p>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon">😊</span>
            <div>
              <p className="trust-title">{t.trustSatisfaction}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
