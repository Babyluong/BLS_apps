#!/bin/bash

# Git Auto Commit Script
# This script can be run manually or set up as a cron job

echo "🔄 Auto Git Sync - Manual Run"
echo "================================"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check for changes
if [ -z "$(git status --porcelain)" ]; then
    echo "ℹ️  No changes to commit"
    exit 0
fi

echo "📝 Changes detected, committing..."

# Add all changes
git add .

# Create commit message with timestamp
timestamp=$(date '+%Y-%m-%d %H:%M:%S')
commit_message="Auto-sync: $timestamp"

# Commit changes
git commit -m "$commit_message"

if [ $? -eq 0 ]; then
    echo "✅ Changes committed successfully"
    
    # Push to GitHub
    echo "🚀 Pushing to GitHub..."
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo "✅ Changes pushed to GitHub successfully!"
    else
        echo "❌ Error pushing to GitHub"
        exit 1
    fi
else
    echo "❌ Error committing changes"
    exit 1
fi

echo "🎉 Auto sync completed!"
