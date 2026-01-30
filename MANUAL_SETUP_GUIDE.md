# Manual Setup Guide

## The Issue

You're on branch `debug-v0.0.5` but trying to push to `main`, which doesn't exist yet in your repo.

## Solution: Set Up Both Branches

### Option 1: Use the Setup Script (Recommended)

```bash
cd /Users/jmwallach/src/bluesky-screenshot-extension

# Download setup-both-branches.sh to your project directory
# Then run:
chmod +x setup-both-branches.sh
./setup-both-branches.sh
```

This will automatically:
- Create `debug-v0.0.6` branch with auto-delete version
- Create `main` branch with compose modal version
- Commit and tag everything

### Option 2: Manual Setup

#### Step 1: Check Current Status

```bash
cd /Users/jmwallach/src/bluesky-screenshot-extension
git branch -a
```

You're probably on `debug-v0.0.5` and `main` doesn't exist.

#### Step 2: Push Current Debug Branch First

Since you already committed on `debug-v0.0.5`:

```bash
# Push current branch (whatever it's called)
git push -u origin debug-v0.0.5

# Push the tag
git push origin v0.0.6
```

#### Step 3: Create Main Branch with Compose Version

```bash
# Create and switch to main branch
git checkout -b main

# Clean directory
find . -maxdepth 1 ! -name '.git' ! -name '.' ! -name '..' -exec rm -rf {} +

# Extract compose version
unzip ~/Downloads/bluesky-screenshot-extension-v0.1.0-compose.zip -d .

# Commit
git add .
git commit -m "feat: Add compose modal with preview (v0.1.0)"

# Tag
git tag -a v0.1.0 -m "Major release - Compose modal"

# Push
git push -u origin main
git push origin v0.1.0
```

#### Step 4: Update Debug Branch to v0.0.6

```bash
# Go back to debug branch
git checkout debug-v0.0.5

# Or create new debug branch
git checkout -b debug-v0.0.6

# Clean directory
find . -maxdepth 1 ! -name '.git' ! -name '.' ! -name '..' -exec rm -rf {} +

# Extract debug version
unzip ~/Downloads/bluesky-screenshot-extension-v0.0.6-debug-autodelete.zip -d .

# Commit
git add .
git commit -m "feat: Add auto-delete for testing (v0.0.6-debug)"

# Tag
git tag -a v0.0.6-debug -m "Debug version with auto-delete"

# Push
git push -u origin debug-v0.0.6
git push origin v0.0.6-debug
```

## Quick Reference

### Switch Between Branches

```bash
# For testing (auto-delete posts)
git checkout debug-v0.0.6

# For production (compose modal)
git checkout main
```

### Load in Chrome

After switching branches:
1. Go to `chrome://extensions`
2. Remove old version
3. Load unpacked from `/Users/jmwallach/src/bluesky-screenshot-extension`
4. The version matches whatever branch you're on

### Check Which Branch You're On

```bash
git branch --show-current
```

### View All Branches

```bash
git branch -a
```

### View All Tags

```bash
git tag -l
```

## Branch Strategy

```
debug-v0.0.6
├── Auto-deletes posts after creation
├── Perfect for testing
└── Tag: v0.0.6, v0.0.6-debug

main
├── Compose modal with preview
├── Production-ready
└── Tag: v0.1.0
```

## Troubleshooting

### "fatal: A branch named 'main' already exists"

```bash
git checkout main
```

### "error: src refspec main does not match any"

Main doesn't exist yet. Create it:

```bash
git checkout -b main
```

### Want to rename current branch?

```bash
# If you're on debug-v0.0.5 and want to rename it
git branch -m debug-v0.0.6
git push -u origin debug-v0.0.6
```

### Lost and want to start fresh?

```bash
# See what branches you have
git branch -a

# Delete a local branch
git branch -D branch-name

# Then follow the setup script
```

## The Easy Way

Just use the setup script - it handles everything! 😊

```bash
cd /Users/jmwallach/src/bluesky-screenshot-extension
./setup-both-branches.sh
```
