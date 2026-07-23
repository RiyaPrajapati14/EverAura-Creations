import React from 'react';
import { translations } from '../utils/translations';

const HowToOrder = ({ lang }) => {
  const t = translations[lang];

  const scrollTo = (id) => {
    const target = document.getElementById(id);
    if (target) {
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const openChatbot = () => {
    window.dispatchEvent(new CustomEvent('open-chatbot'));
  };

  return (
    <section className="how-to-order section-pad" id="how-to-order">
      <div className="container">
        <div className="section-header">
          <p className="section-label">{t.howToOrderLabel}</p>
          <h2 className="section-title">{t.howToOrderTitle}<em>{t.howToOrderTitleEm}</em></h2>
          <p className="section-subtitle">{t.howToOrderSubtitle}</p>
        </div>

        <div className="steps-grid" style={{ gap: '32px', alignItems: 'stretch' }}>
          {/* Step 1 */}
          <div className="step-card" style={{ flex: '1 1 250px' }}>
            <span className="step-number">1</span>
            <span className="step-icon">💡</span>
            <h3>{t.step1Title}</h3>
            <p>{t.step1Desc}</p>
          </div>

          {/* Step 2 */}
          <div className="step-card" style={{ flex: '1 1 320px', maxWidth: '380px' }}>
            <span className="step-number">2</span>
            <span className="step-icon">💬</span>
            <h3>{t.step2Title}</h3>
            <p>{t.step2Desc}</p>
            <div className="step-options-list">
              <div className="step-option-item">
                <p style={{ marginBottom: '4px' }}>{t.step2OptionA}</p>
                <button type="button" onClick={openChatbot} className="btn-how-to btn-chat">
                  {t.btnStartChat}
                </button>
              </div>
              <div className="step-option-item" style={{ marginTop: '8px' }}>
                <p style={{ marginBottom: '4px' }}>{t.step2OptionB}</p>
                <button type="button" onClick={() => scrollTo('order')} className="btn-how-to btn-form">
                  {t.btnGoToForm}
                </button>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="step-card" style={{ flex: '1 1 250px' }}>
            <span className="step-number">3</span>
            <span className="step-icon">📋</span>
            <h3>{t.step3Title}</h3>
            <p>{t.step3Desc}</p>
          </div>

          {/* Step 4 */}
          <div className="step-card" style={{ flex: '1 1 250px' }}>
            <span className="step-number">4</span>
            <span className="step-icon">🎉</span>
            <h3>{t.step4Title}</h3>
            <p>{t.step4Desc}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowToOrder;
