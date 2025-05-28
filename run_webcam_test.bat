@echo off
echo Đang khởi chạy chương trình test nhận diện biển số với webcam...
echo.
echo CÁCH SỬ DỤNG:
echo - Nhấn phím 'q' để thoát
echo - Nhấn phím 's' để chụp ảnh và gửi đến API nhận diện
echo.

:: Kiểm tra xem Docker container đang chạy không
docker ps | findstr "license-plate-backend-ai" > nul
if %errorlevel% NEQ 0 (
    echo CẢNH BÁO: Container license-plate-backend-ai không chạy!
    echo Vui lòng chắc chắn rằng docker-compose đang chạy.
    echo.
    pause
    exit /b
)

:: Chạy trong thư mục Backend_AI/src
cd Backend_AI\src

echo Đang kết nối đến API nhận diện biển số...
echo Ứng dụng sẽ khởi chạy sau 3 giây
timeout /t 3 > nul

:: Chạy ứng dụng test
python webcam_test.py --api http://localhost:8000/api/recognize --interval 0

echo.
echo Đã kết thúc chương trình test webcam
pause 