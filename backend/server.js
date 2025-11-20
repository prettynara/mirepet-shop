import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoute.js';
import productRouter from './routes/productRoute.js';
import sellerRouter from './routes/sellerRoute.js';
import orderRouter from './routes/orderRoute.js';
import path from 'path';
import http from 'http';
import { Server as IOServer } from 'socket.io';

// App Config
dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

// DB & Cloudinary
connectDB();
connectCloudinary();

// Create HTTP server for Socket.io
const server = http.createServer(app);
const io = new IOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  }
});

// Expose io to routes via app.set
app.set('io', io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.debug('Socket connected:', socket.id);
  
  socket.on('joinOrder', (orderId) => {
    if (orderId) {
      socket.join(`order:${orderId}`);
      console.debug(`Socket ${socket.id} joined order:${orderId}`);
    }
  });
  
  socket.on('leaveOrder', (orderId) => {
    if (orderId) {
      socket.leave(`order:${orderId}`);
      console.debug(`Socket ${socket.id} left order:${orderId}`);
    }
  });
  
  socket.on('disconnect', () => {
    console.debug('Socket disconnected:', socket.id);
  });
});

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API endpoints
app.use('/api/users', userRouter);
app.use('/api/product', productRouter);
app.use('/api/sellers', sellerRouter);
app.use('/api/orders', orderRouter);

console.log('✅ userRouter mounted on /api/users');
console.log('✅ productRouter mounted on /api/product');
console.log('✅ sellerRouter mounted on /api/sellers');
console.log('✅ orderRouter mounted on /api/orders');

// Health check route
app.get('/', (req, res) => {
  res.send('API Working');
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Start server
server.listen(port, () => {
  console.log(`Server started on PORT: ${port}`);
});