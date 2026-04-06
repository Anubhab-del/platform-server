import express from 'express';
import { createPaymentIntent, confirmEnrollment } from '../controllers/checkoutController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/payment-intent', protect, createPaymentIntent);
router.post('/confirm',        protect, confirmEnrollment);

export default router;