# Release Notes - v0.0.4

**Permission Fix** - January 27, 2026

## 🐛 Bug Fixes

- ✅ **Fixed "Cannot access contents" error**: Added proper host permissions
- ✅ **Better restricted page handling**: Clear feedback when extension can't access a page
- ✅ **Improved reliability**: Longer initialization delay for content script
- ✅ **Better error messages**: Users now understand why something didn't work

## 🔧 Changes

### Host Permissions
Added explicit permissions for all web pages:
- `http://*/*` - All HTTP sites
- `https://*/*` - All HTTPS sites

This allows the extension to inject content scripts when needed on regular websites.

### Restricted Page Detection
The extension now checks for restricted protocols before attempting to inject:
- `chrome://` pages (browser internal pages)
- `chrome-extension://` pages (other extensions)
- `edge://` pages (Edge internal pages)
- `about:` pages (special browser pages)
- `file://` pages (local files)

When you try to use the extension on these pages, you'll get a clear message explaining why it won't work.

### Error Handling Improvements
- More descriptive error messages
- Better console logging for debugging
- Increased script initialization time from 100ms to 200ms
- Suggests reloading the page if injection fails

## ⚠️ Important Note

When you first install or update to this version, Chrome will ask you to approve the new permissions:
- "Read and change all your data on all websites"

This is necessary for the extension to:
1. Inject the content script on pages where it's not already loaded
2. Capture screenshots of any website you're viewing

**The extension only activates when you explicitly right-click selected text.** It doesn't monitor or access any data unless you trigger it.

## 📦 Upgrade Instructions

1. Download `bluesky-screenshot-extension-v0.0.4.zip`
2. Go to `chrome://extensions`
3. Remove the old version
4. Load unpacked the new version
5. **Accept the permissions prompt** when it appears
6. Re-enter your credentials

## 🧪 Testing

This version has been tested on:
- ✅ Regular HTTP/HTTPS websites
- ✅ Restricted pages (chrome://, etc.) with proper error messages
- ✅ Dynamically loaded content
- ✅ Pages opened in new tabs

## 🔒 Privacy

The extension:
- Only activates when you right-click selected text
- Does not track, monitor, or collect any browsing data
- Only communicates with Bluesky's API for posting
- Stores credentials locally on your device

---

**Full Changelog**: v0.0.3...v0.0.4
