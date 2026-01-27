const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

async function readFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    console.log('\n--- File Content ---');
    console.log(data);
    console.log('--- End of File ---\n');
  } catch (err) {
    console.error(`Error reading file: ${err.message}`);
  }
}

async function writeFile(filePath, content) {
  try {
    await fs.writeFile(filePath, content, 'utf8');
    console.log(`✓ File written successfully: ${filePath}\n`);
  } catch (err) {
    console.error(`Error writing file: ${err.message}`);
  }
}

async function appendFile(filePath, content) {
  try {
    await fs.appendFile(filePath, content, 'utf8');
    console.log(`✓ Content appended successfully: ${filePath}\n`);
  } catch (err) {
    console.error(`Error appending to file: ${err.message}`);
  }
}

async function copyFile(source, destination) {
  try {
    
    await fs.access(source);
    await fs.copyFile(source, destination);
    console.log(`✓ File copied successfully: ${source} → ${destination}\n`);
  } catch (err) {
    console.error(`Error copying file: ${err.message}`);
  }
}


async function deleteFile(filePath) {
  try {
    await fs.unlink(filePath);
    console.log(`✓ File deleted successfully: ${filePath}\n`);
  } catch (err) {
    console.error(`Error deleting file: ${err.message}`);
  }
}

async function listDirectory(dirPath) {
  try {
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    console.log(`\n--- Contents of ${dirPath} ---`);
    
    for (const file of files) {
      const type = file.isDirectory() ? '[DIR]' : '[FILE]';
      const fullPath = path.join(dirPath, file.name);
      
      try {
        const stats = await fs.stat(fullPath);
        const size = file.isDirectory() ? '' : `(${formatBytes(stats.size)})`;
        console.log(`${type} ${file.name} ${size}`);
      } catch (err) {
        console.log(`${type} ${file.name} (access denied)`);
      }
    }
    console.log('--- End of List ---\n');
  } catch (err) {
    console.error(`Error listing directory: ${err.message}`);
  }
}

async function createDirectory(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`✓ Directory created successfully: ${dirPath}\n`);
  } catch (err) {
    console.error(`Error creating directory: ${err.message}`);
  }
}

async function deleteDirectory(dirPath) {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
    console.log(`✓ Directory deleted successfully: ${dirPath}\n`);
  } catch (err) {
    console.error(`Error deleting directory: ${err.message}`);
  }
}

async function getFileInfo(filePath) {
  try {
    const stats = await fs.stat(filePath);
    console.log('\n--- File Information ---');
    console.log(`Path: ${filePath}`);
    console.log(`Size: ${formatBytes(stats.size)}`);
    console.log(`Created: ${stats.birthtime}`);
    console.log(`Modified: ${stats.mtime}`);
    console.log(`Is Directory: ${stats.isDirectory()}`);
    console.log(`Is File: ${stats.isFile()}`);
    console.log('--- End of Info ---\n');
  } catch (err) {
    console.error(`Error getting file info: ${err.message}`);
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function displayMenu() {
  console.log('\n======= FILE MANAGER APPLICATION =======');
  console.log('1.  Read File');
  console.log('2.  Write File');
  console.log('3.  Append to File');
  console.log('4.  Copy File');
  console.log('5.  Delete File');
  console.log('6.  List Directory');
  console.log('7.  Create Directory');
  console.log('8.  Delete Directory');
  console.log('9.  Get File Info');
  console.log('10. Exit');
  console.log('========================================\n');
}

async function main() {
  console.log('Welcome to File Manager Application!\n');

  let running = true;

  while (running) {
    displayMenu();
    const choice = await prompt('Enter your choice (1-10): ');

    switch (choice.trim()) {
      case '1': {
        const filePath = await prompt('Enter file path to read: ');
        await readFile(filePath.trim());
        break;
      }

      case '2': {
        const filePath = await prompt('Enter file path to write: ');
        const content = await prompt('Enter content to write: ');
        await writeFile(filePath.trim(), content);
        break;
      }

      case '3': {
        const filePath = await prompt('Enter file path to append: ');
        const content = await prompt('Enter content to append: ');
        await appendFile(filePath.trim(), content);
        break;
      }

      case '4': {
        const source = await prompt('Enter source file path: ');
        const destination = await prompt('Enter destination file path: ');
        await copyFile(source.trim(), destination.trim());
        break;
      }

      case '5': {
        const filePath = await prompt('Enter file path to delete: ');
        const confirm = await prompt('Are you sure? (yes/no): ');
        if (confirm.toLowerCase() === 'yes') {
          await deleteFile(filePath.trim());
        } else {
          console.log('Delete operation cancelled.\n');
        }
        break;
      }

      case '6': {
        const dirPath = await prompt('Enter directory path (or . for current): ');
        await listDirectory(dirPath.trim() || '.');
        break;
      }

      case '7': {
        const dirPath = await prompt('Enter directory path to create: ');
        await createDirectory(dirPath.trim());
        break;
      }

      case '8': {
        const dirPath = await prompt('Enter directory path to delete: ');
        const confirm = await prompt('Are you sure? This will delete all contents! (yes/no): ');
        if (confirm.toLowerCase() === 'yes') {
          await deleteDirectory(dirPath.trim());
        } else {
          console.log('Delete operation cancelled.\n');
        }
        break;
      }

      case '9': {
        const filePath = await prompt('Enter file path: ');
        await getFileInfo(filePath.trim());
        break;
      }

      case '10':
        console.log('\nThank you for using File Manager Application. Goodbye!\n');
        running = false;
        break;

      default:
        console.log('\nInvalid choice. Please enter a number between 1 and 10.\n');
    }
  }

  rl.close();
}

main().catch((err) => {
  console.error('Application error:', err);
  rl.close();
});