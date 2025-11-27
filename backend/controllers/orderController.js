// ...existing code...
import order from '../models/orderModel.js';
import mongoose from 'mongoose';
import productModel from '../models/productModel.js';
import User from '../models/userModel.js';

// GET /api/orders/client  (for authenticated clients to see their orders)
const getClientOrders = async (req, res) => {
  try {
    console.debug('getClientOrders req.user:', req.user);
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    const clientId = req.user.id;
    const userEmail = (req.user.email || '').trim();
    const userPhone = (req.user.phone || '').toString();

    // safe ObjectId
    let clientObjectId = null;
    try {
      clientObjectId = mongoose.Types.ObjectId.isValid(clientId) ? mongoose.Types.ObjectId(clientId) : null;
    } catch (e) {
      clientObjectId = null;
    }

    //escape helper for regex
    const escapeRegExp = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const emailRegex = userEmail ? { $regex: new RegExp(`^${escapeRegExp(userEmail)}$`, 'i') } : undefined;

    //include orders where client matches OR deliveryInfo email/phone matches  (covers guest orders)
    const query = {
      $or: [
        { client: clientId },
        ...(emailRegex ? [{ 'deliveryInfo.email': emailRegex }] : []),
        ...(userPhone ? [{ 'deliveryInfo.phone': userPhone }] : []),
      ],
    }; 
      console.debug('getClientOrders query=', JSON.stringify(query))

    const orders = await order
      .find(query)
      .sort({ createdAt: -1 })
      .populate({ 
        path: 'items.product', 
        model: productModel.modelName, 
        select: 'name image images imageUrl options price' 
      })
      .populate({
        path: 'seller',
        model: User.modelName,
        select: 'petshopNamee logo name email phone address'        
      })
      .lean();

    // debug: show how many orders matched and a small sample (helps diagnose empty result)
    console.debug('getClientOrders found count=', Array.isArray(orders) ? orders.length : 0);
    if (Array.isArray(orders) && orders.length > 0) {
      console.debug('getClientOrders sample[0..2]=', orders.slice(0, 3));
    } else {
      // if none found, dump recent orders to help debugging
      try {
        const recent = await order.find().sort({ createdAt: -1 }).limit(5).lean();
        console.debug('getClientOrders: recent orders sample (for inspection)=', recent);
      } catch (e) {
        console.debug('getClientOrders: failed to fetch recent sample', e?.message || e);
      }
    }

    return res.json({ success: true, orders });
  } catch (err) {
    console.error('getClientOrders error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/orders
const createOrder = async (req, res) => {
  try {
    const body = req.body || {};
    const items = Array.isArray(body.items) ? body.items : [];
    const deliveryInfo = body.deliveryInfo || {};
    const paymentMethod = body.paymentMethod || 'cod';
    const clientId = req.user?.id || body.clientId || null;

    console.debug('=== createOrder START ===');
    console.debug('createOrder req.user:', req.user);
    console.debug('createOrder clientId:', clientId);
    console.debug('createOrder items count:', items.length);

    if (!items.length) return res.status(400).json({ success: false, message: 'No items' });

    const bySeller = {};
    for (const it of items) {
            const sellerId = 
        it.seller || 
        it.product?.seller || 
        it.productSnapshot?.seller || 
        it.sellerId || 
        it._seller || 
        null;

      console.debug('createOrder: item seller extraction:', {
        'it.seller': it.seller,
        'it.product?.seller': it.product?.seller,
        'it.productSnapshot?.seller': it.productSnapshot?.seller,
        'final sellerId': sellerId
      })
      
      const sid = sellerId ? String(sellerId) : 'unknown';
      if (!bySeller[sid]) bySeller[sid] = [];
      bySeller[sid].push(it);
    }

    console.debug('createOrder: grouped by', Object.keys(bySeller).length, 'sellers');

    const created = [];
    for (const sid of Object.keys(bySeller)) {
      if (sid === 'unknown') {
        console.warn('createOrder: skipping unknown seller');
        continue;
      }
      
      const sellerItems = bySeller[sid];

      // build items with product snapshot from DB (best-effort)
       const itemsWithSnapshot = await Promise.all(sellerItems.map(async si => {
         const pid = si._id || si.product?._id;
         let snapshot = null;
         if (pid && mongoose.Types.ObjectId.isValid(String(pid))) {
           try {
             const p = await productModel.findById(pid).lean();
             if (p) {
               snapshot = { 
                 _id: p._id, 
                 name: p.name, 
                 image: p.image || [], 
                 options: p.options || [], 
                 price: p.price || (p.options?.[0]?.price) || 0, 
                 seller: p.seller 
               };
             }
           } catch (e) {
            console.debug('createOrder: failed to fetch product', pid, e?.message);
            }          
         }
         return {
           product: pid,
           productSnapshot: snapshot || si.product || si.productSnapshot || null,
           option: si.option || {},
           quantity: Number(si.quantity || 1),
           price: Number(si.price || (snapshot?.price) || 0),
         };
       }));

      const amount = typeof body.amount === 'number'
        ? body.amount
        : sellerItems.reduce((acc, it) => acc + (Number(it.price || 0) * Number(it.quantity || 1)), 0);
      
      const orderData = {
        seller: sid,
        client: clientId, 
        items: itemsWithSnapshot,
        amount,
        status: 'new',
        deliveryInfo,
        paymentMethod,
      };

      console.debug('createOrder: creating order for seller', sid, 'with client:', clientId); // ✅ 디버깅
      const doc = await order.create(orderData);
      console.debug('createOrder: ✅ created order', doc._id.toString(), 'client:', doc.client); // ✅ 디버깅
      created.push(doc);
    }

    console.debug('createOrder: ✅ total created:', created.length, 'orders');
    console.debug('=== createOrder END ===');

    return res.status(201).json({ success: true, orders: created });
  } catch (err) {
    console.error('createOrder error', err);
    console.error('createOrder ❌ stack:', err.stack);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/mine
const getMyOrders = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    const sellerId = req.user.id;
    // populate items.product using actual product model name to avoid "Schema hasn't been registered" error
    const orders = await order
      .find({ seller: sellerId })
      .sort({ createdAt: -1 })
      .populate({ path: 'items.product',  model: productModel.modelName, select: 'name image images imageUrl options price' })
      .lean();
    return res.json({ success: true, orders });
  } catch (err) {
    console.error('getMyOrders error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/mine/count
const getMyOrdersCount = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    const sellerId = req.user.id;
    const count = await order.countDocuments({ 
      seller: sellerId, 
      status: { $in: ['new', 'pending'] } 
    });

    console.log(`getMyOrdersCount: seller=${sellerId}, count=${count}`);
    return res.json({ success: true, count });
  } catch (err) {
    console.error('getMyOrdersCount error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    const { id } = req.params;
    const { status } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid id' });

    const doc = await order.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Order not found' });
    if (String(doc.seller) !== String(req.user.id) && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized' });

    doc.status = status || doc.status;
    await doc.save();

    // populate items.product so client receives product name/image if needed
    const updated = await order.findById(id)
      .populate({ path: 'items.product', model: productModel.modelName, select: 'name image images imageUrl options price' })
      .lean();

    return res.json({ success: true, order: updated });
  } catch (err) {
    console.error('updateOrderStatus error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/:id  (single order, populated)
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid id' });

    const ord = await order.findById(id)
      .populate({ 
        path: 'items.product', 
        model: productModel.modelName, 
        select: 'name image images imageUrl options price' 
      })
      .populate({
        path: 'seller',
        model: User.modelName,
        select: 'petshopName logo name email phone address'        
      })
      .lean();

    if (!ord) return res.status(404).json({ success: false, message: 'Order not found' });
    return res.json({ success: true, order: ord });
  } catch (err) {
    console.error('getOrderById error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/orders/:id/assign-courier
const assignCourier = async (req, res) => {
  try {
    console.debug('assignCourier called, user=', req.user?.id, 'body=', req.body);
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    
    const { id } = req.params;
    const { courier, trackingNumber, driver, driverName, driverPhone } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error('Invalid order ID:', id)
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }

    const doc = await order.findById(id);
    if (!doc) {
      console.error('Order not found:', id);
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    console.debug('✅ Order found:', {
      _id: doc._id.toString(),
      seller: doc.seller?.toString(),
      status: doc.status,
      tracking: doc.tracking
    });

    // authorization
    if (String(doc.seller) !== String(req.user.id) && req.user.role !== 'admin') {
      console.error('Not authorized: seller=', doc.seller, 'user=', req.user.id);
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // ensure tracking object exists
    if (!doc.tracking) {
      console.debug('Creating new tacking object');
      doc.tracking = {};
    }

    // 배송 정보 업데이트(빈 값도 허용하여 seller가 수정 가능하도록)
    doc.tracking.courier = courier || doc.tracking.courier || '';
    doc.tracking.trackingNumber = trackingNumber || doc.tracking.trackingNumber || '';

    // 운전자 정보 업데이트(빈 값도 허용)
    if (!doc.tracking.driver) doc.tracking.driver = {};

    if (driver && typeof driver === 'object') {
      doc.tracking.driver.name = driver.name || doc.tracking.driver.name || '';
      doc.tracking.driver.phone = driver.phone || doc.tracking.driver.phone || '';
    } else {
      if (typeof driverName !== 'undefined') doc.tracking.driver.name = driverName || '';
      if (typeof driverPhone !== 'undefined') doc.tracking.driver.phone = driverPhone || '';
    }

    // push history with timestamp
    doc.tracking.history = doc.tracking.history || [];
    doc.tracking.history.push({ 
      status: doc.status || 'assigned', 
      at: new Date(), 
      note: 'courier/driver info updated',
      courier: doc.tracking.courier,
      trackingNumber: doc.tracking.trackingNumber
    });

    // 마지막 업데이트 시간 기록
    doc.tracking.lastUpdated = new Date();

    // ensure mongoose detects nested changes
    doc.markModified('tracking');

    console.debug('Saving order with tracking:', doc.tracking);
    await doc.save();
    
    // populate seller info for client view
    const updated = await order.findById(id)
      .populate({ 
        path: 'items.product', 
        model: productModel.modelName, 
        select: 'name image images imageUrl options price' 
      })
      .populate({
        path: 'seller',
        model: User.modelName,
        select: 'petshopName logo name email phone address'
      })
      .lean();

    console.debug('assignCourier saved successfully:', {
      _id: updated._id,
      tracking: updated.tracking
    })

    // emit realtime update if io available
    try {
      const io = req.app?.get('io');
      if (io) 
        io.to(`order:${id}`).emit('order:update', updated);
        console.debug('Socket.io: emitted order:update for', id);
    } catch (e) {
      console.debug('Socket emit failed', e?.message || e);
    }

    return res.json({ success: true, order: updated });
  } catch (err) {
    console.error('assignCourier error', err);
    console.error('Stack:', err.stack)
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    console.debug('getAllOrders req.user:', req.user);
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Admin only' });
    }

    const orders = await order
      .find({})
      .sort({ createdAt: -1 })
      .populate({ 
        path: 'items.product', 
        model: productModel.modelName, 
        select: 'name image images imageUrl options price' 
      })
      .populate({
        path: 'seller',
        model: User.modelName,
        select: 'petshopName logo name email phone address'        
      })
      .populate({
        path: 'client',
        model: User.modelName,
        select: 'name email phone address'
      })
      .lean();

    console.debug('getAllOrders found count=', orders.length);

    return res.json({ success: true, orders });
  } catch (err) {
    console.error('getAllOrders error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getOrderStats = async (req, res) => {
  try {
    console.debug('getOrderStats req.user:', req.user);
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Admin only' });
    }

    const now = new Date();
    
    // 이번 주 시작 (일요일)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // 이번 달 시작
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 이번 주 주문
    const weekOrders = await order.countDocuments({
      createdAt: { $gte: startOfWeek }
    });

    const weekRevenue = await order.aggregate([
      { $match: { createdAt: { $gte: startOfWeek }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // 이번 달 주문
    const monthOrders = await order.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    const monthRevenue = await order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // 전체 주문
    const totalOrders = await order.countDocuments();

    const totalRevenue = await order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // 상태별 주문 수
    const ordersByStatus = await order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    console.debug('getOrderStats: weekOrders=', weekOrders, 'monthOrders=', monthOrders, 'totalOrders=', totalOrders);

    return res.json({
      success: true,
      stats: {
        week: {
          orders: weekOrders,
          revenue: weekRevenue[0]?.total || 0
        },
        month: {
          orders: monthOrders,
          revenue: monthRevenue[0]?.total || 0
        },
        total: {
          orders: totalOrders,
          revenue: totalRevenue[0]?.total || 0
        },
        byStatus: ordersByStatus.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {})
      }
    });
  } catch (err) {
    console.error('getOrderStats error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


export { createOrder, getMyOrders, getMyOrdersCount, updateOrderStatus, getClientOrders, getOrderById, assignCourier, getAllOrders, getOrderStats };