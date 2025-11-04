import productModel from '../models/productModel.js';
import userModel from '../models/userModel.js';
import mongoose from 'mongoose';

/**
 * 제품 목록을 seller 정보(petshopName, logo)와 함께 반환
 */
const listProduct = async (req, res) => {
  try {
    let products = [];
    try {
      products = await productModel.find({}).populate({ path: 'seller', select: 'petshopName logo' }).lean();
    } catch (e) {
      products = await productModel.find({}).lean();
    }

    const enriched = products.map((p) => {
      const sellerObj = p.seller && typeof p.seller === 'object' ? p.seller : null;
      return {
        ...p,
        seller: sellerObj ? (sellerObj._id ?? p.seller) : p.seller,
        sellerName: sellerObj ? (sellerObj.petshopName || '') : (p.sellerName || ''),
        sellerLogo: sellerObj ? (sellerObj.logo || '') : (p.sellerLogo || ''),
      };
    });

    return res.json({ success: true, products: enriched });
  } catch (error) {
    console.error('listProduct error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 단일 제품 조회 (singleProduct)
 */
const singleProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid id' });

    let product = null;
    try {
      product = await productModel.findById(id).populate({ path: 'seller', select: 'petshopName logo' }).lean();
    } catch (e) {
      product = await productModel.findById(id).lean();
    }

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const sellerObj = product.seller && typeof product.seller === 'object' ? product.seller : null;
    const enriched = {
      ...product,
      sellerName: sellerObj ? (sellerObj.petshopName || '') : (product.sellerName || ''),
      sellerLogo: sellerObj ? (sellerObj.logo || '') : (product.sellerLogo || ''),
    };

    return res.json({ success: true, product: enriched });
  } catch (error) {
    console.error('singleProduct error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 제품 추가
 */
const addProduct = async (req, res) => {
  try {
    const payload = req.body || {};
    const sellerId = req.user?.id || req.user?._id || payload.seller;
    if (!sellerId) return res.status(401).json({ success: false, message: 'Not authenticated' });

    if (!payload.name || !payload.options) {
      return res.status(400).json({ success: false, message: 'Missing required fields (name, options)' });
    }

    const doc = await productModel.create({ ...payload, seller: sellerId });
    return res.status(201).json({ success: true, product: doc });
  } catch (error) {
    console.error('addProduct error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * removeProduct
 * - 만약 req.body.optionId 가 있으면 해당 옵션만 제거
 * - 없으면 전체 제품 삭제 (권한 검사)
 */
const removeProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { optionId } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid id' });

    const product = await productModel.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // 옵션 제거
    if (optionId) {
      const beforeCount = (product.options || []).length;
      product.options = (product.options || []).filter((opt) => String(opt._id) !== String(optionId));
      if ((product.options || []).length === beforeCount) {
        return res.status(404).json({ success: false, message: 'Option not found' });
      }
      await product.save();
      return res.json({ success: true, message: 'Option removed', product });
    }

    // 전체 삭제(권한 검사)
    const requesterId = req.user?.id || req.user?._id;
    const requesterRole = req.user?.role;
    if (requesterRole !== 'admin' && String(product.seller) !== String(requesterId)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await productModel.deleteOne({ _id: id });
    return res.json({ success: true, message: 'Product deleted', id });
  } catch (error) {
    console.error('removeProduct error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * toggleHold: 상품의 hold 상태 토글 또는 body로 지정
 */
const toggleHold = async (req, res) => {
  try {
    const { id } = req.params;
    const { hold } = req.body; // optional boolean to explicitly set

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid id' });

    const product = await productModel.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const requesterId = req.user?.id || req.user?._id;
    const requesterRole = req.user?.role;
    if (requesterRole !== 'admin' && String(product.seller) !== String(requesterId)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (typeof hold === 'boolean') product.hold = hold;
    else product.hold = !product.hold;

    await product.save();
    return res.json({ success: true, product });
  } catch (error) {
    console.error('toggleHold error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * deleteProduct: 제품 전체 삭제 (alias로 유지)
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid id' });

    const product = await productModel.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const requesterId = req.user?.id || req.user?._id;
    const requesterRole = req.user?.role;
    if (requesterRole !== 'admin' && String(product.seller) !== String(requesterId)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await productModel.deleteOne({ _id: id });
    return res.json({ success: true, message: 'Product deleted', id });
  } catch (error) {
    console.error('deleteProduct error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { listProduct, singleProduct, addProduct, removeProduct, toggleHold, deleteProduct };