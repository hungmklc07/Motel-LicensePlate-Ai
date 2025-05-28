import cv2
import time
import requests
import argparse
import os
from datetime import datetime
import json

class WebcamTest:
    def __init__(self, camera_id=0, api_url="http://localhost:8000/api/recognize", building_id=1, location="Cổng chính", interval=2):
        """
        Khởi tạo kết nối với webcam và chuẩn bị các thông số để test
        
        Tham số:
            camera_id: ID của camera (thường là 0 cho webcam mặc định)
            api_url: URL của API nhận diện biển số
            building_id: ID của tòa nhà
            location: Vị trí camera
            interval: Khoảng thời gian giữa các lần gửi ảnh để nhận diện (giây)
        """
        self.camera_id = camera_id
        self.api_url = api_url
        self.building_id = building_id
        self.location = location
        self.interval = interval
        self.cap = None
        self.running = False
        
        # Tạo thư mục lưu ảnh test nếu chưa có
        self.save_dir = os.path.join(os.getcwd(), "test_images")
        if not os.path.exists(self.save_dir):
            os.makedirs(self.save_dir)
    
    def start(self):
        """Bắt đầu chế độ test với webcam"""
        self.cap = cv2.VideoCapture(self.camera_id)
        if not self.cap.isOpened():
            print(f"Không thể mở webcam với ID {self.camera_id}")
            return False
        
        self.running = True
        last_detection_time = 0
        
        print("Đang chạy chế độ test webcam. Nhấn 'q' để thoát, 's' để chụp và phân tích ảnh.")
        print(f"Đang sử dụng camera ID: {self.camera_id}")
        print(f"API URL: {self.api_url}")
        print(f"Building ID: {self.building_id}, Location: {self.location}")
        
        while self.running:
            # Đọc frame từ webcam
            ret, frame = self.cap.read()
            if not ret:
                print("Không thể đọc frame từ webcam")
                break
            
            # Hiển thị frame
            cv2.imshow('Webcam Test', frame)
            
            current_time = time.time()
            key = cv2.waitKey(1)
            
            # Nhấn 'q' để thoát
            if key == ord('q'):
                self.running = False
            
            # Nhấn 's' để chụp và gửi ảnh để nhận diện
            elif key == ord('s') or (current_time - last_detection_time) >= self.interval:
                # Lưu ảnh vừa chụp
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                img_path = os.path.join(self.save_dir, f"test_{timestamp}.jpg")
                cv2.imwrite(img_path, frame)
                print(f"Đã lưu ảnh: {img_path}")
                
                # Gửi ảnh để nhận diện
                self.process_image(frame, img_path)
                last_detection_time = current_time
        
        # Giải phóng tài nguyên
        self.stop()
    
    def process_image(self, frame, img_path):
        """Gửi ảnh đến API nhận diện và hiển thị kết quả"""
        # Chuyển frame thành file để upload
        _, img_encoded = cv2.imencode('.jpg', frame)
        
        # Chuẩn bị request
        files = {'file': ('image.jpg', img_encoded.tobytes(), 'image/jpeg')}
        data = {
            'location': self.location,
            'building_id': self.building_id
        }
        
        try:
            print("Đang gửi ảnh để nhận diện...")
            response = requests.post(self.api_url, files=files, data=data)
            
            if response.status_code == 200:
                result = response.json()
                print("\n--- KẾT QUẢ NHẬN DIỆN ---")
                print(f"Thành công: {result.get('success', False)}")
                print(f"Biển số: {result.get('license_plate', 'Không xác định')}")
                print(f"Độ tin cậy: {result.get('confidence', 0)}")
                print(f"Đã đăng ký: {result.get('registered', False)}")
                
                # Hiển thị thông tin chủ xe nếu có
                if result.get('registered', False) and result.get('owner_info'):
                    owner = result.get('owner_info', {})
                    print("\nThông tin chủ xe:")
                    print(f"Tên: {owner.get('owner_name', 'N/A')}")
                    print(f"Loại xe: {owner.get('vehicle_type', 'N/A')}")
                    print(f"Tòa nhà: {owner.get('building_id', 'N/A')}")
                
                print(f"Thời gian xử lý: {result.get('process_time', 0):.2f} giây")
                print("--------------------------\n")
                
                # Lưu kết quả vào file JSON cùng tên với ảnh
                json_path = img_path.replace('.jpg', '.json')
                with open(json_path, 'w') as f:
                    json.dump(result, f, indent=2)
                print(f"Đã lưu kết quả vào: {json_path}")
                
            else:
                print(f"Lỗi: Mã trạng thái {response.status_code}")
                print(response.text)
        
        except Exception as e:
            print(f"Lỗi khi gửi request: {str(e)}")
    
    def stop(self):
        """Dừng và giải phóng tài nguyên"""
        self.running = False
        if self.cap is not None:
            self.cap.release()
        cv2.destroyAllWindows()
        print("Đã dừng chế độ test webcam")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Test nhận diện biển số xe với webcam')
    parser.add_argument('--camera', type=int, default=0, help='ID của camera (mặc định: 0)')
    parser.add_argument('--api', type=str, default='http://localhost:8000/api/recognize', help='URL API nhận diện biển số')
    parser.add_argument('--building', type=int, default=1, help='ID của tòa nhà (mặc định: 1)')
    parser.add_argument('--location', type=str, default='Cổng chính', help='Vị trí camera (mặc định: Cổng chính)')
    parser.add_argument('--interval', type=int, default=0, help='Thời gian giữa các lần nhận diện tự động (giây, 0 = chỉ dùng phím s)')
    
    args = parser.parse_args()
    
    tester = WebcamTest(
        camera_id=args.camera,
        api_url=args.api,
        building_id=args.building,
        location=args.location,
        interval=args.interval
    )
    
    try:
        tester.start()
    except KeyboardInterrupt:
        print("Đã hủy chương trình bởi người dùng")
    finally:
        tester.stop() 