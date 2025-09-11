#!/usr/bin/env node

/**
 * Auto Git Sync - Automatically commits and pushes changes to GitHub
 * This script monitors file changes and automatically syncs them to GitHub
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AutoGitSync {
    constructor() {
        this.isRunning = false;
        this.lastCommitTime = null;
        this.debounceDelay = 5000; // 5 seconds delay before committing
        this.watchPaths = [
            'src/',
            'components/',
            'screens/',
            'services/',
            'utils/',
            'lib/',
            'styles/',
            'App.js',
            'constants.js',
            'package.json',
            'app.json'
        ];
        this.ignoredFiles = [
            'node_modules/',
            '.git/',
            '.expo/',
            'bls-github-upload/',
            '*.log',
            '*.tmp',
            '.DS_Store',
            'Thumbs.db'
        ];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
        console.log(`${prefix} [${timestamp}] ${message}`);
    }

    isFileIgnored(filePath) {
        return this.ignoredFiles.some(pattern => {
            if (pattern.includes('*')) {
                const regex = new RegExp(pattern.replace(/\*/g, '.*'));
                return regex.test(filePath);
            }
            return filePath.includes(pattern);
        });
    }

    shouldWatchFile(filePath) {
        // Check if file is in watch paths
        const isInWatchPath = this.watchPaths.some(watchPath => {
            if (watchPath.endsWith('/')) {
                return filePath.startsWith(watchPath);
            }
            return filePath === watchPath || filePath.startsWith(watchPath + '/');
        });

        return isInWatchPath && !this.isFileIgnored(filePath);
    }

    async commitChanges() {
        try {
            this.log('Checking for changes...');
            
            // Check if there are any changes
            const status = execSync('git status --porcelain', { encoding: 'utf8' });
            if (!status.trim()) {
                this.log('No changes to commit');
                return;
            }

            this.log('Changes detected, preparing commit...');
            
            // Add all changes
            execSync('git add .', { stdio: 'inherit' });
            
            // Create commit message with timestamp
            const timestamp = new Date().toLocaleString();
            const commitMessage = `Auto-sync: ${timestamp}`;
            
            // Commit changes
            execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
            
            this.log('Changes committed successfully', 'success');
            
            // Push to GitHub
            this.log('Pushing to GitHub...');
            execSync('git push origin main', { stdio: 'inherit' });
            
            this.log('Changes pushed to GitHub successfully!', 'success');
            this.lastCommitTime = new Date();
            
        } catch (error) {
            this.log(`Error during commit/push: ${error.message}`, 'error');
        }
    }

    async debouncedCommit() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        
        // Clear any existing timeout
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        
        // Set new timeout
        this.timeoutId = setTimeout(async () => {
            await this.commitChanges();
            this.isRunning = false;
        }, this.debounceDelay);
    }

    startWatching() {
        this.log('🚀 Starting Auto Git Sync...');
        this.log(`Watching paths: ${this.watchPaths.join(', ')}`);
        this.log(`Debounce delay: ${this.debounceDelay}ms`);
        this.log('Press Ctrl+C to stop\n');

        // Watch for file changes
        this.watchPaths.forEach(watchPath => {
            if (fs.existsSync(watchPath)) {
                fs.watch(watchPath, { recursive: true }, (eventType, filename) => {
                    if (filename && this.shouldWatchFile(filename)) {
                        this.log(`File changed: ${filename}`);
                        this.debouncedCommit();
                    }
                });
            }
        });

        // Also watch individual files
        this.watchPaths.forEach(filePath => {
            if (fs.existsSync(filePath) && !fs.statSync(filePath).isDirectory()) {
                fs.watchFile(filePath, () => {
                    this.log(`File changed: ${filePath}`);
                    this.debouncedCommit();
                });
            }
        });
    }

    stop() {
        this.log('Stopping Auto Git Sync...');
        process.exit(0);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n');
    autoSync.stop();
});

// Start the auto sync
const autoSync = new AutoGitSync();
autoSync.startWatching();
