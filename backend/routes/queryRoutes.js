const express = require('express');
const router  = express.Router();
const qc      = require('../controllers/queryController');

/* ── Customer (chatbot) endpoints ──────────────────────────────────────── */
router.post('/',               qc.submitQuery);           // submit new query
router.get('/check/:phone',    qc.checkRepliesForPhone);  // check replies by phone
router.patch('/:id/seen',      qc.markSeenByUser);        // mark reply as seen by user

/* ── Admin endpoints ────────────────────────────────────────────────────── */
router.get('/',                qc.getAllQueries);          // all queries
router.get('/unread-count',    qc.getUnreadCount);        // badge count
router.patch('/:id/read',      qc.markAsRead);            // mark as read
router.post('/:id/reply',      qc.addReply);              // admin reply

module.exports = router;
