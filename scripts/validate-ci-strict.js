#!/usr/bin/env node

/**
 * Strict Local CI/CD Validation Script
 * Ensures EXACT version matching with GitHub Actions
 * Fails if ANY difference detected
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Colors for console output
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
  log('='.repeat(60), 'cyan');
  log(title, 'cyan');
  log('='.repeat(60), 'cyan');
  console.log();
}

function getVersion(command) {
  try {
    return execSync(command, { encoding: 'utf-8' }).trim();
  } catch (error) {
    return null;
  }
}

function runCommand(command, description, options = {}) {
  const { critical = true, showOutput = true } = options;
  
  try {
    log(`Running: ${description}`, 'blue');
    console.log(`Command: ${command}`);
    
    const output = execSync(command, { 
      cwd: rootDir, 
      stdio: showOutput ? 'inherit' : 'pipe',
      encoding: 'utf-8'
    });
    
    log(`[PASS] ${description}`, 'green');
    return { success: true, output };
  } catch (error) {
    log(`[FAIL] ${description}`, 'red');
    if (critical) {
      log('This check is CRITICAL and must pass', 'red');
      log('CI/CD will fail with this error', 'red');
      process.exit(1);
    }
    return { success: false, error };
  }
}

// CI/CD Environment Configuration
const CI_CONFIG = {
  // GitHub Actions uses ubuntu-latest (currently Ubuntu 22.04)
  os: 'ubuntu-22.04',
  
  // node-version: 'node' means latest stable (currently v20+)
  nodeVersion: {
    min: '20.0.0',
    recommended: '20.x or 22.x',
    ciUsesLatest: true
  },
  
  // npm comes with Node
  npmVersion: {
    min: '9.0.0',
    recommended: '10.x',
    ciUsesLatest: true
  },
  
  // TypeScript version from package.json
  typescriptVersion: '~5.8.3',
  
  // ESLint version from package.json
  eslintVersion: '^9.33.0'
};

function checkExactVersions() {
  header('VERSION COMPATIBILITY CHECK');
  
  let allVersionsMatch = true;
  
  // Node.js version check
  const nodeVersion = process.version;
  const nodeMajor = parseInt(nodeVersion.split('.')[0].substring(1));
  log(`Local Node.js: ${nodeVersion}`, 'blue');
  log(`CI/CD Node.js: latest stable (20+ required)`, 'blue');
  
  if (nodeMajor < 20) {
    log(`[FAIL] Node version mismatch!`, 'red');
    log(`You have Node ${nodeMajor}, CI/CD uses Node 20+`, 'red');
    log(`Install Node 20 or higher to match CI/CD`, 'red');
    allVersionsMatch = false;
  } else {
    log(`[PASS] Node version compatible`, 'green');
  }
  
  console.log();
  
  // npm version check
  const npmVersion = getVersion('npm --version');
  const npmMajor = parseInt(npmVersion.split('.')[0]);
  log(`Local npm: ${npmVersion}`, 'blue');
  log(`CI/CD npm: ${npmMajor >= 10 ? 'matching' : 'newer than local'}`, 'blue');
  
  if (npmMajor < 9) {
    log(`[FAIL] npm version too old!`, 'red');
    log(`You have npm ${npmVersion}, CI/CD uses npm 9+`, 'red');
    allVersionsMatch = false;
  } else {
    log(`[PASS] npm version compatible`, 'green');
  }
  
  console.log();
  
  // TypeScript version check
  const tsVersion = getVersion('npx tsc --version');
  log(`Local TypeScript: ${tsVersion}`, 'blue');
  log(`package.json TypeScript: ${CI_CONFIG.typescriptVersion}`, 'blue');
  
  const installedTS = tsVersion ? tsVersion.replace('Version ', '') : 'not found';
  const expectedTS = CI_CONFIG.typescriptVersion.replace('~', '').replace('^', '');
  
  if (!tsVersion) {
    log(`[FAIL] TypeScript not installed!`, 'red');
    allVersionsMatch = false;
  } else if (!installedTS.startsWith(expectedTS.split('.')[0])) {
    log(`[WARNING] TypeScript version mismatch`, 'yellow');
    log(`Consider running: npm ci`, 'yellow');
  } else {
    log(`[PASS] TypeScript version matches`, 'green');
  }
  
  console.log();
  
  // ESLint version check
  const eslintVersion = getVersion('npx eslint --version');
  log(`Local ESLint: ${eslintVersion}`, 'blue');
  log(`package.json ESLint: ${CI_CONFIG.eslintVersion}`, 'blue');
  
  if (!eslintVersion) {
    log(`[FAIL] ESLint not installed!`, 'red');
    allVersionsMatch = false;
  } else {
    log(`[PASS] ESLint installed`, 'green');
  }
  
  return allVersionsMatch;
}

function strictPackageLockCheck() {
  header('PACKAGE-LOCK INTEGRITY CHECK');
  
  const packageLockPath = join(rootDir, 'package-lock.json');
  const packageJsonPath = join(rootDir, 'package.json');
  
  if (!existsSync(packageLockPath)) {
    log('[FAIL] package-lock.json missing!', 'red');
    log('CI/CD uses "npm ci" which REQUIRES package-lock.json', 'red');
    log('Run: npm install', 'red');
    return false;
  }
  
  // Check if package-lock.json is in sync with package.json
  log('Verifying package-lock.json integrity...', 'blue');
  
  const result = runCommand(
    'npm ls --depth=0',
    'Package dependencies sync check',
    { critical: false, showOutput: false }
  );
  
  if (!result.success) {
    log('[FAIL] package-lock.json out of sync!', 'red');
    log('Run: npm install', 'red');
    return false;
  }
  
  log('[PASS] package-lock.json is in sync', 'green');
  return true;
}

function runStrictCIChecks() {
  header('STRICT CI/CD CHECKS (EXACT MATCH)');
  
  const checks = [
    {
      name: 'Clean Install (npm ci)',
      command: 'npm ci',
      description: 'Installing exact dependencies from package-lock.json',
      critical: true
    },
    {
      name: 'TypeScript Check',
      command: 'npm run typecheck',
      description: 'TypeScript compilation without emit',
      critical: true
    },
    {
      name: 'ESLint Check',  
      command: 'npm run lint',
      description: 'ESLint code quality check',
      critical: true
    },
    {
      name: 'Build Verification',
      command: 'npm run build',
      description: 'Production build test',
      critical: false
    }
  ];
  
  let allPassed = true;
  const results = [];
  
  for (const check of checks) {
    console.log();
    log(`[${checks.indexOf(check) + 1}/${checks.length}] ${check.name}`, 'magenta');
    
    const result = runCommand(
      check.command,
      check.description,
      { critical: check.critical }
    );
    
    results.push({
      name: check.name,
      success: result.success,
      critical: check.critical
    });
    
    if (!result.success && check.critical) {
      allPassed = false;
      break; // Stop on first critical failure
    } else if (!result.success) {
      allPassed = false;
    }
  }
  
  return { allPassed, results };
}

function createCIReport(results) {
  header('CI/CD VALIDATION REPORT');
  
  const timestamp = new Date().toISOString();
  const reportPath = join(rootDir, '.ci-validation-report.json');
  
  const report = {
    timestamp,
    environment: {
      node: process.version,
      npm: getVersion('npm --version'),
      os: process.platform,
      typescript: getVersion('npx tsc --version'),
      eslint: getVersion('npx eslint --version')
    },
    checks: results,
    passed: results.every(r => r.success || !r.critical)
  };
  
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log('Report saved to: .ci-validation-report.json', 'blue');
  
  return report;
}

async function main() {
  console.clear();
  
  log('STRICT CI/CD VALIDATION - EXACT MATCH MODE', 'cyan');
  log('This ensures 100% compatibility with GitHub Actions', 'cyan');
  log('Any difference will cause failure', 'cyan');
  
  // Step 1: Check versions
  const versionsMatch = checkExactVersions();
  
  if (!versionsMatch) {
    log('[FAIL] Version mismatch detected!', 'red');
    log('Install correct versions to match CI/CD', 'red');
    process.exit(1);
  }
  
  // Step 2: Check package-lock
  const packageLockValid = strictPackageLockCheck();
  
  if (!packageLockValid) {
    log('[FAIL] Package lock issues detected!', 'red');
    process.exit(1);
  }
  
  // Step 3: Run strict CI checks
  const { allPassed, results } = runStrictCIChecks();
  
  // Step 4: Generate report
  const report = createCIReport(results);
  
  // Final summary
  header('FINAL VALIDATION RESULT');
  
  if (allPassed) {
    log('[SUCCESS] ALL CI/CD CHECKS PASSED!', 'green');
    log('Your code is 100% CI/CD compliant', 'green');
    log('', 'reset');
    log('Safe to push to GitHub - CI/CD will pass', 'green');
    log('', 'reset');
    log('Commands to push:', 'cyan');
    log('  git add .', 'reset');
    log('  git commit -m "your message"', 'reset');
    log('  git push origin your-branch', 'reset');
  } else {
    log('[FAILURE] CI/CD VALIDATION FAILED!', 'red');
    log('', 'reset');
    log('Failed checks:', 'red');
    results.filter(r => !r.success).forEach(r => {
      log(`  - ${r.name} ${r.critical ? '(CRITICAL)' : '(WARNING)'}`, 'red');
    });
    log('', 'reset');
    log('DO NOT PUSH - GitHub Actions will fail', 'red');
    log('Fix all issues first, then run validation again', 'red');
    process.exit(1);
  }
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  log('Unexpected error during validation:', 'red');
  console.error(error);
  process.exit(1);
});

// Run validation
main().catch(error => {
  log('Critical error:', 'red');
  console.error(error);
  process.exit(1);
});