import React, { useState } from 'react';

const serviceCategories = {
  handmade: [
    'Wedding Welcome Boards',
    'Pre-Wedding Posters',
    'Resin Art',
    'Personalized Gifts & Decorations',
    'Customized Cards & Gift Hampers',
    'Wedding Items, Decor & More'
  ],
  digital: [
    'Instagram Posts',
    'Instagram Reels (Making)',
    'Instagram Poster Designs',
    'Invitation Cards (Digital)',
    'Business Posters & Flyers',
    'Business Visiting Cards',
    'Festival Posters',
    'Animation Videos (Birthday, Wedding, Baby Shower, etc.)',
    'All Types of Creative Designs'
  ]
};

const OrderForm = () => {
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    email: '',
    category: '',
    service_type: '',
    event_date: '',
    requirements: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category') {
      setFormData(prev => ({ ...prev, category: value, service_type: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setErrorMsg('');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.phone || !formData.category || !formData.service_type || !formData.requirements) {
      setErrorMsg('Please fill in all required fields marked with *');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const data = new FormData();
      data.append('customer_name', formData.customer_name);
      data.append('phone', formData.phone);
      data.append('email', formData.email || '');
      data.append('category', formData.category);
      data.append('service_type', formData.service_type);
      data.append('event_date', formData.event_date || '');
      data.append('requirements', formData.requirements);
      if (file) {
        data.append('reference_image', file);
      }

      const response = await fetch('/submit-order', {
        method: 'POST',
        body: data
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(result.error || 'Failed to submit order. Please try again.');
      }
    } catch (err) {
      console.error('Order submission error:', err);
      setErrorMsg('Could not connect to server. Please try submitting again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormData({
      customer_name: '',
      phone: '',
      email: '',
      category: '',
      service_type: '',
      event_date: '',
      requirements: ''
    });
    setFile(null);
    setErrorMsg('');
  };

  return (
    <section className="order section-pad" id="order">
      <div className="container">
        <div className="section-header">
          <p className="section-label">Let's Create Together</p>
          <h2 className="section-title">Place Your <em>Order</em></h2>
          <p className="section-subtitle">Tell us about what you need and let us turn your vision into a beautiful reality</p>
        </div>

        <div className="form-wrap">
          {submitted ? (
            <div className="order-success">
              <span className="success-icon">♥</span>
              <h3>Thank You!</h3>
              <p>Your order has been placed successfully.</p>
              <p className="success-sub">We will review your requirements and contact you via WhatsApp / Phone shortly to confirm details.</p>
              <button onClick={resetForm} className="btn btn-primary" style={{ marginTop: '20px' }}>
                Place Another Order
              </button>
            </div>
          ) : (
            <form className="order-form" onSubmit={handleSubmit}>
              {errorMsg && (
                <div style={{
                  background: '#fde8e8',
                  color: '#9b1c1c',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: '1px solid #f8b4b4',
                  fontSize: '0.9rem'
                }}>
                  {errorMsg}
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="customer_name">Your Name <span className="required">*</span></label>
                  <input
                    type="text"
                    id="customer_name"
                    name="customer_name"
                    placeholder="e.g. Priya Sharma"
                    value={formData.customer_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">WhatsApp / Phone Number <span className="required">*</span></label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address <span className="optional">(Optional)</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="event_date">Event / Required Date <span className="optional">(Optional)</span></label>
                  <input
                    type="date"
                    id="event_date"
                    name="event_date"
                    value={formData.event_date}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Select Category <span className="required">*</span></label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Choose Category --</option>
                    <option value="handmade">Handmade Gifts &amp; Creations</option>
                    <option value="digital">Digital &amp; Animation Services</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="service_type">Select Service <span className="required">*</span></label>
                  <select
                    id="service_type"
                    name="service_type"
                    value={formData.service_type}
                    onChange={handleChange}
                    disabled={!formData.category}
                    required
                  >
                    <option value="">-- Choose Service --</option>
                    {formData.category && serviceCategories[formData.category].map((srv, i) => (
                      <option key={i} value={srv}>{srv}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="requirements">Customization Requirements &amp; Details <span className="required">*</span></label>
                <textarea
                  id="requirements"
                  name="requirements"
                  placeholder="Tell us what you need — colors, names, theme, occasion, specific ideas, text to include, etc."
                  value={formData.requirements}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <div className="form-group full-width">
                <label>Reference Image <span className="optional">(Optional)</span></label>
                <div className="file-upload-wrap">
                  <input
                    type="file"
                    id="reference_image"
                    name="reference_image"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <div className="file-upload-ui">
                    <span className="upload-icon">📁</span>
                    {file ? (
                      <div>
                        <p style={{ fontWeight: 600, color: '#b8734a' }}>Selected: {file.name}</p>
                        <p className="file-hint">Click or drag to choose a different file</p>
                      </div>
                    ) : (
                      <div>
                        <p>Click or drag image here to attach reference</p>
                        <p className="file-hint">Supports PNG, JPG, JPEG up to 10MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
                style={{ fontSize: '1rem', padding: '16px' }}
              >
                {loading ? 'Submitting Order...' : 'Submit Order via WhatsApp / Server'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default OrderForm;
