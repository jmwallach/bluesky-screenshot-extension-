# Release Notes - v0.0.3

**Critical Bug Fix** - January 27, 2026

## 🐛 Critical Fix

- ✅ **Fixed black screenshots**: Corrected coordinate system for screenshot cropping
- ✅ Screenshots now properly capture the highlighted text region
- ✅ Removed incorrect scroll offset calculations

## 🔍 What Was Wrong

The extension was mixing two different coordinate systems:
1. **Page coordinates** (including scroll position) 
2. **Viewport coordinates** (what's visible in the browser window)

Since Chrome's `captureVisibleTab()` only captures the **visible viewport**, we need to use viewport coordinates (no scroll offsets). The previous version was adding scroll offsets, causing the crop region to be completely off the captured image, resulting in black screenshots.

## ✅ What's Fixed

Now using pure viewport coordinates:
- `rect.left` and `rect.top` (no scroll additions)
- Matches what `captureVisibleTab()` actually captures
- Screenshots now show the correct text region with padding

## 📦 Upgrade Instructions

1. Download `bluesky-screenshot-extension-v0.0.3.zip`
2. Go to `chrome://extensions`
3. Remove the old version
4. Load unpacked the new version
5. Credentials will need to be re-entered

## 🧪 Testing

Tested on:
- ✅ Pages with no scroll
- ✅ Pages scrolled down
- ✅ Text at various positions on the page
- ✅ Different text lengths

## 🙏 Thanks

Big thanks to @jmwallach for reporting this with a screenshot!

---

**Full Changelog**: v0.0.2...v0.0.3
