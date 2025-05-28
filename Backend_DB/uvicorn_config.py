import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        # Cấu hình cho file lớn
        limit_concurrency=1000,
        limit_max_requests=10000,
        timeout_keep_alive=120,
        # Tăng kích thước tối đa cho request
        limit_request_line=0,  # Không giới hạn độ dài request line
        limit_request_fields=0,  # Không giới hạn số lượng fields
        limit_request_field_size=0,  # Không giới hạn kích thước field
    ) 