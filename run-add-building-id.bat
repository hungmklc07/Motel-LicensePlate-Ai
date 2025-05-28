@echo off
echo ===============================================================
echo           ADDING BUILDING_ID COLUMN TO TABLES
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
echo [2/3] Copying SQL file to container...
docker cp "./db/sql/add-building-id.sql" "%CONTAINER_ID%:/tmp/add-building-id.sql"

echo.
echo [3/3] Executing SQL file...
docker exec -it %CONTAINER_ID% bash -c "PGPASSWORD=linh2005 psql -U postgres -d BTL_THPTHT -f /tmp/add-building-id.sql"

echo.
echo Building_id column has been added successfully!
echo Please restart your services with 'docker-compose restart' 