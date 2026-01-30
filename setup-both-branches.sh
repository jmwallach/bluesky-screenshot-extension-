#!/bin/bash
# setup-both-branches.sh
# Sets up debug and main branches from downloaded zips

set -e  # Exit on error

PROJECT_DIR="/Users/jmwallach/src/bluesky-screenshot-extension"
DOWNLOADS_DIR="/Users/jmwallach/Downloads"

echo "🚀 Bluesky Screenshot Extension - Branch Setup"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ "$PWD" != "$PROJECT_DIR" ]; then
    echo "📂 Navigating to project directory..."
    cd "$PROJECT_DIR"
fi

echo "📍 Current directory: $(pwd)"
echo ""

# Check for zip files
DEBUG_ZIP="$DOWNLOADS_DIR/bluesky-screenshot-extension-v0.0.6-debug-autodelete.zip"
COMPOSE_ZIP="$DOWNLOADS_DIR/bluesky-screenshot-extension-v0.1.0-compose.zip"

if [ ! -f "$DEBUG_ZIP" ]; then
    echo "❌ Error: Debug zip not found at $DEBUG_ZIP"
    echo "Please download it first."
    exit 1
fi

if [ ! -f "$COMPOSE_ZIP" ]; then
    echo "❌ Error: Compose zip not found at $COMPOSE_ZIP"
    echo "Please download it first."
    exit 1
fi

echo "✓ Found debug zip: $(basename $DEBUG_ZIP)"
echo "✓ Found compose zip: $(basename $COMPOSE_ZIP)"
echo ""

# Save any uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo "💾 Saving uncommitted changes..."
    git add .
    git commit -m "WIP: Auto-save before branch setup" || true
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"
echo ""

# ============================================
# Setup Debug Branch
# ============================================
echo "🔧 Setting up DEBUG branch..."
echo "----------------------------------------"

# Switch to or create debug branch
if git show-ref --verify --quiet refs/heads/debug-v0.0.6; then
    echo "Switching to existing debug-v0.0.6 branch..."
    git checkout debug-v0.0.6
else
    echo "Creating new debug-v0.0.6 branch..."
    git checkout -b debug-v0.0.6 2>/dev/null || git checkout debug-v0.0.6
fi

# Clean directory (except .git)
echo "🧹 Cleaning directory..."
find . -maxdepth 1 ! -name '.git' ! -name '.' ! -name '..' -exec rm -rf {} +

# Extract debug version
echo "📦 Extracting debug version..."
unzip -q "$DEBUG_ZIP" -d .

# Commit
echo "💾 Committing debug version..."
git add .
git commit -m "feat: Add v0.0.6 debug version with auto-delete functionality

- Automatically deletes posts after creation for testing
- Prevents test posts from appearing in followers' feeds
- Perfect for development and testing" || echo "No changes to commit"

# Tag
echo "🏷️  Tagging as v0.0.6-debug..."
git tag -f v0.0.6-debug
git tag -f v0.0.6

echo "✓ Debug branch ready!"
echo ""

# ============================================
# Setup Main Branch
# ============================================
echo "🎨 Setting up MAIN branch..."
echo "----------------------------------------"

# Switch to or create main branch
if git show-ref --verify --quiet refs/heads/main; then
    echo "Switching to existing main branch..."
    git checkout main
else
    # Check if master exists
    if git show-ref --verify --quiet refs/heads/master; then
        echo "Renaming master to main..."
        git branch -m master main
    else
        echo "Creating new main branch..."
        git checkout -b main
    fi
fi

# Clean directory (except .git)
echo "🧹 Cleaning directory..."
find . -maxdepth 1 ! -name '.git' ! -name '.' ! -name '..' -exec rm -rf {} +

# Extract compose version
echo "📦 Extracting compose version..."
unzip -q "$COMPOSE_ZIP" -d .

# Commit
echo "💾 Committing compose version..."
git add .
git commit -m "feat: Add compose modal with preview and caption support (v0.1.0)

Major new feature: Compose modal
- Preview screenshot before posting
- Add post text/captions (up to 300 characters)
- Edit alt text before posting
- Two posting options: 'Post Now' or 'Open in Bluesky'
- Beautiful, modern UI with live character counter
- Better user experience and control

Technical changes:
- Added compose-modal.js with full UI
- Updated content.js to show modal instead of direct posting
- Added optional postText parameter to postToBluesky function
- Updated manifest.json to include compose-modal.js

This prevents accidental posts and allows users to add context
to their screenshots." || echo "No changes to commit"

# Tag
echo "🏷️  Tagging as v0.1.0..."
git tag -f v0.1.0

echo "✓ Main branch ready!"
echo ""

# ============================================
# Summary
# ============================================
echo "============================================"
echo "✅ Setup Complete!"
echo "============================================"
echo ""
echo "📊 Branch Summary:"
echo "  • debug-v0.0.6: Auto-delete posts (for testing)"
echo "  • main (v0.1.0): Compose modal (for production)"
echo ""
echo "📍 Current branch: $(git branch --show-current)"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Push debug branch:"
echo "   git checkout debug-v0.0.6"
echo "   git push -u origin debug-v0.0.6"
echo "   git push origin v0.0.6-debug"
echo "   git push origin v0.0.6"
echo ""
echo "2. Push main branch:"
echo "   git checkout main"
echo "   git push -u origin main"
echo "   git push origin v0.1.0"
echo ""
echo "3. Load extension in Chrome:"
echo "   Debug: chrome://extensions → Load unpacked → switch to debug-v0.0.6 branch first"
echo "   Prod: chrome://extensions → Load unpacked → switch to main branch first"
echo ""
echo "💡 Tip: Use 'git checkout debug-v0.0.6' or 'git checkout main' to switch between versions"
echo ""
