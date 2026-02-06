# AQAR Hub - Production Deployment

## Directory Structure
```
Hosting/
├── assets/       # Compiled CSS and JS files
├── index.html    # Main HTML file
├── backend/      # PHP API backend
└── IQAC/         # File storage directory
```

## Deployment Instructions

### Option 1: Same Server Deployment
If deploying to the same server with a subdirectory structure:
1. Place `assets/`, `index.html` and other static files in your web root (e.g., `/var/www/html/`)
2. Place `backend/` in a subdirectory (e.g., `/var/www/html/aqar/backend/`)
3. Place `IQAC/` at the same level as backend (e.g., `/var/www/html/IQAC/`)

### Option 2: Separate Server Deployment
If deploying frontend and backend on separate servers:
1. Deploy `assets/`, `index.html` and other static files to your web server
2. Deploy `backend/` to your API server
3. Ensure `IQAC/` is accessible to the backend server

## Configuration Steps

1. **Update Backend Environment Variables** (`backend/.env`):
   - Set `APP_URL` to your backend URL (e.g., `https://yourdomain.com/aqar/backend`)
   - Configure database settings:
     ```
     DB_HOST=localhost
     DB_NAME=your_database_name
     DB_USER=your_database_user
     DB_PASSWORD=your_database_password
     ```
   - Set `ALLOWED_ORIGINS` to your frontend domain(s)

2. **Import Database Schema**:
   - Import `backend/DATABASE_SCHEMA.sql` to create the required tables

3. **Set File Permissions**:
   - Directories: 755
   - Files: 644
   - Ensure the web server has write permissions to the IQAC directory

4. **Web Server Configuration**:
   - For Apache: Ensure `mod_rewrite` is enabled for the backend routing
   - For Nginx: Configure appropriate rewrite rules

## Post-Deployment Checks

- Verify the backend API is accessible at your configured endpoint
- Test file uploads and downloads
- Confirm user authentication works
- Check that all dashboard features function properly

## Troubleshooting

- If API calls fail, verify CORS settings in `backend/config/config.php`
- If file uploads fail, check permissions on the IQAC directory
- If pages don't load, verify the web server configuration and `.htaccess` files