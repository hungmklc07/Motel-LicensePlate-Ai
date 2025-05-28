@echo off

echo ===== Rebuilding and restarting the license plate recognition system =====

echo Stopping containers...
docker stop license-plate-frontend-admin license-plate-backend-db license-plate-postgres

echo Removing containers...
docker rm license-plate-frontend-admin license-plate-backend-db license-plate-postgres

echo Building new containers...
docker-compose build

echo Starting the system...
docker-compose up -d

echo System has been rebuilt and restarted!
echo You can access the application at http://localhost 