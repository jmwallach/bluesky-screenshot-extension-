#!/bin/bash
# Quick setup for debug branch
# Run this from your project root: /Users/jmwallach/src/bluesky-screenshot-extension

set -e  # Exit on error

echo "🔧 Setting up debug branch..."

# Save current work if needed
if [[ -n $(git status -s) ]]; then
    echo "📝 Saving current changes..."
    git add .
    git commit -m "WIP: Save before debug branch"
fi

# Create and switch to debug branch
echo "🌿 Creating debug-v0.0.5 branch..."
git checkout -b debug-v0.0.5 2>/dev/null || git checkout debug-v0.0.5

# Clean directory (except .git)
echo "🧹 Cleaning directory..."
find . -maxdepth 1 ! -name '.git' ! -name '.' ! -name '..' -exec rm -rf {} +

# Extract debug version
echo "📦 Extracting v0.0.5-debug..."
ZIP_PATH=""
if [ -f "$HOME/Downloads/bluesky-screenshot-extension-v0.0.5-debug.zip" ]; then
    ZIP_PATH="$HOME/Downloads/bluesky-screenshot-extension-v0.0.5-debug.zip"
elif [ -f "./bluesky-screenshot-extension-v0.0.5-debug.zip" ]; then
    ZIP_PATH="./bluesky-screenshot-extension-v0.0.5-debug.zip"
else
    echo "❌ Error: Cannot find bluesky-screenshot-extension-v0.0.5-debug.zip"
    echo "Please download it to ~/Downloads or the current directory"
    exit 1
fi

unzip -q "$ZIP_PATH" -d .

# Commit
echo "💾 Committing debug version..."
git add .
git commit -m "Add v0.0.5 debug version with verbose logging"

echo ""
echo "✅ Debug branch ready!"
echo ""
echo "📍 Current branch: debug-v0.0.5"
echo "📂 Location: $(pwd)"
echo ""
echo "Next steps:"
echo "1. Open Chrome → chrome://extensions"
echo "2. Remove old version"
echo "3. Load unpacked → select this directory"
echo "4. Test and check console logs"
echo ""
echo "When done testing:"
echo "  git checkout main     # Return to main branch"
echo ""
