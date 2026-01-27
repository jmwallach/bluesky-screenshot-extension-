# Bluesky Screenshot Poster - Chrome Extension

> 🤖 **AI-Generated Project**: This extension was created with assistance from Claude (Anthropic AI) on January 27, 2026. The code structure, error handling, and implementation were generated through AI collaboration.

A Chromium-based browser extension that lets you highlight text, capture a screenshot of that region, and automatically post it to Bluesky with the text as alt text.

## Features

✨ **Quick Capture** - Highlight any text and right-click to post  
📸 **Auto Screenshot** - Captures only the selected text region  
♿ **Accessible** - Uses selected text as alt text for accessibility  
🔒 **Secure** - Uses Bluesky app passwords, credentials stored locally  
⚡ **Fast** - Simple workflow with visual feedback  
🎨 **Beautiful UI** - Modern, polished interface  

## Installation

### From Source (Development)

1. **Clone or download** this repository to your computer

2. **Generate icons** (you'll need to create these):
   - Create an `icons` folder in the extension directory
   - Add the following icon files:
     - `icon16.png` (16x16 pixels)
     - `icon32.png` (32x32 pixels)
     - `icon48.png` (48x48 pixels)
     - `icon128.png` (128x128 pixels)
   - You can use any image editor or icon generator online

3. **Load the extension in Chrome**:
   - Open Chrome/Edge/Brave
   - Go to `chrome://extensions`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the extension folder

4. **Configure your Bluesky credentials**:
   - Click the extension icon
   - Click "Open Settings"
   - Enter your Bluesky handle or email
   - Generate an [app password](https://bsky.app/settings/app-passwords) and enter it
   - Click "Test Connection" to verify
   - Click "Save Settings"

## Usage

### Method 1: Context Menu (Recommended)

1. Highlight any text on a webpage
2. Right-click and select "Post to Bluesky"
3. The extension will:
   - Capture a screenshot of the highlighted region
   - Post it to Bluesky with the text as alt text
   - Show a success notification

### Method 2: Extension Icon

1. Click the extension icon
2. Follow the on-screen instructions
3. Highlight text and right-click to post

## File Structure

```
bluesky-screenshot-extension/
├── manifest.json                    # Extension configuration
├── error-handling-design.ts         # TypeScript error handling system
├── background.js                    # Service worker (background tasks)
├── content.js                       # Content script (page interaction)
├── content.css                      # Styles for content script overlays
├── popup.html                       # Extension popup UI
├── popup.js                         # Popup functionality
├── options.html                     # Settings page UI
├── options.js                       # Settings page functionality
├── icons/                           # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md                        # This file
```

## Technical Details

### Error Handling

The extension includes comprehensive error handling for:
- Screenshot capture failures
- Bluesky API errors (auth, rate limits, network issues)
- Permission errors
- Invalid text selections
- Network connectivity issues

All errors show user-friendly messages via browser notifications.

### Security

- Credentials are stored locally using Chrome's `storage.sync` API
- Uses Bluesky app passwords (not main account password)
- No data is sent to third-party servers
- All communication is directly with Bluesky's official API

### Browser Compatibility

Compatible with:
- Google Chrome (v88+)
- Microsoft Edge (v88+)
- Brave Browser
- Any Chromium-based browser supporting Manifest V3

## Development

### TypeScript Compilation

If you modify `error-handling-design.ts`, compile it to JavaScript:

```bash
npx tsc error-handling-design.ts --target es2020 --module es2020
```

### Testing

1. Test with various websites and text selections
2. Test error scenarios:
   - No text selected
   - Text too long (>1000 chars)
   - Invalid credentials
   - Network disconnection
3. Check browser console for errors

### Building for Production

1. Compile TypeScript to JavaScript
2. Minify JavaScript files (optional)
3. Optimize images
4. Package as ZIP for Chrome Web Store

## Troubleshooting

### "Permission denied" error
- Make sure you've granted the extension permission to access the current tab
- Check that the extension has the necessary permissions in `chrome://extensions`

### "Authentication failed" error
- Verify you're using an app password, not your main password
- Generate a new app password at [Bluesky Settings](https://bsky.app/settings/app-passwords)
- Make sure your handle/email is correct

### Screenshots not capturing correctly
- Try selecting text in a different way
- Ensure the text is visible on screen (not scrolled out of view)
- Refresh the page and try again

### "Network error" messages
- Check your internet connection
- Try again in a few moments (might be temporary Bluesky API issue)
- Check [Bluesky Status](https://status.bsky.app/) for any outages

## Privacy Policy

This extension:
- Only accesses data from the current tab when you explicitly trigger it
- Stores credentials locally on your device
- Communicates only with Bluesky's official API
- Does not collect, share, or sell any user data
- Does not track your browsing history

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - feel free to use and modify as needed.

## Roadmap

Potential future features:
- [ ] Add custom text to posts (not just alt text)
- [ ] Support multiple image formats
- [ ] Batch posting
- [ ] Keyboard shortcuts
- [ ] Post preview before sharing
- [ ] Save screenshots locally
- [ ] Support for other AT Protocol platforms

## Support

For issues or questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the troubleshooting section above

## Acknowledgments

Built with ❤️ for the Bluesky community.

**AI Development Notice**: This project was developed with assistance from Claude (Anthropic AI). While AI was instrumental in generating the code structure and implementation, the project maintainer retains full responsibility for the code's functionality, maintenance, and compliance with all applicable terms of service.

Uses:
- [Bluesky AT Protocol](https://atproto.com/)
- Chrome Extensions Manifest V3
- TypeScript for robust error handling

## Disclaimer

- This is an unofficial third-party extension, not affiliated with Bluesky
- Users must provide their own Bluesky credentials
- Use at your own risk
- Credentials are stored locally and never shared with third parties
- Always use app passwords, never your main account password
