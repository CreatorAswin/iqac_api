# Browser Console Diagnostic Script

## Test API Calls Directly from Browser Console

Open your production dashboard (`https://aqar.winiksolutions.com`), login, then open browser console (F12) and run these commands:

### 1. Check if Token Exists
```javascript
console.log('Token:', localStorage.getItem('iqac_token'));
console.log('User:', JSON.parse(localStorage.getItem('iqac_user') || '{}'));
```

### 2. Test Documents API Call
```javascript
const token = localStorage.getItem('iqac_token');
const apiUrl = 'https://aqar.winiksolutions.com/api/documents';

fetch(apiUrl, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('Response Status:', response.status);
  console.log('Response Headers:', [...response.headers.entries()]);
  return response.json();
})
.then(data => {
  console.log('API Response:', data);
  console.log('Success:', data.success);
  console.log('Data Length:', data.data?.length || 0);
  if (data.data && data.data.length > 0) {
    console.log('First Document:', data.data[0]);
  }
})
.catch(error => {
  console.error('Error:', error);
});
```

### 3. Test with Debug Mode
```javascript
const token = localStorage.getItem('iqac_token');
const apiUrl = 'https://aqar.winiksolutions.com/api/documents?debug=true';

fetch(apiUrl, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  console.log('Debug Response:', JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error('Error:', error);
});
```

## What to Look For

### If you see:
- **Status 401**: Authentication failed - token is invalid or expired
- **Status 500**: Server error - check backend logs
- **Status 200 but data is empty**: Database has no documents OR query filters are too restrictive
- **CORS error**: CORS configuration issue
- **Network error**: Backend is not accessible

### Expected Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "date": "2026-02-03",
      "criteria": "1",
      "subCriteria": "1.1.1",
      "facultyName": "Aswini Kumar",
      "facultyId": "aswinikumar@example.com",
      ...
    }
  ]
}
```

## Quick Fixes

### If Token is Missing/Invalid:
1. Logout and login again
2. Check if login is working correctly

### If CORS Error:
1. Check `.env` file has correct `ALLOWED_ORIGINS`
2. Verify CORS headers are being sent

### If Empty Data:
1. Run diagnostic script: `https://aqar.winiksolutions.com/api/test-get-documents.php`
2. Check if database actually has documents
3. Check if `faculty_id` in database matches user email
