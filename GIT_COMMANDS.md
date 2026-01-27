# Git Commands for v0.0.1 Release

## Quick Commit (All-in-One)

```bash
# Navigate to your extension directory
cd /path/to/bluesky-screenshot-extension

# Run the commit script
./commit.sh

# Push to GitHub
git push origin main
```

## Manual Step-by-Step

### 1. Stage All Changes
```bash
git add .
```

### 2. Commit with Message
```bash
git commit -F COMMIT_MESSAGE.txt
```

Or manually:
```bash
git commit -m "fix: Convert extension from TypeScript to plain JavaScript for compatibility

- Remove all TypeScript syntax (type assertions, non-null operators)
- Eliminate ES6 module imports that caused service worker failures
- Remove \"type\": \"module\" from manifest.json
- Inline postToBluesky functionality directly in content.js
- Add \"scripting\" permission for dynamic script injection
- Replace ErrorHandler imports with inline error handling
- Simplify error messages with console.error and notifications
- Fix syntax errors on lines 50, 63, and 115 of background.js
- Ensure compatibility with Manifest V3 service workers

This resolves the \"Uncaught SyntaxError\" and \"Service worker registration failed\" errors."
```

### 3. Tag the Release (Optional but Recommended)
```bash
git tag -a v0.0.1 -m "Initial release - v0.0.1"
```

### 4. Push to GitHub
```bash
# Push commits
git push origin main

# Push tag
git push origin v0.0.1
```

## Verify Your Commit

```bash
# View commit log
git log --oneline -5

# View tags
git tag -l

# Check what's staged
git status
```

## Create GitHub Release (After Pushing)

1. Go to your repository on GitHub
2. Click "Releases" → "Create a new release"
3. Choose tag: `v0.0.1`
4. Release title: `v0.0.1 - Initial Release`
5. Copy contents from `RELEASE_NOTES_v0.0.1.md`
6. Attach `bluesky-screenshot-extension-v0.0.1.zip`
7. Click "Publish release"

## Troubleshooting

### If you need to undo the last commit:
```bash
git reset --soft HEAD~1
```

### If you need to change the commit message:
```bash
git commit --amend -m "New commit message"
```

### If you already pushed and need to force update:
```bash
git push --force origin main
```

### If you need to delete a tag:
```bash
# Local
git tag -d v0.0.1

# Remote
git push origin :refs/tags/v0.0.1
```

## Files Changed in This Commit

- background.js (rewritten, removed TypeScript)
- content.js (rewritten, removed TypeScript)
- manifest.json (removed module type, added scripting permission, version 0.0.1)
- icons/ (4 new icon files added)
- .gitignore (updated to exclude icons directory)

## Next Steps

After committing and pushing:
1. Create a GitHub release with the v0.0.1 tag
2. Attach the `bluesky-screenshot-extension-v0.0.1.zip` file
3. Update the README if needed
4. Test the extension one more time before announcing
