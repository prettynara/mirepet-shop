import multer from "multer";

const storage = multer.diskStorage({
    findname: function(req,file,callback){
        callback(null, file.originalname)
    }
})

const upload = multer({storage})

export default upload 