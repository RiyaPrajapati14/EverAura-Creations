const Order = require('../models/Order');
const fs = require('fs');
const path = require('path');
const { saveOrderRecord, readOrdersFromFile, getIsMongoConnected } = require('../config/db');
const { sendStudioAlert } = require('../utils/notifyStudio');

/* ══════════════════════════════════════════════════════════════════════════
   PRICE CATALOG — EverAura Creations, Nadiad
   All prices are INR ranges based on local artisan market rates.
   Custom sizing / bulk orders may vary.
══════════════════════════════════════════════════════════════════════════ */
const PRICE_CATALOG = {
  handmade: [
    { name: 'Wedding Welcome Board (Calligraphy, A2)',     range: '₹800 – ₹1,800',  note: 'Includes frame, name & date in elegant calligraphy' },
    { name: 'Wedding Welcome Board (Resin + Floral, A2)',  range: '₹1,500 – ₹2,800', note: 'Preserved flowers, resin finish, customizable color theme' },
    { name: 'Ring Ceremony Platter (Thaal)',               range: '₹1,200 – ₹2,400', note: 'Decorated with resin, mirrors, flowers & name calligraphy' },
    { name: 'Resin Floral Keepsake / Preserved Flowers',  range: '₹600 – ₹1,400',  note: 'Flowers preserved in crystal-clear resin, made to order' },
    { name: 'Resin Art Round Coaster Set (4 pcs)',         range: '₹400 – ₹700',    note: 'Customizable colors, includes cork backing' },
    { name: 'Resin Serving Tray (Large)',                  range: '₹900 – ₹1,800',  note: 'Gold/silver leaf, custom color pour, with handles' },
    { name: 'Personalized Name Frame (A4)',                range: '₹450 – ₹900',    note: 'Name or initials, with floral or resin border design' },
    { name: 'Personalized Gift Box / Hamper',              range: '₹700 – ₹1,500',  note: 'Custom painted, engraved or decoupage gift boxes' },
    { name: 'Calligraphy Wall Art (A3)',                   range: '₹500 – ₹1,000',  note: 'Shayari, quotes, family names in gold/black calligraphy' },
    { name: 'Custom Resin Keychain / Magnet Set',          range: '₹150 – ₹350',    note: 'Per piece rate, bulk discounts available (min 10 pcs)' },
  ],
  digital: [
    { name: 'Pre-Wedding Video Poster (Animated)',         range: '₹300 – ₹700',    note: 'HD animated poster, shared via WhatsApp/Drive link' },
    { name: 'Instagram Reel & Story Design (set of 5)',    range: '₹250 – ₹600',    note: 'Branded aesthetic reels/stories, editable Canva file' },
    { name: 'Digital Wedding Invitation (Animated)',       range: '₹400 – ₹900',    note: 'Full HD video invitation, shareable on WhatsApp' },
    { name: 'Custom Logo & Brand Identity Design',        range: '₹500 – ₹1,200',  note: 'Logo + color palette + business card layout (PDF + PNG)' },
    { name: 'Birthday / Anniversary Invitation Card',     range: '₹200 – ₹500',    note: 'Digital printable or shareable format, same-day delivery' },
    { name: 'Social Media Post Design (set of 10)',        range: '₹400 – ₹800',    note: 'Instagram/Facebook posts with brand consistency' },
  ]
};

/* Price lookup by product name (fuzzy match) */
const getPriceForProduct = (productName) => {
  const lower = productName.toLowerCase();
  const all = [...PRICE_CATALOG.handmade, ...PRICE_CATALOG.digital];
  const match = all.find(p => {
    const keywords = p.name.toLowerCase().split(/[\s,&/()]+/);
    return keywords.some(kw => kw.length > 3 && lower.includes(kw));
  });
  return match || null;
};

/* Format the handmade price list as a chat message */
const formatHandmadePrices = () => {
  let msg = `🎨 **Handmade & Resin Art — Price Guide**\n*(All prices in ₹ INR · Custom pricing available)*\n\n`;
  PRICE_CATALOG.handmade.forEach((item, i) => {
    msg += `**${i + 1}. ${item.name}**\n   💰 ${item.range}\n   ✏️ ${item.note}\n\n`;
  });
  msg += `📍 Free local delivery across **Nadiad, Gujarat**\n⏰ Ready in 4–7 days (Handmade) · Bulk & wedding packages available!\n\nReady to order? 👇`;
  return msg;
};

