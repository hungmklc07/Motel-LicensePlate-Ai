import os
import json

def load_camera_config(config_path=None):
    """Tải cấu hình camera từ file"""
    if config_path is None:
        # Thử tìm file cấu hình ở nhiều vị trí khác nhau
        possible_paths = [
            os.environ.get('CAMERA_CONFIG', '/app/config/cameras.json'),
            os.path.join(os.path.dirname(__file__), '..', 'config', 'cameras.json'),
            os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'config', 'cameras.json')
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                config_path = path
                print(f"Found camera config at: {config_path}")
                break
    
    if not config_path or not os.path.exists(config_path):
        print(f"Camera config not found. Tried paths: {possible_paths}")
        return {}
        
    try:
        with open(config_path, 'r') as f:
            config = json.load(f)
            print(f"Loaded camera config with {len(config)} cameras")
            return config
    except Exception as e:
        print(f"Lỗi đọc file cấu hình camera: {str(e)}")
        # Trả về cấu hình mặc định
        return {}

def get_detection_interval():
    """Lấy khoảng thời gian giữa các lần nhận diện"""
    try:
        interval = float(os.environ.get('DETECTION_INTERVAL', '2.0'))
        return max(1.0, interval)  # Đảm bảo ít nhất 1 giây
    except:
        return 2.0  # Giá trị mặc định

def get_backend_db_url():
    """Lấy URL của Backend DB API"""
    return os.environ.get('BACKEND_DB_URL', 'http://backend-db:5000/api') 