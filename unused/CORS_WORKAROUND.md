# AQAR Hub - Direct Google Apps Script Integration

## Important Notice: CORS Solution Implemented

**The application has been updated to work directly with Google Apps Script without CORS issues.** The modifications now use techniques from a working example that successfully communicates with Google Apps Script directly from the browser.

## Key Changes Made:

1. **Content-Type Header**: Changed from `application/json` to `text/plain;charset=utf-8` which is required by Google Apps Script
2. **JSON Payload**: Sending JSON as stringified body instead of form data
3. **Google Apps Script Updates**: The backend now handles both JSON and form data formats

## How It Works:

The application now uses the same approach as the working old project:
- Uses `Content-Type: text/plain;charset=utf-8` for POST requests
- Sends JSON payload as stringified body
- Google Apps Script is configured to accept requests from your deployment origin

## Testing the Connection:

The application should now connect directly to Google Apps Script without requiring a proxy server.

1. Make sure your `.env` file points to your deployed Google Apps Script:
```
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

2. Run your React app:
```bash
npm run dev
```

## If Issues Persist:

If you still encounter CORS issues, you can use one of these approaches:

### Option 1: Chrome Extension (Development Only)
For development/testing purposes, you can use a CORS disabling extension in Chrome:
1. Install the "CORS Unblock" extension from Chrome Web Store
2. Enable it when developing locally
3. This is NOT suitable for production

### Option 2: Deploy Your Own Proxy (If Needed)
If direct connection doesn't work in your environment, you can deploy a simple proxy on a platform like:
- Vercel
- Netlify Functions
- Railway
- Heroku

## Updated Google Apps Script

The Google Apps Script (`appscript.gs`) has been updated to handle both JSON and form data inputs, making it compatible with direct browser requests.

## Summary

The application is now configured to work directly with Google Apps Script using proven techniques from the working example. This eliminates the need for a proxy server while maintaining reliable communication with Google's services.