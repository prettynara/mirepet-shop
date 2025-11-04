import express from 'express'
import {listProduct, addProduct, removeProduct, singleProduct, toggleHold, deleteProduct} from '../controllers/productController.js'
import upload from '../middleware/multer.js';
import requireAuth from "../middleware/authMiddleware.js";
import adminAuth from '../middleware/adminAuth.js';
import authMiddleware from '../middleware/authMiddleware.js';

const productRouter = express.Router();

console.log("📦 productRouter file loaded!");
//only seller can upload the product
productRouter.post('/add', upload.fields ([{name:'image1',maxCount:1},{name:'image2',maxCount:1},{name:'image3',maxCount:1},{name:'image4',maxCount:1}]), requireAuth, addProduct);
productRouter.post('/remove', requireAuth, adminAuth, authMiddleware, removeProduct);
productRouter.post('/single', singleProduct);
productRouter.get('/list', listProduct);

productRouter.patch('/:id/hold', adminAuth, toggleHold);
productRouter.delete('/:id', requireAuth, deleteProduct);

export default productRouter