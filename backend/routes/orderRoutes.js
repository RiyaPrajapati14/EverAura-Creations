const express = require('express');
const router = express.Router();
const { submitOrder, getOrders, updateOrderStatus, addAdminNote, deleteOrder, updateCustomerMessage } = require('../controllers/orderController');
const { upload, duplicateToReadUploads } = require('../middleware/upload');

// Flexible upload handler (supports any field name)
const handleUpload = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        status: 'error',
        success: false,
        error: err.message || 'Error uploading file.',
        message: err.message || 'Error uploading file.'
      });
    }
    next();
  });
};

// Order CRUD
router.post('/submit-order', handleUpload, duplicateToReadUploads, submitOrder);
router.post('/orders', handleUpload, duplicateToReadUploads, submitOrder);
router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.post('/orders/:id/note', addAdminNote);
router.delete('/orders/:id', deleteOrder);
router.post('/orders/:id/customer-message', updateCustomerMessage);

module.exports = router;

