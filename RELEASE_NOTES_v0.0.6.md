# Release Notes - v0.0.6

**Critical Bug Fix** - January 29, 2026

## 🐛 Critical Fix

- ✅ **Fixed posts not appearing on Bluesky**: Now uses correct DID for post creation
- ✅ Posts now successfully appear in your Bluesky feed
- ✅ Works with both email and handle authentication

## 🔍 What Was Wrong

The extension was authenticating successfully and uploading images correctly, but posts weren't appearing because:

1. Bluesky's `createRecord` API requires the `repo` field to be either:
   - A **DID** (Decentralized Identifier) like `did:plc:xxxxx`
   - A **handle** like `username.bsky.social`

2. We were incorrectly passing the **email address** when users authenticated with email

3. This caused a 400 error: `"Input/repo must be a valid did or a handle"`

## ✅ What's Fixed

Now correctly uses the **DID** returned from authentication for creating posts. The flow:

1. ✅ Authenticate → Get `accessJwt` and `did`
2. ✅ Upload image → Get `blob` reference
3. ✅ Create post → Use `did` (not email) ← **This was the fix!**

## 📊 Debug Logging

This version keeps all the verbose logging from v0.0.5, so you can see:
- 🔵 Authentication status
- 📸 Image processing details
- ⬆️ Upload progress
- 📝 Post creation with full payload
- ✅ Success messages with URIs

## 🎉 Testing Results

Tested successfully with:
- ✅ Email authentication
- ✅ Handle authentication
- ✅ Screenshots of various sizes
- ✅ Different text lengths
- ✅ Multiple websites

Posts now appear immediately on Bluesky!

## 📦 Upgrade Instructions

### From v0.0.5 debug:
1. Download `bluesky-screenshot-extension-v0.0.6.zip`
2. Go to `chrome://extensions`
3. Remove v0.0.5
4. Load unpacked v0.0.6
5. Your credentials should still work

### Fresh Install:
1. Download and extract the zip
2. Load in Chrome
3. Configure credentials
4. Test on any website!

## 🧪 Test It Works

1. Go to https://example.com
2. Highlight "Example Domain"
3. Right-click → "Post to Bluesky"
4. Check your Bluesky profile - the post should appear!

## 🙏 Thanks

Huge thanks to @jmwallach for:
- Testing thoroughly
- Providing detailed debug logs
- Being patient through multiple iterations

This wouldn't have been fixed without your logs! 🎉

---

**Full Changelog**: v0.0.5...v0.0.6
