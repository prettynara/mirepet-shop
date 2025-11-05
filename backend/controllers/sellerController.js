import userModel from "../models/userModel.js";

const getSellers = async (req, res) => {
  try {
    // only users with role 'seller'
    const sellers = await userModel
      .find({ role: "seller" })
      .select("-password -resetPasswordToken -resetPasswordExpire")
      .lean();
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

export { getSellers, getSeller, updateSeller };