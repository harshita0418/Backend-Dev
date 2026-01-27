/*
Task 3 : Directory Backup & Cleanup Utility Scenario
Your system stores user uploads. You must:
Backup important files
Delete old unused files automatically
Tasks
Create a Node.js utility that:Scans a directoryCopies files to a backup folder with timestampDeletes files older than 7 daysLogs all operations into backup.log

Constraints
Use fs.stat
Handle missing directories safely
Use promises / async-await
*/

const fs = require('fs').promises;
const path = require('path');

const sourceDir = './uploads';
const backupDir = './backup';
const logFile = './backup.log';

async function logOperation(message) {
    const timestamp = new Date().toLocaleString();
    const logEntry = `${timestamp} - ${message}\n`;
    
    try {
        await fs.appendFile(logFile, logEntry);
    } catch (err) {
        console.log('Failed to write log');
    }
}

async function ensureDirectoryExists(dirPath) {
    try {
        await fs.access(dirPath);
    } catch {
        await fs.mkdir(dirPath, { recursive: true });
        await logOperation(`Created directory: ${dirPath}`);
    }
}

async function backupFiles() {
    try {
        await ensureDirectoryExists(sourceDir);
        await ensureDirectoryExists(backupDir);
        
        const files = await fs.readdir(sourceDir);
        
        for (const file of files) {
            const sourcePath = path.join(sourceDir, file);
            const stats = await fs.stat(sourcePath);
            
            if (stats.isFile()) {
                const timestamp = Date.now();
                const backupFileName = `${timestamp}_${file}`;
                const backupPath = path.join(backupDir, backupFileName);
                
                await fs.copyFile(sourcePath, backupPath);
                await logOperation(`Backed up: ${file} -> ${backupFileName}`);
                console.log(`Backed up: ${file}`);
            }
        }
    } catch (err) {
        await logOperation(`Backup error: ${err.message}`);
        console.log('Backup failed:', err.message);
    }
}

async function deleteOldFiles() {
    try {
        await ensureDirectoryExists(sourceDir);
        
        const files = await fs.readdir(sourceDir);
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        
        for (const file of files) {
            const filePath = path.join(sourceDir, file);
            const stats = await fs.stat(filePath);
            
            if (stats.isFile() && stats.mtimeMs < sevenDaysAgo) {
                await fs.unlink(filePath);
                await logOperation(`Deleted old file: ${file}`);
                console.log(`Deleted: ${file}`);
            }
        }
    } catch (err) {
        await logOperation(`Cleanup error: ${err.message}`);
        console.log('Cleanup failed:', err.message);
    }
}

async function runBackupAndCleanup() {
    console.log('Starting backup and cleanup...');
    await logOperation('=== Backup & Cleanup Started ===');
    
    await backupFiles();
    await deleteOldFiles();
    
    await logOperation('=== Backup & Cleanup Completed ===');
    console.log('Process completed!');
}

runBackupAndCleanup();