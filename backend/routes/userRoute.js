import express from 'express';
import { loginUser,registerUser,adminLogin, forgotPassword, resetPassword, me, getClient, updateClient, logoutUser, getMyDeliveryInfo, updateMyDeliveryInfo, getAllClients, deleteClient, toggleSellerHold } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const userRouter = express.Router();

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.post('/admin',adminLogin)

//password reset
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password', resetPassword);
userRouter.post('/logout', logoutUser);

//current user
userRouter.get('/me', authMiddleware, me);

// 클라이언트 목록 조회(admin only)
userRouter.get('/clients', authMiddleware, getAllClients);

//client profile
userRouter.get('/client/:id', authMiddleware, getClient);
userRouter.post('/client/:id', authMiddleware, updateClient);
userRouter.delete('/client/:id', authMiddleware, deleteClient);

// Hold seller(admin onlly)
userRouter.patch('/seller/:id/hold', authMiddleware, toggleSellerHold);

// delivery info
userRouter.get('/me/delivery-info', authMiddleware, getMyDeliveryInfo);
userRouter.put('/me/delivery-info', authMiddleware, updateMyDeliveryInfo);

export default userRouter; 