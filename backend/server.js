require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, getIsMongoConnected } = require('./config/db');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB & initialize fallback dual persistence
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets (uploads & images)
app.use('/static/uploads', express.static(path.join(__dirname, '../static/uploads')));
app.use('/static/images', express.static(path.join(__dirname, '../static/images')));

// API & Order Submission Routes
app.use('/api', orderRoutes);
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/', orderRoutes); // Mounts /submit-order directly at root exactly like Flask

// Health Check Endpoint (Skill Enhancement)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: getIsMongoConnected() ? 'MongoDB Connected' : 'Local JSON Fallback Mode Active'
  });
});

// Serve frontend build if in production or when dist exists
const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA routing if dist exists
app.get('*', (req, res) => {
  const indexHtml = path.join(distPath, 'index.html');
  res.sendFile(indexHtml, (err) => {
    if (err) {
      res.status(404).send('EverAura Creations MERN Backend Running. Please run "npm run client" or "npm run dev" to launch the React frontend.');
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 EverAura Creations MERN Server running on port ${PORT}`);
  console.log(`📌 API Endpoints: http://localhost:${PORT}/submit-order | http://localhost:${PORT}/api/orders`);
});
