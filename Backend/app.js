// const express = require('express');
// const cors = require('cors');
// const { connectDB, firebaseConfig } = require('./config');
// const Router = require('./routes');
// const path = require('path');

// const app = express();

// // ── CORS ───────────────────────────────────────────
// const allowedOrigins = [
//   'http://localhost:3000', 
//   'http://127.0.0.1:5500',
//   process.env.FRONTEND_URL,         // e.g. https://yourapp.com
        
// ];

// app.use(cors({
//   origin: (origin, callback) => {
//     // allow requests with no origin (mobile apps, curl, Postman)
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error(`CORS blocked: ${origin}`));
//     }
//   },
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true,                 
// }));

        

// // ── Middleware ─────────────────────────────────────
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // ── Routes ─────────────────────────────────────────
// app.use(express.static(path.join(__dirname, '../frontend')));// serves static files
// app.use('/api', Router);
// // ── Start Server only after DB connects ───────────
// async function startServer() {
//   try {
//     const db = await connectDB();
//     app.locals.db = db;             

//     app.listen(3000, () => {
//       console.log('Server running on port 3000');
//     });
//   } catch (err) {
//     console.error('Failed to start server:', err.message);
//     process.exit(1);
//   }
// }

// startServer();
// // app.use('/api', Router);

// module.exports = app;

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config');
const Router = require('./routes');
const path = require('path');

const app = express();

// CORS (optional if frontend + backend are same origin)
app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend FIRST
app.use(express.static(path.join(__dirname, 'frontend')));

// API routes
app.use('/api', Router);

// Fallback for SPA/static routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start server after DB connects
async function startServer() {
  try {
    const db = await connectDB();
    app.locals.db = db;
  } catch (err) {
    console.error('Failed to connect DB:', err.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
