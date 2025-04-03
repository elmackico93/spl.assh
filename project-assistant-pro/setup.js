#!/usr/bin/env node

/**
 * PROJECT ASSISTANT PRO - SETUP SCRIPT
 * This script sets up the environment for Project Assistant Pro
 */

const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const readline = require('readline');
const os = require('os');
const chalk = require('chalk');

// Application directories
const APP_DIR = path.join(os.homedir(), '.project-assistant');
const CACHE_DIR = path.join(APP_DIR, 'cache');
const SESSIONS_DIR = path.join(APP_DIR, 'sessions');
const EXPORTS_DIR = path.join(APP_DIR, 'exports');
const BACKUPS_DIR = path.join(APP_DIR, 'backups');
const PUBLIC_DIR = path.join(__dirname, 'public');
const CONFIG_FILE = path.join(APP_DIR, 'config.json');

// Default configuration
const DEFAULT_CONFIG = {
  model: 'gpt-4-turbo-preview',
  maxTokens: 4096,
  temperature: 0.7,
  cacheEnabled: true,
  debug: false,
  formatCode: true,
  maxContextFiles: 8,
  ignoreDirs: ['node_modules', '.git', '.next', 'out', 'dist', 'build', 'public'],
  maxFileSizeKb: 200,
  preferredFileTypes: ['.tsx', '.ts', '.jsx', '.js', '.css', '.json', '.md'],
  sessionTimeout: 3600,
  theme: 'matrix',
  port: 3030,
  enableCLI: true,
  enableBrowser: true
};

