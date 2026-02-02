# 📦 AQAR Hub - Production Deployment Package

## ✅ Ready to Upload!

This folder contains **everything** you need to deploy to Hostinger.

---

## 📁 What's Inside

```
Hosting_aqar/
├── index.html              ← React app
├── vite.svg               ← Favicon  
├── .htaccess              ← Frontend routing
├── assets/                ← Built JS, CSS, images
│
├── api/                   ← Complete Backend (PHP)
│   ├── .env              ← ✅ Production config (ready!)
│   ├── .htaccess         ← ✅ API routing (fixed!)
│   ├── index.php
│   ├── includes/         ← ✅ Core classes
│   ├── api/              ← ✅ All endpoints
│   ├── config/           ← ✅ Configuration
│   └── DATABASE_SCHEMA.sql
│
└── uploads/               ← Empty folder for files
```

---

## 🚀 Upload Instructions

### Step 1: Login to Hostinger
1. Go to https://hpanel.hostinger.com
2. Click **Files** → **File Manager**

### Step 2: Navigate to Your Subdomain
1. Go to `/public_html/aqar/`
2. **Delete everything** in this folder (if anything exists)

### Step 3: Upload ALL Files
1. Click **Upload Files**
2. **Select ALL files and folders** from `Hosting_aqar/`
3. Drag and drop into File Manager
4. Wait for upload to complete

### Step 4: Set Permissions
1. Right-click `uploads/` folder
2. Set permissions to **755**
3. Click Apply

---

## 🧪 Testing

After upload, test these URLs:

1. **Frontend**: https://aqar.winiksolutions.com
   - Should show login page

2. **API Health**: https://aqar.winiksolutions.com/api/health
   - Should return: `{"status":"ok","message":"API is running"}`

3. **Login**:
   - Email: `admin@iqac.edu`
   - Password: `admin123`
   - Should redirect to dashboard ✅

---

## ✅ What's Already Configured

- ✅ Domain: `https://aqar.winiksolutions.com`
- ✅ Database: `u336570575_aqar`
- ✅ Username: `u336570575_admin`
- ✅ Password: `XipYF3G5Ia$2`
- ✅ JWT Secret: Generated and secure
- ✅ API URL: Correct in frontend build
- ✅ .htaccess: Fixed for subdomain
- ✅ CORS: Configured for your domain

**Everything is ready - just upload and test!** 🎯

---

## 📋 Upload Checklist

- [ ] Logged into Hostinger File Manager
- [ ] Navigated to `/public_html/aqar/`
- [ ] Deleted old files (if any)
- [ ] Uploaded ALL contents of `Hosting_aqar/`
- [ ] Set `uploads/` folder to 755
- [ ] Tested frontend loads
- [ ] Tested API health endpoint
- [ ] Tested login works

---

## 🆘 If Something Doesn't Work

1. **Check PHP version**: Should be 7.4 or higher
   - hPanel → Advanced → PHP Configuration

2. **Enable mod_rewrite**: Required for .htaccess
   - Contact Hostinger support if needed

3. **Check error logs**: hPanel → Advanced → Error Logs

4. **Clear browser cache**: Ctrl + Shift + Delete

---

**This package is complete and production-ready!** 🚀
