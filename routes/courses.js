import express from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courseController.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/',     getCourses);
router.get('/:id',  getCourseById);
router.post('/',    protect, requireRole('instructor', 'admin'), createCourse);
router.put('/:id',  protect, requireRole('instructor', 'admin'), updateCourse);
router.delete('/:id', protect, requireRole('admin'), deleteCourse);

export default router;