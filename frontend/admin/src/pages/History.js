import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Grid, CircularProgress, 
  Alert, TextField, FormControl, InputLabel, Select,
  MenuItem, Button, Chip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { 
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { historyService } from '../services/api';

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    licensePlate: '',
    startDate: '',
    endDate: '',
    status: 'all',
  });

  // Load dữ liệu lịch sử
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async (params = {}) => {
    setLoading(true);
    try {
      const response = await historyService.getVehicleHistory(params);
      // Map lại dữ liệu để có trường id và camelCase
      const historyWithId = (response.data.data || []).map(v => ({
        ...v,
        id: v.id || v.entry_id || (v.license_plate ? v.license_plate + '_' + v.timestamp : undefined),
        licensePlate: v.license_plate,
        ownerName: v.owner_name,
        vehicleType: v.vehicle_type,
        timestamp: v.timestamp,
        direction: v.direction,
        status: v.status,
        location: v.location,
        notes: v.notes
      }));
      setHistory(historyWithId);
      setError(null);
    } catch (err) {
      setError('Không thể tải lịch sử. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý lọc
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleSearch = () => {
    // Chỉ thêm các filter có giá trị
    const params = {};
    if (filters.licensePlate) params.licensePlate = filters.licensePlate;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.status !== 'all') params.status = filters.status;

    fetchHistory(params);
  };

  const handleClearFilters = () => {
    setFilters({
      licensePlate: '',
      startDate: '',
      endDate: '',
      status: 'all',
    });
    fetchHistory();
  };

  // Cấu hình cột DataGrid
  const columns = [
    { field: 'licensePlate', headerName: 'Biển số xe', width: 150 },
    { 
      field: 'timestamp', 
      headerName: 'Thời gian', 
      width: 180,
      valueFormatter: (params) => {
        const date = new Date(params.value);
        return `${date.toLocaleDateString('vi-VN')} ${date.toLocaleTimeString('vi-VN')}`;
      }
    },
    { 
      field: 'direction', 
      headerName: 'Hướng', 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value === 'in' ? 'Vào' : 'Ra'} 
          color={params.value === 'in' ? 'primary' : 'success'} 
          variant="outlined"
          size="small"
        />
      )
    },
    { 
      field: 'status', 
      headerName: 'Trạng thái', 
      width: 150,
      renderCell: (params) => {
        let color = 'default';
        let label = 'Không xác định';
        
        switch(params.value) {
          case 'registered':
            color = 'success';
            label = 'Đã đăng ký';
            break;
          case 'unregistered':
            color = 'warning';
            label = 'Chưa đăng ký';
            break;
          case 'unknown':
            color = 'error';
            label = 'Xe lạ';
            break;
          default:
            break;
        }
        
        return (
          <Chip 
            label={label} 
            color={color} 
            size="small"
          />
        );
      }
    },
    { field: 'location', headerName: 'Vị trí camera', width: 180 },
    { field: 'ownerName', headerName: 'Chủ xe', width: 200 },
    { field: 'notes', headerName: 'Ghi chú', width: 200 },
  ];

  return (
    <Box>
      <Typography variant="h5" component="h1" mb={3}>
        Lịch sử xe ra vào
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Biển số xe"
              name="licensePlate"
              value={filters.licensePlate}
              onChange={handleFilterChange}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Từ ngày"
              name="startDate"
              type="date"
              value={filters.startDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Đến ngày"
              name="endDate"
              type="date"
              value={filters.endDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Trạng thái</InputLabel>
              <Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                label="Trạng thái"
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="registered">Đã đăng ký</MenuItem>
                <MenuItem value="unregistered">Chưa đăng ký</MenuItem>
                <MenuItem value="unknown">Xe lạ</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box display="flex" gap={1}>
              <Button 
                variant="contained" 
                startIcon={<SearchIcon />}
                onClick={handleSearch}
              >
                Tìm kiếm
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
              >
                Xóa bộ lọc
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Results */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
        ) : (
          <DataGrid
            rows={history}
            columns={columns}
            pageSize={15}
            rowsPerPageOptions={[15, 30, 50]}
            checkboxSelection={false}
            disableSelectionOnClick
            autoHeight
            sx={{ minHeight: 400 }}
          />
        )}
      </Paper>
    </Box>
  );
}

export default History; 