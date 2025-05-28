#!/usr/bin/env pwsh

# Use the specific container ID we found earlier
$containerId = "f406fbfb89ad"

if (!$containerId) {
    Write-Host "PostgreSQL container not found. Make sure containers are running." -ForegroundColor Red
    exit 1
}

# Copy the SQL file to the container
Write-Host "Copying SQL script to container..." -ForegroundColor Cyan
docker cp ./db/sql/add-building-field.sql ${containerId}:/tmp/add-building-field.sql

# Run the SQL script
Write-Host "Running SQL script..." -ForegroundColor Cyan
docker exec -it $containerId bash -c "PGPASSWORD=postgres psql -U postgres -d postgres -f /tmp/add-building-field.sql"

Write-Host "Script execution completed." -ForegroundColor Green 