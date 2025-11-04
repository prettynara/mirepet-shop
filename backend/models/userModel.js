import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const petSchema = new mongoose.Schema({
  name: { type: String },
  type: { type: String },
  breed: { type: String },
  dob: { type: Date },
  photo: { type: String },
}, {_id:false});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    cartData: { type: Object, default: {} },
    role: {
      type: String,
      enum: ["guest", "client", "seller", "admin"],
      default: "guest",
    },
    //new profile fields
    phone: {type: String, default: ''},
    address: {type: String, default: ''},
    pets: {type: [petSchema], default: []},
    // seller profile fileds
    petshopName: {type: String, trim: true, default: ''},
    owner: {type: String, trim: true, default: ''},
    phone: {type: String, trim: true, default: ''},
    address: {type: String, trim: true, default: ''},
    description: {type: String, trim: true, default: ''},
    logo: {type: String, trim: true, default: ''},
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
  },
  { timestamps: true }  
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
