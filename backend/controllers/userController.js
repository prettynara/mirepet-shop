import validator from "validator";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import userModel from './../models/userModel.js';


const createToken = (id, role) =>{
    return jwt.sign({id, role},process.env.JWT_SECRET, {expiresIn: "7d"})
}

// Route for user login
const loginUser = async (req,res) => {

    try {

        const {email, password} = req.body;

        const user = await userModel.findOne({email});

        if (!user) {
           return res.json({success:false, message:"User doesn't exist"})
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {

            const token = createToken(user._id, user.role)
            res.json({success:true, token, role:user.role, name:user.name})

        }
        else {
            res.json({success:false, message: 'Invalid credentials'})
        }
        
    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
        
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

        const token = createToken(user._id, user.role)
        
        res.json({success:true,token, role: user.role})

    } catch(error) {
        console.log(error);
        res.status(500).json({success:false,message:error.message})
    }

}

// Route for admin login
const adminLogin = async (req,res) => {


}

export { loginUser,registerUser,adminLogin }