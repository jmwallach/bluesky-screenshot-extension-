# Quick Setup Guide

## Prerequisites
- Node.js (for TypeScript compilation)
- A Chromium-based browser (Chrome, Edge, Brave, etc.)
- A Bluesky account

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Compile TypeScript

```bash
npm run build
```

This will compile `error-handling-design.ts` to JavaScript.

## Step 3: Create Icons

Create an `icons` folder and add these files:
- `icon16.png` (16x16 pixels)
- `icon32.png` (32x32 pixels)  
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

**Quick icon generation options:**
1. Use an online tool like [favicon.io](https://favicon.io/) or [realfavicongenerator.net](https://realfavicongenerator.net/)
2. Create a simple SVG and convert to PNG at different sizes
3. Use any image editor (Photoshop, GIMP, Figma, etc.)

**Design suggestions:**
- Use Bluesky's blue color (#0085ff)
- Include a camera or screenshot icon
- Keep it simple and recognizable at small sizes

## Step 4: Load Extension in Browser

### Chrome/Edge/Brave:
1. Open `chrome://extensions` (or `edge://extensions`)
2. Enable "Developer mode" toggle (top right)
3. Click "Load unpacked"
4. Select the extension folder
5. The extension icon should appear in your toolbar

## Step 5: Configure Bluesky Credentials

1. Click the extension icon in your toolbar
2. Click "Open Settings"
3. Enter your Bluesky handle (e.g., `username.bsky.social`) or email
4. Generate an app password:
   - Go to [https://bsky.app/settings/app-passwords](https://bsky.app/settings/app-passwords)
   - Click "Add App Password"
   - Give it a name (e.g., "Screenshot Extension")
   - Copy the generated password
5. Paste the app password in the extension settings
6. Click "Test Connection" to verify
7. Click "Save Settings"

## Step 6: Test It Out!

1. Go to any webpage
2. Highlight some text
3. Right-click and select "Post to Bluesky"
4. Check your Bluesky profile - the screenshot should appear!

## Troubleshooting

### TypeScript compilation errors
If you get TypeScript errors, make sure you have the correct version:
```bash
npm install -D typescript@latest @types/chrome@latest
```

### Extension not loading
- Make sure all files are in the same directory
- Check that `manifest.json` is in the root folder
- Look for errors in the Extensions page

### Icons missing error
The extension will still work without icons, but you should add them for a better experience. Use placeholder icons temporarily if needed.

### "Failed to load extension" error
- Check the browser console for specific error messages
- Verify all file paths in manifest.json are correct
- Make sure you compiled the TypeScript files

## Next Steps

Once installed and working:
- Test with different websites
- Try various text selections
- Experiment with long vs short text
- Check error handling by testing edge cases

Enjoy posting to Bluesky! 🎉
