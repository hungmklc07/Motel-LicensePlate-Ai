import numpy as np
import math
import cv2

def changeContrast(img):
    lab= cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l_channel, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
    cl = clahe.apply(l_channel)
    limg = cv2.merge((cl,a,b))
    enhanced_img = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
    return enhanced_img

def rotate_image(image, angle):
    image_center = tuple(np.array(image.shape[1::-1]) / 2)
    rot_mat = cv2.getRotationMatrix2D(image_center, angle, 1.0)
    result = cv2.warpAffine(image, rot_mat, image.shape[1::-1], flags=cv2.INTER_LINEAR)
    return result

def compute_skew(src_img, center_thres):
    if len(src_img.shape) == 3:
        h, w, _ = src_img.shape
    elif len(src_img.shape) == 2:
        h, w = src_img.shape
    else:
        print('upsupported image type')
    img = cv2.medianBlur(src_img, 3)
    edges = cv2.Canny(img,  threshold1 = 30,  threshold2 = 100, apertureSize = 3, L2gradient = True)
    lines = cv2.HoughLinesP(edges, 1, math.pi/180, 30, minLineLength=w / 1.5, maxLineGap=h/3.0)
    if lines is None:
        return 1

    min_line = 100
    min_line_pos = 0
    for i in range (len(lines)):
        for x1, y1, x2, y2 in lines[i]:
            center_point = [((x1+x2)/2), ((y1+y2)/2)]
            if center_thres == 1:
                if center_point[1] < 7:
                    continue
            if center_point[1] < min_line:
                min_line = center_point[1]
                min_line_pos = i

    angle = 0.0
    nlines = lines.size
    cnt = 0
    for x1, y1, x2, y2 in lines[min_line_pos]:
        ang = np.arctan2(y2 - y1, x2 - x1)
        if math.fabs(ang) <= 30: # excluding extreme rotations
            angle += ang
            cnt += 1
    if cnt == 0:
        return 0.0
    return (angle / cnt)*180/math.pi

def deskew(img, cc, ct):
    """
    Xoay ảnh để biển số thẳng hơn dựa trên các tham số góc
    
    Args:
        img: Ảnh đầu vào
        cc: Tham số điều chỉnh góc dọc
        ct: Tham số điều chỉnh góc ngang
    
    Returns:
        Ảnh đã được xoay
    """
    # Lấy kích thước ảnh
    rows, cols = img.shape[0], img.shape[1]
    
    # Tính toán góc xoay
    # cc=0: Không xoay theo chiều dọc
    # cc=1: Xoay 90 độ
    angle_ver = cc * 90
    
    # ct=0: Không xoay theo chiều ngang
    # ct=1: Xoay 180 độ
    angle_hor = ct * 180
    
    # Tổng góc xoay
    angle = (angle_ver + angle_hor) % 360
    
    if angle == 0:
        return img
    
    # Tính toán ma trận xoay
    center = (cols / 2, rows / 2)
    M = cv2.getRotationMatrix2D(center, angle, 1)
    
    # Áp dụng xoay
    rotated = cv2.warpAffine(img, M, (cols, rows))
    
    return rotated

def auto_rotate(img):
    """
    Tự động phát hiện góc nghiêng và xoay biển số
    
    Args:
        img: Ảnh biển số đầu vào
    
    Returns:
        Ảnh biển số đã được xoay thẳng
    """
    # Chuyển sang ảnh xám
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img
    
    # Ngưỡng hóa
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    
    # Tìm contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not contours:
        return img
    
    # Lấy contour lớn nhất
    largest_contour = max(contours, key=cv2.contourArea)
    
    # Tìm góc nghiêng
    rect = cv2.minAreaRect(largest_contour)
    angle = rect[2]
    
    # Điều chỉnh góc để xoay đúng hướng
    if angle < -45:
        angle = -(90 + angle)
    else:
        angle = -angle
    
    # Xoay ảnh
    center = rect[0]
    rows, cols = img.shape[0], img.shape[1]
    M = cv2.getRotationMatrix2D((cols/2, rows/2), angle, 1)
    rotated = cv2.warpAffine(img, M, (cols, rows))
    
    return rotated

def crop_license_plate(img, bbox, padding=5):
    """
    Cắt ảnh biển số từ ảnh gốc với padding
    
    Args:
        img: Ảnh gốc
        bbox: Bounding box của biển số [xmin, ymin, xmax, ymax]
        padding: Padding thêm vào các bên
    
    Returns:
        Ảnh biển số đã được cắt
    """
    x, y, w, h = bbox
    
    # Thêm padding
    x_start = max(0, x - padding)
    y_start = max(0, y - padding)
    x_end = min(img.shape[1], x + w + padding)
    y_end = min(img.shape[0], y + h + padding)
    
    # Cắt ảnh
    cropped = img[y_start:y_end, x_start:x_end]
    
    return cropped

