const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');

const envFile = path.join(__dirname, "..", ".env");
if (fs.existsSync(envFile)) {
  const raw = fs.readFileSync(envFile, "utf8");
  raw.split(/\r?\n/).forEach((line) => {
    const t = line.trim();
    if (!t || t.startsWith("#")) return;
    const i = t.indexOf("=");
    if (i < 1) return;
    const k = t.slice(0, i).trim();
    if (!k || process.env[k] !== undefined) return;
    process.env[k] = t.slice(i + 1).trim();
  });
}

const PORT = Number(process.env.PORT || 3001);
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bidnsteal";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@bidnsteal.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Tufayel@142003";

const app = express();


app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.text());
app.use((req, res, next) => { console.log('[API Request]', req.method, req.originalUrl); next(); });
app.use('/uploads', express.static(path.join(__dirname, '..', '..', 'shared', 'uploads')));


mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB at', MONGODB_URI))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

app.use('/api/auth', require('../routes/auth'));
app.use('/api/admin/products', require('../routes/products'));
app.use('/api/admin/orders', require('../routes/orders'));
app.use('/api/admin/media', require('../routes/media'));
app.use('/api/admin/auctions', require('../routes/auctions'));
app.use('/api/admin', require('../routes/crm'));

app.get('/api/health', (req, res) => res.json({ ok: true, status: 'express-active' }));
app.get('/api/ready', (req, res) => res.json({ ok: true }));

app.get('/api/metrics', async (req, res) => {
  try {
    const Auction = require('../models/Auction');
    const now = new Date();
    const liveAuctions = await Auction.countDocuments({ status: 'live', endAt: { $gt: now } });
    const scheduledAuctions = await Auction.countDocuments({ status: 'scheduled' });
    res.json({ liveAuctions, scheduledAuctions, ok: true });
  } catch (err) {
    res.json({ liveAuctions: 0, scheduledAuctions: 0, ok: false });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 BidnSteal Express API running on http://localhost:${PORT}`);
});
