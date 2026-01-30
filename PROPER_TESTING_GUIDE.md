# Proper Testing Guide for Bluesky Extension

## ❌ The Problem

Your log shows you tested on **claude.ai** - the extension won't work properly there because:
1. Claude.ai is a complex web app with its own scripts
2. The content script might not inject properly
3. It's not a typical webpage

## ✅ Where to Test

Test on a **simple, regular website** like:
- https://example.com
- https://news.ycombinator.com
- https://www.wikipedia.org
- Any blog or news site
- **Bluesky.app itself** (https://bsky.app)

## 📝 Step-by-Step Testing

### 1. Go to a Test Page
```
Open: https://example.com
```

### 2. Open DevTools
```
Press F12 or Right-click → Inspect
Click the "Console" tab
```

### 3. Check Extension Loaded
You should see:
```
Bluesky Screenshot Extension content script loaded
```

If you don't see this, the content script isn't loading. Try:
- Refreshing the page (F5)
- Checking chrome://extensions to make sure it's enabled

### 4. Highlight Text and Post
1. Highlight some text on the page (like "Example Domain")
2. Right-click → "Post to Bluesky"
3. **Watch the console**

### 5. What You Should See

#### ✅ Success Looks Like:
```
📐 Starting crop and post process...
Region: {x: 234, y: 156, width: 245, height: 28}
Selected text: Example Domain
Image loaded: 1920 x 1080
Canvas size: 490 x 56
Device pixel ratio: 2
Cropped image size: 12345 characters
Retrieved credentials from storage
🔵 Starting Bluesky post process...
Alt text length: 14
Identifier: yourhandle.bsky.social
🔐 Authenticating with Bluesky...
Auth response status: 200
✅ Authentication successful!
DID: did:plc:xxxxx
📸 Converting screenshot to blob...
Image size: 4567 bytes
Image type: image/png
⬆️ Uploading image to Bluesky...
Upload response status: 200
✅ Image uploaded successfully!
Blob ref: {link: "..."}
📝 Creating post...
Post payload: {...}
Post response status: 200
✅ Post created successfully!
Post URI: at://did:plc:.../app.bsky.feed.post/...
Post CID: bafyrei...
🎉 Done! Check your Bluesky profile.
```

#### ❌ Failure Looks Like:

**Authentication Failed:**
```
🔵 Starting Bluesky post process...
🔐 Authenticating with Bluesky...
Auth response status: 401
❌ Authentication failed: {error: "AuthenticationRequired", message: "..."}
```
**Fix:** Check credentials in settings

**Upload Failed:**
```
✅ Authentication successful!
⬆️ Uploading image to Bluesky...
Upload response status: 413
❌ Image upload failed: {error: "BlobTooLarge"}
```
**Fix:** Image might be too large

**Post Creation Failed:**
```
✅ Image uploaded successfully!
📝 Creating post...
Post response status: 400
❌ Post creation failed: {error: "InvalidRequest", message: "..."}
```

## 🔍 Network Tab Check

1. Click **Network** tab in DevTools
2. Try posting again
3. Filter by: `bsky.social`
4. You should see 3 requests:
   - `createSession` (Status: 200)
   - `uploadBlob` (Status: 200)
   - `createRecord` (Status: 200)

Click each one to see details if any fail.

## 🧪 Quick Test Sites

### Option 1: Example.com
```
1. Go to https://example.com
2. Highlight "Example Domain"
3. Right-click → Post to Bluesky
```

### Option 2: Wikipedia
```
1. Go to https://en.wikipedia.org/wiki/Cat
2. Highlight any paragraph
3. Right-click → Post to Bluesky
```

### Option 3: Bluesky App
```
1. Go to https://bsky.app
2. Highlight a post's text
3. Right-click → Post to Bluesky
(This creates a screenshot of someone else's post)
```

## 📋 Checklist Before Testing

- [ ] Extension loaded in chrome://extensions
- [ ] Extension shows as enabled (blue toggle)
- [ ] Credentials saved in settings
- [ ] "Test Connection" in settings shows success
- [ ] Testing on a regular website (NOT claude.ai)
- [ ] DevTools console is open
- [ ] Ready to copy/paste console output

## 🐛 If Content Script Doesn't Load

If you don't see "Bluesky Screenshot Extension content script loaded":

1. **Refresh the page** (F5)
2. **Check the extension is enabled** in chrome://extensions
3. **Try a different website**
4. **Check for errors in Background script:**
   - Go to chrome://extensions
   - Click "service worker" under the extension
   - Look for errors in that console

## 📤 What to Share

If still having issues, share:
1. **What website** you tested on
2. **Console output** (copy/paste or screenshot)
3. **Network tab** showing the bsky.social requests
4. **Any error messages** in red

---

**TL;DR:**
1. Go to https://example.com
2. Press F12
3. Highlight "Example Domain"
4. Right-click → Post to Bluesky
5. Watch console and share output
