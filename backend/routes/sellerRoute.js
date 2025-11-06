import express from 'express';
import { getSellers, getSeller, updateSeller, likeSeller } from '../controllers/sellerController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// public sellers list
router.get('/', getSellers);

// public read seller detail

router.get('/:id', getSeller);

// update only owner or admin
router.put('/:id', authMiddleware, updateSeller);
// toggle like (requires auth)
router.post('/:id/like', authMiddleware, likeSeller);

export default router;