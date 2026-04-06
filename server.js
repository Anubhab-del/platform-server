import 'express-async-errors';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes     from './routes/auth.js';
import courseRoutes   from './routes/courses.js';
import enrollRoutes   from './routes/enroll.js';
import checkoutRoutes from './routes/checkout.js';
import chatRoutes     from './routes/chat.js';
import progressRoutes from './routes/progress.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── CORS ───────────────────────────────────────────────────────────
// Must be registered BEFORE helmet and all routes.
// The OPTIONS preflight must also be handled explicitly.

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  optionsSuccessStatus: 200, // Some browsers (IE11) choke on 204
};

// Handle every OPTIONS preflight request immediately
app.options('*', cors(corsOptions));

// Apply CORS to all routes
app.use(cors(corsOptions));

// ── Security & Middleware ──────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Routes ─────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/courses',  courseRoutes);
app.use('/api/enroll',   enrollRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/chat',     chatRoutes);
app.use('/api/progress', progressRoutes);

// ── Health check ───────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status:      'ok',
    environment: process.env.NODE_ENV,
    timestamp:   new Date().toISOString(),
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
  console.error('Global error:', err.stack);

  // Do not override CORS headers on error responses
  res.header('Access-Control-Allow-Origin',  req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  const status  = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Database + Server Start ────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: 'learnpro' });
    console.log('✅ MongoDB connected — learnpro database');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`✅ Allowed origins: ${allowedOrigins.join(', ')}`);
  });
});

export default app;