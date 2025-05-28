@echo off
echo ===============================================================
echo           ADDING SAMPLE DATA TO LICENSE PLATE SYSTEM
echo ===============================================================

echo.
echo [1/3] Getting PostgreSQL container ID...
for /f "tokens=1" %%i in ('docker ps -f "ancestor=postgres:17" --format "{{.ID}}"') do set CONTAINER_ID=%%i

if "%CONTAINER_ID%"=="" (
    echo PostgreSQL container not found. Please make sure the system is running.
    exit /b 1
)

echo Found PostgreSQL container: %CONTAINER_ID%

echo.
echo [2/3] Copying fixed sample data SQL file to container...
docker cp "./db/sql/fixed-sample-data.sql" "%CONTAINER_ID%:/tmp/fixed-sample-data.sql"

echo.
echo [3/3] Executing fixed sample data SQL file...
docker exec -it %CONTAINER_ID% bash -c "PGPASSWORD=linh2005 psql -U postgres -d BTL_THPTHT -f /tmp/fixed-sample-data.sql"

echo.
echo Sample data has been added successfully!
echo You can now view the data in the application. 