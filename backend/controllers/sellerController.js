import userModel from "../models/userModel.js";
import mongoose from 'mongoose';

const getSellers = async (req, res) => {
  try {
    // role 확인
    const role = req.user?.role || 'guest';
    console.log('getSellers called, role:', role);

    // admin이 아니면 isOnHold가 false인 seller만 조회
    let filter = { role: "seller" };
    if (role !== 'admin') {
      filter.isOnHold = { $ne: true };
    }

    // only users with role 'seller'
    const sellers = await userModel
      .find(filter)
      .select("-password -resetPasswordToken -resetPasswordExpire")
      .lean();

    console.log('getSellers: found', sellers.length, 'sellers');
    return res.json({ success: true, sellers });
  } catch (err) {
    console.error("getSellers error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = await userModel.findById(id).select('-password -resetPasswordToken -resetPasswordExpire');
    if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });
    
    // admin 아니고 hold된 seller면 404
    const role = req.user?.role || 'guest';
    if (role !== 'admin' && seller.isOnHold) {
      return res.status(404).json({ success: false, message: 'Seller not available' });
    }
    
    return res.json({ success: true, seller });
  } catch (err) {
    console.error('getSeller error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateSeller = async (req, res) => {
  try {
    const { id } = req.params;
    // auth: require login (authMiddleware should set req.user)
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (req.user.id !== id && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });

    const allowed = ['name','owner','phone','address','description','logo','petshopName'];
    const updates = {};
    for (const k of allowed) {
      if (typeof req.body[k] !== 'undefined') updates[k] = req.body[k];
    }

    const updated = await userModel.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true }).select('-password -resetPasswordToken -resetPasswordExpire');
    if (!updated) return res.status(404).json({ success: false, message: 'Seller not found' });
    return res.json({ success: true, seller: updated });
  } catch (err) {
    console.error('updateSeller error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const likeSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: 'Invalid seller id' });

    const seller = await userModel.findById(id);
    if (!seller) return res.status(404).json({ success: false, message: 'Seller not found' });

    seller.likedBy = seller.likedBy || [];
    const idx = seller.likedBy.findIndex(x => String(x) === String(userId));
    let liked = false;

    if (idx >= 0) {
      // unlike
      seller.likedBy.splice(idx, 1);
      seller.likes = Math.max(0, (seller.likes || 0) - 1);
      liked = false;
    } else {
      // like
      seller.likedBy.push(userId);
      seller.likes = (seller.likes || 0) + 1;
      liked = true;
    }

    await seller.save();
    return res.json({ success: true, liked, likes: seller.likes });
  } catch (err) {
    console.error('likeSeller error', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export { getSellers, getSeller, updateSeller, likeSeller };