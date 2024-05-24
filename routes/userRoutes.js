import express from 'express'
import userController from '../controllers/userController.js'
import auth from '../middlewares/auth.js'

const router = express.Router()
//Public Routes
router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/send-reset-password-email', userController.sendResetPasswordEmail)
router.post('/reset-password/:id/:token', userController.resetPassword)


//Protected Routes
router.post('/changepassword',auth, userController.changePassword)
router.get('/user',auth, userController.getUserDetails)
router.post('/verifyotp',auth, userController.verifyOTP)

export default router;
