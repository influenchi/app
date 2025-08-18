#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const TARGET_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];
const EXCLUDE_DIRS = ['node_modules', '.git', '.next', 'dist', 'build', '.vercel'];
const EXCLUDE_FILES = ['remove-console-logs.mjs'];

// Console methods to remove (you can customize this)
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
  filesModified: 0,
  consolesRemoved: 0,
  errors: 0
};

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
 * Remove console statements from file content
 */
function removeConsoleLogs(content, filePath) {
  let modifiedContent = content;
  let removedCount = 0;

  // More comprehensive regex patterns for different console.log formats
  const patterns = CONSOLE_METHODS.map(method => {
    // Handles various formats:
    // console.log(...);
    // console.log('string', variable, ...);
    // console.log(`template ${string}`);
    // Multiline console.log calls
    return new RegExp(
      `^\\s*${method.replace('.', '\\.')}\\s*\\([^;]*?\\);?\\s*$`,
      'gm'
    );
  });

  // Also handle multiline console statements
  const multilinePattern = new RegExp(
    `^\\s*(${CONSOLE_METHODS.map(m => m.replace('.', '\\.')).join('|')})\\s*\\([\\s\\S]*?\\);?\\s*$`,
    'gm'
  );

  // Apply all patterns
  [...patterns, multilinePattern].forEach(pattern => {
    const matches = modifiedContent.match(pattern);
    if (matches) {
      removedCount += matches.length;
      modifiedContent = modifiedContent.replace(pattern, '');
    }
  });

  // Clean up empty lines left after removal (optional)
  modifiedContent = modifiedContent.replace(/\n\s*\n\s*\n/g, '\n\n');

  if (removedCount > 0) {
    console.log(`  ✅ Removed ${removedCount} console statement(s) from ${path.relative(process.cwd(), filePath)}`);
  }

  return { content: modifiedContent, removedCount };
}

/**
 * Process a single file
 */
async function processFile(filePath) {
  try {
    stats.filesScanned++;

    const content = fs.readFileSync(filePath, 'utf8');
    const { content: modifiedContent, removedCount } = removeConsoleLogs(content, filePath);

    if (removedCount > 0) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      stats.filesModified++;
      stats.consolesRemoved += removedCount;
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
  console.log('🧹 Console Log Removal Script Starting...\n');

  const startTime = Date.now();
  const projectRoot = process.cwd();

  console.log(`📁 Scanning project: ${projectRoot}`);
  console.log(`🎯 Target extensions: ${TARGET_EXTENSIONS.join(', ')}`);
  console.log(`🚫 Excluding directories: ${EXCLUDE_DIRS.join(', ')}`);
  console.log(`📝 Console methods to remove: ${CONSOLE_METHODS.join(', ')}\n`);

  // Confirm before proceeding
  console.log('⚠️  This will modify your files. Make sure you have backups or version control!');
  console.log('Press Ctrl+C to cancel, or any key to continue...\n');

  // Add a small delay to let user cancel if needed
  await new Promise(resolve => {
    process.stdin.once('data', () => {
      process.stdin.pause();
      resolve();
    });
  });

  await scanDirectory(projectRoot);

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n📊 Summary:');
  console.log(`  Files scanned: ${stats.filesScanned}`);
  console.log(`  Files modified: ${stats.filesModified}`);
  console.log(`  Console statements removed: ${stats.consolesRemoved}`);
  console.log(`  Errors: ${stats.errors}`);
  console.log(`  Duration: ${duration}s`);

  if (stats.consolesRemoved > 0) {
    console.log('\n✨ Console cleanup completed successfully!');
  } else {
    console.log('\n💡 No console statements found to remove.');
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
