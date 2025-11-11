import validator from "validator";
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import userModel from './../models/userModel.js';
import { sendEmail } from '../utils/email.js';


const createToken = (id, role) =>{
    return jwt.sign({id, role},process.env.JWT_SECRET, {expiresIn: "7d"})
}

// Route for user login (client + seller + admin)
const loginUser = async (req,res) => {

    try {
        const {email, password} = req.body;
         console.log("Login attempt:", email, password);

         if (!email || !password){
          return res
          .status(400)
          .json({success:false, message:"Please provide email and password"})
         }

        // ✅ 1️⃣ .env의 ADMIN 계정 로그인 확인
         if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            let adminUser = await userModel.findOne({ email, role: "admin" });
            if (adminUser) {
            const token = createToken(adminUser._id.toString(), "admin");   
            return res.json({ success: true, token, role: 'admin', name: 'Administrator', message: 'Admin login success'})   
            }
            // fallback : sign with fixed id (legacy)
            const token = createToken('admin_fixed_id', 'admin');
            return res.json({
            success: true,
            token,
            role: "admin",
            name: "Administrator",
            message: "Admin login success",
        });
        }

        // User Login
        const user = await userModel.findOne({email: email.toLowerCase()}).select('+password');
        console.log("User from DB:", user);

        if (!user) {
           return res.json({success:false, message:"User doesn't exist"})
        }

        // bcrypt로 비밀번호 비교 
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password match:", isMatch);

        if (!isMatch) {
            return res.json({success:false, message:"Invalid credentials"})

        }

        const token = createToken(user._id.toString(), user.role)
        
        // client / seller/ admin 구분
        return res.json({success:true, token, role:user.role, name:user.name, message:"Login successful",})
        
    } catch (error) {
        console.log("Login Error:",error);
        res.status(500).json({success:false, message:error.message})

    }
}

// Route for user register
const registerUser = async (req,res) => {
    //res.json({msg:"Register API Working"})
    try{
        const {name, email, password, role, phone, address, pets} = req.body;
        if (!email || !password){
          return res.json({
            success:false,
            message:"Please enter all fields",
          })
        }

        //checking user already exists or not 
        const exists = await userModel.findOne({email: email.toLowerCase()})
        if (exists){
            return res.json({success:false, message:"User already exists"})
        }

        // validating email format & strong password
        if (!validator.isEmail(email)){
            return res.json({success:false, message:"Please enter a valid email"})
        }
        if (password.length < 8 ){
            return res.json({success:false, message:"Please enter a strong password"})
        }

        // password hashing
        //const hashedPassword = await bcrypt.hash(password, 10);

        // creating user
        const newUser = new userModel({
            name,
            email: email.toLowerCase(),
            password,
            role: role || "client",
            phone: phone || '',
            address: address || '',
            pets: Array.isArray(pets) ? pets : []
        })

        const user = await newUser.save()
        const safeUser = await userModel.findById(user._id).select('-password -resetPasswordToken -resetPasswordExpire');
        const token = createToken(user._id.toString(), user.role)
        res.json({ success:true, token, role: user.role, user:safeUser})
    } catch(error) {
        console.log(error);
        res.status(500).json({success:false,message:error.message})
    }
}

// Route for admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      let adminUser = await userModel.findOne({ email, role: 'admin' });
      if (!adminUser) {
        const hashed = await bcrypt.hash(password, 10);
        adminUser = await userModel.create({ name: 'Administrator', email, password: hashed, role: 'admin' });
      }
      const token = createToken(adminUser._id.toString(), 'admin');
      return res.json({ success: true, token, role: 'admin', name: 'Administrator' });
    }
    return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });
    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) return res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });

    const token = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(token).digest('hex');

    user.resetPasswordToken = hashed;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; //1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}&id=${user._id}`;
    const html = `<p>Reset: <a href="${resetUrl}">${resetUrl}</a></p>`;

    try {
      await sendEmail(user.email, 'Password Reset', html);
    } catch (emailErr) {
      console.error('sendEmail failed:', emailErr);
    }
      // UX: don't reveal internal failure — still respond success
      res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
    } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Reset password: verify token and change password
const resetPassword = async (req, res) => {
  try {
    const { token, id, password } = req.body;
    if (!token || !id || !password) return res.status(400).json({ success: false, message: 'Missing fields' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await userModel.findOne({
      _id: id,
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    }).select('+password');

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    // set new password (pre-save will hash)
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    console.error('resetPassword error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}

// Me endpoint: return current user info (authMiddleware should attach req.user)
const me = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    const user = await userModel.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpire');
    res.json({ success: true, user });
  } catch (err) {
    console.error('me error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}

// Get client by id (public or authenticated)
const getClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await userModel.findById(id).select('-password -resetPasswordToken -resetPasswordExpire');
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
    return res.json({ success: true, client });
  } catch (err) {
    console.error('getClient error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Update client profile (owner or admin)
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('updateClient called, params.id:', id);
    console.log('updateClient auth user:', req.user);
    console.log('updateClient body:', req.body);
    
    // require auth middleware to have attached req.user
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const allowed = ['name', 'phone', 'address', 'pets'];
    const updates = {};
    for (const key of allowed) {
      if (typeof req.body[key] !== 'undefined') updates[key] = req.body[key];
    }

    const updated = await userModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -resetPasswordToken -resetPasswordExpire');
    if (!updated) return res.status(404).json({ success: false, message: 'Client not found' });
    console.log('updateClient success:', updated._id.toString());
    return res.json({ success: true, message: 'Profile updated', client: updated });
  } catch (err) {
    console.error('updateClient error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const logoutUser = (req, res) => {
  try {
    // 클라이언트가 httpOnly cookie로 토큰을 받는 경우 제거
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    return res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    console.error('logoutUser error', err);
    return res.status(500).json({ success: false, message: 'Logout failed' });
  }
};

export { loginUser, registerUser, adminLogin, forgotPassword, resetPassword, me, getClient, updateClient }
