#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const TARGET_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];
const EXCLUDE_DIRS = ['node_modules', '.git', '.next', 'dist', 'build', '.vercel'];
const EXCLUDE_FILES = ['remove-console-logs.mjs', 'preview-console-logs.mjs'];

// Console methods to find
const CONSOLE_METHODS = [
  'console.log',
  'console.warn', 
  'console.info',
  'console.debug',
  'console.trace'
];

// Statistics
let stats = {
  filesScanned: 0,
  filesWithConsoles: 0,
  totalConsoles: 0,
  errors: 0
};

let foundConsoles = [];

/**
 * Check if a directory should be excluded
 */
function shouldExcludeDir(dirName) {
  return EXCLUDE_DIRS.some(excluded => dirName.includes(excluded));
}

/**
 * Check if a file should be processed
 */
function shouldProcessFile(filePath) {
  const fileName = path.basename(filePath);
  const ext = path.extname(filePath);
  
  return TARGET_EXTENSIONS.includes(ext) && !EXCLUDE_FILES.includes(fileName);
}

/**
 * Find console statements in file content
 */
function findConsoleLogs(content, filePath) {
  const lines = content.split('\n');
  const consoleLines = [];
  
  lines.forEach((line, index) => {
    CONSOLE_METHODS.forEach(method => {
      if (line.includes(method)) {
        consoleLines.push({
          line: index + 1,
          content: line.trim(),
          method: method
        });
      }
    });
  });
  
  if (consoleLines.length > 0) {
    foundConsoles.push({
      file: path.relative(process.cwd(), filePath),
      consoles: consoleLines
    });
  }
  
  return consoleLines.length;
}

/**
 * Process a single file
 */
async function processFile(filePath) {
  try {
    stats.filesScanned++;
    
    const content = fs.readFileSync(filePath, 'utf8');
    const consoleCount = findConsoleLogs(content, filePath);
    
    if (consoleCount > 0) {
      stats.filesWithConsoles++;
      stats.totalConsoles += consoleCount;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    stats.errors++;
  }
}

/**
 * Recursively scan directory
 */
async function scanDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!shouldExcludeDir(item)) {
          await scanDirectory(fullPath);
        }
      } else if (stat.isFile() && shouldProcessFile(fullPath)) {
        await processFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`❌ Error scanning directory ${dirPath}:`, error.message);
    stats.errors++;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('👀 Console Log Preview Script\n');
  
  const startTime = Date.now();
  const projectRoot = process.cwd();
  
  console.log(`📁 Scanning project: ${projectRoot}`);
  console.log(`🎯 Target extensions: ${TARGET_EXTENSIONS.join(', ')}`);
  console.log(`🚫 Excluding directories: ${EXCLUDE_DIRS.join(', ')}`);
  console.log(`📝 Looking for: ${CONSOLE_METHODS.join(', ')}\n`);
  
  await scanDirectory(projectRoot);
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  // Show results
  if (foundConsoles.length > 0) {
    console.log('📋 Console statements found:\n');
    
    foundConsoles.forEach(fileInfo => {
      console.log(`📄 ${fileInfo.file}`);
      fileInfo.consoles.forEach(consoleInfo => {
        console.log(`  Line ${consoleInfo.line}: ${consoleInfo.content}`);
      });
      console.log('');
    });
  }
  
  console.log('📊 Summary:');
  console.log(`  Files scanned: ${stats.filesScanned}`);
  console.log(`  Files with console statements: ${stats.filesWithConsoles}`);
  console.log(`  Total console statements: ${stats.totalConsoles}`);
  console.log(`  Errors: ${stats.errors}`);
  console.log(`  Duration: ${duration}s\n`);
  
  if (stats.totalConsoles > 0) {
    console.log('🚀 To remove these console statements, run:');
    console.log('   node remove-console-logs.mjs');
  } else {
    console.log('✨ No console statements found!');
  }
  
  if (stats.errors > 0) {
    console.log('\n⚠️  Some errors occurred. Please review the output above.');
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
