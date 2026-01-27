const fs = require('fs');
const path = require('path');
const readline = require('readline');

class LogAnalyzer {
  constructor() {
    this.stats = {
      totalLines: 0,
      errorCount: 0,
      warningCount: 0,
      infoCount: 0,
      debugCount: 0,
      otherCount: 0,
      errors: [],
      warnings: [],
      errorsByType: {},
      timeRange: { start: null, end: null }
    };
  }

  parseLine(line) {

    const patterns = [

    /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)\s*\[(\w+)\]\s*(.*)/,

    /\[(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\]\s*(\w+):\s*(.*)/,

    /(\w+)\s*-\s*(.*)/,

    /\[(\w+)\]\s*(.*)/
    
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        if (pattern === patterns[0]) {
          return { timestamp: match[1], level: match[2].toUpperCase(), message: match[3] };
        } else if (pattern === patterns[1]) {
          return { timestamp: match[1], level: match[2].toUpperCase(), message: match[3] };
        } else if (pattern === patterns[2]) {
          return { timestamp: null, level: match[1].toUpperCase(), message: match[2] };
        } else if (pattern === patterns[3]) {
          return { timestamp: null, level: match[1].toUpperCase(), message: match[2] };
        }
      }
    }

    return { timestamp: null, level: 'OTHER', message: line };
  }


  async analyzeLogFile(filePath) {
    return new Promise((resolve, reject) => {

        if (!fs.existsSync(filePath)) {
        return reject(new Error(`File not found: ${filePath}`));
      }

      const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });
      const rl = readline.createInterface({
        input: readStream,
        crlfDelay: Infinity
      });

      rl.on('line', (line) => {
        if (line.trim()) {
          this.stats.totalLines++;
          const parsed = this.parseLine(line);


          if (parsed.timestamp) {
            const timestamp = new Date(parsed.timestamp);
            if (!this.stats.timeRange.start || timestamp < this.stats.timeRange.start) {
              this.stats.timeRange.start = timestamp;
            }
            if (!this.stats.timeRange.end || timestamp > this.stats.timeRange.end) {
              this.stats.timeRange.end = timestamp;
            }
          }


          switch (parsed.level) {
            case 'ERROR':
              this.stats.errorCount++;
              this.stats.errors.push({
                timestamp: parsed.timestamp,
                message: parsed.message
              });

              const errorType = this.extractErrorType(parsed.message);
              this.stats.errorsByType[errorType] = (this.stats.errorsByType[errorType] || 0) + 1;
              break;
            case 'WARN':
            case 'WARNING':
              this.stats.warningCount++;
              this.stats.warnings.push({
                timestamp: parsed.timestamp,
                message: parsed.message
              });
              break;
            case 'INFO':
              this.stats.infoCount++;
              break;
            case 'DEBUG':
              this.stats.debugCount++;
              break;
            default:
              this.stats.otherCount++;
          }
        }
      });

      rl.on('error', (err) => {
        reject(err);
      });

      rl.on('close', () => {
        resolve(this.stats);
      });
    });
  }

  extractErrorType(message) {
    const errorPatterns = [
      { pattern: /timeout/i, type: 'Timeout Error' },
      { pattern: /connection/i, type: 'Connection Error' },
      { pattern: /not found|404/i, type: 'Not Found Error' },
      { pattern: /unauthorized|401/i, type: 'Authorization Error' },
      { pattern: /database|db|sql/i, type: 'Database Error' },
      { pattern: /network/i, type: 'Network Error' },
      { pattern: /permission|forbidden|403/i, type: 'Permission Error' },
      { pattern: /syntax/i, type: 'Syntax Error' },
      { pattern: /null|undefined/i, type: 'Null Reference Error' }
    ];

    for (const { pattern, type } of errorPatterns) {
      if (pattern.test(message)) {
        return type;
      }
    }

    return 'Other Error';
  }

  generateReport() {
    console.log('\n========================================');
    console.log('       LOG ANALYSIS REPORT');
    console.log('========================================\n');

    console.log('--- OVERVIEW ---');
    console.log(`Total Lines Analyzed: ${this.stats.totalLines}`);
    
    if (this.stats.timeRange.start && this.stats.timeRange.end) {
      console.log(`Time Range: ${this.stats.timeRange.start.toISOString()} to ${this.stats.timeRange.end.toISOString()}`);
    }
    console.log('');

    console.log('--- LOG LEVEL DISTRIBUTION ---');
    console.log(`ERROR:   ${this.stats.errorCount} (${this.getPercentage(this.stats.errorCount)}%)`);
    console.log(`WARNING: ${this.stats.warningCount} (${this.getPercentage(this.stats.warningCount)}%)`);
    console.log(`INFO:    ${this.stats.infoCount} (${this.getPercentage(this.stats.infoCount)}%)`);
    console.log(`DEBUG:   ${this.stats.debugCount} (${this.getPercentage(this.stats.debugCount)}%)`);
    console.log(`OTHER:   ${this.stats.otherCount} (${this.getPercentage(this.stats.otherCount)}%)`);
    console.log('');

    if (this.stats.errorCount > 0) {
      console.log('--- ERROR BREAKDOWN BY TYPE ---');
      const sortedErrors = Object.entries(this.stats.errorsByType)
        .sort((a, b) => b[1] - a[1]);
      
      for (const [type, count] of sortedErrors) {
        const percentage = ((count / this.stats.errorCount) * 100).toFixed(2);
        console.log(`${type}: ${count} (${percentage}%)`);
      }
      console.log('');

      console.log('--- RECENT ERRORS (Last 5) ---');
      const recentErrors = this.stats.errors.slice(-5);
      recentErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.timestamp || 'N/A'}`);
        console.log(`   ${error.message.substring(0, 100)}${error.message.length > 100 ? '...' : ''}`);
      });
      console.log('');
    }

    if (this.stats.warningCount > 0) {
      console.log('--- RECENT WARNINGS (Last 3) ---');
      const recentWarnings = this.stats.warnings.slice(-3);
      recentWarnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.timestamp || 'N/A'}`);
        console.log(`   ${warning.message.substring(0, 100)}${warning.message.length > 100 ? '...' : ''}`);
      });
      console.log('');
    }

    console.log('========================================\n');
  }

  getPercentage(count) {
    if (this.stats.totalLines === 0) return 0;
    return ((count / this.stats.totalLines) * 100).toFixed(2);
  }

  async exportReport(outputPath) {
    const reportContent = this.generateTextReport();
    
    return new Promise((resolve, reject) => {
      fs.writeFile(outputPath, reportContent, 'utf8', (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`✓ Report exported to: ${outputPath}\n`);
          resolve();
        }
      });
    });
  }

  generateTextReport() {
    let report = '========================================\n';
    report += '       LOG ANALYSIS REPORT\n';
    report += '========================================\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;

    report += '--- OVERVIEW ---\n';
    report += `Total Lines Analyzed: ${this.stats.totalLines}\n`;
    
    if (this.stats.timeRange.start && this.stats.timeRange.end) {
      report += `Time Range: ${this.stats.timeRange.start.toISOString()} to ${this.stats.timeRange.end.toISOString()}\n`;
    }
    report += '\n';

    report += '--- LOG LEVEL DISTRIBUTION ---\n';
    report += `ERROR:   ${this.stats.errorCount} (${this.getPercentage(this.stats.errorCount)}%)\n`;
    report += `WARNING: ${this.stats.warningCount} (${this.getPercentage(this.stats.warningCount)}%)\n`;
    report += `INFO:    ${this.stats.infoCount} (${this.getPercentage(this.stats.infoCount)}%)\n`;
    report += `DEBUG:   ${this.stats.debugCount} (${this.getPercentage(this.stats.debugCount)}%)\n`;
    report += `OTHER:   ${this.stats.otherCount} (${this.getPercentage(this.stats.otherCount)}%)\n\n`;

    if (this.stats.errorCount > 0) {
      report += '--- ERROR BREAKDOWN BY TYPE ---\n';
      const sortedErrors = Object.entries(this.stats.errorsByType)
        .sort((a, b) => b[1] - a[1]);
      
      for (const [type, count] of sortedErrors) {
        const percentage = ((count / this.stats.errorCount) * 100).toFixed(2);
        report += `${type}: ${count} (${percentage}%)\n`;
      }
      report += '\n';

      report += '--- ALL ERRORS ---\n';
      this.stats.errors.forEach((error, index) => {
        report += `${index + 1}. ${error.timestamp || 'N/A'}\n`;
        report += `   ${error.message}\n\n`;
      });
    }

    report += '========================================\n';
    return report;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node logAnalyzer.js <log-file-path> [output-report-path]');
    console.log('Example: node logAnalyzer.js ./logs/app.log ./reports/analysis.txt');
    return;
  }

  const logFilePath = args[0];
  const reportPath = args[1] || null;

  console.log(`\nAnalyzing log file: ${logFilePath}`);
  console.log('Please wait...\n');

  const analyzer = new LogAnalyzer();

  try {
    await analyzer.analyzeLogFile(logFilePath);
    analyzer.generateReport();

    if (reportPath) {
      await analyzer.exportReport(reportPath);
    }

    console.log('Analysis complete!');
  } catch (err) {
    console.error(`\nError during analysis: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = LogAnalyzer;