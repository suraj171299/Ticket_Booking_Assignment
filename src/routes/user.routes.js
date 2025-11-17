import { Router } from 'express'
import { createUserByAdminHandler, getProfileHandler, loginUserHandler, refreshAccessTokenHandler, registerUserHandler } from '../controllers/user.controller.js'
import { loginUserSchema, registerUserSchema } from '../utils/input-schema.js'
import validate from '../middlewares/input-validation.js'
import { authenticateUser, authorizeAdmin } from '../middlewares/authenticate-user.js'

const router = Router()

//user routes
router.route('/register').post(validate(registerUserSchema), registerUserHandler)
router.route('/login').post(validate(loginUserSchema), loginUserHandler)
router.route('/profile').get(authenticateUser, getProfileHandler)
router.route('/refresh-token').post(refreshAccessTokenHandler)
router.route('/admin/create-user').post(validate(registerUserSchema), authenticateUser, authorizeAdmin, createUserByAdminHandler)






export default router