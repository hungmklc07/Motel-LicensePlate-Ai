import math
import cv2
import numpy as np
import torch
import re

# license plate type classification helper function
def linear_equation(x1, y1, x2, y2):
    b = y1 - (y2 - y1) * x1 / (x2 - x1)
    a = (y1 - b) / x1
    return a, b

def check_point_linear(x, y, x1, y1, x2, y2):
    a, b = linear_equation(x1, y1, x2, y2)
    y_pred = a*x+b
    return(math.isclose(y_pred, y, abs_tol = 3))

# detect character and number in license plate
def read_plate(ocr_model, img):
    """
    Sử dụng model OCR để đọc biển số xe từ ảnh
    
    Args:
        ocr_model: Model YOLOv5 đã được huấn luyện để nhận diện ký tự biển số
        img: Ảnh biển số đầu vào
    
    Returns:
        Chuỗi biển số đã nhận diện, "unknown" nếu không đọc được
    """
    # Đảm bảo ảnh không quá nhỏ
    if img.shape[0] < 20 or img.shape[1] < 20:
        return "unknown"
    
    # Phát hiện các ký tự biển số
    results = ocr_model(img, size=640)
    
    # Lấy tọa độ và class các ký tự
    detections = results.pandas().xyxy[0].values.tolist()
    
    # Nếu không có ký tự nào được nhận diện
    if len(detections) == 0:
        return "unknown"
    
    # Sắp xếp các ký tự theo tọa độ X
    detections.sort(key=lambda x: x[0])
    
    # Nhóm các ký tự theo hàng (dòng trên, dòng dưới)
    y_center = img.shape[0] / 2
    top_chars = [d for d in detections if d[1] < y_center]
    bottom_chars = [d for d in detections if d[1] >= y_center]
    
    # Sắp xếp các ký tự trong mỗi hàng
    top_chars.sort(key=lambda x: x[0])
    bottom_chars.sort(key=lambda x: x[0])
    
    # Tạo chuỗi biển số
    plate_number = ""
    
    # Dòng trên
    for char in top_chars:
        class_id = int(char[5])
        char_name = results.names[class_id]
        plate_number += char_name
    
    # Dòng dưới
    if bottom_chars:
        plate_number += "-"
        for char in bottom_chars:
            class_id = int(char[5])
            char_name = results.names[class_id]
            plate_number += char_name
    
    # Nếu biển số quá ngắn hoặc không hợp lệ
    if len(plate_number) < 4:
        return "unknown"
    
    # Loại bỏ các ký tự không hợp lệ (chỉ giữ số, chữ và gạch ngang)
    plate_number = re.sub(r'[^0-9A-Z\-]', '', plate_number)
    
    # Kiểm tra tính hợp lệ của biển số
    if is_valid_plate(plate_number):
        return plate_number
    else:
        return "unknown"

def is_valid_plate(plate_number):
    """
    Kiểm tra tính hợp lệ của biển số xe
    
    Args:
        plate_number: Chuỗi biển số xe
    
    Returns:
        True nếu biển số hợp lệ, False nếu không
    """
    # Các mẫu biển số phổ biến ở Việt Nam
    patterns = [
        r'^[0-9]{2}[A-Z][0-9]{4,5}$',                 # 51G12345
        r'^[0-9]{2}[A-Z][0-9]{3}\.[0-9]{2}$',         # 51G123.45
        r'^[0-9]{2}[A-Z][0-9]{4,5}-[0-9]{2}$',        # 51G12345-01
        r'^[0-9]{2}[A-Z][0-9]{3}\.[0-9]{2}-[0-9]{2}$' # 51G123.45-01
    ]
    
    # Kiểm tra biển số có khớp với một trong các mẫu không
    for pattern in patterns:
        if re.match(pattern, plate_number):
            return True
    
    return False

def enhance_image(img):
    """
    Cải thiện chất lượng ảnh để nhận diện biển số tốt hơn
    
    Args:
        img: Ảnh đầu vào
    
    Returns:
        Ảnh đã được cải thiện
    """
    # Chuyển sang ảnh xám
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img
    
    # Làm mờ để giảm nhiễu
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Cân bằng histogram để cải thiện độ tương phản
    equalized = cv2.equalizeHist(blur)
    
    # Ngưỡng hóa thích ứng
    enhanced = cv2.adaptiveThreshold(equalized, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                    cv2.THRESH_BINARY, 11, 2)
    
    return enhanced

def draw_license_plate(img, license_plate, box, color=(0, 255, 0), thickness=2):
    """
    Vẽ biển số và bounding box lên ảnh
    
    Args:
        img: Ảnh đầu vào
        license_plate: Chuỗi biển số
        box: Tọa độ [x, y, w, h] của biển số
        color: Màu viền, mặc định là xanh lá
        thickness: Độ dày viền, mặc định là 2
    
    Returns:
        Ảnh đã được vẽ biển số và bounding box
    """
    x, y, w, h = box
    
    # Vẽ hình chữ nhật bao quanh biển số
    cv2.rectangle(img, (x, y), (x+w, y+h), color, thickness)
    
    # Vẽ chuỗi biển số ở phía trên bounding box
    cv2.putText(img, license_plate, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 
                0.8, color, thickness, cv2.LINE_AA)
    
    return img