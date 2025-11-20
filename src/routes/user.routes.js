import { Router } from 'express'
import { createUserByAdminHandler, getProfileHandler, loginUserHandler, refreshAccessTokenHandler, registerUserHandler } from '../controllers/user.controller.js'
import { loginUserSchema, registerUserSchema } from '../utils/input-schema.js'
import validate from '../middlewares/validation.middleware.js'
import { authenticateUser, authorizeAdmin } from '../middlewares/auth.middleware.js'
import { cancelBookingHandler, getAllUserBookingsHandler, getBookingByIdHandler } from '../controllers/booking.controller.js'
import { createLimiter } from '../middlewares/rate-limit.middleware.js'

const router = Router()

const loginLimiter = createLimiter({
  keyPrefix: 'login',
  points: 10,
  duration: 60
})

const refreshLimiter = createLimiter({
  keyPrefix: 'refresh',
  points: 10,
  duration: 60
})

const cancelLimiter = createLimiter({
  keyPrefix: 'cancel',
  points: 10,
  duration: 60
})

const registerLimiter = createLimiter({
  keyPrefix: 'register',
  points: 10,
  duration: 60
});

router.route('/register').post(registerLimiter, validate(registerUserSchema), registerUserHandler)
router.route('/login').post(loginLimiter, validate(loginUserSchema), loginUserHandler)
router.route('/profile').get(authenticateUser, getProfileHandler)
router.route('/refresh-token').post(refreshLimiter, refreshAccessTokenHandler)
router.route('/admin/create-user').post(validate(registerUserSchema), authenticateUser, authorizeAdmin, createUserByAdminHandler)
router.route('/:id/cancel-booking').post(authenticateUser, cancelLimiter, cancelBookingHandler)
router.route('/:id/booking').get(authenticateUser, getBookingByIdHandler)
router.route('/bookings').get(authenticateUser, getAllUserBookingsHandler)




export default router