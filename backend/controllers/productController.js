import userModel from "../models/userModel.js"
import productModel from "../models/productModel.js";
import { v2 as cloudinary } from 'cloudinary';

// function for add product for sellers

const addProduct = async (req, res) => {

    try {
    
        if(req.user.role !=="seller"){
            return res.status(403).json({ success: false, message: "Not authorized"})
        }

        const { name, brand, description, category, subCategory, bestseller, options } = req.body
        
        //이미지 업로드 처리
        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined )

        let imagesURL = await Promise.all(
            images.map(async (item)=>{

                let result = await cloudinary.uploader.upload(item.path, {resource_type: 'image'});
                return result.secure_url
            })
        )

        console.log( name, brand, description, category, subCategory, bestseller, options)
        console.log(imagesURL)

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