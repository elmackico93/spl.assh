#!/usr/bin/env node

/**
 * PROJECT ASSISTANT PRO - MAIN ENTRY POINT
 * Enhanced version with Express server and Matrix-style browser interface
 * 
 * This file initializes and starts the Project Assistant Pro application
 */

const app = require('./app');
const fs = require('fs');
const path = require('path');
const os = require('os');
const chalk = require('chalk');

// Check if the application is properly installed
const APP_DIR = path.join(os.homedir(), '.project-assistant');
const CONFIG_FILE = path.join(APP_DIR, 'config.json');

// Display banner
function displayBanner() {
  console.log(chalk.cyan(`
╔══════════════════════════════════════════════════════════════╗
║                 PROJECT ASSISTANT PRO                        ║
║       Advanced AI-powered Next.js/React Development Tool     ║
║                         v3.0.0                               ║
╚══════════════════════════════════════════════════════════════╝
  `));
  console.log(chalk.gray(`Date: ${new Date().toLocaleDateString()}\n`));
}

// Run application
async function runApp() {
  displayBanner();
  
  // Check if setup is required
  if (!fs.existsSync(APP_DIR) || !fs.existsSync(CONFIG_FILE)) {
    console.log(chalk.yellow('First-time setup required. Running setup...'));
    
    try {
      require('./setup');
      return;
    } catch (error) {
      console.error(chalk.red(`Error running setup: ${error.message}`));
      console.log(chalk.yellow('Please run the setup script manually:'));
      console.log(chalk.white('  npm run setup'));
      process.exit(1);
    }
  }
  
  // Start the application
  try {
    await app.startCLI();
  } catch (error) {
    console.error(chalk.red(`Error starting application: ${error.message}`));
    process.exit(1);
  }
}

// Check for command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  displayBanner();
  console.log(chalk.white('Project Assistant Pro Help:'));
  console.log(chalk.white('  --help, -h     Display this help message'));
  console.log(chalk.white('  --version, -v  Display version information'));
  console.log(chalk.white('  --setup        Run the setup script'));
  console.log(chalk.white('  --server-only  Run only the server (no CLI)'));
  console.log(chalk.white('  --cli-only     Run only the CLI (no server)'));
  process.exit(0);
} else if (args.includes('--version') || args.includes('-v')) {
  displayBanner();
  process.exit(0);
} else if (args.includes('--setup')) {
  require('./setup');
} else if (args.includes('--server-only')) {
  displayBanner();
  console.log(chalk.green('Starting server only mode...'));
  app.initializeServer();
} else if (args.includes('--cli-only')) {
  // Load config file
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    config.enableBrowser = false;
    
    // Save updated config
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error(chalk.red(`Error updating config: ${error.message}`));
  }
  
  displayBanner();
  console.log(chalk.green('Starting CLI only mode...'));
  app.startCLI();
} else {
  // Run normally
  runApp();
}

// Handle signal interrupts
process.on('SIGINT', () => {
  console.log(`\n${chalk.green('Exiting Project Assistant Pro. Goodbye!')}`);
  process.exit(0);
});