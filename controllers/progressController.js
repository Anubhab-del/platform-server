import mongoose from 'mongoose';
import Progress from '../models/Progress.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

// GET /api/progress/:courseId
export const getProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.params;

    let progress = await Progress.findOne({ user: userId, course: courseId });

    // If not found but user is enrolled, auto-create "zero progress" row
    if (!progress) {
      const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Not enrolled in this course.',
        });
      }

      progress = await Progress.create({
        user: userId,
        course: courseId,
        completedLessons: [],
        percentComplete: 0,
      });
    }

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('getProgress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress.',
      error: error.message,
    });
  }
};

// PATCH /api/progress/:courseId/complete
export const markLessonComplete = async (req, res) => {
  try {
    const { lessonId } = req.body;
    const { courseId } = req.params;
    const userId = req.user._id;

    if (!lessonId) {
      return res.status(400).json({
        success: false,
        message: 'lessonId is required.',
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    const totalLessons = Array.isArray(course.lessons) ? course.lessons.length : 0;
    if (totalLessons === 0) {
      return res.status(400).json({
        success: false,
        message: 'This course does not have any lessons and cannot be completed.',
      });
    }

    // Ensure enrollment exists (otherwise user cannot complete lessons)
    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Not enrolled in this course.',
      });
    }

    // Ensure progress exists (auto-create if it’s somehow missing)
    let progress = await Progress.findOne({ user: userId, course: courseId });

    if (!progress) {
      progress = await Progress.create({
        user: userId,
        course: courseId,
        completedLessons: [],
        percentComplete: 0,
      });
    }

    const lessonObjectId = new mongoose.Types.ObjectId(lessonId);
    const alreadyDone = progress.completedLessons.some(
      (completedId) => completedId.toString() === lessonObjectId.toString()
    );

    if (!alreadyDone) {
      progress.completedLessons.push(lessonObjectId);
    }

    const percent = Math.round(
      (progress.completedLessons.length / totalLessons) * 100
    );

    progress.percentComplete = percent;
    progress.lastAccessedAt = new Date();

    // Completion (only once)
    if (percent >= 100 && !progress.isCompleted) {
      progress.isCompleted = true;
      progress.completedAt = new Date();

      await Enrollment.findOneAndUpdate(
        { user: userId, course: courseId },
        { status: 'completed', completedAt: new Date() }
      );
    }

    await progress.save();

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('markLessonComplete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark lesson complete.',
      error: error.message,
    });
  }
};