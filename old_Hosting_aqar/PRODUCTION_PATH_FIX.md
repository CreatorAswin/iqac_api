# Production Database Path Fix - Instructions

## Problem
The production database at `https://aqar.winiksolutions.com` has documents with incorrect URLs and file paths from the development environment.

## Solution Steps

### Step 1: Access Hostinger Database
1. Log in to your Hostinger control panel
2. Go to **Databases** → **phpMyAdmin**
3. Select database: `u336570575_aqar`

### Step 2: Run the SQL Update Script
1. Click on the **SQL** tab in phpMyAdmin
2. Copy and paste the contents of `fix_production_paths.sql`
3. Click **Go** to execute

### Step 3: Verify the Changes
After running the script, you should see:
- `document_url` updated to: `https://aqar.winiksolutions.com/IQAC/...`
- `file_path` updated to: `/home/u336570575/domains/winiksolutions.com/public_html/aqar/IQAC/...`

### Step 4: Move Physical Files (if needed)
If you have existing uploaded files in the wrong location, you need to move them:

**Current location (wrong):**
```
/home/u336570575/domains/winiksolutions.com/public_html/aqar/api/IQAC/
```

**Correct location:**
```
/home/u336570575/domains/winiksolutions.com/public_html/aqar/IQAC/
```

Use Hostinger File Manager or FTP to move the files.

### Step 5: Test
1. Go to `https://aqar.winiksolutions.com`
2. Login and check the dashboard
3. Documents should now be visible with correct counts

## SQL Script Location
The SQL script is located at:
`Hosting_aqar/fix_production_paths.sql`

## Notes
- The script uses `SUBSTRING_INDEX` to extract just the filename from existing paths
- It rebuilds the full URL/path using the correct production structure
- All existing documents will be updated automatically

## New Uploads
**Good news!** The upload.php file is already configured correctly for production:
- ✅ `.env` file has correct `APP_URL=https://aqar.winiksolutions.com`
- ✅ Upload directory path goes up 3 levels to reach IQAC folder
- ✅ New uploads will automatically use correct production URLs and paths

**After running the SQL fix:**
- Existing documents will display correctly
- New uploads will continue to work with correct paths
