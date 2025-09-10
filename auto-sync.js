const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

console.log('🔄 Auto-sync started for BLS Lawas project...');

// Watch for changes in the project directory
const watchPath = __dirname;
let isCommitting = false;

// Function to run git commands
function runGitCommand(command, callback) {
    exec(command, { cwd: watchPath }, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`⚠️  Warning: ${stderr}`);
        }
        if (stdout) {
            console.log(`✅ ${stdout.trim()}`);
        }
        if (callback) callback();
    });
}

// Function to auto-commit and push
function autoCommitAndPush() {
    if (isCommitting) return;
    
    isCommitting = true;
    console.log('📝 Changes detected, auto-committing...');
    
    // Add all changes
    runGitCommand('git add .', () => {
        // Check if there are changes to commit
        runGitCommand('git diff --cached --quiet', (exitCode) => {
            if (exitCode === 0) {
                console.log('ℹ️  No changes to commit');
                isCommitting = false;
                return;
            }
            
            // Commit with timestamp
            const timestamp = new Date().toLocaleString();
            const commitMessage = `Auto-sync: ${timestamp}`;
            
            runGitCommand(`git commit -m "${commitMessage}"`, () => {
                // Push to GitHub
                runGitCommand('git push origin main', () => {
                    console.log('🚀 Auto-sync completed!');
                    isCommitting = false;
                });
            });
        });
    });
}

// Watch for file changes
fs.watch(watchPath, { recursive: true }, (eventType, filename) => {
    // Ignore .git directory and node_modules
    if (filename && (
        filename.includes('.git') || 
        filename.includes('node_modules') ||
        filename.includes('auto-sync.js') ||
        filename.includes('.log')
    )) {
        return;
    }
    
    if (eventType === 'change' || eventType === 'rename') {
        console.log(`📁 File changed: ${filename}`);
        // Debounce: wait 2 seconds before committing
        setTimeout(autoCommitAndPush, 2000);
    }
});

console.log('👀 Watching for changes...');
console.log('💡 Save any file to trigger auto-sync!');
