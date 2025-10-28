import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import { loginUser} from './controllers/userController.js';


// App Config
const app = express()
const port = process.env.PORT || 4000

// DB& Cloudinary
connectDB()
connectCloudinary()

// middlewares
app.use(cors({
    origin: 'http://localhost:5173', // react frontend address
    credentials: true,
}))

app.use(express.json())

// API endpoints
app.use('/api/user',userRouter)
app.use('/api/product',productRouter)
console.log("✅ productRouter mounted on /api/product");

// Login Route
app.post('/api/login', loginUser);

// Test Route
app.get('/',(req,res)=>{
    res.send("API Working")
})

// Server start
app.listen(port, ()=> console.log('Server started on PORT : '+ port))



