$sqlContent = Get-Content -Path "init.sql" -Raw
$sqlContent | docker exec -i license-plate-postgres psql -U postgres -d BTL_THPTHT 