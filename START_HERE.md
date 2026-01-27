# ⚠️ IMPORTANT: Read This First!

## Before Loading the Extension

The extension is **almost** ready to load, but you need to add icon files first. Here's the quickest way:

### Quick Fix: Create Placeholder Icons

1. **Extract the zip file** to a folder
2. **Create an `icons` folder** inside that folder
3. **Download these placeholder icons** (or create your own):
   - Go to https://via.placeholder.com/16x16/0085ff/ffffff?text=B
   - Right-click → Save as `icon16.png` in the icons folder
   - Repeat for: `icon32.png` (32x32), `icon48.png` (48x48), `icon128.png` (128x128)
   
   Or use these URLs:
   - 16x16: https://via.placeholder.com/16x16/0085ff/ffffff?text=B
   - 32x32: https://via.placeholder.com/32x32/0085ff/ffffff?text=B
   - 48x48: https://via.placeholder.com/48x48/0085ff/ffffff?text=B
   - 128x128: https://via.placeholder.com/128x128/0085ff/ffffff?text=B

### Your Folder Structure Should Look Like:

```
bluesky-screenshot-extension/
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── manifest.json
├── background.js
├── content.js
├── content.css
├── popup.html
├── popup.js
├── options.html
├── options.js
├── error-handling-design.ts
└── ... other files
```

### Then Load in Chrome:

1. Open Chrome and go to `chrome://extensions`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the folder with all the files
5. Done! ✓

### Why Icons Are Missing

Icons are image files that can't be included in AI-generated code. You need to create or download them separately. The extension will work fine with simple placeholder icons.

### Better Icons Later

Once the extension is working, you can:
- Design custom icons in Figma/Photoshop
- Use an online icon generator
- Commission a designer on Fiverr (~$5-20)

## Still Having Issues?

Make sure:
- ✓ All files extracted to same folder
- ✓ Icons folder exists with 4 PNG files
- ✓ manifest.json is in the root folder (not in a subfolder)
- ✓ Developer mode is enabled in Chrome

Check the Chrome extensions page for specific error messages if it still won't load.
