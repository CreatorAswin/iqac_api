#!/usr/bin/env pwsh
# deploy.ps1 - Deployment script for AQAR Hub Production Environment

Write-Host "AQAR Hub Deployment Script" -ForegroundColor Green
Write-Host "===========================" -ForegroundColor Green

# Check if running on Windows
$isWindows = $true

Write-Host "`n1. Preparing deployment directories..." -ForegroundColor Yellow
Set-Location Hosting

Write-Host "2. Configuring backend for production..." -ForegroundColor Yellow
# Ensure the backend has the correct configuration for production
$backendEnvPath = "backend/.env"
if (Test-Path $backendEnvPath) {
    Write-Host "   Backend .env file exists" -ForegroundColor Green
} else {
    Write-Host "   Creating backend .env file..." -ForegroundColor Cyan
    @"
APP_ENV=production
APP_URL=http://your-domain.com/backend
DB_HOST=localhost
DB_NAME=aqar_hub
DB_USER=your_db_username
DB_PASSWORD=your_db_password
SESSION_LIFETIME=86400
JWT_SECRET=your_production_jwt_secret
ALLOWED_ORIGINS=http://your-domain.com,https://your-domain.com
"@ | Out-File -FilePath $backendEnvPath -Encoding UTF8
}

Write-Host "3. Ensuring IQAC directory permissions..." -ForegroundColor Yellow
$iqacPath = "IQAC"
if (Test-Path $iqacPath) {
    Write-Host "   IQAC directory exists" -ForegroundColor Green
} else {
    Write-Host "   Creating IQAC directory..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $iqacPath -Force
}

Write-Host "4. Setting up file permissions..." -ForegroundColor Yellow
# Create .htaccess in IQAC if needed
$iqacHtaccess = Join-Path $iqacPath ".htaccess"
if (-not (Test-Path $iqacHtaccess)) {
    Write-Host "   Creating IQAC .htaccess file..." -ForegroundColor Cyan
    Copy-Item "../backend/IQAC/.htaccess" $iqacHtaccess -Force
}

Write-Host "5. Verifying frontend configuration..." -ForegroundColor Yellow
$frontendIndexPath = "frontend/index.html"
if (Test-Path $frontendIndexPath) {
    Write-Host "   Frontend build files verified" -ForegroundColor Green
} else {
    Write-Host "   ERROR: Frontend build files not found!" -ForegroundColor Red
    exit 1
}

Write-Host "`nDeployment preparation complete!" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green
Write-Host "Next steps:"
Write-Host "1. Upload the 'frontend' folder contents to your web server root"
Write-Host "2. Upload the 'backend' folder to your backend server location (e.g., /var/www/html/aqar/backend)"
Write-Host "3. Upload the 'IQAC' folder to the same level as backend (or configure UPLOAD_DIR accordingly)"
Write-Host "4. Update the database configuration in backend/.env"
Write-Host "5. Import DATABASE_SCHEMA.sql to create the database tables"
Write-Host "6. Set proper file permissions (755 for directories, 644 for files)"
Write-Host ""
Write-Host "For Apache servers, make sure mod_rewrite is enabled for the backend routing to work."