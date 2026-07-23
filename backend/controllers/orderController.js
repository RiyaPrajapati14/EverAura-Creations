const Order = require('../models/Order');
const { saveOrderRecord, getAllOrders, updateOrderInFile, deleteOrderFromFile, getIsMongoConnected, readOrdersFromFile } = require('../config/db');

// @desc    Submit a new order
// @route   POST /submit-order and POST /api/orders
// @access  Public
const submitOrder = async (req, res) => {
  try {
    const name = (req.body.name || req.body.customer_name || '').trim();
    const phone = (req.body.phone || '').trim();
    const email = (req.body.email || '').trim();
    const product = (req.body.product || req.body.service_type || '').trim();
    const eventDate = (req.body.eventDate || req.body.event_date || '').trim();
    const details = (req.body.details || req.body.requirements || req.body.customization_details || '').trim();

    if (!name || !phone || !product || !details) {
      return res.status(400).json({
        status: 'error',
        success: false,
        error: 'Please fill in all required fields.',
        message: 'Please fill in all required fields.'
      });
    }

    let imagePath = null;
    const file = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);
    if (file) imagePath = `/static/uploads/${file.filename}`;

    const now = new Date();
    const pad = (n, len = 2) => String(n).padStart(len, '0');
    const orderId = now.getFullYear().toString() +
      pad(now.getMonth() + 1) + pad(now.getDate()) +
      pad(now.getHours()) + pad(now.getMinutes()) +
      pad(now.getSeconds()) + pad(now.getMilliseconds(), 3);

    const orderRecord = {
      order_id: orderId,
      timestamp: now.toISOString(),
      customer_name: name,
      phone,
      email: email || null,
      product_required: product,
      event_date: eventDate || 'Not specified',
      customization_details: details,
      reference_image: imagePath,
      source: req.body.source || 'WEB_FORM',
      status: 'Received',
      admin_notes: ''
    };

    await saveOrderRecord(orderRecord);
    const { sendStudioAlert } = require('../utils/notifyStudio');
    sendStudioAlert(orderRecord);

    return res.status(200).json({
      status: 'success',
      success: true,
      message: 'Order submitted successfully!',
      order_id: orderRecord.order_id
    });
  } catch (err) {
    console.error('Unhandled error in submitOrder:', err);
    return res.status(500).json({ status: 'error', message: 'An internal server error occurred.' });
  }
};

// @desc    Get all submitted orders
// @route   GET /api/orders
const getOrders = async (req, res) => {
  try {
    const orders = await getAllOrders();
    return res.status(200).json({ status: 'success', count: orders.length, orders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    return res.status(500).json({ status: 'error', message: 'Could not retrieve orders.' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Received', 'In Production', 'Ready for Delivery in Nadiad', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ status: 'error', message: 'Invalid status value.' });
    }

    let updatedOrder = null;

    // Try MongoDB first
    if (getIsMongoConnected()) {
      try {
        updatedOrder = await Order.findOneAndUpdate(
          { order_id: id },
          { status },
          { new: true }
        );
      } catch (dbErr) {
        console.error('MongoDB status update failed:', dbErr.message);
      }
    }

    // Always update local JSON too
    const fileUpdated = updateOrderInFile(id, { status });
    if (!updatedOrder) updatedOrder = fileUpdated;

    if (!updatedOrder) {
      return res.status(404).json({ status: 'error', message: 'Order not found.' });
    }

    const { sendCustomerStatusUpdate } = require('../utils/notifyStudio');
    const waNotificationUrl = sendCustomerStatusUpdate(updatedOrder, status);

    return res.status(200).json({ status: 'success', order: updatedOrder, waNotificationUrl });
  } catch (err) {
    console.error('Error updating status:', err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

// @desc    Add/update message for customer on an order (visible via tracker)
// @route   POST /api/orders/:id/customer-message
const updateCustomerMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    let updatedOrder = null;

    if (getIsMongoConnected()) {
      try {
        updatedOrder = await Order.findOneAndUpdate(
          { order_id: id },
          { customer_message: message },
          { new: true }
        );
      } catch (dbErr) {
        console.error('MongoDB customer message update failed:', dbErr.message);
      }
    }

    const fileUpdated = updateOrderInFile(id, { customer_message: message });
    if (!updatedOrder) updatedOrder = fileUpdated;

    if (!updatedOrder) {
      return res.status(404).json({ status: 'error', message: 'Order not found.' });
    }

    return res.status(200).json({ status: 'success', order: updatedOrder });
  } catch (err) {
    console.error('Error updating customer message:', err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

// @desc    Add/update admin note on an order
// @route   POST /api/orders/:id/note
const addAdminNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    let updatedOrder = null;

    if (getIsMongoConnected()) {
      try {
        updatedOrder = await Order.findOneAndUpdate(
          { order_id: id },
          { admin_notes: note },
          { new: true }
        );
      } catch (dbErr) {
        console.error('MongoDB note update failed:', dbErr.message);
      }
    }

    const fileUpdated = updateOrderInFile(id, { admin_notes: note });
    if (!updatedOrder) updatedOrder = fileUpdated;

    if (!updatedOrder) {
      return res.status(404).json({ status: 'error', message: 'Order not found.' });
    }

    return res.status(200).json({ status: 'success', order: updatedOrder });
  } catch (err) {
    console.error('Error adding note:', err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

// @desc    Delete an order
// @route   DELETE /api/orders/:id
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (getIsMongoConnected()) {
      try {
        await Order.findOneAndDelete({ order_id: id });
      } catch (dbErr) {
        console.error('MongoDB delete failed:', dbErr.message);
      }
    }

    deleteOrderFromFile(id);

    return res.status(200).json({ status: 'success', message: 'Order deleted successfully.' });
  } catch (err) {
    console.error('Error deleting order:', err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports = { submitOrder, getOrders, updateOrderStatus, addAdminNote, deleteOrder, updateCustomerMessage, saveOrderRecord };
