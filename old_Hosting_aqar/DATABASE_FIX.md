# 🔧 Database Connection Fix

## Problem
"Database connection failed" error

## ✅ Solutions (Try in Order)

### Solution 1: Import Database Schema

The database exists but has no tables yet.

1. **Login to Hostinger** → **Databases** → **phpMyAdmin**
2. **Select database**: `u336570575_aqar`
3. Click **Import** tab
4. Click **Choose File**
5. Select: `Hosting_aqar/api/DATABASE_SCHEMA.sql`
6. Click **Go**
7. **Verify**: You should see tables: `users`, `documents`, `assignments`, `sessions`

### Solution 2: Fix Password Escaping

The password has a `$` character that might need escaping.

**I've already updated the `.env` file** with escaped password:
```
DB_PASSWORD="XipYF3G5Ia\$2"
```

**Re-upload** `Hosting_aqar/api/.env` to server.

### Solution 3: Try Different DB_HOST

Sometimes `localhost` doesn't work on shared hosting.

Edit `.env` on server, try:
```
DB_HOST=127.0.0.1
```

### Solution 4: Verify Database Exists

1. Login to Hostinger → **Databases** → **MySQL Databases**
2. Check if `u336570575_aqar` exists
3. If not, create it:
   - Database name: `aqar` (Hostinger adds prefix automatically)
   - Click **Create**

---

## 🧪 Test After Each Fix

Visit: https://aqar.winiksolutions.com/api/test-login.php

Look for:
- `"database_connection": "success"` ✅

Then try login:
- https://aqar.winiksolutions.com
- Email: `admin@iqac.edu`
- Password: `admin123`

---

## 📋 Most Likely Issue

**Database tables don't exist yet!**

You need to import `DATABASE_SCHEMA.sql` via phpMyAdmin (Solution 1).

This will create:
- `users` table (with default admin user)
- `documents` table
- `assignments` table  
- `sessions` table
