import dotenv from 'dotenv';
import Stripe from 'stripe';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Progress from '../models/Progress.js';

dotenv.config();

const getStripe = () => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    throw new Error('STRIPE_SECRET_KEY is missing in .env');
  }

  return new Stripe(stripeKey);
};

// POST /api/checkout/payment-intent
export const createPaymentIntent = async (req, res) => {
  try {
    const stripe = getStripe();
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    if (course.isFree || course.price === 0) {
      return res.status(400).json({
        success: false,
        message: 'This course is free. Use the enroll endpoint directly.',
      });
    }

    const existing = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
    });

    if (existing) {
      return res.status(409).json({ success: false, message: 'Already enrolled.' });
    }

    const amountInCents = Math.round(course.price * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        courseId: courseId.toString(),
        userId: req.user._id.toString(),
        courseName: course.title,
      },
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: amountInCents,
      courseName: course.title,
    });
  } catch (error) {
    console.error('createPaymentIntent error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent.',
      error: error.message,
    });
  }
};

// POST /api/checkout/confirm
export const confirmEnrollment = async (req, res) => {
  try {
    const stripe = getStripe();
    const { courseId, paymentIntentId } = req.body;
    const userId = req.user._id;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: `Payment not completed. Status: ${paymentIntent.status}`,
      });
    }

    const existing = await Enrollment.findOne({ user: userId, course: courseId });
    if (existing) {
      return res.json({
        success: true,
        message: 'Already enrolled.',
        data: existing,
      });
    }

    const enrollment = await Enrollment.create({
      user: userId,
      course: courseId,
      paymentIntentId,
      amountPaid: paymentIntent.amount / 100,
      status: 'active',
    });

    await Progress.create({
      user: userId,
      course: courseId,
      completedLessons: [],
      percentComplete: 0,
    });

    await Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: 1 } });

    res.status(201).json({
      success: true,
      message: 'Enrollment confirmed.',
      data: enrollment,
    });
  } catch (error) {
    console.error('confirmEnrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm enrollment.',
      error: error.message,
    });
  }
};