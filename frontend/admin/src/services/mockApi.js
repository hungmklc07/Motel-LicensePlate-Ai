const mockData = {
    "vehicles": [
      {
        "id": 1,
        "licensePlate": "29A-12345",
        "ownerName": "Nguyễn Văn A",
        "ownerPhone": "0123456789",
        "vehicleType": "Xe máy",
        "registerDate": "2023-01-15",
        "notes": "Người ở phòng 101"
      },
      {
        "id": 2,
        "licensePlate": "30F-54321",
        "ownerName": "Trần Thị B",
        "ownerPhone": "0987654321",
        "vehicleType": "Ô tô",
        "registerDate": "2023-02-20",
        "notes": "Người ở phòng 205"
      },
      {
        "id": 3,
        "licensePlate": "36B-67890",
        "ownerName": "Lê Văn C",
        "ownerPhone": "0369852147",
        "vehicleType": "Xe máy",
        "registerDate": "2023-03-10",
        "notes": "Người ở phòng 302"
      },
      {
        "id": 4,
        "licensePlate": "51G-98765",
        "ownerName": "Phạm Thị D",
        "ownerPhone": "0932145678",
        "vehicleType": "Xe máy",
        "registerDate": "2023-04-05",
        "notes": "Người ở phòng 401"
      }
    ],
    "history": [
      {
        "id": 1,
        "licensePlate": "29A-12345",
        "timestamp": "2023-05-01T08:30:00",
        "direction": "in",
        "status": "registered",
        "ownerName": "Nguyễn Văn A",
        "location": "Cổng chính"
      },
      {
        "id": 2,
        "licensePlate": "30F-54321",
        "timestamp": "2023-05-01T09:15:00",
        "direction": "in",
        "status": "registered",
        "ownerName": "Trần Thị B",
        "location": "Cổng chính"
      },
      {
        "id": 3,
        "licensePlate": "36B-67890",
        "timestamp": "2023-05-01T10:45:00",
        "direction": "out",
        "status": "registered",
        "ownerName": "Lê Văn C",
        "location": "Cổng phụ"
      },
      {
        "id": 4,
        "licensePlate": "51F-88888",
        "timestamp": "2023-05-01T11:20:00",
        "direction": "in",
        "status": "unknown",
        "ownerName": null,
        "location": "Cổng chính"
      },
      {
        "id": 5,
        "licensePlate": "29A-12345",
        "timestamp": "2023-05-01T14:25:00",
        "direction": "out",
        "status": "registered",
        "ownerName": "Nguyễn Văn A",
        "location": "Cổng chính"
      }
    ],
    "alerts": [
      {
        "id": 1,
        "licensePlate": "51F-88888",
        "timestamp": "2023-05-01T11:20:00",
        "status": "pending",
        "location": "Cổng chính",
        "notes": "",
        "imageUrl": "https://via.placeholder.com/400x300?text=51F-88888"
      },
      {
        "id": 2,
        "licensePlate": "36B-77777",
        "timestamp": "2023-05-01T14:45:00",
        "status": "pending",
        "location": "Cổng phụ",
        "notes": "",
        "imageUrl": "https://via.placeholder.com/400x300?text=36B-77777"
      },
      {
        "id": 3,
        "licensePlate": "92H-54678",
        "timestamp": "2023-05-01T16:30:00",
        "status": "pending",
        "location": "Cổng chính",
        "notes": "",
        "imageUrl": "https://via.placeholder.com/400x300?text=92H-54678"
      }
    ],
    "recognition": {
      "latest": {
        "licensePlate": "29A-12345",
        "timestamp": "2023-05-01T15:30:00",
        "status": "registered",
        "ownerName": "Nguyễn Văn A",
        "ownerPhone": "0123456789",
        "vehicleType": "Xe máy",
        "imageUrl": "https://via.placeholder.com/400x300?text=29A-12345"
      }
    },
    "auth": {
      "login": {
        "token": "mock-jwt-token-for-testing"
      },
      "me": {
        "id": 1,
        "username": "admin",
        "name": "Admin User",
        "role": "admin"
      }
    }
  };
  
  // Sửa lại phần mockAuthService trong mockApi.js
