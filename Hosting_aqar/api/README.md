# AQAR Hub Backend

PHP REST API backend for AQAR Hub document management system.

## Features

- RESTful API design
- Token-based authentication
- Local file storage in IQAC folder
- MySQL database
- Role-based access control
- Comprehensive error handling

## Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache/Nginx web server
- Composer

## Installation

1. **Install Dependencies**
   ```bash
   composer install
   ```

2. **Configure Environment**
   - Copy `.env` file and update with your settings
   - Set database credentials
   - Update `APP_URL` to match your server

3. **Set Permissions**
   ```bash
   chmod 755 IQAC
   chown www-data:www-data IQAC  # For Apache
   ```

4. **Create Database**
   - Run the SQL script from `../DATABASE_SCHEMA.sql`

5. **Start Server**
   ```bash
   # Development
   php -S localhost:8000
   
   # Production: Configure Apache/Nginx to point to this directory
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify token

### Documents
- `GET /api/documents` - List documents
- `POST /api/documents/upload` - Upload document
- `PUT /api/documents/update_status` - Update status
- `DELETE /api/documents/delete` - Delete document

### Users (Admin only)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users` - Update user
- `DELETE /api/users` - Delete user

### Assignments (Admin only)
- `GET /api/assignments` - List assignments
- `POST /api/assignments` - Create assignment
- `DELETE /api/assignments` - Delete assignment

### Statistics
- `GET /api/stats` - Get system statistics

## File Structure

```
backend/
├── config/
│   ├── database.php      # Database connection
│   └── config.php        # App configuration
├── includes/
│   ├── auth.php          # Authentication
│   ├── file_handler.php  # File operations
│   └── cors.php          # CORS handling
├── api/
│   ├── auth/             # Auth endpoints
│   ├── documents/        # Document endpoints
│   ├── users/            # User endpoints
│   ├── assignments/      # Assignment endpoints
│   └── stats/            # Statistics endpoints
├── IQAC/                 # File storage
├── .env                  # Environment config
├── .htaccess             # Apache config
├── composer.json         # Dependencies
└── index.php             # Main router
```

## Security

- Password hashing with bcrypt
- Token-based session management
- SQL injection protection (PDO prepared statements)
- File type validation
- CORS configuration
- Protected sensitive files

## Testing

```bash
# Test login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@iqac.edu","password":"admin123"}'

# Test with token
curl -X GET http://localhost:8000/api/documents \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## License

Proprietary
