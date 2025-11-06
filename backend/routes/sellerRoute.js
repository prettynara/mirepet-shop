import express from 'express';
import { getSellers, getSeller, updateSeller, likeSeller } from '../controllers/sellerController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// public sellers list
-router.get('/:id', getSellers);
+router.get('/', getSellers);

// public read seller detail
-// public read (if you want public access, remove authMiddleware)
-router.get('/:id', authMiddleware, getSeller);
+router.get('/:id', getSeller);

// update only owner or admin
router.put('/:id', authMiddleware, updateSeller);
// toggle like (requires auth)
router.post('/:id/like', authMiddleware, likeSeller);

export default router;