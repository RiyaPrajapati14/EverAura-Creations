const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Order = require('../models/Order');

let isMongoConnected = false;

// Single reliable fallback path: <project-root>/data/orders.json
const dataDir = path.join(__dirname, '../../data');
const ordersFilePath = path.join(dataDir, 'orders.json');

// Ensure data/ directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Helper: read orders from local JSON fallback file
const readOrdersFromFile = () => {
  if (fs.existsSync(ordersFilePath)) {
    try {
      const content = fs.readFileSync(ordersFilePath, 'utf-8').trim();
      return content ? JSON.parse(content) : [];
    } catch (err) {
      console.error('Error reading fallback orders.json:', err.message);
      return [];
    }
  }
  return [];
};

// Helper: write orders to local JSON fallback file
const writeOrdersToFile = (ordersList) => {
  try {
    fs.writeFileSync(ordersFilePath, JSON.stringify(ordersList, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to orders.json:', err.message);
  }
};

// Update a single order in the local JSON file
const updateOrderInFile = (orderId, updates) => {
  const orders = readOrdersFromFile();
  const updated = orders.map(o => o.order_id === orderId ? { ...o, ...updates } : o);
  writeOrdersToFile(updated);
  return updated.find(o => o.order_id === orderId) || null;
};

// Delete a single order from the local JSON file
const deleteOrderFromFile = (orderId) => {
  const orders = readOrdersFromFile();
  const filtered = orders.filter(o => o.order_id !== orderId);
  writeOrdersToFile(filtered);
};

// Auto-migrate local orders from JSON file into MongoDB
const autoMigrateLocalOrders = async () => {
  try {
    const localOrders = readOrdersFromFile();
    if (localOrders && localOrders.length > 0) {
      let migratedCount = 0;
      for (const order of localOrders) {
        const exists = await Order.findOne({ order_id: order.order_id });
        if (!exists) {
          await Order.create({
            order_id: order.order_id,
            timestamp: order.timestamp || new Date().toISOString(),
            customer_name: order.customer_name,
            phone: order.phone,
            email: order.email || null,
            product_required: order.product_required,
            event_date: order.event_date || 'Not specified',
            customization_details: order.customization_details,
            reference_image: order.reference_image || null,
            source: order.source || 'WEB_FORM',
            status: order.status || 'Received'
          });
          migratedCount++;
        }
      }
      if (migratedCount > 0) {
        console.log(`[MongoDB Migration] Imported ${migratedCount} order(s) from local JSON to MongoDB.`);
      }
    }
  } catch (err) {
    console.error('Error auto-migrating local orders to MongoDB:', err.message);
  }
};

// Connect to MongoDB
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/everaura';
  try {
    console.log(`Attempting connection to MongoDB at: ${mongoURI}`);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 5000,
    });
    isMongoConnected = true;
    console.log('✅ MongoDB Connected Successfully!');
    await autoMigrateLocalOrders();
  } catch (err) {
    isMongoConnected = false;
    console.warn('⚠️  MongoDB not available:', err.message);
    console.warn('⚡ [Fallback Mode] Using local data/orders.json — all features remain operational.');
  }
};

// Dual persistence: save order
const saveOrderRecord = async (orderData) => {
  // Always write to local JSON for backup
  const localOrders = readOrdersFromFile();
  localOrders.push(orderData);
  writeOrdersToFile(localOrders);

  if (isMongoConnected) {
    try {
      const newOrder = await Order.create(orderData);
      return newOrder;
    } catch (err) {
      console.error('Error saving to MongoDB, data preserved in data/orders.json:', err.message);
      return orderData;
    }
  }
  return orderData;
};

// Dual persistence: get all orders
const getAllOrders = async () => {
  if (isMongoConnected) {
    try {
      return await Order.find().sort({ createdAt: -1 });
    } catch (err) {
      console.error('Error fetching from MongoDB, reading from orders.json:', err.message);
      return readOrdersFromFile();
    }
  }
  return readOrdersFromFile().reverse();
};

module.exports = {
  connectDB,
  saveOrderRecord,
  getAllOrders,
  readOrdersFromFile,
  writeOrdersToFile,
  updateOrderInFile,
  deleteOrderFromFile,
  getIsMongoConnected: () => isMongoConnected
};
