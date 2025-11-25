import express from 'express'
import {listProduct, addProduct, removeProduct, singleProduct, toggleHold, deleteProduct, updateProduct, getMyProducts} from '../controllers/productController.js'
import upload from '../middleware/multer.js';
import requireAuth from "../middleware/authMiddleware.js";
import adminAuth from '../middleware/adminAuth.js';
import authMiddleware from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const productRouter = express.Router();

console.log( "productRouter file loaded!");

// Get/api/product/list 선택적 인증(토큰 있으면 role 확인)
productRouter.get('/list', async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

  if (token){
    try{
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModle.findById(decoded.userId || decoded.id).select('-password');
      if (user) {
        req.user = { id: user._id.toString(), role: user.role, email: user.email };
        console.log('✅ productRouter: token verified, role:', user.role);
      }
    } catch (err) {
      console.log('⚠️ productRouter: invalid token, treating as guest');
    }
  } else {
    console.log('ℹ️ productRouter: no token, treating as guest');
  }
  
  next();
}, listProduct);

// seller의 제품만 조회
productRouter.get('/my-products', authMiddleware, getMyProducts);

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

// 제품수정
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

//제품 상세 조회
productRouter.get('/:id', singleProduct);
// 제품 제거(장바구니 등에서)
productRouter.post('/:id/remove', requireAuth, removeProduct);
productRouter.patch('/:id/hold', adminAuth, toggleHold);
// 완전 삭제 
productRouter.delete('/:id', requireAuth, deleteProduct);

export default productRouter;