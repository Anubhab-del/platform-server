import express from 'express';
import { enrollInCourse, getMyEnrollments, checkEnrollment } from '../controllers/enrollController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/:courseId',   protect, enrollInCourse);
router.get('/my',           protect, getMyEnrollments);
router.get('/check/:courseId', protect, checkEnrollment);

export default router;