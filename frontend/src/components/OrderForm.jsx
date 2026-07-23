import React, { useState } from 'react';
import { translations } from '../utils/translations';

const OrderForm = ({ lang }) => {
  const t = translations[lang];

  const serviceCategories = {
    handmade: t.handmadeItems.map(item => item.title),
    digital: t.digitalItems.map(item => item.title)
  };

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
      setErrorMsg(t.orderErrorHeader);
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
      data.append('source', 'WEB_FORM');

      const response = await fetch('/submit-order', {
        method: 'POST',
        body: data
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(result.error || t.orderErrorConnect);
      }
    } catch (err) {
      console.error('Order submission error:', err);
      setErrorMsg(t.orderErrorConnect);
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
          <p className="section-label">{t.orderLabel}</p>
          <h2 className="section-title">{t.orderTitle}<em>{t.orderTitleEm}</em></h2>
          <p className="section-subtitle">{t.orderSubtitle}</p>
        </div>

        <div className="form-wrap">
          {submitted ? (
            <div className="order-success">
              <span className="success-icon">♥</span>
              <h3>{t.orderSuccessTitle}</h3>
              <p>{t.orderSuccessText}</p>
              <p className="success-sub">{t.orderSuccessSub}</p>
              <button type="button" onClick={resetForm} className="btn btn-primary" style={{ marginTop: '20px' }}>
                {t.orderAnotherBtn}
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
                  <label htmlFor="customer_name">{t.orderNameLabel}<span className="required">{t.requiredStar}</span></label>
                  <input
                    type="text"
                    id="customer_name"
                    name="customer_name"
                    placeholder={t.orderNamePlaceholder}
                    value={formData.customer_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">{t.orderPhoneLabel}<span className="required">{t.requiredStar}</span></label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder={t.orderPhonePlaceholder}
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">{t.orderEmailLabel} <span className="optional">{t.optionalLabel}</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder={t.orderEmailPlaceholder}
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="event_date">{t.orderDateLabel} <span className="optional">{t.optionalLabel}</span></label>
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
                  <label htmlFor="category">{t.orderCategoryLabel}<span className="required">{t.requiredStar}</span></label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">{t.orderCategoryChoose}</option>
                    <option value="handmade">{t.orderCategoryHandmade}</option>
                    <option value="digital">{t.orderCategoryDigital}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="service_type">{t.orderServiceLabel}<span className="required">{t.requiredStar}</span></label>
                  <select
                    id="service_type"
                    name="service_type"
                    value={formData.service_type}
                    onChange={handleChange}
                    disabled={!formData.category}
                    required
                  >
                    <option value="">{t.orderServiceChoose}</option>
                    {formData.category && serviceCategories[formData.category].map((srv, i) => (
                      <option key={i} value={srv}>{srv}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="requirements">{t.orderRequirementsLabel}<span className="required">{t.requiredStar}</span></label>
                <textarea
                  id="requirements"
                  name="requirements"
                  placeholder={t.orderRequirementsPlaceholder}
                  value={formData.requirements}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <div className="form-group full-width">
                <label>{t.orderFileLabel} <span className="optional">{t.optionalLabel}</span></label>
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
                        <p style={{ fontWeight: 600, color: '#b8734a' }}>{t.orderFileSelected}{file.name}</p>
                        <p className="file-hint">{t.orderFileChooseNew}</p>
                      </div>
                    ) : (
                      <div>
                        <p>{t.orderFilePlaceholder}</p>
                        <p className="file-hint">{t.orderFileHint}</p>
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
                {loading ? t.orderSubmittingBtn : t.orderSubmitBtn}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default OrderForm;
