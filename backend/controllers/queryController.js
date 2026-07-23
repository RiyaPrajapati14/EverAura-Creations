const Query = require('../models/Query');
const fs    = require('fs');
const path  = require('path');
const { getIsMongoConnected } = require('../config/db');

/* ── JSON fallback file path ─────────────────────────────────────────── */
const QUERIES_FILE = path.join(__dirname, '../../queries.json');

const readQueriesFromFile = () => {
  try {
    if (fs.existsSync(QUERIES_FILE)) {
      return JSON.parse(fs.readFileSync(QUERIES_FILE, 'utf8'));
    }
  } catch { /* ignore */ }
  return [];
};

const writeQueriesToFile = (queries) => {
  try {
    fs.writeFileSync(QUERIES_FILE, JSON.stringify(queries, null, 2));
  } catch (e) {
    console.error('Failed to write queries.json:', e.message);
  }
};

/* ══════════════════════════════════════════════════════════════════════════
   POST /api/queries — Submit a new query from chatbot
══════════════════════════════════════════════════════════════════════════ */
exports.submitQuery = async (req, res) => {
  try {
    const { customerName, phone, queryText } = req.body;
    if (!customerName || !phone || !queryText) {
      return res.status(400).json({ error: 'customerName, phone, and queryText are required.' });
    }

    if (getIsMongoConnected()) {
      const q = await Query.create({ customerName, phone, queryText });
      return res.status(201).json({ success: true, queryId: q.queryId });
    } else {
      // JSON fallback
      const queries = readQueriesFromFile();
      const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
      const newQ = {
        queryId:       `QRY-${Date.now()}-${rand}`,
        customerName,
        phone,
        queryText,
        status:        'open',
        adminReplies:  [],
        isReadByAdmin: false,
        isSeenByUser:  false,
        createdAt:     new Date().toISOString()
      };
      queries.unshift(newQ);
      writeQueriesToFile(queries);
      return res.status(201).json({ success: true, queryId: newQ.queryId });
    }
  } catch (err) {
    console.error('submitQuery error:', err.message);
    res.status(500).json({ error: 'Failed to save query.' });
  }
};

/* ══════════════════════════════════════════════════════════════════════════
   GET /api/queries — Admin: fetch all queries (newest first)
══════════════════════════════════════════════════════════════════════════ */
exports.getAllQueries = async (req, res) => {
  try {
    if (getIsMongoConnected()) {
      const queries = await Query.find().sort({ createdAt: -1 }).lean();
      return res.json(queries);
    } else {
      const queries = readQueriesFromFile();
      return res.json(queries);
    }
  } catch (err) {
    console.error('getAllQueries error:', err.message);
    res.status(500).json({ error: 'Failed to fetch queries.' });
  }
};

/* ══════════════════════════════════════════════════════════════════════════
   GET /api/queries/unread-count — Admin badge count
══════════════════════════════════════════════════════════════════════════ */
exports.getUnreadCount = async (req, res) => {
  try {
    if (getIsMongoConnected()) {
      const count = await Query.countDocuments({ isReadByAdmin: false });
      return res.json({ count });
    } else {
      const queries = readQueriesFromFile();
      const count = queries.filter(q => !q.isReadByAdmin).length;
      return res.json({ count });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to count.' });
  }
};

/* ══════════════════════════════════════════════════════════════════════════
   PATCH /api/queries/:id/read — Admin marks query as read
══════════════════════════════════════════════════════════════════════════ */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (getIsMongoConnected()) {
      await Query.findOneAndUpdate({ queryId: id }, { isReadByAdmin: true });
      return res.json({ success: true });
    } else {
      const queries = readQueriesFromFile();
      const idx = queries.findIndex(q => q.queryId === id);
      if (idx !== -1) { queries[idx].isReadByAdmin = true; writeQueriesToFile(queries); }
      return res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as read.' });
  }
};

/* ══════════════════════════════════════════════════════════════════════════
   POST /api/queries/:id/reply — Admin posts a reply
══════════════════════════════════════════════════════════════════════════ */
exports.addReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Reply text is required.' });

    const reply = { text: text.trim(), repliedAt: new Date().toISOString() };

    if (getIsMongoConnected()) {
      const q = await Query.findOneAndUpdate(
        { queryId: id },
        { $push: { adminReplies: reply }, status: 'replied' },
        { new: true }
      );
      if (!q) return res.status(404).json({ error: 'Query not found.' });
      return res.json({ success: true, query: q });
    } else {
      const queries = readQueriesFromFile();
      const idx = queries.findIndex(q => q.queryId === id);
      if (idx === -1) return res.status(404).json({ error: 'Query not found.' });
      queries[idx].adminReplies.push(reply);
      queries[idx].status = 'replied';
      queries[idx].isSeenByUser = false; // reset so customer knows new reply arrived
      writeQueriesToFile(queries);
      return res.json({ success: true, query: queries[idx] });
    }
  } catch (err) {
    console.error('addReply error:', err.message);
    res.status(500).json({ error: 'Failed to add reply.' });
  }
};

/* ══════════════════════════════════════════════════════════════════════════
   GET /api/queries/check/:phone — Chatbot: check replies for a phone number
══════════════════════════════════════════════════════════════════════════ */
exports.checkRepliesForPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    if (getIsMongoConnected()) {
      const queries = await Query.find({ phone: cleanPhone }).sort({ createdAt: -1 }).lean();
      return res.json(queries);
    } else {
      const all = readQueriesFromFile();
      const queries = all.filter(q => q.phone.replace(/[^0-9]/g, '') === cleanPhone);
      return res.json(queries);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to check replies.' });
  }
};

/* ══════════════════════════════════════════════════════════════════════════
   PATCH /api/queries/:id/seen — Customer marks reply as seen
══════════════════════════════════════════════════════════════════════════ */
exports.markSeenByUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (getIsMongoConnected()) {
      await Query.findOneAndUpdate({ queryId: id }, { isSeenByUser: true, status: 'closed' });
    } else {
      const queries = readQueriesFromFile();
      const idx = queries.findIndex(q => q.queryId === id);
      if (idx !== -1) {
        queries[idx].isSeenByUser = true;
        queries[idx].status = 'closed';
        writeQueriesToFile(queries);
      }
    }
    return res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update.' });
  }
};
