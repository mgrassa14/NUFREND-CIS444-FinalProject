const express = require('express');
const { connectDB,firebaseConfig } = require('./config');

const Router = require('./routes');

const app = express();

// ── Middleware Pipeline ────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(express.static('public'));   // uncomment if serving static files

// ── Routes ────────────────────────────────────────
app.use('/api', Router);             

// ── Start Server only after DB connects ───────────
async function startServer() {
  try {
    const db = await connectDB();
    app.locals.db = db;               // ✅ attach db for routes to access

    app.listen(3000, () => {
      console.log('Server running on port 3000');
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;