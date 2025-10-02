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

        //console.log( name, brand, description, category, subCategory, bestseller, options)
        //console.log(imagesURL)

        
        // options 처리 (string → array)
        let parsedOptions = [];
        if (options) {
            try {
                parsedOptions = JSON.parse(options);
            } catch (e) {
                console.log("Options parse error:", e.message);
                return res.status(400).json({ success: false, message: "Invalid options format" });
            }
        }
    
        const productData ={
            name,
            brand,
            description,
            category,
            subCategory,
            seller: req.user.id, // 현재 로그인한 seller
            date: Date.now(),
            bestseller : bestseller === 'true' ? true : false,
            options: parsedOptions,
            image: imagesURL
        };

        console.log(productData);
        //console.log("options raw:", options);
        //console.log("parsedOptions:", parsedOptions);

        const product = new productModel(productData);
        await product.save()

        res.json({ success: true, message: "Product Added" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// function for list product 

const listProduct = async (req, res) => {

    try {

        const products = await productModel.find({});
        res.json({success:true, products})
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
        
    }

}

// function for removing product 

const removeProduct = async (req, res) => {

    try {

        await productModel.findByIdAndDelete(req.body.id)
        res.json({success:true, message:"Product removed"})
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }

}

// function for single product info

const singleProduct = async (req, res) => {

    try {

        const { productId } = req.body
        const product = await productModel.findById(productId)
        res.json({success:true, product})
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }

}

export {listProduct, addProduct, removeProduct, singleProduct}