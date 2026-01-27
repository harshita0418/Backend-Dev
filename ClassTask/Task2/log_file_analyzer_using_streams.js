/*
Task 2: Log File Analyzer using Streams 
Scenario
A company server generates a huge log file (500MB+). You are asked to analyze it without loading the full file into memory.
Tasks
Create a program that:Reads a large log file using streamsCounts:
Total lines
Number of ERROR, WARNING, INFO
Generates a summary report file
 Constraints
Must use streams
No readFile
Efficient memory usage
*/

const fs = require('fs');
const readline = require('readline');

const logFilePath = 'server.log';
const reportFilePath = 'report.txt';

let totalLines = 0;
let errorCount = 0;
let warningCount = 0;
let infoCount = 0;

const readStream = fs.createReadStream(logFilePath);

const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity
});

rl.on('line', (line) => {
    totalLines++;
    
    if (line.includes('ERROR')) {
        errorCount++;
    } else if (line.includes('WARNING')) {
        warningCount++;
    } else if (line.includes('INFO')) {
        infoCount++;
    }
});

rl.on('close', () => {
    const summary = `Log Analysis Report
Generated: ${new Date().toLocaleString()}
-----------------------------------
Total Lines: ${totalLines}
ERROR count: ${errorCount}
WARNING count: ${warningCount}
INFO count: ${infoCount}
-----------------------------------
`;

    fs.writeFile(reportFilePath, summary, (err) => {
        if (err) {
            console.log('Could not create report');
        } else {
            console.log('Report generated successfully!');
            console.log(summary);
        }
    });
});

rl.on('error', (err) => {
    console.log('Error reading file:', err);
});