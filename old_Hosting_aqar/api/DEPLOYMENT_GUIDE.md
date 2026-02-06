# Deployment Instructions for Hostinger

## Files to Upload

Upload the following files from `Hosting_aqar/api/` to your Hostinger server:

### 1. Updated Main File
- **File**: `api/documents/get.php`
- **Location on Hostinger**: `public_html/api/api/documents/get.php`
- **Changes**: Enhanced error handling, debug mode, detailed logging

### 2. Diagnostic Script
- **File**: `test-get-documents.php`
- **Location on Hostinger**: `public_html/api/test-get-documents.php`
- **Purpose**: Test database connection and document retrieval

## Testing Steps

### Step 1: Test Diagnostic Script
1. Upload `test-get-documents.php` to Hostinger
2. Access: `https://aqar.winiksolutions.com/api/test-get-documents.php`
3. Check the JSON output for:
   - ✅ `database.connection: "SUCCESS"`
   - ✅ `documents.total_count: <number>`
   - ✅ Sample documents displayed

### Step 2: Test GET Endpoint with Debug Mode
1. Upload the updated `get.php` to Hostinger
2. Login to your dashboard to get an authentication token
3. Test the endpoint with debug mode:
   ```
   https://aqar.winiksolutions.com/api/documents?debug=true
   ```
4. Check the response for:
   - ✅ `success: true`
   - ✅ `data: [...]` with documents
   - ✅ `debug` section showing query details

### Step 3: Test Normal Operation
1. Remove `?debug=true` from the URL
2. Test: `https://aqar.winiksolutions.com/api/documents`
3. Verify documents are returned correctly

### Step 4: Test in Dashboard
1. Open your dashboard: `https://aqar.winiksolutions.com`
2. Login with your credentials
3. Navigate to the documents page
4. Verify documents are displayed

## Troubleshooting

### If Diagnostic Script Shows Database Error
**Problem**: Database connection failed  
**Solution**: 
1. Check `.env` file has correct credentials
2. Verify database name, username, password
3. Ensure database exists on Hostinger

### If Authentication Fails
**Problem**: `error: "Unauthorized"`  
**Solution**:
1. Check if login works correctly
2. Verify token is being sent in Authorization header
3. Check browser console for CORS errors

### If No Documents Returned
**Problem**: `data: []` (empty array)  
**Solution**:
1. Check if documents exist in database
2. Run diagnostic script to verify data
3. Check filters being applied (facultyId, status, etc.)

## Debug Mode Usage

The enhanced `get.php` now supports debug mode. Add `?debug=true` to any request:

```
GET /api/documents?debug=true
GET /api/documents?facultyId=123&debug=true
GET /api/documents?status=Pending&debug=true
```

Debug mode returns additional information:
- Authentication details
- Database connection status
- Query SQL and parameters
- Number of documents found
- Sample document data

**IMPORTANT**: Remove `?debug=true` in production after troubleshooting!

## What Changed in get.php

1. **Enhanced Error Logging**: All errors are now logged with detailed stack traces
2. **Debug Mode**: Optional debug parameter shows detailed execution info
3. **Better Error Handling**: Separate handling for PDO and general exceptions
4. **Success Logging**: Logs successful queries with document count
5. **Detailed Error Responses**: More informative error messages

## Next Steps

1. Upload the updated files to Hostinger
2. Run the diagnostic script first
3. Share the diagnostic output if issues persist
4. Test the dashboard to confirm documents are showing
