import React from 'react';

const TrustBar = () => {
  return (
    <section className="trust-bar">
      <div className="container">
        <div className="trust-grid">
          <div className="trust-item">
            <span className="trust-icon">♥</span>
            <div>
              <p className="trust-title">Made with Love</p>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon">✦</span>
            <div>
              <p className="trust-title">High Quality Work</p>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon">📍</span>
            <div>
              <p className="trust-title">Local Nadiad Delivery</p>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon">😊</span>
            <div>
              <p className="trust-title">Customer Satisfaction</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
