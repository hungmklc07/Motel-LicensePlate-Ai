import cv2
import time
import threading
import os
import requests
from datetime import datetime

class CameraManager:
    def __init__(self, camera_urls, backend_db_url, detection_interval=3, latest_frames=None):
        self.camera_urls = camera_urls  # Dict với format {camera_id: {url: "rtsp://...", location: "Cổng chính", building_id: 1}}
        self.backend_db_url = backend_db_url
        self.detection_interval = detection_interval  # Thời gian giữa các lần nhận diện (giây)
        self.streams = {}
        self.threads = {}  # Thread đọc frame
        self.detection_threads = {}  # Thread nhận diện
        self.running = False
        self.latest_frames = latest_frames if latest_frames is not None else {}
        self.detection_thread_flags = {}
    
    def start(self):
        """Bắt đầu quá trình nhận diện từ tất cả camera"""
        self.running = True
        for camera_id, camera_info in self.camera_urls.items():
            # Thread đọc frame liên tục
            thread = threading.Thread(target=self._process_camera, args=(camera_id, camera_info))
            thread.daemon = True
            thread.start()
            self.threads[camera_id] = thread
            if camera_id not in self.detection_thread_flags:
                self.detection_thread_flags[camera_id] = False
            if not self.detection_thread_flags[camera_id]:
                detect_thread = threading.Thread(target=self._detect_loop, args=(camera_id, camera_info))
                detect_thread.daemon = True
                detect_thread.start()
                self.detection_threads[camera_id] = detect_thread
                self.detection_thread_flags[camera_id] = True
        
    def stop(self):
        """Dừng tất cả camera"""
        self.running = False
        # Đợi tất cả thread dừng lại
        for thread in list(self.threads.values()) + list(self.detection_threads.values()):
            if thread.is_alive():
                thread.join(timeout=1.0)
        # Giải phóng tài nguyên
        for stream in self.streams.values():
            if stream is not None:
                stream.release()
        self.streams = {}
    
    def _process_camera(self, camera_id, camera_info):
        """Luồng chỉ đọc frame từ camera và lưu vào RAM"""
        url = camera_info['url']
        location = camera_info.get('location', 'Camera không tên')
        building_id = camera_info.get('building_id')
        
        # Khởi tạo kết nối với camera
        try:
            # Hỗ trợ cả URL dạng chuỗi và camera ID dạng số
            if isinstance(url, int) or (isinstance(url, str) and url.isdigit()):
                url = int(url)
                print(f"Kết nối với webcam ID {url}")
            cap = cv2.VideoCapture(url)
            
            # Kiểm tra kết nối thành công
            if not cap.isOpened():
                print(f"Không thể kết nối với camera ID {camera_id} ({url})")
                return
                
            self.streams[camera_id] = cap
            print(f"Đã kết nối thành công với camera ID {camera_id} ({url})")
        
        except Exception as e:
            print(f"Lỗi khi kết nối với camera ID {camera_id} ({url}): {str(e)}")
            return
        
        while self.running:
            # Đọc frame từ camera
            ret, frame = cap.read()
            if not ret:
                print(f"Lỗi khi đọc từ camera ID {camera_id}: {url}")
                time.sleep(5)  # Đợi và thử lại
                # Thử kết nối lại
                cap.release()
                try:
                    cap = cv2.VideoCapture(url)
                    if not cap.isOpened():
                        print(f"Không thể kết nối lại với camera ID {camera_id} ({url})")
                        time.sleep(10)  # Đợi lâu hơn trước khi thử lại
                        continue
                    self.streams[camera_id] = cap
                    print(f"Đã kết nối lại thành công với camera ID {camera_id} ({url})")
                except Exception as e:
                    print(f"Lỗi khi kết nối lại với camera ID {camera_id} ({url}): {str(e)}")
                    time.sleep(10)
                continue
            
            # Lưu frame mới nhất vào RAM
            self.latest_frames[camera_id] = frame.copy()
            time.sleep(0.01)  # Đọc liên tục cho mượt
    
    def _detect_loop(self, camera_id, camera_info):
        """Luồng nhận diện riêng biệt, mỗi detection_interval giây lấy frame mới nhất để nhận diện"""
        location = camera_info.get('location', 'Camera không tên')
        building_id = camera_info.get('building_id')
        while self.running:
            print(f"[{datetime.now()}] Nhận diện camera {camera_id}")
            frame = self.latest_frames.get(camera_id)
            if frame is not None:
                try:
                    self._process_frame(frame, location, building_id)
                except Exception as e:
                    print(f"Lỗi xử lý nhận diện frame từ camera {camera_id}: {str(e)}")
            time.sleep(self.detection_interval)
    
    def _process_frame(self, frame, location, building_id):
        """Gửi frame đến API nhận diện nội bộ"""
        # Chuyển đổi frame thành định dạng file
        is_success, buffer = cv2.imencode(".jpg", frame)
        if not is_success:
            return
        
        # Chuẩn bị file để upload
        files = {'file': ('image.jpg', buffer.tobytes(), 'image/jpeg')}
        data = {
            'location': location
        }
        if building_id:
            data['building_id'] = building_id
        
        # Lưu ảnh vào thư mục tạm (nếu cần debug)
        if os.getenv('DEBUG_SAVE_FRAMES', 'false').lower() == 'true':
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            debug_dir = os.path.join(os.getenv('IMAGE_DIR', '/app/images'), 'debug')
            if not os.path.exists(debug_dir):
                os.makedirs(debug_dir)
            cv2.imwrite(os.path.join(debug_dir, f"{timestamp}.jpg"), frame)
        
        # Gọi API nhận diện nội bộ
        try:
            # Sử dụng localhost vì đây là gọi trong cùng container
            response = requests.post('http://localhost:8000/api/recognize', files=files, data=data)
            if response.status_code == 200:
                result = response.json()
                if result.get('success') and result.get('license_plate') != 'unknown':
                    print(f"Đã phát hiện biển số: {result.get('license_plate')} tại {location}")
        except Exception as e:
            print(f"Lỗi gửi request tới API nhận diện: {str(e)}") 