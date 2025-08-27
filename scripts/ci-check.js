#!/usr/bin/env node

/**
 * Quick CI/CD Check Runner
 * Run this before every push to ensure CI/CD will pass
 */

import { spawn } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

console.clear();
log('Running CI/CD validation...', 'cyan');
log('This will check if your code will pass GitHub Actions', 'cyan');
console.log();

// Run the strict validation
const strictScript = join(__dirname, 'validate-ci-strict.js');

const child = spawn('node', [strictScript], {
  stdio: 'inherit',
  shell: true
});

child.on('exit', (code) => {
  if (code === 0) {
    console.log();
    log('CI/CD validation passed!', 'green');
  } else {
    console.log();
    log('CI/CD validation failed!', 'red');
    log('Fix issues before pushing', 'red');
    process.exit(1);
  }
});