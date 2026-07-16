/**
 * Studio Notification Service — EverAura Creations, Nadiad
 *
 * Channels available:
 *  1. WhatsApp (wa.me pre-filled link)  — always available, zero cost
 *  2. Telegram Bot                       — optional, set env vars to enable
 *
 * All functions return or log URLs — no customer data is exposed on the frontend.
 */

/* ── Helper ─────────────────────────────────────────────────────────── */
const buildWaPhone = (phone) => {
  const clean = (phone || '').replace(/[^0-9]/g, '');
  return clean.length === 10 ? `91${clean}` : clean;
};

/* ── 1. Studio owner alert on new order ──────────────────────────────── */
const sendStudioAlert = async (orderRecord) => {
  try {
    const isBot = orderRecord.source === 'AI_CHATBOT';
    console.log(`\n🔔 [STUDIO ALERT] New Order via ${isBot ? '🤖 AI Chatbot' : '🌐 Web Form'}!`);
    console.log(`📦 Order ID : ${orderRecord.order_id}`);
    console.log(`👤 Customer : ${orderRecord.customer_name} | 📱 ${orderRecord.phone}`);
    console.log(`🎨 Item     : ${orderRecord.product_required}`);
    console.log(`📅 Event    : ${orderRecord.event_date}`);
    console.log(`📝 Notes    : ${orderRecord.customization_details}`);
    if (orderRecord.reference_image) {
      console.log(`📎 File     : http://localhost:5000${orderRecord.reference_image}`);
    }
    console.log(`════════════════════════════════════════════════════════\n`);

    // Optional Telegram
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      const fetch = (await import('node-fetch')).default;
      const text =
        `🎉 *NEW ORDER (#${orderRecord.order_id})*\n` +
        `🤖 *Source*: ${orderRecord.source}\n` +
        `👤 *Name*: ${orderRecord.customer_name}\n` +
        `📱 *Mobile*: ${orderRecord.phone}\n` +
        `🎨 *Product*: ${orderRecord.product_required}\n` +
        `📅 *Event*: ${orderRecord.event_date}\n` +
        `📝 *Notes*: ${orderRecord.customization_details}`;
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text, parse_mode: 'Markdown' })
      });
    }
  } catch (err) {
    console.error('Error dispatching studio alert:', err.message);
  }
};

/* ── 2. Status update → customer WhatsApp link ───────────────────────── */
const sendCustomerStatusUpdate = (orderRecord, newStatus) => {
  const waPhone = buildWaPhone(orderRecord.phone);
  let message =
    `Namaste ${orderRecord.customer_name}! 🙏\n\n` +
    `Your *EverAura Creations* order *#${orderRecord.order_id}* ` +
    `(${orderRecord.product_required}) status:\n\n*${newStatus}*`;

  if (newStatus === 'Ready for Delivery in Nadiad') {
    message += `\n\n📍 We are preparing for local doorstep delivery in Nadiad. Our artisan will contact you shortly to confirm the delivery time. Thank you for celebrating with us! ♥`;
  } else if (newStatus === 'In Production') {
    message += `\n\n🎨 Our artisan has started working on your custom piece with love and care! We'll notify you when it's ready.`;
  } else if (newStatus === 'Completed') {
    message += `\n\n✅ Your order has been completed! Hope you love your EverAura creation. Do share your experience! 😊`;
  }

  const url = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
  console.log(`\n💬 [STATUS UPDATE WA LINK] → ${url}\n`);
  return url;
};

/* ── 3. Custom urgent message → pre-filled WhatsApp URL ─────────────── */
const sendCustomMessage = (orderRecord, customMessage) => {
  const waPhone = buildWaPhone(orderRecord.phone);
  const fullMessage =
    `Namaste ${orderRecord.customer_name}! 🙏\n\n` +
    `Message from *EverAura Creations* regarding your order *#${orderRecord.order_id}*:\n\n` +
    customMessage +
    `\n\n— EverAura Creations, Nadiad 🎨`;
  const url = `https://wa.me/${waPhone}?text=${encodeURIComponent(fullMessage)}`;
  console.log(`\n📲 [CUSTOM MESSAGE WA LINK] → ${url}\n`);
  return url;
};

/* ── 4. Bulk urgent alert (returns array of WA links for each customer) ─ */
const sendBulkAlert = (orderRecords, message) => {
  return orderRecords.map(o => ({
    order_id: o.order_id,
    customer_name: o.customer_name,
    phone: o.phone,
    waUrl: sendCustomMessage(o, message)
  }));
};

module.exports = {
  sendStudioAlert,
  sendCustomerStatusUpdate,
  sendCustomMessage,
  sendBulkAlert,
};
