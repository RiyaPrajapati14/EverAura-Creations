const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  order_id: { type: String, required: true, unique: true },
  timestamp: { type: String, default: () => new Date().toISOString() },
  customer_name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true, default: null },
  product_required: { type: String, required: true, trim: true },
  event_date: { type: String, default: 'Not specified', trim: true },
  customization_details: { type: String, required: true, trim: true },
  reference_image: { type: String, default: null },
  source: {
    type: String,
    enum: ['WEB_FORM', 'AI_CHATBOT'],
    default: 'WEB_FORM'
  },
  status: {
    type: String,
    enum: ['Received', 'In Production', 'Ready for Delivery in Nadiad', 'Completed', 'Cancelled'],
    default: 'Received'
  },
  admin_notes: { type: String, default: '' },
  customer_message: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
