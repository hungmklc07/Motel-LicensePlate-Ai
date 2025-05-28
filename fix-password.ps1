$sqlContent = Get-Content -Path "fix-password.sql" -Raw
$sqlContent | docker exec -i license-plate-postgres psql -U postgres -d BTL_THPTHT 