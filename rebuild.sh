#!/bin/bash

echo "===== Rebuilding and restarting the license plate recognition system ====="

echo "Stopping containers..."
docker stop license-plate-frontend-admin license-plate-backend-db postgresdb

echo "Removing containers..."
docker rm license-plate-frontend-admin license-plate-backend-db postgresdb

echo "Building new containers..."
docker-compose build

echo "Starting the system..."
docker-compose up -d

echo "System has been rebuilt and restarted!"
echo "You can access the application at http://localhost"
echo "Waiting for database to be ready..."
sleep 10

echo "Fixing missing tables and columns..."
cat db/sql/fix-missing-tables.sql | docker exec -i postgresdb psql -U postgres -d BTL_THPTHT

echo "Adding sample buildings data..."
cat db/sql/btl-sample-data-modified.sql | docker exec -i postgresdb psql -U postgres -d BTL_THPTHT

echo "Adding vehicle data..."
cat db/sql/fix-vehicles-data.sql | docker exec -i postgresdb psql -U postgres -d BTL_THPTHT

echo "Adding user accounts..."
cat db/sql/add-users.sql | docker exec -i postgresdb psql -U postgres -d BTL_THPTHT

echo "Fixing database structure to match code requirements..."
cat db/sql/fix-database-structure.sql | docker exec -i postgresdb psql -U postgres -d BTL_THPTHT

echo "Adding sample alerts data..."
cat db/sql/add-sample-alerts.sql | docker exec -i postgresdb psql -U postgres -d BTL_THPTHT

echo "Restarting backend to apply changes..."
docker restart license-plate-backend-db

echo "Done! The system is now ready with sample data!" 