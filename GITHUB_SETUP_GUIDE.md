# GitHub Setup Guide for BLS Training App

This guide will help you upload your BLS Training App code to GitHub.

## 📋 Prerequisites

Before starting, make sure you have:
- [ ] Git installed on your computer
- [ ] A GitHub account
- [ ] Your BLS app code ready in the project folder

## 🚀 Step-by-Step Instructions

### Step 1: Install Git (if not already installed)

1. **Download Git for Windows**:
   - Go to https://git-scm.com/download/win
   - Download the latest version
   - Run the installer and follow the setup wizard
   - **Important**: Choose "Git from the command line and also from 3rd-party software" when asked about PATH

2. **Verify Installation**:
   - Open Command Prompt or PowerShell
   - Type: `git --version`
   - You should see a version number (e.g., "git version 2.40.0")

### Step 2: Create GitHub Repository

1. **Go to GitHub.com** and sign in to your account

2. **Create a new repository**:
   - Click the "+" icon in the top right corner
   - Select "New repository"
   - Repository name: `bls-training-app` (or your preferred name)
   - Description: "BLS Training App for Hospital Lawas"
   - Choose "Public" or "Private" (your choice)
   - **DO NOT** check "Add a README file" (we already have one)
   - **DO NOT** check "Add .gitignore" (we already have one)
   - Click "Create repository"

3. **Copy the repository URL**:
   - GitHub will show you the repository URL
   - It will look like: `https://github.com/yourusername/bls-training-app.git`
   - Copy this URL for later use

### Step 3: Initialize Git in Your Project

1. **Open Command Prompt/PowerShell** in your project directory:
   - Navigate to: `C:\Users\60113\Downloads\bls\bls`
   - Or right-click in the folder and select "Open in Terminal"

2. **Initialize Git repository**:
   ```bash
   git init
   ```

3. **Configure Git (first time only)**:
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

4. **Add all files to Git**:
   ```bash
   git add .
   ```

5. **Create initial commit**:
   ```bash
   git commit -m "Initial commit: BLS Training App"
   ```

6. **Add GitHub repository as remote**:
   ```bash
   git remote add origin https://github.com/yourusername/bls-training-app.git
   ```
   (Replace `yourusername` with your actual GitHub username)

7. **Push code to GitHub**:
   ```bash
   git branch -M main
   git push -u origin main
   ```

### Step 4: Verify Upload

1. **Go to your GitHub repository** in a web browser
2. **Refresh the page** - you should see all your files
3. **Check that important files are there**:
   - ✅ App.js
   - ✅ package.json
   - ✅ README.md
   - ✅ .gitignore
   - ✅ All your project files

## 🔧 Troubleshooting

### If you get authentication errors:

1. **Use Personal Access Token**:
   - Go to GitHub Settings > Developer settings > Personal access tokens
   - Generate new token with "repo" permissions
   - Use token as password when prompted

2. **Or use GitHub CLI**:
   ```bash
   gh auth login
   ```

### If you get "repository not found" error:

1. **Check the repository URL** - make sure it's correct
2. **Make sure the repository exists** on GitHub
3. **Check your GitHub username** is correct

### If you get "fatal: not a git repository":

1. **Make sure you're in the right directory**
2. **Run `git init` first**

## 📁 What Gets Uploaded

✅ **Will be uploaded**:
- All your source code files
- package.json and dependencies
- README.md documentation
- .gitignore file
- All project assets

❌ **Will NOT be uploaded** (thanks to .gitignore):
- node_modules/ folder
- .env files with sensitive data
- Temporary files
- Build artifacts

## 🔄 Future Updates

After the initial upload, to update your code on GitHub:

1. **Make your changes** to the code
2. **Add changes to Git**:
   ```bash
   git add .
   ```
3. **Commit changes**:
   ```bash
   git commit -m "Description of your changes"
   ```
4. **Push to GitHub**:
   ```bash
   git push
   ```

## 🎉 Success!

Once completed, your BLS Training App will be available on GitHub at:
`https://github.com/yourusername/bls-training-app`

You can now:
- Share the code with others
- Collaborate with team members
- Track changes and versions
- Deploy from GitHub
- Create issues and pull requests

## 📞 Need Help?

If you encounter any issues:
1. Check the error message carefully
2. Make sure Git is properly installed
3. Verify your GitHub credentials
4. Ensure you're in the correct directory
5. Check that the repository exists on GitHub

Good luck with your GitHub upload! 🚀
