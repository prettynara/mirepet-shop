import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const requireAuth = async (req, res, next) => {
  try {
    let token;

    // 1) Authorization: Bearer <token>
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2) cookie (if your login sets an httpOnly cookie named 'token')
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized - token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded should have id field
    const user = await User.findById(decoded.id).select('-password -resetPasswordToken -resetPasswordExpire');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized - user not found' });
    }

    req.user = { id: user._id.toString(), role: user.role, email: user.email };
    next();
  } catch (err) {
    console.error('authMiddleware error:', err.message);
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

export default requireAuth;