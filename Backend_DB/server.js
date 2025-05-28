const express = require('express');
require('dotenv').config();
const { router: authRouter } = require('./routes/auth');
const vehiclesIn = require('./routes/vehicles_in');
const vehiclesOut = require('./routes/vehicles_out');
const history = require('./routes/history');
const vehicles = require('./routes/vehicles');
const buildings = require('./routes/buildings');
const users = require('./routes/users');
const alerts = require('./routes/alerts');
const cors = require('cors'); 
const http = require('http');
const { Server } = require('socket.io');


const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
app.set('io', io);
// Cấu hình CORS - thêm đoạn này
app.use(cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    credentials: true
}));

// Parse JSON
app.use(express.json());

// Middleware debug - log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/vehicles-in', vehiclesIn);
app.use('/api/vehicles-out', vehiclesOut);
app.use('/api/history', history);
app.use('/api/vehicles', vehicles);
app.use('/api/buildings', buildings);
app.use('/api/users', users);
app.use('/api/alerts', alerts);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', uptime: process.uptime() });
});

// Middleware xử lý lỗi 404 - Route không tồn tại
app.use((req, res, next) => {
    res.status(404).json({
        message: `Không tìm thấy đường dẫn: ${req.originalUrl}`
    });
});

// Middleware xử lý lỗi tổng quát
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || 'Đã xảy ra lỗi server',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
