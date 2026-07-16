import React, { useEffect, useState } from 'react';

const Hero = () => {
  const [typedText, setTypedText] = useState('');
  const fullText = 'Crafted with Love, Made for Memories.';
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // Typewriter effect
    let i = 0;
    const typeTimer = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < fullText.length) {
          setTypedText(prev => fullText.slice(0, prev.length + 1));
          i++;
        } else {
          clearInterval(interval);
        }
      }, 50);
      return () => clearInterval(interval);
    }, 1000);

    // Parallax effect
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const heroBg = document.querySelector('.hero-bg');
      if (heroBg && scrolled < window.innerHeight) {
        heroBg.style.transform = `scale(1.05) translateY(${scrolled * 0.3}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      clearTimeout(typeTimer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollTo = (id) => {
    const target = document.getElementById(id);
    if (target) {
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <section className="hero" id="home">
      <div
        className={`hero-bg ${imgError ? 'hero-bg-fallback' : ''}`}
        style={{
          backgroundImage: imgError ? 'none' : "url('/static/images/hero_bg.jpg')"
        }}
      >
        {/* Hidden img to catch load error */}
        <img
          src="/static/images/hero_bg.jpg"
          alt=""
          style={{ display: 'none' }}
          onError={() => setImgError(true)}
        />
      </div>
      <div className="hero-overlay"></div>
      
      <div className="hero-content">
        <div className="hero-ganesha" aria-hidden="true">🕉</div>
        <p className="hero-pretitle">✦ Welcome to ✦</p>
        <h1 className="hero-title">EverAura<br /><em>Creations</em></h1>
        <p className="hero-tagline" style={{ borderRight: typedText.length < fullText.length ? '2px solid rgba(255,255,255,0.5)' : 'none' }}>
          {typedText}
        </p>
        <p className="hero-slogan">&ldquo; You Imagine, We Create! &rdquo;</p>
        <p className="hero-desc">Handmade Gifts &amp; Digital Creations for Every Special Occasion</p>
        <div className="hero-buttons">
          <button onClick={() => scrollTo('gallery')} className="btn btn-primary">View Our Work</button>
          <button onClick={() => scrollTo('how-to-order')} className="btn btn-outline">How to Order</button>
        </div>
      </div>

      <div className="hero-scroll-hint">
        <span>Scroll to explore</span>
        <div className="scroll-arrow"></div>
      </div>

      <div className="hero-floating-petals" aria-hidden="true">
        <span className="petal p1">✿</span>
        <span className="petal p2">❀</span>
        <span className="petal p3">✾</span>
        <span className="petal p4">✦</span>
        <span className="petal p5">✿</span>
      </div>
    </section>
  );
};

export default Hero;
