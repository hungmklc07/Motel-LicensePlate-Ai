import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Typography, Paper, Grid,
  Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Snackbar, Alert, CircularProgress,
  IconButton, MenuItem, FormControl, InputLabel, Select
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { vehicleService } from '../services/api';
import api from '../services/api';

function Vehicles() {
  // State
  const [vehicles, setVehicles] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState({
    licensePlate: '',
    ownerName: '',
    ownerPhone: '',
    vehicleType: '',
    registerDate: '',
    building_id: '',
    notes: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Load dữ liệu xe
  useEffect(() => {
    fetchVehicles();
    fetchBuildings();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await vehicleService.getRegisteredVehicles();
      // Map lại dữ liệu để có trường id và camelCase
      const vehiclesWithId = (response.data.data || []).map(v => ({
        ...v,
        id: v.id || v.vehicle_id || v.license_plate, // id duy nhất cho DataGrid
        licensePlate: v.license_plate,
        ownerName: v.owner_name,
        ownerPhone: v.phone_number,
        vehicleType: v.vehicle_type,
        registerDate: v.register_date,
        buildingName: v.building_name,
        notes: v.notes
      }));
      setVehicles(vehiclesWithId);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách xe. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBuildings = async () => {
    try {
      const response = await api.get('/buildings');
      setBuildings(response.data);
    } catch (err) {
      console.error('Không thể tải danh sách khu nhà trọ:', err);
    }
  };

  // Xử lý form
  const handleOpenDialog = (vehicle = null) => {
    if (vehicle) {
      setCurrentVehicle(vehicle);
      setIsEditing(true);
    } else {
      // Get the first building_id as default if available
      const defaultBuildingId = buildings.length > 0 ? buildings[0].id : '';
      
      setCurrentVehicle({
        licensePlate: '',
        ownerName: '',
        ownerPhone: '',
        vehicleType: '',
        registerDate: new Date().toISOString().split('T')[0],
        building_id: defaultBuildingId,
        notes: ''
      });
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentVehicle({
      ...currentVehicle,
      [name]: value
    });
  };

  const handleSubmit = async () => {
    try {
      // Convert fields to match backend expectations
      const vehicleData = {
        license_plate: currentVehicle.licensePlate,
        owner_name: currentVehicle.ownerName,
        phone_number: currentVehicle.ownerPhone,
        vehicle_type: currentVehicle.vehicleType,
        register_date: currentVehicle.registerDate,
        building_id: currentVehicle.building_id,
        notes: currentVehicle.notes
      };

      if (isEditing) {
        await vehicleService.updateVehicle(currentVehicle.id, vehicleData);
        setSnackbar({
          open: true,
          message: 'Cập nhật thông tin xe thành công',
          severity: 'success'
        });
      } else {
        const res = await vehicleService.addVehicle(vehicleData);
        // Map lại object xe vừa thêm nếu backend trả về
        if (res && res.data) {
          const v = res.data;
          const newVehicle = {
            ...v,
            id: v.id || v.vehicle_id || v.license_plate,
            licensePlate: v.license_plate,
            ownerName: v.owner_name,
            ownerPhone: v.phone_number,
            vehicleType: v.vehicle_type,
            registerDate: v.register_date,
            buildingName: v.building_name,
            notes: v.notes
          };
          setVehicles(prev => [newVehicle, ...prev]);
        }
        setSnackbar({
          open: true,
          message: 'Thêm xe mới thành công',
          severity: 'success'
        });
      }
      // Refresh danh sách
      await fetchVehicles();
      handleCloseDialog();
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Lỗi: ${err.response?.data?.message || 'Không thể xử lý yêu cầu'}`,
        severity: 'error'
      });
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa xe này không?')) {
      try {
        await vehicleService.deleteVehicle(id);
        setSnackbar({
          open: true,
          message: 'Xóa xe thành công',
          severity: 'success'
        });
        await fetchVehicles();
      } catch (err) {
        setSnackbar({
          open: true,
          message: `Lỗi: ${err.response?.data?.message || 'Không thể xóa xe'}`,
          severity: 'error'
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Cấu hình cột DataGrid
  const columns = [
    { field: 'licensePlate', headerName: 'Biển số xe', width: 150 },
    { field: 'ownerName', headerName: 'Chủ xe', width: 200 },
    { field: 'ownerPhone', headerName: 'Số điện thoại', width: 150 },
    { field: 'vehicleType', headerName: 'Loại xe', width: 120 },
    { field: 'buildingName', headerName: 'Khu nhà trọ', width: 150 },
    { 
      field: 'registerDate', 
      headerName: 'Ngày đăng ký', 
      width: 150,
      valueFormatter: (params) => {
        const date = new Date(params.value);
        return date.toLocaleDateString('vi-VN');
      } 
    },
    { field: 'notes', headerName: 'Ghi chú', width: 200 },
    {
      field: 'actions',
      headerName: 'Thao tác',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton 
            color="primary"
            onClick={() => handleOpenDialog(params.row)}
          >
            <EditIcon />
          </IconButton>
          <IconButton 
            color="error"
            onClick={() => handleDeleteVehicle(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Quản lý xe đã đăng ký
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm xe mới
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
        ) : (
          <DataGrid
            rows={vehicles}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            checkboxSelection={false}
            disableSelectionOnClick
            autoHeight
            sx={{ minHeight: 400 }}
          />
        )}
      </Paper>

      {/* Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEditing ? 'Cập nhật thông tin xe' : 'Thêm xe mới'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Biển số xe"
                name="licensePlate"
                value={currentVehicle.licensePlate}
                onChange={handleInputChange}
                disabled={isEditing}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Loại xe"
                name="vehicleType"
                value={currentVehicle.vehicleType}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tên chủ xe"
                name="ownerName"
                value={currentVehicle.ownerName}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                name="ownerPhone"
                value={currentVehicle.ownerPhone}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="building-label">Khu nhà trọ</InputLabel>
                <Select
                  labelId="building-label"
                  name="building_id"
                  value={currentVehicle.building_id}
                  onChange={handleInputChange}
                  label="Khu nhà trọ"
                >
                  {buildings.map((building) => (
                    <MenuItem key={building.id} value={building.id}>
                      {building.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ngày đăng ký"
                name="registerDate"
                type="date"
                value={currentVehicle.registerDate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ghi chú"
                name="notes"
                value={currentVehicle.notes}
                onChange={handleInputChange}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
          >
            {isEditing ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar thông báo */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Vehicles; 