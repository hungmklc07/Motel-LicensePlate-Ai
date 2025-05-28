#!/usr/bin/env pwsh

# Get the PostgreSQL container ID dynamically
$containerId = $(docker ps -f "ancestor=postgres:17" --format "{{.ID}}")

if (!$containerId) {
    Write-Host "PostgreSQL container not found. Make sure containers are running." -ForegroundColor Red
    exit 1
}

Write-Host "Found PostgreSQL container: $containerId" -ForegroundColor Green

# Copy the SQL file to the container
Write-Host "Copying SQL script to container..." -ForegroundColor Cyan
docker cp ./db/sql/missing-tables.sql ${containerId}:/tmp/missing-tables.sql

# Run the SQL script
Write-Host "Running SQL script..." -ForegroundColor Cyan
docker exec -it $containerId bash -c "PGPASSWORD=linh2005 psql -U postgres -d BTL_THPTHT -f /tmp/missing-tables.sql"

Write-Host "Script execution completed." -ForegroundColor Green 