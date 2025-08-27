#!/usr/bin/env node

/**
 * Local CI/CD Validation Script
 * Replicates exact checks from GitHub Actions before pushing
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
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
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(title) {
  console.log();
  log('='.repeat(50), 'cyan');
  log(title, 'cyan');
  log('='.repeat(50), 'cyan');
  console.log();
}

function runCommand(command, description, critical = true) {
  try {
    log(`Running: ${description}`, 'blue');
    console.log(`Command: ${command}`);
    
    const output = execSync(command, { 
      cwd: rootDir, 
      stdio: 'inherit' 
    });
    
    log(`[OK] ${description}`, 'green');
    return true;
  } catch (error) {
    log(`[FAILED] ${description}`, 'red');
    if (critical) {
      log('This check is critical and must pass before pushing to GitHub', 'red');
      process.exit(1);
    }
    return false;
  }
}

function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
  
  log(`Node.js Version: ${nodeVersion}`, 'blue');
  
  // GitHub Actions uses 'node' which is latest stable
  // We should be on Node 20+ for best compatibility
  if (majorVersion < 20) {
    log(`Warning: You're using Node ${majorVersion}. GitHub Actions uses latest Node (20+)`, 'yellow');
    log('Consider upgrading to Node 20+ for exact CI/CD match', 'yellow');
    return false;
  } else {
    log('[OK] Node version compatible with CI/CD', 'green');
    return true;
  }
}

function checkNpmVersion() {
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
    log(`npm Version: ${npmVersion}`, 'blue');
    
    const majorVersion = parseInt(npmVersion.split('.')[0]);
    if (majorVersion < 9) {
      log(`Warning: You're using npm ${npmVersion}. GitHub Actions uses npm 9+`, 'yellow');
      return false;
    } else {
      log('[OK] npm version compatible with CI/CD', 'green');
      return true;
    }
  } catch (error) {
    log('Could not check npm version', 'yellow');
    return false;
  }
}

function checkEnvironmentVariables() {
  log('Checking environment variables...', 'blue');
  
  const envFile = join(rootDir, '.env');
  const envExampleFile = join(rootDir, '.env.example');
  
  if (!existsSync(envFile)) {
    log('Warning: .env file not found', 'yellow');
    log('Create .env file from .env.example for local development', 'yellow');
    return false;
  }
  
  const envContent = readFileSync(envFile, 'utf-8');
  const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missing = [];
  
  for (const key of required) {
    if (!envContent.includes(key) || envContent.includes(`${key}=placeholder`)) {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    log(`Warning: Missing or placeholder environment variables: ${missing.join(', ')}`, 'yellow');
    log('These are required for deployment but not for CI checks', 'yellow');
    return false;
  } else {
    log('[OK] All required environment variables are set', 'green');
    return true;
  }
}

function checkPackageLock() {
  const packageLockFile = join(rootDir, 'package-lock.json');
  
  if (!existsSync(packageLockFile)) {
    log('[FAILED] package-lock.json not found!', 'red');
    log('Run "npm install" to generate package-lock.json', 'red');
    log('CI/CD uses "npm ci" which requires package-lock.json', 'red');
    process.exit(1);
  } else {
    log('[OK] package-lock.json exists', 'green');
    return true;
  }
}

function checkBranch() {
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
    log(`Current branch: ${branch}`, 'blue');
    
    if (branch === 'main' || branch === 'develop') {
      log(`Warning: You're on ${branch} branch!`, 'yellow');
      log('Create a feature branch before making changes', 'yellow');
      log('Use: git checkout -b feature/your-feature-name', 'yellow');
      return false;
    } else {
      log('[OK] Working on feature branch', 'green');
      return true;
    }
  } catch (error) {
    log('Could not check git branch', 'yellow');
    return false;
  }
}

async function main() {
  console.clear();
  
  log('Golf X - Local CI/CD Validation', 'cyan');
  log('Replicating GitHub Actions checks locally', 'cyan');
  log('This ensures your code will pass CI/CD before pushing', 'cyan');
  
  let hasWarnings = false;
  let allChecksPassed = true;
  
  // Environment checks
  header('1. ENVIRONMENT CHECKS');
  
  if (!checkNodeVersion()) hasWarnings = true;
  if (!checkNpmVersion()) hasWarnings = true;
  if (!checkBranch()) hasWarnings = true;
  if (!checkEnvironmentVariables()) hasWarnings = true;
  checkPackageLock();
  
  // Dependency Installation (matches: npm ci)
  header('2. DEPENDENCY INSTALLATION');
  
  runCommand(
    'npm ci',
    'Installing dependencies (using ci for exact match)',
    true
  );
  
  // TypeScript Check (matches: npm run typecheck)
  header('3. TYPESCRIPT CHECK');
  
  const typescriptPassed = runCommand(
    'npm run typecheck',
    'TypeScript type checking',
    false
  );
  if (!typescriptPassed) allChecksPassed = false;
  
  // Linter Check (matches: npm run lint)
  header('4. LINTER CHECK');
  
  const lintPassed = runCommand(
    'npm run lint',
    'ESLint code style checking',
    false
  );
  if (!lintPassed) allChecksPassed = false;
  
  // Build Check (not in CI but good to verify)
  header('5. BUILD CHECK (Optional)');
  
  log('Testing production build...', 'blue');
  const buildPassed = runCommand(
    'npm run build',
    'Production build test',
    false
  );
  if (!buildPassed) {
    log('Build failed - this will fail in deployment!', 'red');
    allChecksPassed = false;
  }
  
  // Security Audit (additional check)
  header('6. SECURITY AUDIT (Additional)');
  
  runCommand(
    'npm audit --audit-level=high',
    'Security vulnerability check',
    false
  );
  
  // Final Summary
  header('VALIDATION SUMMARY');
  
  if (allChecksPassed && !hasWarnings) {
    log('[SUCCESS] All CI/CD checks passed!', 'green');
    log('Your code is ready to push to GitHub', 'green');
    log('', 'reset');
    log('Next steps:', 'cyan');
    log('1. git add .', 'reset');
    log('2. git commit -m "your message"', 'reset');
    log('3. git push origin your-branch-name', 'reset');
    log('4. Create Pull Request on GitHub', 'reset');
  } else if (allChecksPassed && hasWarnings) {
    log('[SUCCESS] Critical CI/CD checks passed', 'green');
    log('[WARNING] Some non-critical warnings detected', 'yellow');
    log('', 'reset');
    log('Your code will pass CI/CD, but consider addressing warnings', 'yellow');
  } else {
    log('[FAILED] CI/CD validation failed!', 'red');
    log('Fix the issues above before pushing to GitHub', 'red');
    log('', 'reset');
    log('The same checks will run in GitHub Actions and fail there', 'red');
    process.exit(1);
  }
}

// Run the validation
main().catch(error => {
  log('Unexpected error during validation:', 'red');
  console.error(error);
  process.exit(1);
});