const formatDigitalPrices = () => {
  let msg = `🖥️ **Digital & Video Creations — Price Guide**\n*(Delivered worldwide via WhatsApp / Drive link)*\n\n`;
  PRICE_CATALOG.digital.forEach((item, i) => {
    msg += `**${i + 1}. ${item.name}**\n   💰 ${item.range}\n   ✏️ ${item.note}\n\n`;
  });
  msg += `⚡ Delivery in **24–48 hours** · Revisions included · Payment after preview!\n\nReady to order? 👇`;
  return msg;
};

/* Order status timeline renderer */
const formatStatusTimeline = (status) => {
  const stages = ['Received', 'In Production', 'Ready for Delivery in Nadiad', 'Completed'];
  const emojis = ['📥', '🎨', '📦', '✅'];
  const currentIdx = stages.indexOf(status);
  return stages.map((stage, i) => {
    const done = i < currentIdx;
    const active = i === currentIdx;
    const bullet = active ? '▶' : (done ? '✓' : '○');
    const style = active ? `**${emojis[i]} ${stage}**` : (done ? `~~${emojis[i]} ${stage}~~` : `${emojis[i]} ${stage}`);
    return `${bullet} ${style}`;
  }).join('\n');
};

/* ══════════════════════════════════════════════════════════════════════════
   GROQ AI INTEGRATION — LLaMA 3.3 70B Model
══════════════════════════════════════════════════════════════════════════ */
const callGroqAI = async (userPrompt) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  try {
    const systemPrompt = `You are the friendly, expert 24/7 AI Assistant for "EverAura Creations", Nadiad's premier artisan craft & digital studio in Gujarat, India.
Studio Profile & Info:
- Specialty: Handmade Gifts, Resin Art (Keepsakes, Coasters, Trays), Wedding Welcome Boards, Calligraphy Frames, Ring Ceremony Platters, Digital Wedding Invitations, Pre-wedding Video Posters, Social Media Reels & Brand Logos.
- Location: Nadiad, Gujarat.
- Physical Delivery: Free doorstep delivery across Nadiad.
- Digital Delivery: Worldwide instant delivery via high-res WhatsApp / Google Drive link.
- Handmade Turnaround: 4 to 7 days.
- Digital Turnaround: 24 to 48 hours.
- Key Price Highlights: Welcome Boards (₹800-2800), Ring Platters (₹1200-2400), Resin Keepsakes (₹600-1400), Digital Invites (₹400-900), Video Posters (₹300-700).

Instructions:
1. Respond warmly and conversationally in the user's language (English, Phonetic Gujarati / Gujlish, or Hindi).
2. Keep responses concise (2 to 4 sentences max) with nice formatting and emojis.
3. Always invite the user to place an order or check prices if interested.`;

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content.trim();
    }
  } catch (err) {
    console.error('Groq AI Call Error:', err.message);
  }
  return null;
};

/* ══════════════════════════════════════════════════════════════════════════
   Regional / Gujlish NLP Helper
══════════════════════════════════════════════════════════════════════════ */
const detectRegionalIntent = (text) => {
  const lower = text.toLowerCase().trim();

  if (lower.includes('nadiad') || lower.includes('delivery') || lower.includes('kya malak') || lower.includes('kyare malak') || lower.includes('ડિલિવરી')) {
    return {
      type: 'FAQ_DELIVERY',
      reply: "Ha ji! 🏠 Nadiad ma amari **free local doorstep delivery** available che!\n\nFor digital items (Reels, Invitations, Posters), we deliver **worldwide instantly** via high-res download link.\n\nSu banavvu che tamare?"
    };
  }
  if (lower.includes('ketla divas') || lower.includes('kyare') || lower.includes('how many days') || lower.includes('time') || lower.includes('ketla din') || lower.includes('કેટલા દિવસ')) {
    return {
      type: 'FAQ_TIME',
      reply: "⏰ Handmade gifts (Resin Art, Welcome Boards, Ring Platters) generally **4 thi 7 divas** ma ready thai jay che with patience and perfection. 🎨\n\nDigital video posters and invitations take just **24 thi 48 hours**!\n\nTamaro event kyare che?"
    };
  }
  if (lower.includes('price') || lower.includes('ketla ma') || lower.includes('ketlu') || lower.includes('rate') || lower.includes('cost') || lower.includes('kitna') || lower.includes('kitne') || lower.includes('rupee') || lower.includes('કિંમત') || lower.includes('ભાવ')) {
    return {
      type: 'FAQ_PRICE',
      reply: "💎 Here are our price ranges! Which category interests you?",
      quickReplies: ['📋 Handmade Prices', '🖥️ Digital Prices', '✨ Place an Order']
    };
  }
  if (lower.includes('kem cho') || lower.includes('namaste') || lower.includes('hello') || lower.includes('hi ') || lower === 'hi' || lower.includes('નમસ્તે') || lower.includes('helo')) {
    return {
      type: 'GREETING',
      reply: "Kem cho! 🪧 Welcome to **EverAura Creations** — Nadiad's premier artisan craft studio!\n\nI am your 24/7 AI Assistant. How can I help you today?",
      quickReplies: ['✨ Place an Order', '💬 Check Price', '📍 Delivery Info', '📦 Track Order']
    };
  }
  return null;
};


