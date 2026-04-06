import express from 'express';
import cors from 'cors';
import { markLessonComplete, getProgress } from '../controllers/progressController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://platform-client-black-five.vercel.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

router.options('/:courseId', cors(corsOptions));
router.options('/:courseId/complete', cors(corsOptions));

router.get('/:courseId', protect, getProgress);
router.patch('/:courseId/complete', protect, markLessonComplete);

export default router;