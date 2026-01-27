# Release Notes - v0.0.1

**Initial Release** - January 27, 2026

## 🎉 Features

- ✨ Capture screenshots of highlighted text with a right-click
- 📸 Automatically crop to the selected text region
- 🔵 Post screenshots directly to Bluesky
- ♿ Adds selected text as alt text for accessibility
- ⚙️ Simple settings page for Bluesky credentials
- 🎨 Clean, modern UI with visual feedback
- 🔒 Secure local credential storage

## 📦 What's Included

- Complete Chrome extension (Manifest V3)
- Default blue icons with "B" branding
- Settings page for Bluesky authentication
- Error handling and user notifications
- Documentation and setup guides

## 🚀 Installation

1. Download `bluesky-screenshot-extension-v0.0.1.zip`
2. Extract the contents to a folder
3. Open Chrome and go to `chrome://extensions`
4. Enable "Developer mode"
5. Click "Load unpacked" and select the extracted folder
6. Configure your Bluesky credentials in the extension settings

## ⚙️ Configuration

1. Click the extension icon
2. Click "Open Settings"
3. Enter your Bluesky handle or email
4. Generate an [app password](https://bsky.app/settings/app-passwords)
5. Enter the app password
6. Click "Test Connection" to verify
7. Save settings

## 📝 Usage

1. Navigate to any webpage
2. Highlight the text you want to share
3. Right-click and select "Post to Bluesky"
4. Screenshot is automatically captured and posted!

## 🔧 Technical Details

- **Language**: JavaScript (ES6+)
- **Manifest Version**: 3
- **Minimum Chrome Version**: 88+
- **Permissions**: activeTab, contextMenus, notifications, storage, scripting
- **Size**: ~30KB (without dependencies)

## 🐛 Known Issues

None reported yet! Please file issues on GitHub if you encounter any problems.

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

Built with assistance from Claude AI (Anthropic).
Designed for the Bluesky community.

---

**Next planned features:**
- Keyboard shortcuts
- Custom post text (beyond alt text)
- Batch posting
- Post preview before sharing
- Multiple image support
