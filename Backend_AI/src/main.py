from fastapi import FastAPI, File, UploadFile, Form, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import cv2
import numpy as np
import io
import time
import uuid
import os
import requests
from datetime import datetime
import torch
from src.function import utils_rotate
from src.function import helper
from src.camera_manager import CameraManager
from src.config import load_camera_config, get_detection_interval, get_backend_db_url
from fastapi.responses import StreamingResponse, FileResponse, JSONResponse
import threading
from typing import List

app = FastAPI()

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Biến môi trường
BACKEND_DB_URL = get_backend_db_url()
SAVE_IMAGES = os.getenv("SAVE_IMAGES", "true").lower() == "true"
IMAGE_DIR = os.getenv("IMAGE_DIR", "/app/images")

if SAVE_IMAGES and not os.path.exists(IMAGE_DIR):
    os.makedirs(IMAGE_DIR)

# Mount thư mục images để có thể truy cập ảnh từ bên ngoài
app.mount("/images", StaticFiles(directory=IMAGE_DIR), name="images")

# Biến toàn cục cho camera manager
camera_manager = None

# Biến toàn cục lưu frame mới nhất cho từng camera
latest_frames = {}

# Danh sách kết nối WebSocket
websocket_connections: List[WebSocket] = []

# Load models
@app.on_event("startup")
async def startup_event():
    global yolo_LP_detect, yolo_license_plate, camera_manager
    
    try:
        # Load models khi khởi động
        yolo_LP_detect = torch.hub.load('yolov5', 'custom', path='src/model/LP_detector_nano_61.pt', source='local')
        yolo_license_plate = torch.hub.load('yolov5', 'custom', path='src/model/LP_ocr_nano_62.pt', source='local')
        yolo_license_plate.conf = 0.60
        print("Models loaded successfully!")
    except Exception as e:
        print(f"Error loading models: {str(e)}")
        # Sử dụng model mặc định từ yolov5 nếu không tìm thấy model tùy chỉnh
        try:
            yolo_LP_detect = torch.hub.load('ultralytics/yolov5', 'yolov5s')
            yolo_license_plate = torch.hub.load('ultralytics/yolov5', 'yolov5s')
            print("Using default models")
        except Exception as e:
            print(f"Error loading default models: {str(e)}")
    
    # Khởi tạo Camera Manager
    camera_configs = load_camera_config()
    
    # Khởi tạo empty frames cho tất cả camera trong config
    # Để đảm bảo API endpoints luôn trả về đúng cấu trúc
    if camera_configs:
        print(f"Pre-initializing frames for cameras: {list(camera_configs.keys())}")
        # Tạo frame rỗng cho tất cả camera
        for camera_id in camera_configs:
            if camera_id not in latest_frames:
                # Tạo một frame đen 640x480 nếu camera chưa có frame
                empty_frame = np.zeros((480, 640, 3), dtype=np.uint8)
                # Vẽ text "NO SIGNAL" lên frame
                cv2.putText(empty_frame, f"NO SIGNAL - {camera_id}", (50, 240), 
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                latest_frames[camera_id] = empty_frame
    
    # Chỉ kích hoạt việc quét camera liên tục nếu ENABLE_CAMERA_DETECTION=true
    if os.getenv("ENABLE_CAMERA_DETECTION", "false").lower() == "true":
        if camera_configs:
            print(f"Loaded camera configs: {list(camera_configs.keys())}")
            camera_manager = CameraManager(
                camera_configs, 
                BACKEND_DB_URL, 
                detection_interval=get_detection_interval(),
                latest_frames=latest_frames
            )
            camera_manager.start()
            print(f"Camera Manager started with {len(camera_configs)} cameras")
        else:
            print("Camera configurations not found or empty. Camera detection not started.")

@app.on_event("shutdown")
async def shutdown_event():
    # Dừng Camera Manager khi ứng dụng kết thúc
    global camera_manager
    if camera_manager:
        camera_manager.stop()
        print("Camera Manager stopped")

@app.get("/")
def read_root():
    return {"message": "License Plate Recognition API"}

@app.post("/api/recognize")
async def recognize_license_plate(file: UploadFile = File(...), location: str = Form("Cổng chính"), building_id: int = Form(None)):
    # Đọc và xử lý ảnh
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Lưu ảnh gốc nếu cần
    img_path = None
    if SAVE_IMAGES:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        img_id = f"{timestamp}_{uuid.uuid4().hex[:8]}"
        img_path = f"{IMAGE_DIR}/{img_id}.jpg"
        cv2.imwrite(img_path, img)
    
    # Nhận diện biển số xe
    start_time = time.time()
    
    plates = yolo_LP_detect(img, size=640)
    list_plates = plates.pandas().xyxy[0].values.tolist()
    list_read_plates = set()
    
    license_plate = "unknown"
    confidence = 0
    crop_img_path = None
    
    if len(list_plates) == 0:
        # Thử đọc biển số trực tiếp từ ảnh
        license_plate = helper.read_plate(yolo_license_plate, img)
    else:
        for plate in list_plates:
            flag = 0
            x = int(plate[0])  # xmin
            y = int(plate[1])  # ymin
            w = int(plate[2] - plate[0])  # xmax - xmin
            h = int(plate[3] - plate[1])  # ymax - ymin  
            crop_img = img[y:y+h, x:x+w]
            
            # Lưu ảnh crop nếu cần
            if SAVE_IMAGES:
                crop_img_path = f"{IMAGE_DIR}/{img_id}_crop.jpg"
                cv2.imwrite(crop_img_path, crop_img)
            
            # Thử đọc biển số với nhiều góc xoay khác nhau
            for cc in range(0, 2):
                for ct in range(0, 2):
                    lp = helper.read_plate(yolo_license_plate, utils_rotate.deskew(crop_img, cc, ct))
                    if lp != "unknown":
                        license_plate = lp
                        confidence = float(plate[4])  # confidence score
                        flag = 1
                        break
                if flag == 1:
                    break
    
    process_time = time.time() - start_time
    
    # Nếu không phát hiện biển số
    if license_plate == "unknown":
        return {
            "success": False,
            "message": "Không phát hiện biển số xe",
            "process_time": process_time,
            "image_path": img_path.replace(IMAGE_DIR, "/images") if img_path else None
        }
    
    # Kiểm tra biển số trong cơ sở dữ liệu
    try:
        # Gửi request đến Backend DB
        check_response = requests.get(f"{BACKEND_DB_URL}/vehicles/check/{license_plate}")
        
        if check_response.status_code == 200:
            vehicle_data = check_response.json()
            registered = vehicle_data.get("registered", False)
            owner_info = vehicle_data.get("data", {})
            
            # Nếu không có building_id từ form, sử dụng từ owner_info nếu có
            if building_id is None and registered:
                building_id = owner_info.get("building_id")
            
            # Lưu lịch sử nhận diện
            history_data = {
                "license_plate_number": license_plate,
                "time_in": datetime.now().isoformat(),
                "location": location,
                "building_id": building_id,
                "image_path": img_path.replace(IMAGE_DIR, "/images") if img_path else None
            }
            
            # Gửi dữ liệu lịch sử đến Backend DB
            try:
                history_response = requests.post(f"{BACKEND_DB_URL}/vehicles-in", json=history_data)
                if history_response.status_code != 201 and history_response.status_code != 200:
                    print(f"Error sending history: status {history_response.status_code}")
            except Exception as e:
                print(f"Error sending history: {str(e)}")
            
            # Gửi cảnh báo nếu xe chưa đăng ký
            if not registered and building_id is not None:
                try:
                    alert_data = {
                        "license_plate": license_plate,
                        "location": location,
                        "building_id": building_id,
                        "image_path": img_path.replace(IMAGE_DIR, "/images") if img_path else None
                    }
                    alert_response = requests.post(f"{BACKEND_DB_URL}/alerts", json=alert_data)
                    # Broadcast alert qua WebSocket
                    import json as _json
                    for ws in websocket_connections:
                        try:
                            await ws.send_text(_json.dumps({
                                "type": "alert",
                                "data": alert_data
                            }))
                        except Exception:
                            pass
                except Exception as e:
                    print(f"Error sending alert: {str(e)}")
            
            # Trả về kết quả nhận diện và kiểm tra biến trước khi thay thế path
            image_path_to_return = img_path.replace(IMAGE_DIR, "/images") if img_path else None
            crop_image_path_to_return = crop_img_path.replace(IMAGE_DIR, "/images") if crop_img_path else None
            
            return {
                "success": True,
                "license_plate": license_plate,
                "confidence": confidence,
                "registered": registered,
                "owner_info": owner_info if registered else None,
                "process_time": process_time,
                "image_saved": SAVE_IMAGES,
                "image_path": image_path_to_return,
                "crop_image_path": crop_image_path_to_return
            }
        else:
            print(f"Error checking license plate: status {check_response.status_code}")
            return {
                "success": True,
                "license_plate": license_plate,
                "confidence": confidence,
                "registered": False,
                "error": f"Không thể kiểm tra trạng thái đăng ký: {check_response.status_code}",
                "process_time": process_time,
                "image_path": img_path.replace(IMAGE_DIR, "/images") if img_path else None,
                "crop_image_path": crop_img_path.replace(IMAGE_DIR, "/images") if crop_img_path else None
            }
    except Exception as e:
        print(f"Error in license plate recognition: {str(e)}")
        return {
            "success": True,
            "license_plate": license_plate,
            "confidence": confidence,
            "registered": False,
            "error": f"Lỗi khi xử lý: {str(e)}",
            "process_time": process_time,
            "image_path": img_path.replace(IMAGE_DIR, "/images") if img_path else None,
            "crop_image_path": crop_img_path.replace(IMAGE_DIR, "/images") if crop_img_path else None
        }

@app.get("/api/cameras")
def get_cameras():
    """Trả về danh sách camera đang hoạt động"""
    global camera_manager
    
    if camera_manager:
        return {
            "cameras": list(camera_manager.camera_urls.keys()),
            "status": "running" if camera_manager.running else "stopped",
            "running_count": len(camera_manager.threads)
        }
    else:
        return {
            "cameras": [],
            "status": "not_initialized",
            "running_count": 0
        }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "timestamp": datetime.now().isoformat(), "version": "1.0.0"}

