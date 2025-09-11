# Auto Git Integration Setup

This setup provides automatic Git integration so your changes are automatically saved to GitHub.

## 🚀 Quick Start

### Option 1: Automatic Monitoring (Recommended)
Run the auto-sync script that monitors file changes and automatically commits/pushes:

```bash
# Windows
start-auto-sync.bat

# Or directly with Node.js
node auto-git-sync.js
```

### Option 2: Manual Sync
Run the manual sync script when you want to commit and push changes:

```bash
# Windows (PowerShell)
./git-auto-commit.sh

# Or manually
git add .
git commit -m "Your commit message"
git push origin main
```

## 📁 What Gets Monitored

The auto-sync monitors these paths for changes:
- `src/` - Source code
- `components/` - React components
- `screens/` - Screen components
- `services/` - Service files
- `utils/` - Utility functions
- `lib/` - Library files
- `styles/` - Style files
- `App.js` - Main app file
- `constants.js` - Constants
- `package.json` - Dependencies
- `app.json` - App configuration

## ⚙️ Configuration

### Debounce Delay
The auto-sync waits 5 seconds after the last file change before committing. This prevents too many commits for rapid changes.

### Ignored Files
These files/folders are ignored:
- `node_modules/`
- `.git/`
- `.expo/`
- `bls-github-upload/`
- `*.log`, `*.tmp`
- `.DS_Store`, `Thumbs.db`

## 🔧 Advanced Setup

### Set up as Windows Service (Optional)
You can set up the auto-sync to run as a Windows service using tools like `node-windows` or `pm2`.

### Customize Watch Paths
Edit `auto-git-sync.js` and modify the `watchPaths` array to include/exclude specific paths.

### Customize Commit Messages
Edit the commit message format in `auto-git-sync.js`:

```javascript
const commitMessage = `Auto-sync: ${timestamp}`;
```

## 🛠️ Troubleshooting

### Git Authentication
Make sure your Git is configured with your GitHub credentials:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### GitHub Authentication
If you get authentication errors, you may need to:
1. Use a Personal Access Token instead of password
2. Set up SSH keys
3. Use GitHub CLI for authentication

### Check Git Status
```bash
git status
git log --oneline -5
```

## 📋 Usage Examples

### Start Auto Sync
```bash
# Windows
start-auto-sync.bat

# The script will:
# 1. Monitor file changes
# 2. Wait 5 seconds after last change
# 3. Automatically commit changes
# 4. Push to GitHub
```

### Manual Sync
```bash
# When you want to commit immediately
./git-auto-commit.sh
```

### Stop Auto Sync
Press `Ctrl+C` in the terminal where auto-sync is running.

## ✅ Verification

After setting up, you can verify it's working by:
1. Making a small change to any monitored file
2. Waiting 5 seconds
3. Checking your GitHub repository for the new commit

## 🎯 Benefits

- **Automatic**: No need to remember to commit/push
- **Safe**: Debounced to prevent too many commits
- **Selective**: Only monitors important files
- **Reliable**: Handles errors gracefully
- **Flexible**: Can be run manually or automatically

Your changes will now be automatically saved to GitHub! 🎉
