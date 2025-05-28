const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'BTL_THPTHT',
    port: process.env.DB_PORT || 5432,
    max: 20, // Số lượng kết nối tối đa trong pool
    idleTimeoutMillis: 30000, // Thời gian tối đa một kết nối không sử dụng trước khi đóng
    connectionTimeoutMillis: 2000, // Thời gian tối đa chờ kết nối trước khi timeout
});

// Kiểm tra kết nối
pool.on('connect', () => {
    console.log('Connected to PostgreSQL database successfully');
});

// Xử lý lỗi kết nối
pool.on('error', (err) => {
    console.error('PostgreSQL connection error:', err);
    console.error('Attempting to reconnect...');
});

// Test kết nối khi khởi động
const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('Database connection test successful');
        client.release();
    } catch (err) {
        console.error('Database connection test failed:', err);
    }
};

testConnection();

module.exports = pool;
