import express from 'express';
import { loginUser,registerUser,adminLogin, forgotPassword, resetPassword, me } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const userRouter = express.Router();

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.post('/admin',adminLogin)

//password reset
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password', resetPassword);

//current user
userRouter.get('/me', authMiddleware, me);

export default userRouter; 