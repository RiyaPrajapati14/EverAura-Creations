import React from 'react';
import { translations } from '../utils/translations';

const SloganBanner = ({ lang }) => {
  const t = translations[lang];

  return (
    <section className="slogan-banner">
      <div className="container">
        <div className="slogan-content">
          <span className="slogan-ornament" aria-hidden="true">♥</span>
          <p className="slogan-text">{t.sloganText}</p>
          <span className="slogan-ornament" aria-hidden="true">♥</span>
        </div>
        <p className="slogan-sub">{t.sloganSub}</p>
      </div>
    </section>
  );
};

export default SloganBanner;
