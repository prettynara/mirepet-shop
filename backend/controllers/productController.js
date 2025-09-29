import userModel from "../models/userModel.js"
import productModel from "../models/productModel.js";

// function for add product for sellers

const addProduct = async (req, res) => {

    try {
    
        if(req.user.role !=="seller"){
            return res.status(403).json({ success: false, message: "Not authorized"})
        }

        const { name, brand, description, category, subCategory, size, bestseller, options } = req.body
        
        //이미지 업로드 처리
        const images = [];
        if (req.files.image1) images.push(req.files.image1[0]);
        if (req.files.image2) images.push(req.files.image2[0]);
        if (req.files.image3) images.push(req.files.image3[0]);
        if (req.files.image4) images.push(req.files.image4[0]);

        const newProduct = new productModel({
            name,
            brand,
            description,
            category,
            subCategory,
            seller: req.user.id, // 현재 로그인한 seller
            date: new Date(),
            bestseller,
            options: options || [],
            image: images
        });

        const savedProduct = await newProduct.save();
        res.json({ success: true, product: savedProduct });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// function for list product 

const listProduct = async (req, res) => {

}

// function for removing product 

const removeProduct = async (req, res) => {

}

// function for single product info

const singleProduct = async (req, res) => {

}

export {listProduct, addProduct, removeProduct, singleProduct}