/* ══════════════════════════════════════════════════════════════════════════
   MAIN CHAT HANDLER
══════════════════════════════════════════════════════════════════════════ */
exports.handleChatMessage = async (req, res) => {
  try {
    const { message = '', state = 'INIT', sessionData = {} } = req.body;
    const cleanMsg = message.trim();

    /* ══ UNIVERSAL COMMANDS — work from any state ══════════════════════ */

    // 🏠 Main Menu — always resets to INIT
    if (cleanMsg === '🏠 Main Menu' || cleanMsg.toLowerCase() === 'main menu' || cleanMsg.toLowerCase() === 'menu') {
      return res.json({
        nextState: 'INIT',
        reply: "🏠 **Main Menu**\n\nHow can I help you today?",
        quickReplies: ['✨ Place an Order', '💬 Check Price', '📍 Delivery Info', '📦 Track Order', '🚫 Cancel Order'],
        sessionData: {}
      });
    }

    // 🔄 Start Over — anywhere in the flow
    if (cleanMsg === '🔄 Start Over' || cleanMsg.toLowerCase() === 'start over' || cleanMsg.toLowerCase() === 'restart') {
      return res.json({
        nextState: 'INIT',
        reply: "Sure! Let's start fresh. 😊\n\nWhat would you like to do?",
        quickReplies: ['✨ Place an Order', '💬 Check Price', '📍 Delivery Info', '📦 Track Order', '🚫 Cancel Order'],
        sessionData: {}
      });
    }

    // 🚫 Cancel Order — start cancellation flow
    if (cleanMsg === '🚫 Cancel Order' || cleanMsg.toLowerCase() === 'cancel order' || cleanMsg.toLowerCase() === 'cancel my order') {
      return res.json({
        nextState: 'CANCEL_INPUT',
        reply: "🚫 **Cancel an Order**\n\nPlease enter your **10-digit WhatsApp Number** or **Order ID** to find your order:",
        quickReplies: ['🏠 Main Menu']
      });
    }

    /* ── 1. Track Order — prompt for identifier ── */
    if (cleanMsg === '📦 Track Order' || cleanMsg.toLowerCase() === 'track order' || cleanMsg.toLowerCase() === 'track my order') {
      return res.json({
        nextState: 'TRACK_ORDER_INPUT',
        reply: "📦 **Live Order Tracking**\n\nPlease enter your **10-digit WhatsApp Number** or your **Order ID** (e.g. `20260716...`) to check your current status:",
        quickReplies: ['✨ Place an Order', '📍 Delivery Info']
      });
    }

    /* ── 2. Track Order — lookup ── */
    if (state === 'TRACK_ORDER_INPUT') {
      const query = cleanMsg.replace(/\s/g, '');
      const digits = query.replace(/[^0-9]/g, '');

      let foundOrders = [];

      if (getIsMongoConnected()) {
        try {
          if (digits.length === 10) {
            foundOrders = await Order.find({ phone: { $regex: digits } }).sort({ createdAt: -1 });
          } else if (digits.length >= 14) {
            foundOrders = await Order.find({ order_id: { $regex: digits } }).sort({ createdAt: -1 });
          }
        } catch (dbErr) { /* fall through to JSON */ }
      }

      if (foundOrders.length === 0) {
        const localOrders = readOrdersFromFile();
        if (digits.length === 10) {
          foundOrders = localOrders.filter(o => (o.phone || '').replace(/[^0-9]/g, '').includes(digits)).reverse();
        } else if (digits.length >= 14) {
          foundOrders = localOrders.filter(o => (o.order_id || '').includes(digits));
        }
      }

      if (digits.length < 10) {
        return res.json({
          nextState: 'TRACK_ORDER_INPUT',
          reply: "Please enter a valid **10-digit Mobile Number** (e.g. `9876543210`) or your Order ID:",
          quickReplies: ['✨ Place an Order', '🏠 Main Menu']
        });
      }

      if (foundOrders && foundOrders.length > 0) {
        const o = foundOrders[0];
        const timeline = formatStatusTimeline(o.status || 'Received');
        return res.json({
          nextState: 'INIT',
          reply: `✅ **Order Found!**\n\n📌 **Order ID:** #${o.order_id}\n🎨 **Item:** ${o.product_required}\n📅 **Event Date:** ${o.event_date}\n👤 **Name:** ${o.customer_name}\n\n**📊 Order Progress:**\n${timeline}\n\n📍 Delivery Hub: **Nadiad, Gujarat** — We'll WhatsApp you when ready! ♥`,
          quickReplies: ['✨ Place an Order', '🚫 Cancel Order', '🏠 Main Menu']
        });
      } else {
        return res.json({
          nextState: 'INIT',
          reply: `❌ No orders found for \`${cleanMsg}\`.\n\nDouble-check your **10-digit WhatsApp number** used at the time of ordering.\n\n👇 Would you like to place a new order instead?`,
          quickReplies: ['✨ Place an Order', '📦 Track Order', '🏠 Main Menu']
        });
      }
    }

    /* ── Cancel Order — lookup ── */
    if (state === 'CANCEL_INPUT') {
      const digits = cleanMsg.replace(/[^0-9]/g, '');
      let foundOrders = [];

      if (getIsMongoConnected()) {
        try {
          if (digits.length === 10) {
            foundOrders = await Order.find({ phone: { $regex: digits }, status: { $nin: ['Completed', 'Cancelled'] } }).sort({ createdAt: -1 });
          } else if (digits.length >= 14) {
            foundOrders = await Order.find({ order_id: { $regex: digits }, status: { $nin: ['Completed', 'Cancelled'] } }).sort({ createdAt: -1 });
          }
        } catch (dbErr) { /* fall through */ }
      }

      if (foundOrders.length === 0) {
        const localOrders = readOrdersFromFile();
        const active = localOrders.filter(o => !['Completed', 'Cancelled'].includes(o.status));
        if (digits.length === 10) {
          foundOrders = active.filter(o => (o.phone || '').replace(/[^0-9]/g, '').includes(digits)).reverse();
        } else if (digits.length >= 14) {
          foundOrders = active.filter(o => (o.order_id || '').includes(digits));
        }
      }

      if (digits.length < 10) {
        return res.json({
          nextState: 'CANCEL_INPUT',
          reply: "Please enter a valid **10-digit Mobile Number** or your Order ID:",
          quickReplies: ['🏠 Main Menu']
        });
      }

      if (foundOrders && foundOrders.length > 0) {
        const o = foundOrders[0];
        return res.json({
          nextState: 'CANCEL_CONFIRM',
          reply: `⚠️ **Order Found — Confirm Cancellation**\n\n📌 **Order ID:** #${o.order_id}\n🎨 **Item:** ${o.product_required}\n📅 **Event Date:** ${o.event_date}\n👤 **Name:** ${o.customer_name}\n🔄 **Current Status:** ${o.status}\n\nAre you sure you want to **cancel this order**? This cannot be undone.`,
          quickReplies: ['✅ Yes, Cancel My Order', '❌ No, Keep My Order', '🏠 Main Menu'],
          sessionData: { cancel_order_id: o.order_id, cancel_phone: o.phone }
        });
      } else {
        return res.json({
          nextState: 'INIT',
          reply: `❌ No active orders found for \`${cleanMsg}\`.\n\nOrders that are already **Completed** or **Cancelled** cannot be modified.\n\nWould you like to place a new order?`,
          quickReplies: ['✨ Place an Order', '📦 Track Order', '🏠 Main Menu']
        });
      }
    }

    /* ── Cancel Order — confirm ── */
    if (state === 'CANCEL_CONFIRM') {
      if (cleanMsg === '✅ Yes, Cancel My Order') {
        const orderId = sessionData.cancel_order_id;
        // Update in MongoDB
        if (getIsMongoConnected()) {
          try { await Order.findOneAndUpdate({ order_id: orderId }, { status: 'Cancelled' }); } catch (e) {}
        }
        // Update in local JSON
        const { updateOrderInFile } = require('../config/db');
        updateOrderInFile(orderId, { status: 'Cancelled' });

        return res.json({
          nextState: 'INIT',
          reply: `✅ **Order #${orderId} has been cancelled.**\n\nWe're sorry to see you go! 😢\n\nIf you'd like to place a new order or need help with anything, we're always here.`,
          quickReplies: ['✨ Place an Order', '💬 Check Price', '🏠 Main Menu'],
          sessionData: {}
        });
      } else {
        return res.json({
          nextState: 'INIT',
          reply: "Great! Your order is **safe and active**. 😊\n\nAnything else I can help you with?",
          quickReplies: ['📦 Track Order', '✨ Place an Order', '🏠 Main Menu'],
          sessionData: {}
        });
      }
    }

    /* ── 3. Pricing quick replies ── */
    if (cleanMsg === '💬 Check Price' || cleanMsg === '💎 See Pricing') {
      return res.json({
        nextState: 'INIT',
        reply: "💰 Which category would you like prices for?",
        quickReplies: ['📋 Handmade Prices', '🖥️ Digital Prices', '✨ Place an Order', '🏠 Main Menu']
      });
    }
    if (cleanMsg === '📋 Handmade Prices') {
      return res.json({
        nextState: 'INIT',
        reply: formatHandmadePrices(),
        quickReplies: ['✨ Place an Order', '🖥️ Digital Prices', '📦 Track Order', '🏠 Main Menu']
      });
    }
    if (cleanMsg === '🖥️ Digital Prices') {
      return res.json({
        nextState: 'INIT',
        reply: formatDigitalPrices(),
        quickReplies: ['✨ Place an Order', '📋 Handmade Prices', '📦 Track Order', '🏠 Main Menu']
      });
    }

    /* ── 4. INIT / General query state ── */
    if (state === 'INIT' || state === 'GENERAL_QUERY') {

      if (cleanMsg === '✨ Place an Order' || cleanMsg === '✨ Place Another Order' ||
          cleanMsg.toLowerCase().includes('order') || cleanMsg.toLowerCase().includes('buy') ||
          cleanMsg.toLowerCase().includes('banavvu') || cleanMsg.toLowerCase().includes('banana')) {
        return res.json({
          nextState: 'SELECT_SERVICE',
          reply: "✨ Wonderful! Let's craft your custom creation.\n\nWhich **category** are you looking for?",
          quickReplies: ['🎨 Handmade & Resin Art', '🖥️ Digital & Video Creations'],
          sessionData: {}
        });
      }
      if (cleanMsg === '📍 Delivery Info') {
        return res.json({
          nextState: 'INIT',
          reply: "📍 **Delivery Information**\n\n🏠 **Physical Delivery:** Exclusively across **Nadiad, Gujarat** (free local doorstep delivery / pickup)\n\n🌐 **Digital Services:** Worldwide delivery via instant high-res WhatsApp / Google Drive link!\n\n⏰ Handmade: 4–7 days · Digital: 24–48 hours",
          quickReplies: ['✨ Place an Order', '💬 Check Price', '📦 Track Order', '🏠 Main Menu']
        });
      }

      // Gujlish / Custom Rule Intent Matcher
      const regionalIntent = detectRegionalIntent(cleanMsg);
      if (regionalIntent) {
        return res.json({
          nextState: 'INIT',
          reply: regionalIntent.reply,
          quickReplies: regionalIntent.quickReplies || ['✨ Place an Order', '📍 Delivery Info', '📦 Track Order']
        });
      }

      // Groq AI Integration (Ultra-fast LLaMA 3.3 70B Model)
      const aiReply = await callGroqAI(cleanMsg);
      if (aiReply) {
        return res.json({
          nextState: 'INIT',
          reply: aiReply,
          quickReplies: ['✨ Place an Order', '💬 Check Price', '📍 Delivery Info', '📦 Track Order']
        });
      }

      // Default Fallback Response
      return res.json({
        nextState: 'INIT',
        reply: "Namaste! 🪧 I am your EverAura Creations AI Assistant for **Nadiad**.\n\nAsk me anything in English or Gujlish, or pick an option:",
        quickReplies: ['✨ Place an Order', '💬 Check Price', '📍 Delivery Info', '📦 Track Order', '🚫 Cancel Order']
      });
    }


    /* ── 5. Conversational Order State Machine ── */
    if (state === 'SELECT_SERVICE') {
      const isDigital = cleanMsg.toLowerCase().includes('digital') || cleanMsg.toLowerCase().includes('video');
      const options = isDigital
        ? ['Pre-Wedding Video Poster', 'Instagram Reel & Story Design', 'Digital Wedding Invitation', 'Custom Logo & Brand Identity', 'Birthday / Anniversary Invitation', 'Social Media Post Design']
        : ['Wedding Welcome Board', 'Resin Floral Keepsake', 'Ring Ceremony Platter', 'Personalized Name Frame', 'Resin Serving Tray', 'Resin Coaster Set', 'Calligraphy Wall Art', 'Personalized Gift Box'];
      return res.json({
        nextState: 'SELECT_PRODUCT',
        reply: `Great choice! 🎨 Which **${cleanMsg}** item would you like customized?`,
        quickReplies: [...options, '🏠 Main Menu'],
        sessionData: { ...sessionData, product_category: cleanMsg }
      });
    }

    if (state === 'SELECT_PRODUCT') {
      const priceInfo = getPriceForProduct(cleanMsg);
      const priceMsg = priceInfo
        ? `\n\n💰 **Estimated Price:** ${priceInfo.range}\n✏️ *${priceInfo.note}*\n\n*(Exact quote given by artisan after reviewing your customization details)*`
        : '';
      return res.json({
        nextState: 'EVENT_DATE',
        reply: `Perfect: **${cleanMsg}**! 🎨${priceMsg}\n\nWhen is your **special event or delivery needed by** in Nadiad?\n*(Type a date like \`25 August\`, \`next week\`, etc.)*`,
        quickReplies: ['🏠 Main Menu', '🔄 Start Over'],
        sessionData: { ...sessionData, product_required: cleanMsg }
      });
    }

    if (state === 'EVENT_DATE') {
      return res.json({
        nextState: 'CUSTOM_DETAILS',
        reply: `Noted for **${cleanMsg}**! 📅\n\nPlease share your **customization ideas** — names to write, color theme (e.g. Terracotta, Rose Gold), quotes, floral preferences, or any special requests:`,
        quickReplies: ['🏠 Main Menu', '🔄 Start Over'],
        sessionData: { ...sessionData, event_date: cleanMsg }
      });
    }

    if (state === 'CUSTOM_DETAILS') {
      return res.json({
        nextState: 'UPLOAD_IMAGE',
        reply: `Beautiful details! ✨\n\nDo you have a **reference design or photo** you'd like us to match? Click 📎 **Attach File** below.\nOr click **Skip** if you don't have one — our artisan will create based on your description!`,
        quickReplies: ['Skip', '🏠 Main Menu'],
        sessionData: { ...sessionData, customization_details: cleanMsg }
      });
    }

    if (state === 'UPLOAD_IMAGE') {
      const imgPath = sessionData.reference_image || null;
      return res.json({
        nextState: 'CUSTOMER_NAME',
        reply: `Almost done! 😊\n\nWhat is your **Full Name**?`,
        quickReplies: ['🏠 Main Menu', '🔄 Start Over'],
        sessionData: { ...sessionData, reference_image: imgPath }
      });
    }

    if (state === 'CUSTOMER_NAME') {
      return res.json({
        nextState: 'CUSTOMER_PHONE',
        reply: `Thank you, **${cleanMsg}**! ♥\n\nWhat is your **10-digit WhatsApp Number**?\n*(Our artisan will contact you here when your order is ready — no email needed)*`,
        quickReplies: ['🏠 Main Menu', '🔄 Start Over'],
        sessionData: { ...sessionData, customer_name: cleanMsg }
      });
    }

    if (state === 'CUSTOMER_PHONE') {
      const cleanPhone = cleanMsg.replace(/[^0-9]/g, '');
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        return res.json({
          nextState: 'CUSTOMER_PHONE',
          reply: `⚠️ Please enter a valid Indian **10-digit Mobile Number** starting with 6, 7, 8 or 9\n*(e.g. \`9876543210\`):`,
          quickReplies: ['🏠 Main Menu', '🔄 Start Over'],
          sessionData
        });
      }
      const priceInfo = getPriceForProduct(sessionData.product_required || '');
      const priceNote = priceInfo ? `\n💰 **Estimated Price:** ${priceInfo.range}` : '';
      const summary = `📋 **Order Summary**\n` +
        `• **Item:** ${sessionData.product_required}\n` +
        `• **Event Date:** ${sessionData.event_date}\n` +
        `• **Notes:** ${sessionData.customization_details}\n` +
        `• **Name:** ${sessionData.customer_name}\n` +
        `• **WhatsApp:** +91 ${cleanPhone}\n` +
        `• **Delivery:** Nadiad, Gujarat${priceNote}`;
      return res.json({
        nextState: 'CONFIRMATION',
        reply: `${summary}\n\nShall I submit this order now?`,
        quickReplies: ['✅ Yes, Submit Order', '🔄 Start Over', '🏠 Main Menu'],
        sessionData: { ...sessionData, phone: cleanPhone }
      });
    }

    if (state === 'CONFIRMATION') {
      if (cleanMsg === '✅ Yes, Submit Order' || cleanMsg.toLowerCase().includes('yes') || cleanMsg.toLowerCase().includes('ha')) {
        const now = new Date();
        const pad = n => n.toString().padStart(2, '0');
        const orderId = now.getFullYear().toString() + pad(now.getMonth() + 1) + pad(now.getDate()) +
          pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());

        const orderRecord = {
          order_id: orderId,
          timestamp: now.toISOString(),
          customer_name: sessionData.customer_name || 'Valued Customer',
          phone: sessionData.phone || 'Not specified',
          email: null,
          product_required: sessionData.product_required || 'Custom Handcrafted Item',
          event_date: sessionData.event_date || 'Not specified',
          customization_details: sessionData.customization_details || 'As discussed in AI chat',
          reference_image: sessionData.reference_image || null,
          source: 'AI_CHATBOT',
          status: 'Received',
          admin_notes: ''
        };

        await saveOrderRecord(orderRecord);
        sendStudioAlert(orderRecord);

        return res.json({
          nextState: 'INIT',
          reply: `🎉 **Order Submitted Successfully!**\n\n📌 **Your Tracking ID:** \`#${orderId}\`\n\nThank you, **${orderRecord.customer_name}**! 🙏\n\nOur studio in **Nadiad** has received your request and will contact you on WhatsApp (+91 ${orderRecord.phone}) very soon.\n\n_Save your Tracking ID to check status anytime!_ ♥`,
          quickReplies: ['📦 Track Order', '✨ Place Another Order', '🏠 Main Menu'],
          sessionData: {}
        });
      } else {
        return res.json({
          nextState: 'INIT',
          reply: "No worries! 😊 Your order was not placed.\n\nWhat would you like to do?",
          quickReplies: ['✨ Place an Order', '💬 Check Price', '🏠 Main Menu'],
          sessionData: {}
        });
      }
    }

    // Final fallback
    return res.json({
      nextState: 'INIT',
      reply: "I'm here to help! What would you like to do?",
      quickReplies: ['✨ Place an Order', '💬 Check Price', '📍 Delivery Info', '📦 Track Order', '🏠 Main Menu']
    });

  } catch (error) {
    console.error('Chatbot API Error:', error);
    res.status(500).json({
      reply: "Sorry, I encountered a brief hiccup. Please click **✨ Place an Order** to try again!",
      nextState: 'INIT',
      quickReplies: ['✨ Place an Order']
    });
  }
};

/* ── File upload inside chat ── */
exports.handleChatUpload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    const imageUrl = `/static/uploads/${req.file.filename}`;
    res.json({ success: true, imageUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
