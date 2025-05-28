#!/bin/bash

echo "==============================================================="
echo "           ADDING SAMPLE DATA TO LICENSE PLATE SYSTEM"
echo "==============================================================="

echo
echo "[1/3] Getting PostgreSQL container ID..."
CONTAINER_ID=$(docker ps -f "ancestor=postgres:17" --format "{{.ID}}")

if [ -z "$CONTAINER_ID" ]; then
    echo "PostgreSQL container not found. Please make sure the system is running."
    exit 1
fi

echo "Found PostgreSQL container: $CONTAINER_ID"

echo
echo "[2/3] Copying sample data SQL file to container..."
docker cp "./db/sql/sample-data.sql" "$CONTAINER_ID:/tmp/sample-data.sql"

echo
echo "[3/3] Executing sample data SQL file..."
docker exec -it $CONTAINER_ID bash -c "PGPASSWORD=postgres psql -U postgres -d postgres -f /tmp/sample-data.sql"

echo
echo "Sample data has been added successfully!"
echo "You can now view the data in the application." 