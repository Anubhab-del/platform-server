import 'express-async-errors';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import enrollRoutes from './routes/enroll.js';
import checkoutRoutes from './routes/checkout.js';
import chatRoutes from './routes/chat.js';
import progressRoutes from './routes/progress.js';

dotenv.config();

const app = express();

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://platform-client-black-five.vercel.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enroll', enrollRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/progress', progressRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);

  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

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
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  });
});

export default app;