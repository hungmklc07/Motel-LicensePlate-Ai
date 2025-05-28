const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const { authenticateToken } = require('./auth');

// Middleware kiểm tra quyền super_admin
const checkSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Không có quyền truy cập' });
  }
  next();
};

// Lấy danh sách người dùng (chỉ super_admin)
router.get('/', authenticateToken, checkSuperAdmin, async (req, res) => {
  try {
    const { buildingId, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT u.id, u.username, u.full_name, u.role, u.building_id, u.created_at, b.name as building_name
      FROM users u
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE 1=1
    `;
    let countQuery = `SELECT COUNT(*) FROM users u WHERE 1=1`;
    const params = [];
    let paramIndex = 1;
    
    // Filter theo khu nhà trọ
    if (buildingId) {
      query += ` AND u.building_id = $${paramIndex}`;
      countQuery += ` AND u.building_id = $${paramIndex}`;
      params.push(buildingId);
      paramIndex++;
    }
    
    // Sắp xếp và phân trang
    query += ` ORDER BY u.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const users = await pool.query(query, params);
    const count = await pool.query(countQuery, params.slice(0, paramIndex - 1));
    
    res.json({
      data: users.rows,
      totalItems: parseInt(count.rows[0].count),
      totalPages: Math.ceil(parseInt(count.rows[0].count) / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    console.error('Lỗi lấy danh sách người dùng:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách người dùng' });
  }
});

// Lấy thông tin chi tiết người dùng
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Người dùng thường chỉ có thể xem thông tin của chính mình
    if (req.user.role !== 'super_admin' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    
    const result = await pool.query(`
      SELECT u.id, u.username, u.full_name, u.role, u.building_id, u.created_at, b.name as building_name
      FROM users u
      LEFT JOIN buildings b ON u.building_id = b.id
      WHERE u.id = $1
    `, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Lỗi lấy thông tin người dùng:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy thông tin người dùng' });
  }
});

// Tạo người dùng mới (chỉ super_admin)
router.post('/', authenticateToken, checkSuperAdmin, async (req, res) => {
  try {
    const { username, password, full_name, role, building_id } = req.body;
    
    // Validate dữ liệu
    if (!username || !password) {
      return res.status(400).json({ message: 'Tên đăng nhập và mật khẩu là bắt buộc' });
    }
    
    if (role === 'building_admin' && !building_id) {
      return res.status(400).json({ message: 'Admin khu phải chọn khu nhà trọ quản lý' });
    }
    
    // Kiểm tra username đã tồn tại chưa
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
    }
    
    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Tạo người dùng mới
    const result = await pool.query(`
      INSERT INTO users (username, password, full_name, role, building_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, full_name, role, building_id, created_at
    `, [username, hashedPassword, full_name, role, role === 'building_admin' ? building_id : null]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Lỗi tạo người dùng:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi tạo người dùng' });
  }
});

// Cập nhật thông tin người dùng
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const { full_name, role, building_id } = req.body;
    
    // Lấy thông tin người dùng hiện tại
    const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    const user = userCheck.rows[0];
    
    // Kiểm tra quyền truy cập
    if (req.user.role !== 'super_admin' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ message: 'Không có quyền chỉnh sửa người dùng này' });
    }
    
    // Super admin có thể thay đổi role và building_id
    if (req.user.role === 'super_admin') {
      if (role === 'building_admin' && !building_id) {
        return res.status(400).json({ message: 'Admin khu phải chọn khu nhà trọ quản lý' });
      }
      
      const result = await pool.query(`
        UPDATE users 
        SET full_name = $1, role = $2, building_id = $3
        WHERE id = $4
        RETURNING id, username, full_name, role, building_id, created_at
      `, [
        full_name || user.full_name,
        role || user.role,
        role === 'building_admin' ? building_id : null,
        userId
      ]);
      
      return res.json(result.rows[0]);
    }
    
    // Người dùng thường chỉ có thể thay đổi full_name
    const result = await pool.query(`
      UPDATE users 
      SET full_name = $1
      WHERE id = $2
      RETURNING id, username, full_name, role, building_id, created_at
    `, [full_name || user.full_name, userId]);
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Lỗi cập nhật người dùng:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật người dùng' });
  }
});

// Xóa người dùng (chỉ super_admin)
router.delete('/:id', authenticateToken, checkSuperAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Không thể xóa chính mình
    if (req.user.id === parseInt(userId)) {
      return res.status(400).json({ message: 'Không thể xóa tài khoản của chính mình' });
    }
    
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    res.json({ message: 'Xóa người dùng thành công' });
  } catch (err) {
    console.error('Lỗi xóa người dùng:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi xóa người dùng' });
  }
});

// Đặt lại mật khẩu người dùng (chỉ super_admin)
router.post('/:id/reset-password', authenticateToken, checkSuperAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({ message: 'Mật khẩu mới là bắt buộc' });
    }
    
    // Kiểm tra người dùng tồn tại
    const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Cập nhật mật khẩu
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, userId]
    );
    
    res.json({ message: 'Đặt lại mật khẩu thành công' });
  } catch (err) {
    console.error('Lỗi đặt lại mật khẩu:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi đặt lại mật khẩu' });
  }
});

module.exports = router; 