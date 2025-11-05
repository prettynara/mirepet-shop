import express from 'express';
import { getSellers, getSeller, updateSeller } from '../controllers/sellerController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// public sellers list
router.get('/', getSellers);
// public read (if you want public access, remove authMiddleware)
router.get('/:id', authMiddleware, getSeller);
// update only owner or admin
router.put('/:id', authMiddleware, updateSeller);

export default router;