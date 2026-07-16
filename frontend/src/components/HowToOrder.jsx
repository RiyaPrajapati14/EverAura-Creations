import React from 'react';

const HowToOrder = () => {
  return (
    <section className="how-to-order section-pad" id="how-to-order">
      <div className="container">
        <div className="section-header">
          <p className="section-label">Simple &amp; Easy</p>
          <h2 className="section-title">How to <em>Place Your Order</em></h2>
          <p className="section-subtitle">Four simple steps from your imagination to our handcrafted creation</p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <span className="step-number">1</span>
            <span className="step-icon">💡</span>
            <h3>Browse &amp; Imagine</h3>
            <p>Explore our handmade and digital categories to find what inspires you.</p>
          </div>

          <div className="step-connector">───►</div>

          <div className="step-card">
            <span className="step-number">2</span>
            <span className="step-icon">💬</span>
            <h3>Connect &amp; Customize</h3>
            <p>Contact us via WhatsApp with your ideas (Automated Order Bot coming soon!).</p>
          </div>

          <div className="step-connector">───►</div>

          <div className="step-card">
            <span className="step-number">3</span>
            <span className="step-icon">📋</span>
            <h3>Confirmation</h3>
            <p>We review your request and confirm details, pricing &amp; timeline promptly.</p>
          </div>

          <div className="step-connector">───►</div>

          <div className="step-card">
            <span className="step-number">4</span>
            <span className="step-icon">🎉</span>
            <h3>Nadiad Delivery</h3>
            <p>We craft your memories and deliver exclusively across Nadiad (or online digitally).</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowToOrder;
