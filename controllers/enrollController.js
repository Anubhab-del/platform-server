import Enrollment from '../models/Enrollment.js';
import Progress from '../models/Progress.js';
import Course from '../models/Course.js';

// POST /api/enroll/:courseId
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const existing = await Enrollment.findOne({ user: userId, course: courseId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Already enrolled in this course.',
      });
    }

    const { paymentIntentId, amountPaid } = req.body;

    const enrollment = await Enrollment.create({
      user: userId,
      course: courseId,
      paymentIntentId: paymentIntentId || '',
      amountPaid: amountPaid || 0,
    });

    const existingProgress = await Progress.findOne({ user: userId, course: courseId });

    if (!existingProgress) {
      await Progress.create({
        user: userId,
        course: courseId,
        completedLessons: [],
        percentComplete: 0,
      });
    }

    await Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: 1 } });

    res.status(201).json({
      success: true,
      message: 'Enrolled successfully.',
      data: enrollment,
    });
  } catch (error) {
    console.error('enrollInCourse error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll in course.',
      error: error.message,
    });
  }
};

// GET /api/enroll/my
export const getMyEnrollments = async (req, res) => {
  try {
    const userId = req.user._id;

    const enrollments = await Enrollment.find({ user: userId })
      .populate('course', 'title thumbnail category level duration instructor price rating slug')
      .sort({ createdAt: -1 })
      .lean();

    const progressList = await Progress.find({ user: userId }).lean();

    const progressMap = {};
    progressList.forEach((p) => {
      progressMap[p.course.toString()] = p;
    });

    const result = enrollments
      .filter((e) => e.course) // skip broken enrollments with missing course
      .map((e) => ({
        ...e,
        progress: progressMap[e.course._id.toString()] || {
          completedLessons: [],
          percentComplete: 0,
        },
      }));

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('getMyEnrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollments.',
      error: error.message,
    });
  }
};

// GET /api/enroll/check/:courseId
export const checkEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: req.params.courseId,
    });

    res.json({
      success: true,
      isEnrolled: !!enrollment,
    });
  } catch (error) {
    console.error('checkEnrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check enrollment.',
      error: error.message,
    });
  }
};