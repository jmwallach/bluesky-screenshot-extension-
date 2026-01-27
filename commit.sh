#!/bin/bash
# Git commit script for Bluesky Screenshot Extension

# Stage all changed files
git add .

# Commit with the message
git commit -F COMMIT_MESSAGE.txt

# Optional: Tag as v0.0.1
# Uncomment the line below if you want to create a version tag
# git tag -a v0.0.1 -m "Initial release - v0.0.1"

echo "✓ Commit complete!"
echo ""
echo "To push to GitHub, run:"
echo "  git push origin main"
echo ""
echo "If you created a tag, also run:"
echo "  git push origin v0.0.1"
