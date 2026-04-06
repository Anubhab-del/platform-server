import 'express-async-errors';
import express    from 'express';
import mongoose   from 'mongoose';
import helmet     from 'helmet';
import morgan     from 'morgan';
import dotenv     from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

import authRoutes     from './routes/auth.js';
import courseRoutes   from './routes/courses.js';
import enrollRoutes   from './routes/enroll.js';
import checkoutRoutes from './routes/checkout.js';
import chatRoutes     from './routes/chat.js';
import progressRoutes from './routes/progress.js';

dotenv.config();

const app       = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── Manual CORS — set headers on EVERY response ────────────────────
// This runs before everything else and cannot be overridden by helmet
// or any middleware down the chain.
app.use((req, res, next) => {
  const origin = req.headers.origin;

  const allowed = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.CLIENT_URL || '',
  ].filter(Boolean);

  // If the request has an origin header and it is in our list, echo it back.
  // If there is no origin (Postman, server-to-server), allow wildcard.
  if (origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else {
    // Still set the header so the browser gets a useful error, not a network error
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // Cache preflight for 24h

  // Preflight — respond immediately with 200, do not go further
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// ── Security ───────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── Routes ─────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/courses',  courseRoutes);
app.use('/api/enroll',   enrollRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/chat',     chatRoutes);
app.use('/api/progress', progressRoutes);

// ── Health ─────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status:    'ok',
    env:       process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── 404 ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ── Global error handler ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);

  // Re-stamp CORS headers so error responses are never blocked
  const origin = req.headers.origin;
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  res.status(err.statusCode || err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ── Start ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI, { dbName: 'learnpro' })
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server on port ${PORT}`);
      console.log(`CLIENT_URL = ${process.env.CLIENT_URL}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB failed:', err.message);
    process.exit(1);
  });

export default app;