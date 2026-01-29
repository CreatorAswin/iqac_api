# AQAR Hub Migration - Quick Start Guide

This is a condensed guide to get you started with the migration from Google Apps Script to MySQL + PHP Backend.

## Prerequisites

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Composer (PHP package manager)
- Apache/Nginx web server

## Quick Setup (30 minutes)

### 1. Database Setup (5 minutes)

```bash
# Create database
mysql -u root -p
CREATE DATABASE aqar_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aqar_hub;

# Run the SQL scripts from implementation_plan.md
# Copy and paste each CREATE TABLE statement
```

### 2. PHP Backend Setup (10 minutes)

```bash
# Create project directory
mkdir aqar-hub-backend
cd aqar-hub-backend

# Initialize Composer
composer init

# Install dependencies
composer require google/apiclient:^2.12
composer require vlucas/phpdotenv:^5.5

# Create directory structure
mkdir -p config includes api/{auth,documents,users,assignments,stats} uploads/temp
```

### 3. Configure Environment (5 minutes)

Create `.env` file:

```env
APP_ENV=development
APP_URL=http://localhost:8000
DB_HOST=localhost
DB_NAME=aqar_hub
DB_USER=root
DB_PASSWORD=your_password
```

### 4. Create File Storage Folder (2 minutes)

```bash
# Create IQAC folder for file storage
mkdir -p IQAC
chmod 755 IQAC

# For Apache
chown www-data:www-data IQAC

# For Nginx
# chown nginx:nginx IQAC
```

### 5. Copy PHP Files

Copy all the PHP files from `LOCAL_FILE_STORAGE.md` to your backend directory:
- `config/database.php`
- `config/config.php`
- `includes/auth.php`
- `includes/file_handler.php`
- `api/documents/upload.php`
- `api/documents/delete.php`
- `index.php`
- `.htaccess`

### 6. Test the Backend

```bash
# Start PHP development server
php -S localhost:8000

# Test in another terminal
curl http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@iqac.edu","password":"admin123"}'
```

### 7. Update Frontend

Update `.env` in your React project:

```env
VITE_PHP_API_URL=http://localhost:8000/api
```

## File Structure Overview

```
aqar-hub-backend/
├── .env                          # Environment configuration
├── composer.json                 # PHP dependencies
├── index.php                     # API router
├── config/
│   ├── database.php             # Database connection
│   └── google_drive.php         # Google Drive service
├── includes/
│   └── auth.php                 # Authentication
└── api/
    ├── auth/login.php
    ├── documents/upload.php
    ├── users/get.php
    └── stats/get.php
```

## Common Issues

### Database Connection Failed
- Check MySQL is running: `sudo systemctl status mysql`
- Verify credentials in `.env`
- Ensure database exists: `SHOW DATABASES;`

### File Upload Failed
- Check IQAC folder permissions: `ls -la IQAC/`
- Ensure folder is writable: `chmod 755 IQAC`
- Check disk space: `df -h`
- Verify file size limits in `config/config.php`

### CORS Errors
- Add your frontend URL to CORS headers in `index.php`
- Check browser console for specific error

## Next Steps

1. Review the local file storage guide: `LOCAL_FILE_STORAGE.md`
2. Run data migration script
3. Test all API endpoints (especially file upload)
4. Update frontend to use new API
5. Deploy to production

## Support

For detailed information, refer to:
- `LOCAL_FILE_STORAGE.md` - Local file storage implementation
- `DATABASE_SCHEMA.sql` - Full database schema
- `API_DOCUMENTATION.md` - API endpoint reference