export const mockAuthService = {
    login: (credentials) => {
      console.log('Mock login called with:', credentials); // Thêm log để debug
      // Giả lập quá trình đăng nhập
      return new Promise((resolve, reject) => {
        // Kiểm tra username là 'admin'
        if (credentials.username === 'admin') {
          // Thành công, trả về token từ mock data
          console.log('Login successful'); // Thêm log để debug
          resolve({
            data: mockData.auth.login
          });
        } else {
          // Thất bại
          console.log('Login failed'); // Thêm log để debug
          reject({
            response: {
              data: {
                message: 'Tên đăng nhập hoặc mật khẩu không đúng'
              }
            }
          });
        }
      });
    },
    
    checkAuth: () => {
      console.log('Mock checkAuth called'); // Thêm log để debug
      const token = localStorage.getItem('token');
      console.log('Token in localStorage:', token); // Kiểm tra token có tồn tại không
      
      // Nếu không có token, từ chối yêu cầu
      if (!token) {
        console.log('No token, rejecting auth check'); // Thêm log để debug
        return Promise.reject({ response: { status: 401 } });
      }
      
      // Có token, trả về thông tin người dùng
      console.log('Token exists, resolving auth check'); // Thêm log để debug
      return Promise.resolve({
        data: mockData.auth.me
      });
    },
    
    logout: () => {
      console.log('Mock logout called'); // Thêm log để debug
      localStorage.removeItem('token');
      return Promise.resolve();
    }
  };
  
  export const mockVehicleService = {
    getRegisteredVehicles: () => {
      return Promise.resolve({ data: mockData.vehicles });
    },
    
    getVehicleById: (id) => {
      const vehicle = mockData.vehicles.find(v => v.id === parseInt(id));
      return Promise.resolve({ data: vehicle });
    },
    
    addVehicle: (vehicleData) => {
      // Tạo ID mới
      const newId = Math.max(...mockData.vehicles.map(v => v.id)) + 1;
      const newVehicle = { ...vehicleData, id: newId };
      mockData.vehicles.push(newVehicle);
      return Promise.resolve({ data: newVehicle });
    },
    
    updateVehicle: (id, vehicleData) => {
      const index = mockData.vehicles.findIndex(v => v.id === parseInt(id));
      if (index !== -1) {
        mockData.vehicles[index] = { ...vehicleData };
      }
      return Promise.resolve({ data: vehicleData });
    },
    
    deleteVehicle: (id) => {
      const index = mockData.vehicles.findIndex(v => v.id === parseInt(id));
      if (index !== -1) {
        mockData.vehicles.splice(index, 1);
      }
      return Promise.resolve({ data: { id } });
    }
  };
  
  export const mockHistoryService = {
    getVehicleHistory: (params) => {
      // Đơn giản hóa - trả về tất cả lịch sử không lọc theo params
      return Promise.resolve({ data: mockData.history });
    },
    
    getHistoryById: (id) => {
      const history = mockData.history.find(h => h.id === parseInt(id));
      return Promise.resolve({ data: history });
    }
  };
  
  export const mockAlertService = {
    getAlerts: (params) => {
      // Đơn giản hóa - trả về tất cả cảnh báo không lọc theo params
      return Promise.resolve({ data: mockData.alerts });
    },
    
    processAlert: (id, alertData) => {
      const index = mockData.alerts.findIndex(a => a.id === parseInt(id));
      if (index !== -1) {
        mockData.alerts[index] = { ...mockData.alerts[index], ...alertData };
      }
      return Promise.resolve({ data: mockData.alerts[index] });
    },
    
    deleteAlert: (id) => {
      const index = mockData.alerts.findIndex(a => a.id === parseInt(id));
      if (index !== -1) {
        mockData.alerts.splice(index, 1);
      }
      return Promise.resolve({ data: { id } });
    }
  };