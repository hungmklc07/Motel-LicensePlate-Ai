@echo off
echo ===============================================================
echo           FIXING MISSING COLUMNS AND ADDING DATA
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
docker cp "./db/sql/fix-missing-columns.sql" "%CONTAINER_ID%:/tmp/fix-missing-columns.sql"

echo.
echo [3/3] Executing SQL file...
docker exec -it %CONTAINER_ID% bash -c "PGPASSWORD=linh2005 psql -U postgres -d BTL_THPTHT -f /tmp/fix-missing-columns.sql"

echo.
echo Columns have been fixed and data has been added successfully!
echo Please restart your services with 'docker-compose restart' 