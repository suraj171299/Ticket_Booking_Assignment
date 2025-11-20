import { Router } from 'express';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { createHoldHandler } from '../controllers/hold.controller.js';
import { confirmHoldHandler } from '../controllers/booking.controller.js';
import { createLimiter } from '../middlewares/rate-limit.middleware.js';

const router = Router();

const holdLimiter = createLimiter({
  keyPrefix: 'hold',
  points: 10,
  duration: 60
})

const confirmLimiter = createLimiter({
  keyPrefix: 'confirm',
  points: 5,
  duration: 60
})

router.route('/:eventId/events').post(authenticateUser, holdLimiter, createHoldHandler);
router.route('/:holdId/confirm').post(authenticateUser, confirmLimiter, confirmHoldHandler);

export default router;