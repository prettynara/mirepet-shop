import express from 'express';
import { loginUser,registerUser,adminLogin, forgotPassword, resetPassword, me, getClient, updateClient, logoutUser } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const userRouter = express.Router();

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.post('/admin',adminLogin)

//password reset
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password', resetPassword);
userRouter.post('/logout', authMiddleware, logoutUser);

//current user
userRouter.get('/me', authMiddleware, me);

//client profile endpoints
userRouter.get('/client/:id', authMiddleware, getClient);
userRouter.post('/client/:id', authMiddleware, updateClient);

export default userRouter; 