@app.get("/api/version")
def get_version():
    return {
        "service": "license-plate-recognition",
        "version": "1.0.0",
        "backend_db_url": BACKEND_DB_URL,
        "save_images": SAVE_IMAGES,
        "image_dir": IMAGE_DIR,
        "camera_detection": os.getenv("ENABLE_CAMERA_DETECTION", "false").lower() == "true"
    }

@app.get("/api/camera/{camera_id}/snapshot")
def get_camera_snapshot(camera_id: str):
    print(f"Snapshot requested for camera: {camera_id}")
    print(f"Available cameras in latest_frames: {list(latest_frames.keys())}")
    
    frame = latest_frames.get(camera_id)
    if frame is not None:
        print(f"Frame found for camera {camera_id}, returning image")
        _, buffer = cv2.imencode('.jpg', frame)
        return StreamingResponse(io.BytesIO(buffer.tobytes()), media_type="image/jpeg")
    
    # Nếu không có frame, tạo frame "NO SIGNAL"
    print(f"No frame available for camera {camera_id}, creating NO SIGNAL image")
    # Tạo một frame đen 640x480
    no_signal_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    # Vẽ text "NO SIGNAL" lên frame
    cv2.putText(no_signal_frame, f"NO SIGNAL - {camera_id}", (50, 240), 
                cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
    
    # Lưu frame này vào latest_frames để lần sau sử dụng
    latest_frames[camera_id] = no_signal_frame
    
    _, buffer = cv2.imencode('.jpg', no_signal_frame)
    return StreamingResponse(io.BytesIO(buffer.tobytes()), media_type="image/jpeg")

@app.get("/api/camera/{camera_id}/stream")
def camera_stream(camera_id: str):
    print(f"Stream requested for camera: {camera_id}")
    
    def generate():
        while True:
            frame = latest_frames.get(camera_id)
            if frame is None:
                # Tạo một frame "NO SIGNAL" nếu camera không có dữ liệu
                no_signal_frame = np.zeros((480, 640, 3), dtype=np.uint8)
                cv2.putText(no_signal_frame, f"NO SIGNAL - {camera_id}", (50, 240), 
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                frame = no_signal_frame
                # Lưu frame này vào latest_frames để lần sau sử dụng
                latest_frames[camera_id] = no_signal_frame
            
            _, buffer = cv2.imencode('.jpg', frame)
            yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            time.sleep(0.1)
    
    return StreamingResponse(generate(), media_type='multipart/x-mixed-replace; boundary=frame')

@app.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    await websocket.accept()
    websocket_connections.append(websocket)
    try:
        while True:
            await websocket.receive_text()  # giữ kết nối sống
    except WebSocketDisconnect:
        websocket_connections.remove(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)