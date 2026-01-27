const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const crypto = require('crypto');

class FileSyncTool {
  constructor(sourceDir, targetDir, options = {}) {
    this.sourceDir = path.resolve(sourceDir);
    this.targetDir = path.resolve(targetDir);
    this.options = {
      dryRun: options.dryRun || false,
      deleteOrphaned: options.deleteOrphaned || false,
      verbose: options.verbose || false,
      compareByHash: options.compareByHash || false
    };
    this.stats = {
      filesCompared: 0,
      filesCopied: 0,
      filesUpdated: 0,
      filesDeleted: 0,
      errors: []
    };
  }

  async calculateFileHash(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('md5');
      const stream = fsSync.createReadStream(filePath);

      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', (err) => reject(err));
    });
  }

  async filesAreDifferent(sourcePath, targetPath) {
    try {
      const [sourceStats, targetStats] = await Promise.all([
        fs.stat(sourcePath),
        fs.stat(targetPath)
      ]);

      if (sourceStats.size !== targetStats.size) {
        return true;
      }

      if (sourceStats.mtime.getTime() !== targetStats.mtime.getTime()) {

        if (this.options.compareByHash) {
          const [sourceHash, targetHash] = await Promise.all([
            this.calculateFileHash(sourcePath),
            this.calculateFileHash(targetPath)
          ]);
          return sourceHash !== targetHash;
        }
        return true;
      }

      return false;
    } catch (err) {

        return true;
    }
  }


  async getFilesRecursively(dir, baseDir = dir) {
    const files = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(baseDir, fullPath);

        if (entry.isDirectory()) {
          const subFiles = await this.getFilesRecursively(fullPath, baseDir);
          files.push(...subFiles);
        } else if (entry.isFile()) {
          files.push(relativePath);
        }
      }
    } catch (err) {
      this.stats.errors.push({
        operation: 'scan',
        path: dir,
        error: err.message
      });
    }

    return files;
  }


  async ensureDirectory(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (err) {
      throw new Error(`Failed to create directory ${dirPath}: ${err.message}`);
    }
  }


  async copyFile(sourcePath, targetPath) {
    try {
      const targetDir = path.dirname(targetPath);
      await this.ensureDirectory(targetDir);
      
      if (!this.options.dryRun) {
        await fs.copyFile(sourcePath, targetPath);

        const stats = await fs.stat(sourcePath);
        await fs.utimes(targetPath, stats.atime, stats.mtime);
      }
      
      return true;
    } catch (err) {
      this.stats.errors.push({
        operation: 'copy',
        source: sourcePath,
        target: targetPath,
        error: err.message
      });
      return false;
    }
  }

  async deleteFile(filePath) {
    try {
      if (!this.options.dryRun) {
        await fs.unlink(filePath);
      }
      return true;
    } catch (err) {
      this.stats.errors.push({
        operation: 'delete',
        path: filePath,
        error: err.message
      });
      return false;
    }
  }

  async synchronize() {
    console.log('\n========================================');
    console.log('  FILE SYNCHRONIZATION TOOL');
    console.log('========================================\n');
    console.log(`Source: ${this.sourceDir}`);
    console.log(`Target: ${this.targetDir}`);
    console.log(`Mode: ${this.options.dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE'}`);
    console.log(`Delete orphaned: ${this.options.deleteOrphaned ? 'Yes' : 'No'}`);
    console.log(`Compare by hash: ${this.options.compareByHash ? 'Yes' : 'No'}\n`);
    console.log('Starting synchronization...\n');


    try {
      await fs.access(this.sourceDir);
    } catch (err) {
      throw new Error(`Source directory does not exist: ${this.sourceDir}`);
    }

    await this.ensureDirectory(this.targetDir);

    console.log('Scanning directories...');
    const [sourceFiles, targetFiles] = await Promise.all([
      this.getFilesRecursively(this.sourceDir),
      this.getFilesRecursively(this.targetDir)
    ]);

    console.log(`Found ${sourceFiles.length} files in source`);
    console.log(`Found ${targetFiles.length} files in target\n`);


    const sourceSet = new Set(sourceFiles);
    const targetSet = new Set(targetFiles);


    console.log('Processing files...\n');
    for (const relPath of sourceFiles) {
      this.stats.filesCompared++;
      const sourcePath = path.join(this.sourceDir, relPath);
      const targetPath = path.join(this.targetDir, relPath);

      try {
        if (!targetSet.has(relPath)) {

            if (this.options.verbose) {
            console.log(`[NEW] ${relPath}`);
          }
          if (await this.copyFile(sourcePath, targetPath)) {
            this.stats.filesCopied++;
          }
        } else {

            if (await this.filesAreDifferent(sourcePath, targetPath)) {
            if (this.options.verbose) {
              console.log(`[UPDATE] ${relPath}`);
            }
            if (await this.copyFile(sourcePath, targetPath)) {
              this.stats.filesUpdated++;
            }
          } else {
            if (this.options.verbose) {
              console.log(`[SKIP] ${relPath} (identical)`);
            }
          }
        }
      } catch (err) {
        this.stats.errors.push({
          operation: 'process',
          path: relPath,
          error: err.message
        });
      }
    }


    if (this.options.deleteOrphaned) {
      console.log('\nProcessing orphaned files...\n');
      for (const relPath of targetFiles) {
        if (!sourceSet.has(relPath)) {
          const targetPath = path.join(this.targetDir, relPath);
          if (this.options.verbose) {
            console.log(`[DELETE] ${relPath}`);
          }
          if (await this.deleteFile(targetPath)) {
            this.stats.filesDeleted++;
          }
        }
      }
    }


    this.displaySummary();
  }


  displaySummary() {
    console.log('\n========================================');
    console.log('  SYNCHRONIZATION SUMMARY');
    console.log('========================================\n');
    console.log(`Files Compared: ${this.stats.filesCompared}`);
    console.log(`New Files Copied: ${this.stats.filesCopied}`);
    console.log(`Files Updated: ${this.stats.filesUpdated}`);
    console.log(`Files Deleted: ${this.stats.filesDeleted}`);
    console.log(`Total Changes: ${this.stats.filesCopied + this.stats.filesUpdated + this.stats.filesDeleted}`);
    
    if (this.stats.errors.length > 0) {
      console.log(`\nErrors Encountered: ${this.stats.errors.length}`);
      console.log('\n--- ERROR DETAILS ---');
      this.stats.errors.forEach((err, index) => {
        console.log(`\n${index + 1}. Operation: ${err.operation}`);
        if (err.source) console.log(`   Source: ${err.source}`);
        if (err.target) console.log(`   Target: ${err.target}`);
        if (err.path) console.log(`   Path: ${err.path}`);
        console.log(`   Error: ${err.error}`);
      });
    }

    console.log('\n========================================');
    
    if (this.options.dryRun) {
      console.log('\n⚠ DRY RUN MODE - No changes were made');
      console.log('Run without --dry-run to apply changes\n');
    } else {
      console.log('\n✓ Synchronization complete!\n');
    }
  }
}


function parseArguments() {
  const args = process.argv.slice(2);
  
  let sourceDir, targetDir, options;

  if (args.length < 2) {

    sourceDir = './ClassTask';
    targetDir = './ClassTask_backup';
    options = {
      dryRun: false,
      deleteOrphaned: false,
      verbose: false,
      compareByHash: false
    };
    console.log('No arguments provided. Using default directories:');
    console.log(`Source: ${sourceDir}`);
    console.log(`Target: ${targetDir}`);
    console.log('Use --help for usage information.\n');
  } else {
    sourceDir = args[0];
    targetDir = args[1];
    options = {
      dryRun: args.includes('--dry-run'),
      deleteOrphaned: args.includes('--delete'),
      verbose: args.includes('--verbose'),
      compareByHash: args.includes('--compare-hash')
    };
  }

  return { sourceDir, targetDir, options };
}


async function main() {
  try {
    const { sourceDir, targetDir, options } = parseArguments();
    const syncTool = new FileSyncTool(sourceDir, targetDir, options);
    await syncTool.synchronize();
  } catch (err) {
    console.error(`\n❌ Error: ${err.message}\n`);
    process.exit(1);
  }
}


if (require.main === module) {
  main();
}

module.exports = FileSyncTool;