import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import sellerRouter from './routes/sellerRoute.js';
import { loginUser} from './controllers/userController.js';
import path from 'path';


// App Config
dotenv.config();
const app = express()
const port = process.env.PORT || 4000

// DB& Cloudinary
connectDB()
connectCloudinary()

// middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}))


app.use(express.json())
app.use(express.urlencoded({ extended: true}))

// API endpoints
app.use('/api',userRouter)
app.use('/api/product',productRouter)
app.use('/api/sellers',sellerRouter)
console.log("✅ userRouter mounted on /api");
console.log("✅ productRouter mounted on /api/product");
console.log("✅ sellerRouter mounted on /api/sellers");

// Login Route
app.post('/api/login', loginUser);

// Test Route
app.get('/',(req,res)=>{
    res.send("API Working")
})

// Server start
app.listen(port, ()=> console.log('Server started on PORT : '+ port))

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

