# XAMPP Quick Start - 5 Minutes ⚡

Fast setup guide for AQAR Hub with XAMPP.

## 1. Copy Backend to XAMPP (1 min)

```bash
xcopy /E /I "d:\Startup\aqar-hub\backend" "C:\xampp\htdocs\aqar-hub-backend"
```

## 2. Start XAMPP (30 sec)

1. Open **XAMPP Control Panel** (as Administrator)
2. Click **Start** for Apache and MySQL

## 3. Create Database (2 min)

1. Open: `http://localhost/phpmyadmin`
2. Click **"New"** → Database name: `aqar_hub` → Create
3. Click **"Import"** → Choose `DATABASE_SCHEMA.sql` → Go

## 4. Configure Backend (1 min)

Edit `C:\xampp\htdocs\aqar-hub-backend\.env`:

```env
APP_URL=http://localhost/aqar-hub-backend
DB_HOST=localhost
DB_NAME=aqar_hub
DB_USER=root
DB_PASSWORD=
ALLOWED_ORIGINS=http://localhost:5173
```

## 5. Install Dependencies (30 sec)

```bash
cd C:\xampp\htdocs\aqar-hub-backend
composer install
```

## 6. Test API (30 sec)

Open browser: `http://localhost/aqar-hub-backend/api/auth/login`

Or test with curl:
```bash
curl -X POST http://localhost/aqar-hub-backend/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@iqac.edu\",\"password\":\"admin123\"}"
```

## 7. Update Frontend (.env)

```env
VITE_PHP_API_URL=http://localhost/aqar-hub-backend/api
```

## Done! 🎉

- Backend: `http://localhost/aqar-hub-backend/api`
- phpMyAdmin: `http://localhost/phpmyadmin`
- Frontend: `npm run dev` → `http://localhost:5173`

---

**Need Help?** See full guide: `XAMPP_SETUP_GUIDE.md`
