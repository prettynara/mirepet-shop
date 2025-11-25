import express from 'express';
import { getSellers, getSeller, updateSeller, likeSeller } from '../controllers/sellerController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const router = express.Router();

// 역할에 따라 hold 필터링
router.get('/', async (req, res, next) => {
    // authMiddleware를 선택적으로 적용
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.userId || decoded.id).select('-password');
        if (user) {
            req.user = { id: user._id.toString(), role: user.role, email: user.email};
            console.log(' sellerRoute: token verified, role:', user.role);
        }
      } catch (err) {
        // 토큰이 유효하지 않은 경우 무시
        console.log('sellerRoute: invalid token, treating as guest');
      }
    } else {
        console.log('sellerRoute: no token, treating as guest');
    }
    next();
}, getSellers);

// public read seller detail

router.get('/:id', getSeller);

// update only owner or admin
router.put('/:id', authMiddleware, updateSeller);
// toggle like (requires auth)
router.post('/:id/like', authMiddleware, likeSeller);

export default router;