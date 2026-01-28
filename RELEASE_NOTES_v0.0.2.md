# Release Notes - v0.0.2

**Bug Fix Release** - January 27, 2026

## 🐛 Bug Fixes

- ✅ **Fixed username input**: Extension now automatically removes @ symbol if included
- ✅ **Fixed "Receiving end does not exist" error**: Content script is now injected dynamically if needed
- ✅ **Better error messages**: Users see helpful messages for restricted pages
- ✅ **Improved reliability**: Content script loads more consistently

## 🔧 Changes

### Username Handling
- Settings page now accepts handles with or without @ symbol
- @ is automatically stripped during save and test
- Help text clarified to reduce confusion
- Examples updated: `@username.bsky.social` → `username.bsky.social`

### Content Script Injection
- Added fallback injection when content script isn't loaded
- Includes both JS and CSS injection
- Added 100ms delay to ensure script initialization
- Shows clear error on restricted pages (chrome://, edge://, etc.)

### Manifest Updates
- Added `run_at: "document_idle"` for better timing
- Version bumped to 0.0.2

## 📦 Upgrade Instructions

### If you have v0.0.1 installed:
1. Download `bluesky-screenshot-extension-v0.0.2.zip`
2. Extract to a new folder
3. Go to `chrome://extensions`
4. Click "Remove" on the old version
5. Click "Load unpacked" and select the new folder
6. Re-enter your credentials (they won't carry over)

### Fresh Install:
Follow the same installation steps as v0.0.1

## 🙏 Thanks

Thanks to early testers for reporting these issues!

## 🔜 Coming Soon

- Keyboard shortcuts
- Post preview
- Custom post text
- Better credential migration

---

**Full Changelog**: v0.0.1...v0.0.2
