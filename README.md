# EverAura Creations — MERN Stack Web Application with Interactive Sliders 🕉️✨

Welcome to **EverAura Creations**, an elegant, modern web application for custom handcrafted gifts and high-impact digital creations. Originally built with Python/Flask, this project has been fully migrated to a robust **MERN Monorepo Stack** (MongoDB, Express, React, Node.js) with dynamic **Swiper.js image sliders** and dual-persistence database compatibility.

---

## 🌟 Key Features & Improvements

1. **Full MERN Stack Architecture**:
   - **Backend (`backend/`)**: Node.js & Express API server (`http://localhost:5000`) with comprehensive multipart form upload handling (`Multer`) and structured Mongoose schemas.
   - **Frontend (`frontend/`)**: High-performance React 18 single-page application built with Vite (`http://localhost:5173`), featuring glassmorphism, floating petals, smooth scrolling, and responsive layouts.
   - **Monorepo Orchestration**: Root `package.json` with `concurrently` allows running both servers together or individually with simple NPM scripts.

2. **Interactive Swiper.js Image Sliders**:
   - Replaced static grid cards in both **Handmade Gifts** and **Digital Services** sections with touch/swipe-enabled **Swiper carousels**.
   - Configured with `Navigation`, `Pagination` (dynamic bullets), `Autoplay`, and responsive breakpoints (`1 to 4 slides per view`).

3. **Dual-Persistence & Zero Regression**:
   - **MongoDB + JSON Fallback**: On startup, the backend checks for `mongodb://127.0.0.1:27017/everaura`. If MongoDB is running, it connects and automatically migrates any existing data from `orders.json` into MongoDB. If MongoDB is offline, it seamlessly falls back to `orders.json` without breaking or losing data.
   - **Backwards Compatibility**: Maintains the exact `/submit-order` endpoint, unique timestamp order ID generation (`YYYYMMDDHHMMSSmmm`), and dual-writes uploaded images to both `static/uploads` and `read/static/uploads`.

4. **Rich Aesthetics & Artisan Design**:
   - Curated terracotta/rose gold color palette (`#b8734a`, `#2c1810`, `#fdf8f2`).
   - Parallax hero background with live typewriter effect (`"Crafted with Love, Made for Memories."`).
   - Animated stats counter (`500+ Happy Customers`, `15+ Unique Services`, `100% Made with Love`) using `IntersectionObserver`.

---

## 📂 Project Structure

```
d:/EverAura Creations/
├── package.json           # Root orchestrator (concurrent scripts)
├── README.md              # Project documentation
├── backend/               # Express API & MongoDB backend
│   ├── config/db.js       # MongoDB & dual-persistence connection
│   ├── models/Order.js    # Mongoose Order Schema
│   ├── middleware/upload.js # Multer file upload handling
│   ├── controllers/orderController.js # Order processing logic
│   ├── routes/orderRoutes.js # API endpoints (/submit-order, /api/orders, etc.)
│   └── server.js          # Express entry point
├── frontend/              # Vite + React Single Page Application
│   ├── public/static/     # Cached static image assets
│   ├── src/
│   │   ├── components/    # Modular React components (Navbar, Hero, Sliders, OrderForm...)
│   │   ├── App.jsx        # Main application layout
│   │   ├── main.jsx       # React DOM root entry
│   │   └── index.css      # Complete artisan styling & Swiper tokens
│   └── vite.config.js     # Proxy setup (/submit-order, /api, /static -> port 5000)
└── static/                # Shared static images and uploads directory
```

---

## 🚀 How to Run the Application

### Option 1: Run Full Stack Simultaneously (Recommended)
From the root directory (`d:/EverAura Creations/`), run:
```bash
npm run dev
```
This launches both:
- **Express Backend Server** on `http://localhost:5000`
- **Vite React Dev Server** on `http://localhost:5173`

### Option 2: Run Services Individually
- **Backend Only**:
  ```bash
  npm run server
  ```
  *(OR cd into `backend` and run `npm start`)*

- **Frontend Dev Server Only**:
  ```bash
  npm run client
  ```
  *(OR cd into `frontend` and run `npm run dev`)*

### Option 3: Production Build (Single Port Serving)
1. Build the React frontend bundle:
   ```bash
   npm run build
   ```
2. Start the Express server:
   ```bash
   npm run server
   ```
The Express server on `http://localhost:5000` will automatically serve the production React build and API endpoints from a single unified port!

---

## 📌 API Endpoints

- `POST /submit-order` or `POST /api/orders` — Submit a new customer order (Supports `multipart/form-data` with image attachment).
- `GET /api/orders` — Retrieve all submitted orders (from MongoDB or JSON fallback).
- `GET /api/health` — Check server status, timestamp, and active database mode.

---
*Made with ♥ by EverAura Studio*
