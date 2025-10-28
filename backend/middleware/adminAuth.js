import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const adminAuth = async (req, res, next) => {
  try {
    console.log('adminAuth - req.user before:', req.user, 'headers.authorization:', req.headers.authorization);

    // if req.user not set (authMiddleware not run), try to parse bearer token
    if (!req.user) {
      const authHeader = req.headers.authorization || req.headers.Authorization;
      if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await userModel.findById(decoded.id).select('+role +email');
          if (user) {
            req.user = { id: user._id.toString(), role: user.role, email: user.email };
          }
        } catch (err) {
          console.log('adminAuth token verify failed:', err.message);
        }
      }
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not Authorized - please login" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin only" });
    }

    console.log('adminAuth - req.user after:', req.user);
    next();
  } catch (error) {
    console.error('adminAuth error:', error);
    res.status(401).json({ success: false, message: error.message });
  }
};

export default adminAuth;