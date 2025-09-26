import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
    weight: { type: String }, // ex: "2kg", "4kg"
    price: { type: Number, required: true },
    sale_price: { type: Number },
    special_price: { type: Boolean, default: false }
    
});

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String }, // optional
    description: { type: String, required: true },
    image: [{ type: Array, required: true }], // 배열 (최대 4장)
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    seller: { type: String, required: true },
    date: { type: Date, required:true },
    bestseller: { type: Boolean },
    options: [optionSchema] // weight/price 옵션 리스트
  },
  { timestamps: true }
);

const productModel = mongoose.model.product || mongoose.model("product", productSchema)

export default productModel