#!/usr/bin/env node

/**
 * PROJECT ASSISTANT PRO - DEPENDENCY INSTALLER
 * This script installs all required dependencies for Project Assistant Pro
 */

const { exec } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m'
};

// Create banner
function displayBanner() {
  const title = `
╔══════════════════════════════════════════════════════════════╗
║                 PROJECT ASSISTANT PRO                        ║
║                  DEPENDENCY INSTALLER                        ║
║                         v3.0.0                               ║
╚══════════════════════════════════════════════════════════════╝
  `;
  
  console.log(`${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.gray}Date: ${new Date().toLocaleDateString()}${colors.reset}\n`);
}

// Create spinner
function createSpinner(text) {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let frameIndex = 0;
  let intervalId = null;
  let currentText = text;
  let active = false;
  
  const spinner = {
    start: (newText) => {
      if (newText) currentText = newText;
      active = true;
      
      if (intervalId) clearInterval(intervalId);
      
      process.stdout.write(`${colors.cyan}${frames[frameIndex]}${colors.reset} ${currentText}`);
      intervalId = setInterval(() => {
        if (!active) return;
        
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        frameIndex = (frameIndex + 1) % frames.length;
        process.stdout.write(`${colors.cyan}${frames[frameIndex]}${colors.reset} ${currentText}`);
      }, 80);
      
      return spinner;
    },
    
    update: (newText) => {
      currentText = newText;
      if (active) {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(`${colors.cyan}${frames[frameIndex]}${colors.reset} ${currentText}`);
      }
      return spinner;
    },
    
    succeed: (text) => {
      spinner.stop();
      console.log(`${colors.green}✓${colors.reset} ${text || currentText}`);
      return spinner;
    },
    
    fail: (text) => {
      spinner.stop();
      console.log(`${colors.red}✗${colors.reset} ${text || currentText}`);
      return spinner;
    },
    
    stop: () => {
      active = false;
      if (intervalId) clearInterval(intervalId);
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      return spinner;
    }
  };
  
  return spinner;
}

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Execute shell command with promise
function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

// Check if a command exists
async function commandExists(command) {
  try {
    const isWindows = process.platform === 'win32';
    const checkCmd = isWindows ? 'where' : 'which';
    
    await execCommand(`${checkCmd} ${command}`);
    return true;
  } catch (error) {
    return false;
  }
}

// Install dependencies
async function installDependencies() {
  displayBanner();
  
  console.log(`${colors.white}Welcome to the Project Assistant Pro dependency installer!${colors.reset}`);
  console.log(`${colors.white}This script will install all required dependencies.${colors.reset}\n`);
  
  // Check for npm
  const spinner = createSpinner('Checking for npm...').start();
  
  try {
    const hasNpm = await commandExists('npm');
    
    if (!hasNpm) {
      spinner.fail('npm not found');
      console.log(`${colors.red}Error: npm is required but not found on your system.${colors.reset}`);
      console.log(`${colors.yellow}Please install Node.js and npm from https://nodejs.org/${colors.reset}`);
      process.exit(1);
    }
    
    spinner.succeed('npm found');
  } catch (error) {
    spinner.fail(`Error checking for npm: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
  
  // Install dependencies
  const installSpinner = createSpinner('Installing dependencies...').start();
  
  try {
    await execCommand('npm install');
    installSpinner.succeed('Dependencies installed successfully');
  } catch (error) {
    installSpinner.fail(`Error installing dependencies: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
  
  // Create public directory
  const publicSpinner = createSpinner('Setting up public directory...').start();
  
  try {
    const publicDir = path.join(__dirname, 'public');
    
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Copy index.html to public directory
    const indexHtml = path.join(__dirname, 'index.html');
    const destIndexHtml = path.join(publicDir, 'index.html');
    
    if (fs.existsSync(indexHtml)) {
      fs.copyFileSync(indexHtml, destIndexHtml);
    }
    
    publicSpinner.succeed('Public directory set up successfully');
  } catch (error) {
    publicSpinner.fail(`Error setting up public directory: ${error.message}`);
    console.error(error);
  }
  
  console.log(`\n${colors.green}Installation completed successfully!${colors.reset}`);
  console.log(`${colors.cyan}You can now run the setup script:${colors.reset}`);
  console.log(`${colors.white}  npm run setup${colors.reset}`);
  console.log(`${colors.white}  # or${colors.reset}`);
  console.log(`${colors.white}  node setup.js${colors.reset}`);
  
  rl.close();
}

// Run installer
installDependencies().catch(error => {
  console.error(`${colors.red}Unhandled error: ${error.message}${colors.reset}`);
  process.exit(1);
});