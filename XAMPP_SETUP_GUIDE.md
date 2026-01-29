# AQAR Hub - XAMPP Setup Guide

Complete guide for setting up AQAR Hub backend with XAMPP on Windows.

---

## Prerequisites

- XAMPP installed (Download from https://www.apachefriends.org/)
- Your backend folder at `d:\Startup\aqar-hub\backend`

---

## Step-by-Step Setup

### Step 1: Install XAMPP (If Not Installed)

1. Download XAMPP from https://www.apachefriends.org/
2. Install to default location: `C:\xampp`
3. During installation, select:
   - ✅ Apache
   - ✅ MySQL
   - ✅ PHP
   - ✅ phpMyAdmin

### Step 2: Move Backend to XAMPP htdocs

**Option A: Copy to htdocs (Recommended for XAMPP)**

```bash
# Copy backend folder to XAMPP htdocs
xcopy /E /I "d:\Startup\aqar-hub\backend" "C:\xampp\htdocs\aqar-hub-backend"
```

**Option B: Create Virtual Host (Advanced)**

Keep files in current location and create a virtual host (see Step 7 below).

### Step 3: Start XAMPP Services

1. Open **XAMPP Control Panel** (Run as Administrator)
2. Click **Start** for:
   - ✅ Apache
   - ✅ MySQL
3. Wait for both to show green "Running" status

### Step 4: Create Database

**Method 1: Using phpMyAdmin (Easiest)**

1. Open browser and go to: `http://localhost/phpmyadmin`
2. Click **"New"** in the left sidebar
3. Database name: `aqar_hub`
4. Collation: `utf8mb4_unicode_ci`
5. Click **"Create"**

6. Click on `aqar_hub` database
7. Click **"Import"** tab
8. Click **"Choose File"**
9. Select: `d:\Startup\aqar-hub\DATABASE_SCHEMA.sql`
10. Click **"Go"** at the bottom
11. Wait for success message

**Method 2: Using Command Line**

```bash
# Open Command Prompt
cd C:\xampp\mysql\bin

# Login to MySQL
mysql -u root -p
# Press Enter (no password by default)

# Create database
CREATE DATABASE aqar_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aqar_hub;

# Import schema
source d:/Startup/aqar-hub/DATABASE_SCHEMA.sql;

# Exit
exit;
```

### Step 5: Configure Backend Environment

1. Open `C:\xampp\htdocs\aqar-hub-backend\.env` in a text editor

2. Update the configuration:

```env
# Application Environment
APP_ENV=development
APP_URL=http://localhost/aqar-hub-backend

# Database Configuration
DB_HOST=localhost
DB_NAME=aqar_hub
DB_USER=root
DB_PASSWORD=

# Security
JWT_SECRET=your_random_secret_key_here_change_in_production
SESSION_LIFETIME=86400

# CORS - Add your React app URL
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

3. Save the file

### Step 6: Install Composer Dependencies

1. Download Composer from https://getcomposer.org/download/ (if not installed)

2. Open Command Prompt and navigate to backend:

```bash
cd C:\xampp\htdocs\aqar-hub-backend
composer install
```

3. Wait for installation to complete

### Step 7: Configure Apache (Optional - For Custom URL)

If you want to use `http://aqar-hub.local` instead of `http://localhost/aqar-hub-backend`:

**A. Edit Apache Virtual Hosts**

1. Open `C:\xampp\apache\conf\extra\httpd-vhosts.conf`

2. Add at the end:

```apache
<VirtualHost *:80>
    ServerName aqar-hub.local
    DocumentRoot "C:/xampp/htdocs/aqar-hub-backend"
    
    <Directory "C:/xampp/htdocs/aqar-hub-backend">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog "logs/aqar-hub-error.log"
    CustomLog "logs/aqar-hub-access.log" common
</VirtualHost>
```

3. Save the file

**B. Edit Windows Hosts File**

1. Open Notepad as Administrator
2. Open file: `C:\Windows\System32\drivers\etc\hosts`
3. Add at the end:

```
127.0.0.1    aqar-hub.local
```

4. Save the file

**C. Restart Apache**

1. Go to XAMPP Control Panel
2. Click **Stop** for Apache
3. Click **Start** for Apache

4. Now you can access: `http://aqar-hub.local/api/auth/login`

### Step 8: Set Folder Permissions

The IQAC folder needs write permissions:

1. Right-click on `C:\xampp\htdocs\aqar-hub-backend\IQAC`
2. Select **Properties**
3. Go to **Security** tab
4. Click **Edit**
5. Select **Users**
6. Check **Full Control**
7. Click **Apply** → **OK**

### Step 9: Test the Backend

**Test 1: Check if Apache is serving the backend**

Open browser: `http://localhost/aqar-hub-backend/index.php`

You should see:
```json
{
  "success": false,
  "error": "Route not found: GET /index.php",
  "available_routes": [...]
}
```

**Test 2: Test Login API**

Open Command Prompt:

```bash
curl -X POST http://localhost/aqar-hub-backend/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@iqac.edu\",\"password\":\"admin123\"}"
```

Or use Postman:
- URL: `http://localhost/aqar-hub-backend/api/auth/login`
- Method: POST
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "email": "admin@iqac.edu",
  "password": "admin123"
}
```

Expected Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Admin",
    "email": "admin@iqac.edu",
    "role": "Admin",
    "status": "Active"
  },
  "token": "abc123..."
}
```

