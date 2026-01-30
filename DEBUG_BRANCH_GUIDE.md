# Creating a Debug Branch for v0.0.5

Follow these steps to create a separate debug branch for testing:

## Step 1: Save Your Current Work

```bash
cd /Users/jmwallach/src/bluesky-screenshot-extension

# Check current status
git status

# If you have uncommitted changes, commit them first:
git add .
git commit -m "WIP: Current state before debug branch"
```

## Step 2: Create and Switch to Debug Branch

```bash
# Create a new branch called 'debug-v0.0.5' and switch to it
git checkout -b debug-v0.0.5

# Verify you're on the new branch
git branch
# Should show: * debug-v0.0.5
```

## Step 3: Extract v0.0.5 Debug Files

```bash
# First, let's backup your current files (optional but recommended)
mkdir -p ~/backups
cp -r /Users/jmwallach/src/bluesky-screenshot-extension ~/backups/bluesky-backup-$(date +%Y%m%d-%H%M%S)

# Navigate to your project directory
cd /Users/jmwallach/src/bluesky-screenshot-extension

# Remove old files (keep .git and other hidden files)
# This removes everything except .git directory
find . -maxdepth 1 ! -name '.git' ! -name '.' ! -name '..' -exec rm -rf {} +

# Now extract the v0.0.5-debug.zip
# (Assuming you downloaded it to ~/Downloads)
unzip ~/Downloads/bluesky-screenshot-extension-v0.0.5-debug.zip -d .

# Or if it's somewhere else:
# unzip /path/to/bluesky-screenshot-extension-v0.0.5-debug.zip -d .
```

## Step 4: Commit the Debug Version

```bash
# Check what changed
git status

# Add all the debug version files
git add .

# Commit with a clear message
git commit -m "Add v0.0.5 debug version with verbose logging"
```

## Step 5: Test the Extension

```bash
# Now test the extension:
# 1. Open Chrome
# 2. Go to chrome://extensions
# 3. Remove the old version if loaded
# 4. Click "Load unpacked"
# 5. Select: /Users/jmwallach/src/bluesky-screenshot-extension
```

## Step 6: After Testing - Switch Back to Main

When you're done debugging and want to go back to your main branch:

```bash
# Make sure to commit any notes or findings first
git add .
git commit -m "Debug findings and logs"

# Switch back to main branch
git checkout main

# Your main branch will be exactly as you left it
```

## Step 7: Optional - Merge Debug Fixes to Main

If you find and fix issues in the debug branch:

```bash
# While on debug-v0.0.5 branch, commit your fixes
git add .
git commit -m "fix: [description of fix]"

# Switch to main
git checkout main

# Merge the debug branch changes
git merge debug-v0.0.5

# Resolve any conflicts if they exist
# Then push to GitHub
git push origin main
```

## Step 8: Delete Debug Branch (When Done)

Once you're completely done with debugging:

```bash
# Make sure you're on main branch
git checkout main

# Delete the local debug branch
git branch -d debug-v0.0.5

# If you pushed it to GitHub and want to delete it there too:
git push origin --delete debug-v0.0.5
```

## Quick Reference Commands

```bash
# Where am I?
git branch

# Switch branches
git checkout main
git checkout debug-v0.0.5

# Create new branch
git checkout -b branch-name

# See what changed
git status
git diff

# Commit changes
git add .
git commit -m "message"

# Push branch to GitHub
git push origin debug-v0.0.5

# Pull latest from GitHub
git pull origin main
```

## Alternative: Just Test Without Branching

If you don't want to use branches, you can:

```bash
# Extract v0.0.5 to a different directory
mkdir -p ~/debug-extension
unzip ~/Downloads/bluesky-screenshot-extension-v0.0.5-debug.zip -d ~/debug-extension

# Load this directory in Chrome instead
# Your git repo stays untouched
```

## Troubleshooting

### "Changes not staged for commit" error
```bash
# You have uncommitted changes, commit them first:
git add .
git commit -m "Save current state"
```

### "Branch already exists" error
```bash
# Delete the existing branch first:
git branch -D debug-v0.0.5
# Then create it again
git checkout -b debug-v0.0.5
```

### Can't find the zip file
```bash
# Check Downloads folder
ls -la ~/Downloads/bluesky-screenshot-extension-v0.0.5-debug.zip

# Or search for it
find ~ -name "bluesky-screenshot-extension-v0.0.5-debug.zip" 2>/dev/null
```

### Want to see what's in the zip before extracting
```bash
unzip -l ~/Downloads/bluesky-screenshot-extension-v0.0.5-debug.zip
```

---

**Summary:**
1. Create branch: `git checkout -b debug-v0.0.5`
2. Extract zip: `unzip ~/Downloads/bluesky-screenshot-extension-v0.0.5-debug.zip -d .`
3. Commit: `git add . && git commit -m "Add debug version"`
4. Test in Chrome
5. Switch back: `git checkout main`
