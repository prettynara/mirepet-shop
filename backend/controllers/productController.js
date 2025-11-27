import productModel from '../models/productModel.js';
import userModel from '../models/userModel.js';
import orderModel from '../models/orderModel.js';
import mongoose from 'mongoose';

/**
 * 제품 목록을 seller 정보(petshopName, logo)와 함께 반환
 */
const listProduct = async (req, res) => {
  try {
    // role 확인
    const role = req.user?.role || 'guest';
    console.log('listProduct called, role:', role);

    // admin이 아니면 isOnHold = false 제품만 조회
    let filter = {};
    if (role !== 'admin') {
      filter.isOnHold = { $ne: true}; 
    }

    let products = [];
    try {
      products = await productModel.find({}).populate({ path: 'seller', select: 'petshopName logo' }).lean();
    } catch (e) {
      products = await productModel.find({}).lean();
    }
    console.log('listProduct: found', products.length, 'products');

    // seller가 object로 이미 포함되어 있지 않다면 userModel에서 매핑 조회
    const sellerIds = new Set();
    products.forEach(p => {
      if (p && p.seller && typeof p.seller !== 'object') sellerIds.add(String(p.seller));
    });

    let sellerMap = {};
    if (sellerIds.size) {
      // 필터해서 유효한 ObjectId만 조회
      const ids = Array.from(sellerIds).filter(id => mongoose.Types.ObjectId.isValid(id));
      if (ids.length) {
        const sellers = await userModel.find({ _id: { $in: ids } }).select('petshopName logo').lean();
        sellers.forEach(s => {
          sellerMap[String(s._id)] = { petshopName: s.petshopName || '', logo: s.logo || '' };
        });
      }
    }

    const enriched = products.map((p) => {
      const sellerObj = p.seller && typeof p.seller === 'object' ? p.seller : null;
      const sid = !sellerObj ? String(p.seller || '') : String(sellerObj._id || '');
      const mapped = sellerMap[sid] || null;
      return {
        ...p,
        seller: sellerObj ? (sellerObj._id ?? p.seller) : p.seller,
        // fix: use mapped petshopName when seller not populated
        sellerName: sellerObj ? (sellerObj.petshopName || '') : (mapped?.petshopName || p.sellerName || ''),
        sellerLogo: sellerObj ? (sellerObj.logo || '') : (mapped?.logo || ''),
      }
      });

    return res.json({ success: true, products: enriched });
  } catch (error) {
    console.error('listProduct error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const toggleHold = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('toggleHold called, id:', id, 'user:', req.user);

    if (!req.user) {
      return res.status(401).json({ success: false, message: ' Not authenticated' });
    }

    if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admin only' });
  }

  const product =await productModel.findById(id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  // Toggle isOnHold
  product.isOnHold = !product.isOnHold;
  await product.save();

  console.log('toggleHold success:', id, 'isOnHold:', product.isOnHold);

  return res.json({
    success: true,
    message: product.isOnHold ? 'Product on hold' : 'Product unhold',
    product: {
      _id: product._id,
      name: product.name,
      isOnHold: product.isOnHold
    }
  })
} catch(error) {
  console.error('toggleHold error', error);
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
    let sellerName = '';
    let sellerLogo = '';

    if (sellerObj) {
      sellerName = sellerObj.petshopName || '';
      sellerLogo = sellerObj.logo || '';
    } else if (product.seller && mongoose.Types.ObjectId.isValid(String(product.seller))) {
      const s = await userModel.findById(String(product.seller)).select('petshopName logo').lean();
      if (s) {
        sellerName = s.petshopName || '';
        sellerLogo = s.logo || '';
      }
    } else {
      // fallback to any existing fields on product
      sellerName = product.sellerName || '';
      sellerLogo = product.sellerLogo || '';
    }

    const enriched = {
      ...product,
      sellerName,
      sellerLogo,
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
    console.log('addProduct req.files:', req.files);
    const body = req.body || {};
    let options = body.options;
    try { if (typeof options === 'string') options = JSON.parse(options); } catch (e) {}

    const sellerId = req.user?.id || req.user?._id || body.seller;
    if (!sellerId) return res.status(401).json({ success: false, message: 'Not authenticated' });

    if (!body.name) return res.status(400).json({ success: false, message: 'Missing product name' });
    if (!options || (Array.isArray(options) && options.length === 0)) return res.status(400).json({ success: false, message: 'Missing product options' });

    // normalize req.files -> array
    let rawFiles = req.files || [];
    let files = [];
    if (Array.isArray(rawFiles)) {
      files = rawFiles;
    } else if (rawFiles && typeof rawFiles === 'object') {
      // multer.fields gives an object: { image1: [file], image2: [file], ... }
      files = Object.values(rawFiles).flat();
    }

    const images = files.map((f) => {
      if (f.filename) return `${req.protocol}://${req.get('host')}/uploads/${f.filename}`;
      if (f.path) {
        const parts = String(f.path).split(/[/\\]/);
        const filename = parts[parts.length - 1];
        return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
      }
      if (f.location) return f.location;
      if (f.url) return f.url;
      return '';
    }).filter(Boolean);

    const payload = {
      name: body.name,
      brand: body.brand || '',
      description: body.description || '',
      category: body.category || '',
      subCategory: body.subCategory || '',
      options,
      image: images,
      seller: sellerId,
      bestseller: body.bestseller === 'true' || body.bestseller === true || false,
      date: new Date(),
    };

    const doc = await productModel.create(payload);
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

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid id' });

    const product = await productModel.findById(id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // 권한 검사
    const requesterId = req.user?.id || req.user?._id;
    const requesterRole = req.user?.role;
    if (requesterRole !== 'admin' && String(product.seller) !== String(requesterId)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const body = req.body || {};
    let options = body.options;
    try { if (typeof options === 'string') options = JSON.parse(options); } catch (e) {}

    // normalize req.files (multer.fields -> object, multer.any -> array)
    let rawFiles = req.files || [];
    let files = [];
    if (Array.isArray(rawFiles)) files = rawFiles;
    else if (rawFiles && typeof rawFiles === 'object') files = Object.values(rawFiles).flat();

    const newImages = files.map((f) => {
      if (f.filename) return `${req.protocol}://${req.get('host')}/uploads/${f.filename}`;
      if (f.path) {
        const parts = String(f.path).split(/[/\\]/);
        const filename = parts[parts.length - 1];
        return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
      }
      if (f.location) return f.location;
      if (f.url) return f.url;
      return '';
    }).filter(Boolean);

    // frontend가 기존 이미지를 그대로 남기길 원하면 existingImages 필드로 URL 배열을 보낼 수 있음
    let existingImages = [];
    if (body.existingImages) {
      try { existingImages = typeof body.existingImages === 'string' ? JSON.parse(body.existingImages) : body.existingImages; } catch (e) { existingImages = []; }
    }

    // final images: 새로 올라온 이미지가 있으면 그것으로 교체, 아니면 existingImages(프론트) 또는 기존 product.image 유지
    const finalImages = newImages.length ? newImages : (Array.isArray(existingImages) && existingImages.length ? existingImages : product.image || []);

    // 업데이트 가능한 필드만 적용
    if (typeof body.name !== 'undefined') product.name = body.name;
    if (typeof body.brand !== 'undefined') product.brand = body.brand;
    if (typeof body.description !== 'undefined') product.description = body.description;
    if (typeof body.category !== 'undefined') product.category = body.category;
    if (typeof body.subCategory !== 'undefined') product.subCategory = body.subCategory;
    if (options) product.options = options;
    product.image = finalImages;
    if (typeof body.bestseller !== 'undefined') product.bestseller = body.bestseller === 'true' || body.bestseller === true;

    await product.save();
    return res.json({ success: true, product });
  } catch (error) {
    console.error('updateProduct error', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMyProducts = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const sellerId = req.user.id;
    console.debug('getMyProducts: sellerId=', sellerId);

    const products = await productModel
      .find({ seller: sellerId })
      .populate({ 
        path: 'seller', 
        model: 'user',
        select: 'petshopName logo name' })
      .lean();

    console.debug('getMyProducts: found', products.length, 'products');

    if (products.length > 0) {
      console.debug('Sample product seller:', {
        seller: products[0].seller,
        type: typeof products[0].seller
      })
    }

    const enriched = products.map((p) => ({
      ...p,
      sellerName: p.seller?.petshopName || p.seller?.name || '',
      sellerLogo: p.seller?.logo || '',
    }));

    return res.json({ success: true, products: enriched });
  } catch (error) {
    console.error('❌ getMyProducts error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { listProduct, singleProduct, addProduct, removeProduct, toggleHold, deleteProduct, updateProduct, getMyProducts };