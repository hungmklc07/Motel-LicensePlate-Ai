from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
from pathlib import Path

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Tạo thư mục uploads nếu chưa tồn tại
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    try:
        # Tạo đường dẫn đầy đủ cho file
        file_path = UPLOAD_DIR / file.filename
        
        # Lưu file với kích thước lớn
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {
            "filename": file.filename,
            "status": "success",
            "message": "File uploaded successfully"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
    finally:
        file.file.close() 