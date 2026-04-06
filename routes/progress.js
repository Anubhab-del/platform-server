import express from 'express';
import { markLessonComplete, getProgress } from '../controllers/progressController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/:courseId', protect, getProgress);
router.post('/:courseId/complete', protect, markLessonComplete);

export default router;