/*Task 4: System Monitor & Logger Tool Scenario
Your company wants a background tool to monitor system health.Requirements
Create a Node.js program that:Uses os module to fetch:

CPU count
Free & total memory
Platform

Uses path module to generate file path
Logs system data every 5 seconds into system-log.txt
Uses setInterval
Uses fs.appendFile
Code must be modular

systemInfo.js
logger.js
app.js
*/


// for systemInfo.js

const os = require('os');

function getSystemInfo() {
    return {
        cpuCount: os.cpus().length,
        freeMemory: (os.freemem() / 1024 / 1024).toFixed(2) + ' MB',
        totalMemory: (os.totalmem() / 1024 / 1024).toFixed(2) + ' MB',
        platform: os.platform(),
        timestamp: new Date().toLocaleString()
    };
}

module.exports = getSystemInfo;

// for logger.js

const fs = require('fs');
const path = require('path');

function logToFile(data) {
    const logPath = path.join(__dirname, 'system-log.txt');
    const logEntry = `${data.timestamp} | CPU: ${data.cpuCount} | Free Mem: ${data.freeMemory} | Total Mem: ${data.totalMemory} | Platform: ${data.platform}\n`;
    
    fs.appendFile(logPath, logEntry, (err) => {
        if (err) {
            console.log('Failed to write log');
        } else {
            console.log('System data logged');
        }
    });
}

module.exports = logToFile;

// for app.js

const getSystemInfo = require('./systemInfo');
const logToFile = require('./logger');

console.log('System monitor started...');

setInterval(() => {
    const sysData = getSystemInfo();
    logToFile(sysData);
}, 5000);