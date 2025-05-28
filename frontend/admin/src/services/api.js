import axios from 'axios';
import { 
  mockAuthService, 
  mockVehicleService, 
  mockHistoryService, 
  mockAlertService 
} from './mockApi';

// Debug function to check token validity
const debugToken = (token) => {
  try {
    if (!token) return 'No token';
    
    // Just log basic token info without decoding sensitive parts
    console.log('Token type:', typeof token);
    console.log('Token length:', token.length);
    console.log('Token first 10 chars:', token.substring(0, 10) + '...');
    
    return 'Token looks valid';
  } catch (err) {
    console.error('Error analyzing token:', err);
    return 'Invalid token format';
  }
};

// Flag để xác định có sử dụng mock API hay không
const USE_MOCK_API = false; // Đã đổi từ true sang false để sử dụng backend API thật

// Cấu hình API URL
const API_URL = '/api'; // Use relative path for API requests via Nginx proxy

// Tạo instance axios với cấu hình mặc định
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
  // Add timeout
  timeout: 10000,
  // Vô hiệu hóa cache
  cache: false
});

// Thêm interceptor để gắn token vào header và vô hiệu hóa cache
api.interceptors.request.use(
  (config) => {
    // Thêm timestamp để tránh cache
    const timestamp = new Date().getTime();
    config.url = config.url + (config.url.includes('?') ? '&' : '?') + '_t=' + timestamp;
    
    const token = localStorage.getItem('token');
    if (token) {
      debugToken(token);
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request with token:', config.url);
    } else {
      console.log('Request without token:', config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Thêm interceptor để xử lý lỗi 401 (Unauthorized)
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, {
      status: response.status,
      hasData: !!response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    
    if (error.response && error.response.status === 401) {
      // Xóa token nếu server trả về 401
      console.log('401 error - removing token');
      localStorage.removeItem('token');
      // Chỉ chuyển hướng khi không đang ở trang login
      if (!window.location.pathname.includes('/login')) {
        console.log('Redirecting to login due to 401');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Services cho Authentication
export const authService = USE_MOCK_API 
  ? mockAuthService 
  : {
    // Đăng nhập
    login: (credentials) => api.post('/auth/login', credentials),
    
    // Kiểm tra trạng thái đăng nhập
    checkAuth: () => api.get('/auth/me'),
    
    // Đăng xuất
    logout: () => {
      console.log('Logging out, removing token');
      localStorage.removeItem('token');
      return Promise.resolve();
    },
  };

// Services cho Quản lý Xe
export const vehicleService = USE_MOCK_API 
  ? mockVehicleService 
  : {
    // Lấy danh sách xe đã đăng ký
    getRegisteredVehicles: () => api.get('/vehicles'),
    
    // Lấy chi tiết xe theo ID
    getVehicleById: (id) => api.get(`/vehicles/${id}`),
    
    // Thêm xe mới
    addVehicle: (vehicleData) => api.post('/vehicles', vehicleData),
    
    // Cập nhật thông tin xe
    updateVehicle: (id, vehicleData) => api.put(`/vehicles/${id}`, vehicleData),
    
    // Xóa xe
    deleteVehicle: (id) => api.delete(`/vehicles/${id}`),
  };

// Services cho Lịch sử nhận diện
export const historyService = USE_MOCK_API 
  ? mockHistoryService 
  : {
    // Lấy lịch sử xe ra vào
    getVehicleHistory: (params) => api.get('/history', { params }),
    
    // Lấy chi tiết lịch sử theo ID
    getHistoryById: (id) => api.get(`/history/${id}`),
  };

// Services cho Cảnh báo xe lạ
export const alertService = USE_MOCK_API 
  ? mockAlertService 
  : {
    // Lấy danh sách cảnh báo xe lạ
    getAlerts: (params) => api.get('/alerts', { params }),
    
    // Xử lý cảnh báo (đánh dấu đã xem, thêm ghi chú, v.v.)
    processAlert: (id, alertData) => api.put(`/alerts/${id}`, alertData),
    
    // Xóa cảnh báo
    deleteAlert: (id) => api.delete(`/alerts/${id}`),
  };

export default api;