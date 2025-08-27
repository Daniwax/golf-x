#!/usr/bin/env node

/**
 * Pre-Push CI/CD Check
 * Ensures code will pass GitHub Actions before pushing
 * Matches EXACT CI/CD pipeline checks
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Terminal colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(title) {
  console.log();
  log('━'.repeat(60), 'cyan');
  log(`  ${title}`, 'cyan');
  log('━'.repeat(60), 'cyan');
  console.log();
}

function runCheck(command, description) {
  try {
    log(`[RUNNING] ${description}...`, 'blue');
    execSync(command, { 
      cwd: rootDir, 
      stdio: 'inherit' 
    });
    log(`[PASS] ${description}`, 'green');
    return true;
  } catch (error) {
    log(`[FAIL] ${description}`, 'red');
    return false;
  }
}

function checkEnvironment() {
  const results = {
    node: false,
    npm: false,
    dependencies: false,
    packageLock: false
  };
  
  // Check Node version
  const nodeVersion = process.version;
  const nodeMajor = parseInt(nodeVersion.split('.')[0].substring(1));
  log(`Node.js: ${nodeVersion}`, 'blue');
  
  if (nodeMajor < 20) {
    log(`[WARNING] CI/CD uses Node 20+, you have Node ${nodeMajor}`, 'yellow');
  } else {
    results.node = true;
  }
  
  // Check npm version  
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
    log(`npm: ${npmVersion}`, 'blue');
    results.npm = true;
  } catch (error) {
    log('[WARNING] Could not check npm version', 'yellow');
  }
  
  // Check package-lock.json exists
  const packageLockPath = join(rootDir, 'package-lock.json');
  if (!existsSync(packageLockPath)) {
    log('[FAIL] package-lock.json not found!', 'red');
    log('Run: npm install', 'red');
  } else {
    results.packageLock = true;
  }
  
  // Check dependencies installed
  try {
    execSync('npm ls --depth=0', { 
      cwd: rootDir, 
      stdio: 'pipe' 
    });
    results.dependencies = true;
    log('[OK] Dependencies installed and in sync', 'green');
  } catch (error) {
    log('[WARNING] Dependencies may be out of sync', 'yellow');
    log('Run: npm install', 'yellow');
  }
  
  return results;
}

function runCIPipeline() {
  const checks = [
    {
      name: 'TypeScript Check',
      command: 'npm run typecheck',
      description: 'Type checking (tsc --noEmit)',
      critical: true
    },
    {
      name: 'ESLint',
      command: 'npm run lint',
      description: 'Linting (eslint .)',
      critical: true
    },
    {
      name: 'Build Test',
      command: 'npm run build',
      description: 'Production build',
      critical: false
    }
  ];
  
  const results = [];
  let criticalFailure = false;
  
  for (const check of checks) {
    console.log();
    const passed = runCheck(check.command, check.description);
    
    results.push({
      name: check.name,
      passed,
      critical: check.critical
    });
    
    if (!passed && check.critical) {
      criticalFailure = true;
      break;
    }
  }
  
  return { results, criticalFailure };
}

async function main() {
  console.clear();
  
  header('PRE-PUSH CI/CD VALIDATION');
  log('Matching GitHub Actions Pipeline Checks', 'cyan');
  
  // Step 1: Environment check
  header('1. ENVIRONMENT CHECK');
  const env = checkEnvironment();
  
  if (!env.packageLock) {
    log('[ABORT] Cannot proceed without package-lock.json', 'red');
    process.exit(1);
  }
  
  if (!env.dependencies) {
    log('Installing dependencies...', 'yellow');
    try {
      execSync('npm install', { 
        cwd: rootDir, 
        stdio: 'inherit' 
      });
    } catch (error) {
      log('[FAIL] Could not install dependencies', 'red');
      process.exit(1);
    }
  }
  
  // Step 2: Run CI pipeline checks
  header('2. CI/CD PIPELINE CHECKS');
  log('Running the same checks as GitHub Actions...', 'cyan');
  
  const { results, criticalFailure } = runCIPipeline();
  
  // Step 3: Summary
  header('VALIDATION SUMMARY');
  
  console.log('Results:');
  results.forEach(r => {
    const status = r.passed ? '[PASS]' : '[FAIL]';
    const color = r.passed ? 'green' : 'red';
    const critical = r.critical ? ' (CRITICAL)' : '';
    log(`  ${status} ${r.name}${critical}`, color);
  });
  
  console.log();
  
  if (criticalFailure) {
    log('━━━ CI/CD VALIDATION FAILED ━━━', 'red');
    log('', 'reset');
    log('Your code will FAIL in GitHub Actions!', 'red');
    log('Fix the errors above before pushing.', 'red');
    log('', 'reset');
    log('The exact same checks run in CI/CD:', 'yellow');
    log('  1. npm ci', 'reset');
    log('  2. npm run typecheck', 'reset');
    log('  3. npm run lint', 'reset');
    process.exit(1);
  } else {
    const hasWarnings = results.some(r => !r.passed && !r.critical);
    
    if (hasWarnings) {
      log('━━━ CI/CD VALIDATION PASSED WITH WARNINGS ━━━', 'yellow');
      log('', 'reset');
      log('Critical checks passed. Non-critical warnings detected.', 'yellow');
    } else {
      log('━━━ CI/CD VALIDATION PASSED ━━━', 'green');
      log('', 'reset');
      log('All checks passed!', 'green');
    }
    
    log('', 'reset');
    log('Your code is ready to push:', 'cyan');
    log('  git add .', 'reset');
    log('  git commit -m "your message"', 'reset'); 
    log('  git push origin your-branch', 'reset');
  }
}

// Error handling
process.on('unhandledRejection', (error) => {
  log('Unexpected error:', 'red');
  console.error(error);
  process.exit(1);
});

// Run validation
main().catch(error => {
  log('Critical error:', 'red');
  console.error(error);
  process.exit(1);
});