import express from 'express'
import {listProduct, addProduct, removeProduct, singleProduct} from '../controllers/productController.js'
import upload from '../middleware/multer.js';
import requireAuth from "../middleware/authMiddleware.js";

const productRouter = express.Router();

//only seller can upload the product
productRouter.post('/add',requireAuth, upload.fields([{name:'image1',maxCount:1},{name:'image2',maxCount:1},{name:'image3',maxCount:1},{name:'image4',maxCount:1}]), addProduct);
productRouter.post('/remove', requireAuth, removeProduct);
productRouter.post('/single', singleProduct);
productRouter.get('/list', listProduct);

export default productRouter