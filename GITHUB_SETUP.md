# GitHub Setup Guide

This guide will walk you through creating a GitHub repository and uploading your extension.

## Prerequisites

- A GitHub account (create one at [github.com](https://github.com) if needed)
- Git installed on your computer ([download here](https://git-scm.com/downloads))

## Step 1: Create a GitHub Account

If you don't have one already:

1. Go to [github.com](https://github.com)
2. Click "Sign up" in the top right
3. Enter your email, create a password, and choose a username
4. Verify your email address
5. Complete the setup prompts

## Step 2: Install Git

### Windows:
1. Download from [git-scm.com](https://git-scm.com/downloads)
2. Run the installer with default settings
3. Open Command Prompt or PowerShell to verify: `git --version`

### Mac:
1. Open Terminal
2. Type: `git --version`
3. If not installed, it will prompt you to install Xcode Command Line Tools
4. Or install via Homebrew: `brew install git`

### Linux:
```bash
# Ubuntu/Debian
sudo apt-get install git

# Fedora
sudo dnf install git
```

## Step 3: Configure Git (First Time Only)

Open your terminal/command prompt and run:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Use the same email as your GitHub account.

## Step 4: Create a New Repository on GitHub

1. Log into GitHub
2. Click the **"+"** icon in top right → **"New repository"**
3. Fill in the details:
   - **Repository name**: `bluesky-screenshot-extension` (or your preferred name)
   - **Description**: "Chrome extension to capture screenshots and post to Bluesky"
   - **Public** or **Private**: Choose Public if you want others to see it
   - **DO NOT** check "Initialize with README" (you already have one)
4. Click **"Create repository"**

## Step 5: Connect Your Local Project to GitHub

### Option A: Using Command Line (Recommended)

1. Open Terminal/Command Prompt
2. Navigate to your extension folder:
   ```bash
   cd /path/to/your/extension/folder
   ```

3. Initialize Git repository:
   ```bash
   git init
   ```

4. Add all files:
   ```bash
   git add .
   ```

5. Create first commit:
   ```bash
   git commit -m "Initial commit: Bluesky screenshot extension with AI-generated code"
   ```

6. Add GitHub as remote (replace YOUR-USERNAME and YOUR-REPO):
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   ```

7. Push to GitHub:
   ```bash
   git branch -M main
   git push -u origin main
   ```

8. If prompted for credentials:
   - **Username**: Your GitHub username
   - **Password**: Use a Personal Access Token (not your password - see below)

### Option B: Using GitHub Desktop (Easier for Beginners)

1. Download [GitHub Desktop](https://desktop.github.com/)
2. Install and sign in with your GitHub account
3. Click **File** → **Add Local Repository**
4. Select your extension folder
5. If it says "not a git repository", click **"Create a repository"**
6. Click **"Publish repository"** in the top bar
7. Choose public/private and click **"Publish Repository"**

## Step 6: Create a Personal Access Token (for Command Line)

If using command line and asked for password:

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name like "Extension Development"
4. Select scopes: Check **"repo"** (full control of private repositories)
5. Click **"Generate token"**
6. **COPY THE TOKEN** - you won't see it again!
7. Use this token as your password when pushing to GitHub

## Step 7: Verify Upload

1. Go to your repository on GitHub: `https://github.com/YOUR-USERNAME/YOUR-REPO`
2. You should see all your files listed
3. The README.md will display automatically on the main page

## Step 8: Add Icons Before Pushing (Important!)

Before sharing publicly, create your icon files:

1. Create an `icons` folder in your extension directory
2. Add these files:
   - `icon16.png` (16x16 pixels)
   - `icon32.png` (32x32 pixels)
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)

3. After adding icons:
   ```bash
   git add icons/
   git commit -m "Add extension icons"
   git push
   ```

## Common Issues & Solutions

### "Permission denied" error
- Make sure you're using a Personal Access Token, not your password
- Check that you have write access to the repository

### "Repository not found"
- Double-check the repository URL
- Make sure you're logged into the correct GitHub account

### Files not showing up
- Make sure you ran `git add .` before committing
- Check `.gitignore` isn't excluding important files

### Large files rejected
- GitHub has a 100MB file limit
- Remove large files or use Git LFS for big assets

## Updating Your Repository Later

When you make changes:

```bash
# Stage changes
git add .

# Commit with message
git commit -m "Description of what you changed"

# Push to GitHub
git push
```

## Making Your Repository Look Professional

1. **Add a .gitignore**: Already included ✓
2. **Add a LICENSE**: Already included ✓
3. **Add a good README**: Already included ✓
4. **Add topics/tags**:
   - Go to your repo on GitHub
   - Click the ⚙️ icon next to "About"
   - Add topics: `chrome-extension`, `bluesky`, `screenshot`, `typescript`
5. **Add a repository description**: Same place as topics
6. **Add a website link**: Link to your Bluesky profile or project site

## Next Steps

- Add a `CONTRIBUTING.md` if you want others to contribute
- Set up GitHub Actions for automated builds
- Add issue templates for bug reports
- Create a project board for tracking features
- Add a code of conduct

## Quick Reference

```bash
# Check status
git status

# View commit history
git log --oneline

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout main

# Pull latest changes
git pull

# Push to GitHub
git push
```

## Need Help?

- [GitHub Docs](https://docs.github.com/)
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Desktop Guide](https://docs.github.com/en/desktop)

Happy coding! 🚀
