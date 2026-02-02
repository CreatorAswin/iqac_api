# AQAR Hub - Hostinger Deployment Preparation Script
# This script prepares your files for upload to Hostinger

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AQAR Hub - Deployment Preparation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$projectPath = "c:\xampp\htdocs\aqar"
$deploymentPath = "C:\deployment\aqar"

# Step 1: Check if project exists
Write-Host "[1/6] Checking project directory..." -ForegroundColor Yellow
if (-Not (Test-Path $projectPath)) {
    Write-Host "ERROR: Project not found at $projectPath" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Project found" -ForegroundColor Green

# Step 2: Build frontend
Write-Host ""
Write-Host "[2/6] Building React frontend..." -ForegroundColor Yellow
Set-Location $projectPath
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend built successfully" -ForegroundColor Green

# Step 3: Create deployment directory
Write-Host ""
Write-Host "[3/6] Creating deployment directory..." -ForegroundColor Yellow
if (Test-Path $deploymentPath) {
    Remove-Item -Path $deploymentPath -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $deploymentPath | Out-Null
New-Item -ItemType Directory -Force -Path "$deploymentPath\api" | Out-Null
New-Item -ItemType Directory -Force -Path "$deploymentPath\uploads" | Out-Null
Write-Host "✓ Deployment directory created" -ForegroundColor Green

# Step 4: Copy frontend files
Write-Host ""
Write-Host "[4/6] Copying frontend files..." -ForegroundColor Yellow
Copy-Item -Path "$projectPath\dist\*" -Destination $deploymentPath -Recurse -Force
Write-Host "✓ Frontend files copied" -ForegroundColor Green

# Step 5: Copy backend files
Write-Host ""
Write-Host "[5/6] Copying backend files..." -ForegroundColor Yellow
Copy-Item -Path "$projectPath\backend\*" -Destination "$deploymentPath\api" -Recurse -Force

# Exclude unnecessary files
Remove-Item -Path "$deploymentPath\api\.env.development" -ErrorAction SilentlyContinue
Remove-Item -Path "$deploymentPath\api\.env.local" -ErrorAction SilentlyContinue

Write-Host "✓ Backend files copied to 'api' folder" -ForegroundColor Green

# Step 6: Create frontend .htaccess
Write-Host ""
Write-Host "[6/6] Creating .htaccess files..." -ForegroundColor Yellow

$frontendHtaccess = @"
# Enable HTTPS redirect
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# React Router - Redirect all to index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Prevent directory listing
Options -Indexes

# Protect sensitive files
<FilesMatch "\.(env|sql|md|json)$">
    Order allow,deny
    Deny from all
</FilesMatch>
"@

Set-Content -Path "$deploymentPath\.htaccess" -Value $frontendHtaccess
Write-Host "✓ .htaccess files created" -ForegroundColor Green

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deployment Package Ready!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Location: $deploymentPath" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANT NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Update $deploymentPath\api\.env with:" -ForegroundColor White
Write-Host "   - Database: u336570575_aqar" -ForegroundColor Gray
Write-Host "   - Username: u336570575_admin" -ForegroundColor Gray
Write-Host "   - Password: [Your Hostinger password]" -ForegroundColor Gray
Write-Host "   - JWT_SECRET: [Generate at randomkeygen.com]" -ForegroundColor Gray
Write-Host "   - Your subdomain URL" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Upload contents of $deploymentPath to:" -ForegroundColor White
Write-Host "   /public_html/aqar/ on Hostinger" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Set folder permissions:" -ForegroundColor White
Write-Host "   - uploads/ folder: 755 or 777" -ForegroundColor Gray
Write-Host "   - api/.env file: 644" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to open deployment folder..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Start-Process "explorer.exe" -ArgumentList $deploymentPath