**Test 3: Test File Upload**

After getting the token from login, test file upload using Postman or the frontend.

### Step 10: Update Frontend Configuration

Update your React app's `.env` file:

```env
# If using default XAMPP path
VITE_PHP_API_URL=http://localhost/aqar-hub-backend/api

# If using virtual host
VITE_PHP_API_URL=http://aqar-hub.local/api
```

---

## Common Issues & Solutions

### Issue 1: Apache Won't Start

**Error**: "Port 80 is already in use"

**Solution**:
1. Open XAMPP Control Panel
2. Click **Config** for Apache
3. Select **httpd.conf**
4. Find line: `Listen 80`
5. Change to: `Listen 8080`
6. Save and restart Apache
7. Access via: `http://localhost:8080/aqar-hub-backend`

### Issue 2: MySQL Won't Start

**Error**: "Port 3306 is already in use"

**Solution**:
1. Check if MySQL service is running in Windows Services
2. Stop the MySQL service
3. Or change XAMPP MySQL port:
   - Config → my.ini
   - Change `port=3306` to `port=3307`
   - Update `.env`: `DB_HOST=localhost:3307`

### Issue 3: 404 Not Found

**Problem**: All API requests return 404

**Solution**:
1. Check if `.htaccess` file exists in backend folder
2. Enable mod_rewrite in Apache:
   - Open `C:\xampp\apache\conf\httpd.conf`
   - Find: `#LoadModule rewrite_module modules/mod_rewrite.so`
   - Remove the `#` to uncomment
   - Save and restart Apache

### Issue 4: File Upload Fails

**Problem**: "Failed to save file" or permission errors

**Solution**:
1. Check IQAC folder permissions (Step 8)
2. Check PHP upload settings:
   - Open `C:\xampp\php\php.ini`
   - Find and update:
     ```ini
     upload_max_filesize = 50M
     post_max_size = 50M
     max_execution_time = 300
     ```
   - Save and restart Apache

### Issue 5: CORS Errors

**Problem**: Frontend can't connect to backend

**Solution**:
1. Check `.env` file has correct `ALLOWED_ORIGINS`
2. Make sure it includes your React app URL
3. Restart Apache after changing `.env`

### Issue 6: Database Connection Failed

**Problem**: "Database connection failed"

**Solution**:
1. Check MySQL is running in XAMPP
2. Verify database exists in phpMyAdmin
3. Check `.env` credentials match MySQL
4. Default XAMPP MySQL:
   - Username: `root`
   - Password: (empty)

---

## Quick Reference

### XAMPP Locations

- **XAMPP Root**: `C:\xampp`
- **htdocs**: `C:\xampp\htdocs`
- **PHP**: `C:\xampp\php`
- **MySQL**: `C:\xampp\mysql`
- **Apache Config**: `C:\xampp\apache\conf`
- **phpMyAdmin**: `http://localhost/phpmyadmin`

### Your Backend URLs

- **API Base**: `http://localhost/aqar-hub-backend/api`
- **Login**: `http://localhost/aqar-hub-backend/api/auth/login`
- **Documents**: `http://localhost/aqar-hub-backend/api/documents`
- **Files**: `http://localhost/aqar-hub-backend/IQAC/...`

### Useful Commands

```bash
# Start XAMPP services
"C:\xampp\xampp-control.exe"

# Access MySQL CLI
C:\xampp\mysql\bin\mysql -u root -p

# View Apache error log
notepad C:\xampp\apache\logs\error.log

# View PHP error log
notepad C:\xampp\php\logs\php_error_log
```

---

## Development Workflow

1. **Start XAMPP**
   - Open XAMPP Control Panel
   - Start Apache and MySQL

2. **Start React Frontend**
   ```bash
   cd d:\Startup\aqar-hub
   npm run dev
   ```

3. **Access Application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost/aqar-hub-backend/api`
   - phpMyAdmin: `http://localhost/phpmyadmin`

4. **View Logs**
   - Apache errors: XAMPP Control Panel → Logs → Apache (error.log)
   - PHP errors: Check `C:\xampp\php\logs\php_error_log`

5. **Stop Services**
   - Click Stop for Apache and MySQL in XAMPP Control Panel

---

## Next Steps After Setup

1. ✅ Test all API endpoints with Postman
2. ✅ Update frontend to use new API URL
3. ✅ Test file upload functionality
4. ✅ Test user login and authentication
5. ✅ Test document management features

---

## Production Deployment (Later)

When ready for production:

1. **Choose Hosting**
   - Shared hosting with cPanel
   - VPS (DigitalOcean, AWS, etc.)
   - Cloud hosting (Heroku, Railway, etc.)

2. **Update Configuration**
   - Change `APP_ENV=production` in `.env`
   - Set strong `JWT_SECRET`
   - Set database password
   - Update `ALLOWED_ORIGINS` to production URL

3. **Security**
   - Enable HTTPS
   - Use strong database password
   - Restrict file permissions
   - Enable firewall

4. **Backup**
   - Set up automated database backups
   - Set up file backups

---

## Support

If you encounter any issues:

1. Check XAMPP error logs
2. Check PHP error logs
3. Verify database connection in phpMyAdmin
4. Test API endpoints with Postman
5. Check browser console for frontend errors

**Happy Coding! 🚀**
