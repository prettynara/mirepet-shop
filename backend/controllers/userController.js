import validator from "validator";
import bcrypt from "bcrypt"
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

        // ✅ 1️⃣ .env의 ADMIN 계정 로그인 확인
         if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const adminUser = await userModel.findOne({ email, role : 'admin'})
            if (adminUser) {
            const token = createToken(adminUser._id.toString(), "admin");   
            return res.json({ success: ture, token, role: 'admin', name: 'Administrator', message: 'Admin login success'})   
            }
            // fallback : sign with fixed id (legacy)
            const token = createToken('admin_fixed_id', 'admin');
            return res.json({
            success: true,
            token,
            role: "admin",
            name: "Administrator",
        });
        }
            message: "Admin login success"

        // User Login
        const user = await userModel.findOne({email}).select('+password');

        if (!user) {
           return res.json({success:false, message:"User doesn't exist"})
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({success:false, message:"Invalid credentials"})

        }

        const token = createToken(user._id.toString(), user.role)
        
        // client / seller/ admin 구분
        return res.json({success:true, token, role:user.role, name:user.name})
        
    } catch (error) {
        console.log("Login Error:",error);
        res.status(500).json({success:false, message:error.message})

    }
}

// Route for user register
const registerUser = async (req,res) => {
    //res.json({msg:"Register API Working"})
    try{

        const {name, email, password, role} = req.body;

        //checking user already exists or not 
        const exists = await userModel.findOne({email})
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

        // hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        const newUser = new userModel({
            name,
            email,
            password:hashedPassword,
            role: role || "client" 
        })

        const user = await newUser.save()

        const token = createToken(user._id.toString(), user.role)
        
        res.json({success:true,token, role: user.role})

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
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });

    const token = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(token).digest('hex');

    user.resetPasswordToken = hashed;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}&id=${user._id}`;
    const html = `<p>Reset: <a href="${resetUrl}">${resetUrl}</a></p>`;

    try {
      await sendEmail(user.email, 'Password Reset', html);
    } catch (emailErr) {
      console.error('sendEmail failed:', emailErr);
      // UX: don't reveal internal failure — still respond success
      return res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
    }

    return res.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
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

    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await userModel.findOne({
      _id: id,
      resetPasswordToken: hashed,
      resetPasswordExpire: { $gt: Date.now() }
    }).select('+password');

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    // set new password (pre-save will hash)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    console.error('resetPassword error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

// Me endpoint: return current user info (authMiddleware should attach req.user)
const me = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    const user = await userModel.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpire');
    return res.json({ success: true, user });
  } catch (err) {
    console.error('me error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

export { loginUser,registerUser,adminLogin, forgotPassword, resetPassword, me  }