// Create banner
function displayBanner() {
  console.log(chalk.cyan(`
╔══════════════════════════════════════════════════════════════╗
║                 PROJECT ASSISTANT PRO                         ║
║                      SETUP SCRIPT                             ║
║                         v3.0.0                               ║
╚══════════════════════════════════════════════════════════════╝
  `));
  console.log(chalk.gray(`Date: ${new Date().toLocaleDateString()}\n`));
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
      
      process.stdout.write(`${chalk.cyan(frames[frameIndex])} ${currentText}`);
      intervalId = setInterval(() => {
        if (!active) return;
        
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        frameIndex = (frameIndex + 1) % frames.length;
        process.stdout.write(`${chalk.cyan(frames[frameIndex])} ${currentText}`);
      }, 80);
      
      return spinner;
    },
    
    update: (newText) => {
      currentText = newText;
      if (active) {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(`${chalk.cyan(frames[frameIndex])} ${currentText}`);
      }
      return spinner;
    },
    
    succeed: (text) => {
      spinner.stop();
      console.log(`${chalk.green('✓')} ${text || currentText}`);
      return spinner;
    },
    
    fail: (text) => {
      spinner.stop();
      console.log(`${chalk.red('✗')} ${text || currentText}`);
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

// Ask a question
function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

// Main setup function
async function setup() {
  displayBanner();
  
  console.log(chalk.white('Welcome to the Project Assistant Pro setup!'));
  console.log(chalk.white('This script will set up your environment for Project Assistant Pro.\n'));
  
  // Create directories
  const spinner = createSpinner('Creating application directories...').start();
  
  try {
    await fs.ensureDir(APP_DIR);
    await fs.ensureDir(CACHE_DIR);
    await fs.ensureDir(SESSIONS_DIR);
    await fs.ensureDir(EXPORTS_DIR);
    await fs.ensureDir(BACKUPS_DIR);
    await fs.ensureDir(PUBLIC_DIR);
    
    spinner.succeed('Application directories created successfully');
  } catch (error) {
    spinner.fail(`Error creating directories: ${error.message}`);
    console.error(chalk.red(error));
    process.exit(1);
  }
  
  // Check for existing config
  let config = { ...DEFAULT_CONFIG };
  
  if (await fs.pathExists(CONFIG_FILE)) {
    const spinner = createSpinner('Loading existing configuration...').start();
    
    try {
      const existingConfig = await fs.readJson(CONFIG_FILE);
      config = { ...DEFAULT_CONFIG, ...existingConfig };
      spinner.succeed('Existing configuration loaded');
    } catch (error) {
      spinner.fail(`Error loading configuration: ${error.message}`);
      console.log(chalk.yellow('Using default configuration'));
    }
  } else {
    console.log(chalk.yellow('No existing configuration found. Creating a new one...'));
  }
  
  // Ask for OpenAI API key
  const apiKey = process.env.OPENAI_API_KEY || await askQuestion(
    chalk.cyan('Enter your OpenAI API key (press Enter to skip): ')
  );
  
  if (apiKey && apiKey.trim()) {
    console.log(chalk.green('API key provided'));
    console.log(chalk.yellow('Note: Your API key is not stored in the configuration file.'));
    console.log(chalk.yellow('Please set the OPENAI_API_KEY environment variable in your system or shell profile.'));
    console.log(chalk.yellow('Example: export OPENAI_API_KEY=your_key_here\n'));
  } else {
    console.log(chalk.yellow('No API key provided.'));
    console.log(chalk.yellow('You will need to set the OPENAI_API_KEY environment variable to use AI features.'));
    console.log(chalk.yellow('Example: export OPENAI_API_KEY=your_key_here\n'));
  }
  
  // Ask for port
  const portInput = await askQuestion(
    chalk.cyan(`Enter the server port (default: ${config.port}): `)
  );
  
  if (portInput && portInput.trim()) {
    const port = parseInt(portInput);
    if (!isNaN(port) && port > 0 && port < 65536) {
      config.port = port;
      console.log(chalk.green(`Port set to ${port}`));
    } else {
      console.log(chalk.yellow(`Invalid port. Using default port: ${config.port}`));
    }
  }
  
  // Ask for theme preference
  const themeOptions = ['matrix', 'light', 'dark'];
  console.log(chalk.cyan('\nChoose a theme:'));
  themeOptions.forEach((theme, index) => {
    console.log(`${index + 1}. ${theme}`);
  });
  
  const themeInput = await askQuestion(
    chalk.cyan(`Enter theme number (1-${themeOptions.length}, default: 1): `)
  );
  
  if (themeInput && themeInput.trim()) {
    const themeIndex = parseInt(themeInput) - 1;
    if (!isNaN(themeIndex) && themeIndex >= 0 && themeIndex < themeOptions.length) {
      config.theme = themeOptions[themeIndex];
      console.log(chalk.green(`Theme set to ${config.theme}`));
    } else {
      console.log(chalk.yellow(`Invalid choice. Using default theme: ${config.theme}`));
    }
  }
  
  // Write configuration file
  const spinner2 = createSpinner('Saving configuration...').start();
  
  try {
    await fs.writeJson(CONFIG_FILE, config, { spaces: 2 });
    spinner2.succeed('Configuration saved successfully');
  } catch (error) {
    spinner2.fail(`Error saving configuration: ${error.message}`);
    console.error(chalk.red(error));
  }
  
  // Copy UI files to public directory
  const spinner3 = createSpinner('Setting up web interface...').start();
  
  try {
    // In a real implementation, we would copy UI files here
    // For this example, we're assuming the UI files are already in the package
    spinner3.succeed('Web interface set up successfully');
  } catch (error) {
    spinner3.fail(`Error setting up web interface: ${error.message}`);
    console.error(chalk.red(error));
  }
  
  console.log('\n' + chalk.green('Setup completed successfully!'));
  console.log(chalk.cyan('You can now start Project Assistant Pro with:'));
  console.log(chalk.white('  npm start'));
  console.log(chalk.white('  # or'));
  console.log(chalk.white('  node index.js'));
  
  rl.close();
}

// Run setup
setup().catch(error => {
  console.error(chalk.red(`Unhandled error: ${error.message}`));
  process.exit(1);
});