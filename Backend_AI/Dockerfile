FROM python:3.9
WORKDIR /app

RUN apt-get update && apt-get install -y libgl1-mesa-glx libglib2.0-0

# Cài đặt các gói cơ bản trước
RUN pip install --no-cache-dir numpy opencv-python-headless fastapi uvicorn

# Sao chép requirements và cài đặt
COPY src/requirement.txt .
RUN pip install --no-cache-dir --timeout 100 -r requirement.txt

# Sao chép toàn bộ thư mục src vào /app
COPY src/ /app/src/
COPY yolov5/ /app/yolov5/

# Tạo thư mục images và config
RUN mkdir -p /app/images /app/config

# Thiết lập biến môi trường
ENV PYTHONPATH=/app

# Expose cổng
EXPOSE 8000

# Chạy ứng dụng
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]