import express from 'express'
import userController from '../controllers/userController.js'
import auth from '../middlewares/auth.js'

const router = express.Router()
//Public Routes
router.post('/register', userController.register)
router.post('/login', userController.login)

//Protected Routes
router.post('/changepassword',auth, userController.changePassword)

export default router;
