const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Middleware xác thực token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Không tìm thấy token xác thực' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    req.user = user;
    next();
  });
};

// Đăng nhập
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt with body:', req.body);
    const { username, password } = req.body;
    
    console.log('Username:', username);
    console.log('Password:', password);
    
    // Kiểm tra username
    const userResult = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    console.log('User query result:', userResult.rows.length > 0 ? 'User found' : 'User not found');
    
    if (userResult.rows.length === 0) {
      console.log('Login failed: User not found');
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }
    
    const user = userResult.rows[0];
    console.log('User found:', { id: user.id, username: user.username, role: user.role });
    
    // Kiểm tra password
    console.log('Comparing password with hash...');
    const passwordValid = await bcrypt.compare(password, user.password);
    console.log('Password validation result:', passwordValid ? 'Valid' : 'Invalid');
    
    if (!passwordValid) {
      console.log('Login failed: Invalid password');
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }
    
    // Tạo token
    console.log('Generating JWT token...');
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        role: user.role,
        building_id: user.building_id 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    console.log('Login successful, sending response');
    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        role: user.role,
        buildingId: user.building_id
      }
    });
    
  } catch (err) {
    console.error('Lỗi đăng nhập chi tiết:', err.stack);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi đăng nhập', error: err.message });
  }
});

// Kiểm tra token
router.get('/check', authenticateToken, (req, res) => {
  res.json({ 
    valid: true, 
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role,
      buildingId: req.user.building_id
    } 
  });
});

// Thêm route /me để đồng bộ với frontend
router.get('/me', authenticateToken, (req, res) => {
  res.json({ 
    valid: true, 
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role,
      buildingId: req.user.building_id
    } 
  });
});

// Đổi mật khẩu
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    // Kiểm tra mật khẩu hiện tại
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    
    const user = userResult.rows[0];
    const passwordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!passwordValid) {
      return res.status(401).json({ message: 'Mật khẩu hiện tại không đúng' });
    }
    
    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Cập nhật mật khẩu
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, userId]
    );
    
    res.json({ message: 'Đổi mật khẩu thành công' });
    
  } catch (err) {
    console.error('Lỗi đổi mật khẩu:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi đổi mật khẩu' });
  }
});

module.exports = {
  router,
  authenticateToken
}; 