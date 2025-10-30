import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({

    name: { type : String, required : true },
    email: { type : String, required : true, unique : true },
    password: { type : String, required : true, select: false },
    cartData: { type : Object, default : {}},
    role: {
        type: String,
        enum: ["guest", "client", "seller", "admin"],
        default: "guest"
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }

},{timestamps:true})

userSchema.pre('save', async function(next){
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword){
  return bcrypt.compare(candidate, this.password);
};

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel