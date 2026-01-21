// Task 1: File Manager CLI Tool

// Scenario -- 
// You are working as a backend intern. Your manager asks you to build a command-line File Manager that can perform basic file operations.

// Tasks --

// Create a Node.js program that supports the following commands:
// Read a file
// Write content to a file
// Append logs to a file
// Copy a file
// Delete a file
// List files inside a directory

// Constraints --

// Use asynchronous fs methods
// Handle errors properly (ENOENT, EACCES)
// Use process.argv for input

const fs = require('fs').promises;
const path = require('path');

// Get command line arguments
// process.argv[0] is 'node', [1] is 'fileManager.js', [2] is command, [3] is filePath, [4] is content or dest

const command = process.argv[2];
const filePath = process.argv[3];
const content = process.argv[4];

if (!command) {
  console.log('Usage: node fileManager.js <command> <filePath> [content|destPath]');
  console.log('Commands: read, write, append, copy, delete, list');
  process.exit(1);
}

switch (command) {
  case 'read':
  case 'delete':
  case 'list':
    if (!filePath) {
      console.log(`Error: ${command} command requires a file path.`);
      console.log(`Usage: node fileManager.js ${command} <filePath>`);
      process.exit(1);
    }
    break;
  case 'write':
  case 'append':
    if (!filePath || content === undefined) {
      console.log(`Error: ${command} command requires a file path and content.`);
      console.log(`Usage: node fileManager.js ${command} <filePath> <content>`);
      process.exit(1);
    }
    break;
  case 'copy':
    if (!filePath || !process.argv[4]) {
      console.log('Error: copy command requires source and destination paths.');
      console.log('Usage: node fileManager.js copy <sourcePath> <destPath>');
      process.exit(1);
    }
    break;
  default:
    console.log('Invalid command. Available commands: read, write, append, copy, delete, list');
    process.exit(1);
}

(async () => {
  try {
    switch (command) {
      case 'read':
        const data = await fs.readFile(filePath, 'utf8');
        console.log(data);
        break;

      case 'write':
        await fs.writeFile(filePath, content);
        console.log('File written successfully');
        break;

      case 'append':
        await fs.appendFile(filePath, content);
        console.log('Content appended successfully');
        break;

      case 'copy':
        const destPath = process.argv[4];
        await fs.copyFile(filePath, destPath);
        console.log('File copied successfully');
        break;

      case 'delete':
        await fs.unlink(filePath);
        console.log('File deleted successfully');
        break;

      case 'list':
        const files = await fs.readdir(filePath);
        console.log(files.join('\n'));
        break;
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();