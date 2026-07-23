const mongoose = require('mongoose');

/* ══════════════════════════════════════════════════════════════════════════
   Query Model — EverAura Creations
   Stores customer queries submitted via AI chatbot.
   Admin can reply via the Studio Admin panel.
══════════════════════════════════════════════════════════════════════════ */

const AdminReplySchema = new mongoose.Schema({
  text:      { type: String, required: true },
  repliedAt: { type: Date,   default: Date.now }
}, { _id: false });

const CustomerReplySchema = new mongoose.Schema({
  text:      { type: String, required: true },
  repliedAt: { type: Date,   default: Date.now }
}, { _id: false });

const QuerySchema = new mongoose.Schema({
  queryId: {
    type:    String,
    unique:  true,
    default: () => {
      const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
      return `QRY-${Date.now()}-${rand}`;
    }
  },
  customerName:  { type: String, required: true },
  phone:         { type: String, required: true },
  queryText:     { type: String, required: true },
  status:        { type: String, enum: ['open', 'replied', 'closed'], default: 'open' },
  adminReplies:  { type: [AdminReplySchema], default: [] },
  customerReplies: { type: [CustomerReplySchema], default: [] },
  isReadByAdmin: { type: Boolean, default: false }, // false = unread → shows badge
  isSeenByUser:  { type: Boolean, default: false }, // true once customer views reply
}, {
  timestamps: true   // createdAt, updatedAt
});

module.exports = mongoose.model('Query', QuerySchema);
