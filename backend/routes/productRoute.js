import express from 'express'
import {listProduct, addProduct, removeProduct, singleProduct, toggleHold, deleteProduct, updateProduct, getMyProducts} from '../controllers/productController.js'
import upload from '../middleware/multer.js';
import requireAuth from "../middleware/authMiddleware.js";
import adminAuth from '../middleware/adminAuth.js';
import authMiddleware from '../middleware/authMiddleware.js';

const productRouter = express.Router();

productRouter.get('/my-products', authMiddleware, getMyProducts);

console.log("📦 productRouter file loaded!");
productRouter.post(
  '/add',
  requireAuth,
  upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 },
  ]),
  addProduct
);

// update product (authenticated) - multipart allowed, same fields as add
productRouter.put(
  '/:id',
  requireAuth,
  upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 },
  ]),
  updateProduct
);

productRouter.get('/list', listProduct);
productRouter.get('/:id', singleProduct);
productRouter.post('/:id/remove', requireAuth, removeProduct);
productRouter.patch('/:id/hold', adminAuth, toggleHold);
productRouter.delete('/:id', requireAuth, deleteProduct);

export default productRouter;