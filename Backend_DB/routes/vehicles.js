const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('./auth');

// Lấy danh sách xe đăng ký
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, buildingId, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT v.*, b.name as building_name 
      FROM vehicles v
      JOIN buildings b ON v.building_id = b.id
      WHERE 1=1
    `;
    let countQuery = `SELECT COUNT(*) FROM vehicles v WHERE 1=1`;
    const params = [];
    let paramIndex = 1;
    
    // Filter theo buildingId hoặc quyền truy cập
    if (req.user.role === 'building_admin') {
      // Admin khu chỉ thấy xe trong khu mình
      query += ` AND v.building_id = $${paramIndex}`;
      countQuery += ` AND v.building_id = $${paramIndex}`;
      params.push(req.user.building_id);
      paramIndex++;
    } else if (buildingId) {
      // Super admin có thể filter theo khu
      query += ` AND v.building_id = $${paramIndex}`;
      countQuery += ` AND v.building_id = $${paramIndex}`;
      params.push(buildingId);
      paramIndex++;
    }
    
    // Tìm kiếm theo biển số hoặc tên chủ xe
    if (search) {
      query += ` AND (v.license_plate ILIKE $${paramIndex} OR v.owner_name ILIKE $${paramIndex})`;
      countQuery += ` AND (v.license_plate ILIKE $${paramIndex} OR v.owner_name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    // Sắp xếp và phân trang
    query += ` ORDER BY v.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const vehicles = await pool.query(query, params);
    const count = await pool.query(countQuery, params.slice(0, paramIndex - 1));
    
    res.json({
      data: vehicles.rows,
      totalItems: parseInt(count.rows[0].count),
      totalPages: Math.ceil(parseInt(count.rows[0].count) / limit),
      currentPage: parseInt(page)
    });
  } catch (err) {
    console.error('Lỗi lấy danh sách xe:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách xe' });
  }
});

// Lấy thông tin chi tiết xe
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const vehicleId = req.params.id;
    
    const result = await pool.query(`
      SELECT v.*, b.name as building_name 
      FROM vehicles v
      JOIN buildings b ON v.building_id = b.id
      WHERE v.id = $1
    `, [vehicleId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy xe' });
    }
    
    const vehicle = result.rows[0];
    
    // Kiểm tra quyền truy cập
    if (req.user.role === 'building_admin' && req.user.building_id !== vehicle.building_id) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    
    res.json(vehicle);
  } catch (err) {
    console.error('Lỗi lấy thông tin xe:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy thông tin xe' });
  }
});

// Đăng ký xe mới
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { license_plate, owner_name, vehicle_type, phone_number, building_id } = req.body;
    
    // Validate dữ liệu
    if (!license_plate || !owner_name || !building_id) {
      return res.status(400).json({ 
        message: 'Biển số xe, tên chủ xe và khu nhà trọ là bắt buộc' 
      });
    }
    
    // Kiểm tra quyền truy cập
    if (req.user.role === 'building_admin') {
      if (req.user.building_id !== parseInt(building_id)) {
        return res.status(403).json({ 
          message: 'Bạn chỉ có thể đăng ký xe cho khu nhà trọ của mình' 
        });
      }
    }
    
    // Kiểm tra biển số xe đã tồn tại chưa
    const existingVehicle = await pool.query(
      'SELECT * FROM vehicles WHERE license_plate = $1',
      [license_plate]
    );
    
    if (existingVehicle.rows.length > 0) {
      return res.status(400).json({ message: 'Biển số xe đã được đăng ký' });
    }
    
    // Thêm xe mới
    const result = await pool.query(`
      INSERT INTO vehicles (license_plate, owner_name, vehicle_type, phone_number, building_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [license_plate, owner_name, vehicle_type, phone_number, building_id]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Lỗi đăng ký xe:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi đăng ký xe' });
  }
});

// Cập nhật thông tin xe
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const { owner_name, vehicle_type, phone_number } = req.body;
    
    // Lấy thông tin xe hiện tại
    const vehicleCheck = await pool.query('SELECT * FROM vehicles WHERE id = $1', [vehicleId]);
    
    if (vehicleCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy xe' });
    }
    
    const vehicle = vehicleCheck.rows[0];
    
    // Kiểm tra quyền truy cập
    if (req.user.role === 'building_admin' && req.user.building_id !== vehicle.building_id) {
      return res.status(403).json({ message: 'Không có quyền chỉnh sửa xe này' });
    }
    
    // Cập nhật xe
    const result = await pool.query(`
      UPDATE vehicles 
      SET owner_name = $1, vehicle_type = $2, phone_number = $3
      WHERE id = $4
      RETURNING *
    `, [
      owner_name !== undefined && owner_name !== null && owner_name !== '' ? owner_name : vehicle.owner_name,
      vehicle_type !== undefined && vehicle_type !== null && vehicle_type !== '' ? vehicle_type : vehicle.vehicle_type,
      phone_number !== undefined && phone_number !== null && phone_number !== '' ? phone_number : vehicle.phone_number,
      vehicleId
    ]);
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Lỗi cập nhật xe:', err, err.stack);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật xe', error: err.message });
  }
});

// Xóa xe
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const vehicleId = req.params.id;
    
    // Lấy thông tin xe hiện tại
    const vehicleCheck = await pool.query('SELECT * FROM vehicles WHERE id = $1', [vehicleId]);
    
    if (vehicleCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy xe' });
    }
    
    const vehicle = vehicleCheck.rows[0];
    
    // Kiểm tra quyền truy cập
    if (req.user.role === 'building_admin' && req.user.building_id !== vehicle.building_id) {
      return res.status(403).json({ message: 'Không có quyền xóa xe này' });
    }
    
    // Xóa xe
    await pool.query('DELETE FROM vehicles WHERE id = $1', [vehicleId]);
    
    res.json({ message: 'Xóa xe thành công' });
  } catch (err) {
    console.error('Lỗi xóa xe:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi xóa xe' });
  }
});

// Kiểm tra biển số xe có được đăng ký không
router.get('/check/:licensePlate', async (req, res) => {
  try {
    const licensePlate = req.params.licensePlate;
    
    const result = await pool.query(`
      SELECT v.*, b.name as building_name 
      FROM vehicles v
      JOIN buildings b ON v.building_id = b.id
      WHERE v.license_plate = $1 AND v.is_active = true
    `, [licensePlate]);
    
    if (result.rows.length === 0) {
      return res.json({ registered: false });
    }
    
    const vehicle = result.rows[0];
    
    res.json({
      registered: true,
      data: {
        id: vehicle.id,
        licensePlate: vehicle.license_plate,
        ownerName: vehicle.owner_name,
        vehicleType: vehicle.vehicle_type,
        phoneNumber: vehicle.phone_number,
        building_id: vehicle.building_id,
        buildingName: vehicle.building_name
      }
    });
  } catch (err) {
    console.error('Lỗi kiểm tra biển số xe:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi khi kiểm tra biển số xe' });
  }
});

module.exports = router; 