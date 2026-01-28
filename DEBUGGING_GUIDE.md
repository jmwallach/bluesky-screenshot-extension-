# Debugging Guide for Bluesky Screenshot Extension

## Step 1: Open Chrome DevTools

### For Background Script (Service Worker)
1. Go to `chrome://extensions`
2. Find "Bluesky Screenshot Poster"
3. Click the blue "service worker" link (or "Inspect views: service worker")
4. This opens DevTools for the background script

### For Content Script (on the webpage)
1. Go to any webpage where you're testing
2. Right-click on the page → "Inspect" or press F12
3. This opens DevTools for the content script

## Step 2: Test the Extension

1. Highlight some text on a webpage
2. Right-click → "Post to Bluesky"
3. Watch the console for messages

## Step 3: Check for Errors

### In Background Script Console:
Look for:
- ❌ Red error messages
- ⚠️ Yellow warnings
- ✅ "Bluesky Screenshot Extension background script loaded" (should see on load)

### In Content Script Console:
Look for:
- ❌ Red error messages about fetch, authentication, or network
- ✅ "Bluesky Screenshot Extension content script loaded" (should see on page load)
- 🔍 Any messages about posting to Bluesky

## Step 4: Check Network Requests

### In Content Script DevTools:
1. Click the **Network** tab
2. Highlight text and try to post
3. Look for these requests:

**Should see 3 requests to bsky.social:**

1. **createSession** (Authentication)
   - URL: `https://bsky.social/xrpc/com.atproto.server.createSession`
   - Method: POST
   - Status: Should be **200 OK**
   - If **401**: Wrong credentials
   - If **429**: Rate limited
   - Response should contain `accessJwt` and `did`

2. **uploadBlob** (Image Upload)
   - URL: `https://bsky.social/xrpc/com.atproto.repo.uploadBlob`
   - Method: POST
   - Status: Should be **200 OK**
   - Response should contain `blob` object with `ref` and `mimeType`

3. **createRecord** (Create Post)
   - URL: `https://bsky.social/xrpc/com.atproto.repo.createRecord`
   - Method: POST
   - Status: Should be **200 OK**
   - Response should contain `uri` and `cid` (the post ID)

### To Inspect a Request:
1. Click on the request name
2. Go to **Headers** tab to see request details
3. Go to **Response** tab to see what the server returned
4. Go to **Payload** tab to see what was sent

## Step 5: Common Issues to Check

### Authentication Failed (401)
**In Network → createSession → Response:**
```json
{
  "error": "AuthenticationRequired",
  "message": "Invalid identifier or password"
}
```
**Fix**: 
- Check credentials in extension settings
- Make sure you're using an **app password**, not your main password
- Verify handle doesn't have @ symbol
- Try the "Test Connection" button in settings

### Rate Limited (429)
**In Network → uploadBlob or createRecord → Response:**
```json
{
  "error": "RateLimitExceeded"
}
```
**Fix**: Wait a few minutes before trying again

### CORS Error
**In Console:**
```
Access to fetch at 'https://bsky.social/...' from origin 'https://example.com' 
has been blocked by CORS policy
```
**Fix**: This shouldn't happen since we're in a content script, but if it does, the extension needs to be updated

### Image Upload Failed
**In Network → uploadBlob:**
- Status: 400 or 500
**Check**:
- Is the screenshot actually captured? (should see data in the request)
- Is the image too large? (>1MB might cause issues)

### Post Creation Failed
**In Network → createRecord:**
- Status: 400
**Check Response** for error details:
```json
{
  "error": "InvalidRequest",
  "message": "..."
}
```

## Step 6: Enable Verbose Logging

I'll create an updated version with more console logging. For now, you can manually add logs:

1. Go to `chrome://extensions`
2. Find the extension
3. Click "Remove"
4. Edit `content.js` and add console.log statements:

```javascript
// Add after line ~145 (in postToBluesky function)
console.log('Starting authentication...');

// Add after line ~157 (after auth response)
console.log('Authentication successful, accessJwt:', accessJwt);

// Add after line ~172 (after upload response)
console.log('Image uploaded successfully, blob:', blob);

// Add after line ~193 (after create post)
console.log('Post created successfully!');
```

5. Load the extension again

## Step 7: What to Report

If you're still having issues, please provide:

1. **Console errors** from both background and content script
2. **Network requests** - screenshot of the Network tab showing the 3 bsky.social requests
3. **Status codes** for each request (200, 401, 429, etc.)
4. **Response bodies** from failed requests (especially error messages)
5. **What page** you were testing on

## Quick Test Checklist

Run through this checklist:

- [ ] Extension loaded without errors in `chrome://extensions`
- [ ] Credentials saved and "Test Connection" shows success
- [ ] Content script loads on test page (check console)
- [ ] Background script is running (check service worker)
- [ ] Highlight text → right-click shows "Post to Bluesky" option
- [ ] Click "Post to Bluesky" → no immediate errors
- [ ] Check Network tab for the 3 requests to bsky.social
- [ ] All 3 requests return status 200
- [ ] Success notification appears
- [ ] Check Bluesky account for new post

## Testing the API Directly

You can test if the API is working with your credentials:

### Open DevTools Console on any page:
```javascript
// Test authentication
fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    identifier: 'your-handle.bsky.social',  // Replace with your handle
    password: 'your-app-password'            // Replace with your app password
  })
})
.then(r => r.json())
.then(data => console.log('Auth response:', data))
.catch(err => console.error('Auth error:', err));
```

If this works, you should see:
```json
{
  "did": "did:plc:...",
  "handle": "your-handle.bsky.social",
  "email": "...",
  "accessJwt": "...",
  "refreshJwt": "..."
}
```

If it fails, you'll see the error.

## Need More Help?

Let me know what you find and I'll help troubleshoot further!
