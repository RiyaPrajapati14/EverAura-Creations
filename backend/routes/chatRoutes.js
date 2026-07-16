const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { upload, duplicateToReadUploads } = require('../middleware/upload');

// Chat interaction & conversational order state machine
router.post('/', chatController.handleChatMessage);

// Reference image upload inside chat widget
router.post('/upload', upload.single('referenceImage'), duplicateToReadUploads, chatController.handleChatUpload);

module.exports = router;
