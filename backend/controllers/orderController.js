// ...existing code...
import order from '../models/orderModel.js';
import mongoose from 'mongoose';

// POST /api/orders
const createOrder = async (req, res) => {
  try {
    const body = req.body || {};
    const items = Array.isArray(body.items) ? body.items : [];
    const deliveryInfo = body.deliveryInfo || {};
    const paymentMethod = body.paymentMethod || 'cod';
    const clientId = req.user?.id || body.clientId || null;

    if (!items.length) return res.status(400).json({ success: false, message: 'No items' });

    const bySeller = {};
    for (const it of items) {
      const sellerId = it.seller || it.product?.seller || it.sellerId || null;
      const sid = sellerId ? String(sellerId) : 'unknown';
      if (!bySeller[sid]) bySeller[sid] = [];
      bySeller[sid].push(it);
    }

    const created = [];
    for (const sid of Object.keys(bySeller)) {
      if (sid === 'unknown') continue;
      const sellerItems = bySeller[sid];

      // build items with product snapshot from DB (best-effort)
       const itemsWithSnapshot = await Promise.all(sellerItems.map(async si => {
         const pid = si._id || si.product?._id;
         let snapshot = null;
         if (pid && mongoose.Types.ObjectId.isValid(String(pid))) {
           try {
             const p = await productModel.findById(pid).lean();
             if (p) snapshot = { _id: p._id, name: p.name, image: p.image || [], options: p.options || [], price: p.price || (p.options?.[0]?.price) || 0, seller: p.seller };
           } catch (e) { /* ignore */ }
         }
         return {
           product: pid,
           productSnapshot: snapshot,
           option: si.option || {},
           quantity: Number(si.quantity || 1),
           price: Number(si.price || (snapshot?.price) || 0),
         };
       }));

      const amount = typeof body.amount === 'number'
        ? body.amount
        : sellerItems.reduce((acc, it) => acc + (Number(it.price || 0) * Number(it.quantity || 1)), 0);
      const doc = await order.create({
        seller: sid,
        client: clientId,
        items: itemsWithSnapshot,
        amount,
        status: 'new',
        deliveryInfo,
        paymentMethod,
      });
      created.push(doc);
    }

    return res.status(201).json({ success: true, orders: created });
  } catch (err) {
    console.error('createOrder error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/mine
const getMyOrders = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    const sellerId = req.user.id;
    // populate items.product so frontend receives product object (with image/name/options/price)
    const orders = await order
      .find({ seller: sellerId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'items.product',
        select: 'name image images imageUrl options price', // adjust field names your product model uses
      })
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
    const count = await order.countDocuments({ seller: sellerId, status: { $in: ['new', 'pending'] } });
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
    return res.json({ success: true, order: doc });
  } catch (err) {
    console.error('updateOrderStatus error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export { createOrder, getMyOrders, getMyOrdersCount, updateOrderStatus };
// ...existing code...