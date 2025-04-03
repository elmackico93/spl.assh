#!/usr/bin/env node

/**
 * PROJECT ASSISTANT PRO - ENHANCED VERSION
 * Advanced AI-powered tool for Next.js/React Development
 * With Express server and Matrix-style browser interface
 */

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');
const os = require('os');
const { exec } = require('child_process');
const http = require('https');
const express = require('express');
const cors = require('cors');
const expressWs = require('express-ws');
const open = require('open');
const { Server } = require('socket.io');

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
  gray: '\x1b[90m',
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m'
};

// Application directories
const APP_DIR = path.join(os.homedir(), '.project-assistant');
const CACHE_DIR = path.join(APP_DIR, 'cache');
const SESSIONS_DIR = path.join(APP_DIR, 'sessions');
const EXPORTS_DIR = path.join(APP_DIR, 'exports');
const BACKUPS_DIR = path.join(APP_DIR, 'backups');
const PUBLIC_DIR = path.join(__dirname, 'public');
const CONFIG_FILE = path.join(APP_DIR, 'config.json');

// Ensure all directories exist
[APP_DIR, CACHE_DIR, SESSIONS_DIR, EXPORTS_DIR, BACKUPS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

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

// Load user configuration
let config = { ...DEFAULT_CONFIG };
if (fs.existsSync(CONFIG_FILE)) {
  try {
    config = { ...DEFAULT_CONFIG, ...JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) };
  } catch (error) {
    console.error(`${colors.red}Error loading config file:${colors.reset}`, error);
  }
}

// Global session state
let currentSession = {
  id: null,
  startTime: null,
  projectDir: null,
  projectInfo: null,
  tasks: [],
  modifiedFiles: new Set(),
  backups: [],
  status: 'idle', // 'idle', 'running', 'paused'
  logs: []
};

// Task status enum
const TaskStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// Connected clients for WebSocket communication
const connectedClients = new Set();

/**
 * Displays the application banner
 */
function displayBanner() {
  const title = `
╔══════════════════════════════════════════════════════════════╗
║                 PROJECT ASSISTANT PRO                         ║
║       Advanced AI-powered Next.js/React Development Tool      ║
║                         v3.0.0                               ║
╚══════════════════════════════════════════════════════════════╝
  `;
  
  console.log(`${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.gray}Date: ${new Date().toLocaleDateString()}${colors.reset}\n`);
}

/**
 * Generates a unique ID
 * @returns {string} Generated ID
 */
function generateId() {
  return crypto.randomBytes(4).toString('hex');
}

/**
 * Creates a visual spinner for indicating progress
 * @param {string} text - Text to display next to spinner
 * @returns {Object} Spinner object with start, stop, and update methods
 */
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

/**
 * Simple OpenAI API client
 */
class OpenAIClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.openai.com/v1';
  }
  
  async createChatCompletion(options) {
    const data = JSON.stringify({
      model: options.model || config.model,
      messages: options.messages,
      max_tokens: options.max_tokens || config.maxTokens,
      temperature: options.temperature || config.temperature
    });
    
    return new Promise((resolve, reject) => {
      const req = http.request(
        `${this.baseURL}/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Length': Buffer.byteLength(data)
          }
        },
        (res) => {
          let responseData = '';
          
          res.on('data', (chunk) => {
            responseData += chunk;
          });
          
          res.on('end', () => {
            try {
              const parsedData = JSON.parse(responseData);
              
              if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve(parsedData);
              } else {
                reject(new Error(`API Error: ${parsedData.error?.message || 'Unknown error'}`));
              }
            } catch (error) {
              reject(new Error(`Failed to parse response: ${error.message}`));
            }
          });
        }
      );
      
      req.on('error', (error) => {
        reject(new Error(`Network error: ${error.message}`));
      });
      
      req.write(data);
      req.end();
    });
  }
}

// Initialize OpenAI if API key is available
const openai = new OpenAIClient(process.env.OPENAI_API_KEY);

/**
 * Adds a new log entry
 * @param {string} level - Log level (info, warning, error)
 * @param {string} message - Log message
 * @param {Object} data - Additional data
 */
function addLogEntry(level, message, data = {}) {
  const logEntry = {
    id: generateId(),
    timestamp: Date.now(),
    level,
    message,
    data
  };
  
  currentSession.logs.push(logEntry);
  
  // Broadcast log event
  broadcastEvent('newLog', logEntry);
  
  // Keep logs at a reasonable size
  if (currentSession.logs.length > 1000) {
    currentSession.logs = currentSession.logs.slice(-1000);
  }
  
  return logEntry;
}

/**
 * Broadcasts an event to all connected clients
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
function broadcastEvent(event, data) {
  const message = JSON.stringify({ event, data });
  
  for (const client of connectedClients) {
    try {
      client.send(message);
    } catch (error) {
      console.error(`Error broadcasting to client: ${error.message}`);
    }
  }
}

/**
 * Analyzes project structure
 * @param {string} projectDir - Project directory path
 * @returns {Object} Project information
 */
async function analyzeProject(projectDir) {
  const spinner = createSpinner('Analyzing project structure...').start();
  
  const projectInfo = {
    framework: 'Unknown',
    routerType: 'Unknown',
    hasTypeScript: false,
    styling: [],
    stateManagement: [],
    uiLibraries: [],
    dependencies: {},
    devDependencies: {}
  };
  
  // Check for package.json
  const packageJsonPath = path.join(projectDir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(await fsp.readFile(packageJsonPath, 'utf8'));
      
      // Get dependencies
      projectInfo.dependencies = packageJson.dependencies || {};
      projectInfo.devDependencies = packageJson.devDependencies || {};
      const allDeps = { ...projectInfo.dependencies, ...projectInfo.devDependencies };
      
      // Detect framework
      if (allDeps.next) {
        projectInfo.framework = 'Next.js';
      } else if (allDeps.react) {
        projectInfo.framework = 'React';
      } else if (allDeps.vue) {
        projectInfo.framework = 'Vue';
      } else if (allDeps.angular) {
        projectInfo.framework = 'Angular';
      }
      
      // Detect TypeScript
      projectInfo.hasTypeScript = !!allDeps.typescript || fs.existsSync(path.join(projectDir, 'tsconfig.json'));
      
      // Detect styling
      if (allDeps.tailwindcss) projectInfo.styling.push('Tailwind CSS');
      if (allDeps['styled-components']) projectInfo.styling.push('styled-components');
      if (allDeps['@emotion/react']) projectInfo.styling.push('Emotion');
      if (allDeps.sass || allDeps['sass-loader']) projectInfo.styling.push('Sass');
      
      // Detect state management
      if (allDeps.redux || allDeps['@reduxjs/toolkit']) projectInfo.stateManagement.push('Redux');
      if (allDeps.mobx) projectInfo.stateManagement.push('MobX');
      if (allDeps.recoil) projectInfo.stateManagement.push('Recoil');
      if (allDeps.zustand) projectInfo.stateManagement.push('Zustand');
      
      // Detect UI libraries
      if (allDeps['@mui/material'] || allDeps['@material-ui/core']) projectInfo.uiLibraries.push('Material UI');
      if (allDeps['@chakra-ui/react']) projectInfo.uiLibraries.push('Chakra UI');
      if (allDeps.antd) projectInfo.uiLibraries.push('Ant Design');
    } catch (error) {
      spinner.fail(`Error parsing package.json: ${error.message}`);
      return projectInfo;
    }
  }
  
  // Check for Next.js app directory structure
  if (projectInfo.framework === 'Next.js') {
    const hasAppDir = fs.existsSync(path.join(projectDir, 'app'));
    const hasPagesDir = fs.existsSync(path.join(projectDir, 'pages'));
    
    if (hasAppDir) {
      projectInfo.routerType = 'App Router';
    } else if (hasPagesDir) {
      projectInfo.routerType = 'Pages Router';
    }
  }
  
  spinner.succeed('Project analyzed successfully');
  
  // Log event
  addLogEntry('info', 'Project analyzed', projectInfo);
  
  return projectInfo;
}

/**
 * Identifies relevant files for a task
 * @param {string} projectDir - Project directory
 * @param {Object} projectInfo - Project information
 * @param {string} taskDescription - Description of the task
 * @returns {Array} Array of relevant files
 */
async function findRelevantFiles(projectDir, projectInfo, taskDescription) {
  const spinner = createSpinner('Identifying relevant files...').start();
  
  // Extract keywords from task description
  const keywords = taskDescription.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  // Define patterns based on project structure
  const patterns = [];
  if (projectInfo.framework === 'Next.js') {
    if (projectInfo.routerType === 'App Router') {
      patterns.push('app/**/*.{js,jsx,ts,tsx}');
      patterns.push('components/**/*.{js,jsx,ts,tsx}');
    } else {
      patterns.push('pages/**/*.{js,jsx,ts,tsx}');
      patterns.push('components/**/*.{js,jsx,ts,tsx}');
    }
  } else {
    patterns.push('src/**/*.{js,jsx,ts,tsx}');
  }
  
  // Find all files
  const allFiles = [];
  
  for (const pattern of patterns) {
    let files = [];
    
    // Simple glob implementation
    try {
      const parts = pattern.split('/');
      const baseDir = parts[0];
      const extension = parts[parts.length - 1];
      
      await findFiles(path.join(projectDir, baseDir), (file) => {
        if (file.match(extension.replace('*.', '.'))) {
          allFiles.push(file);
        }
      });
    } catch (error) {
      console.error(`Error finding files: ${error.message}`);
    }
  }
  
  // Score and filter files
  const relevantFiles = [];
  for (const file of allFiles) {
    try {
      const stats = await fsp.stat(file);
      
      // Skip files that are too large
      if (stats.size > config.maxFileSizeKb * 1024) continue;
      
      const content = await fsp.readFile(file, 'utf8');
      const filename = path.basename(file).toLowerCase();
      
      // Calculate relevance score
      let score = 0;
      for (const keyword of keywords) {
        if (filename.includes(keyword)) score += 3;
        
        const regex = new RegExp(keyword, 'gi');
        const matches = content.match(regex);
        if (matches) score += matches.length;
      }
      
      if (score > 0) {
        relevantFiles.push({
          path: file,
          content,
          score
        });
      }
    } catch (error) {
      // Skip files that can't be read
    }
  }
  
  // Sort by relevance and limit
  relevantFiles.sort((a, b) => b.score - a.score);
  const result = relevantFiles.slice(0, config.maxContextFiles);
  
  spinner.succeed(`Identified ${result.length} relevant files`);
  
  // Log event
  addLogEntry('info', 'Identified relevant files', { 
    count: result.length, 
    files: result.map(f => path.relative(projectDir, f.path)) 
  });
  
  return result;
}

/**
 * Simple file finder function
 * @param {string} dir - Directory to search
 * @param {Function} callback - Callback for each file
 */
async function findFiles(dir, callback) {
  if (!fs.existsSync(dir)) return;
  
  const files = await fsp.readdir(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = await fsp.stat(fullPath);
    
    if (stat.isDirectory()) {
      // Skip ignored directories
      if (config.ignoreDirs.includes(file)) continue;
      await findFiles(fullPath, callback);
    } else {
      callback(fullPath);
    }
  }
}

/**
 * Builds context from relevant files
 * @param {Array} relevantFiles - Array of relevant files
 * @returns {Object} Context object
 */
function buildContext(relevantFiles, projectInfo) {
  const context = {
    fileContents: {},
    components: new Set(),
    imports: new Set(),
    hooks: []
  };
  
  for (const file of relevantFiles) {
    const relativePath = path.relative(currentSession.projectDir, file.path);
    context.fileContents[relativePath] = file.content;
    
    // Extract imports
    const importRegex = /import\s+(?:{([^}]+)}|\*\s+as\s+([a-zA-Z0-9_]+)|([a-zA-Z0-9_]+))\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(file.content)) !== null) {
      const [_, namedImports, namespaceImport, defaultImport, source] = match;
      
      context.imports.add(source);
      
      if (namedImports) {
        namedImports.split(',').forEach(name => {
          const trimmedName = name.trim().split(' as ')[0];
          if (/^[A-Z]/.test(trimmedName)) {
            context.components.add(trimmedName);
          }
        });
      }
      
      if (defaultImport && /^[A-Z]/.test(defaultImport)) {
        context.components.add(defaultImport);
      }
    }
    
    // Extract React hooks
    const hookRegex = /function\s+(use[A-Za-z0-9_]+)/g;
    while ((match = hookRegex.exec(file.content)) !== null) {
      context.hooks.push(match[1]);
    }
  }
  
  // Add project info
  context.projectInfo = projectInfo;
  
  return context;
}

/**
 * Creates a backup of a file
 * @param {string} filePath - Path to the file
 * @returns {string} Backup ID
 */
async function backupFile(filePath) {
  try {
    const backupId = generateId();
    const content = await fsp.readFile(filePath, 'utf8');
    const backupPath = path.join(BACKUPS_DIR, `${backupId}_${path.basename(filePath)}`);
    await fsp.writeFile(backupPath, content);
    
    currentSession.backups.push({
      id: backupId,
      originalPath: filePath,
      backupPath,
      timestamp: Date.now()
    });
    
    // Log event
    addLogEntry('info', 'File backed up', { 
      file: path.relative(currentSession.projectDir, filePath),
      backupId 
    });
    
    return backupId;
  } catch (error) {
    console.error(`Error backing up file: ${error.message}`);
    addLogEntry('error', 'Backup failed', { 
      file: path.relative(currentSession.projectDir, filePath),
      error: error.message 
    });
    return null;
  }
}

/**
 * Restores a file from backup
 * @param {string} backupId - Backup ID
 * @returns {boolean} Success status
 */
async function restoreFromBackup(backupId) {
  const backup = currentSession.backups.find(b => b.id === backupId);
  if (!backup) return false;
  
  try {
    const content = await fsp.readFile(backup.backupPath, 'utf8');
    await fsp.writeFile(backup.originalPath, content);
    
    // Log event
    addLogEntry('info', 'File restored from backup', { 
      file: path.relative(currentSession.projectDir, backup.originalPath),
      backupId 
    });
    
    return true;
  } catch (error) {
    console.error(`Error restoring backup: ${error.message}`);
    addLogEntry('error', 'Restore failed', { 
      backupId,
      error: error.message 
    });
    return false;
  }
}

/**
 * Handles an AI-powered task
 * @param {string} taskDescription - Task description
 * @param {string} taskType - Type of task (optional)
 * @param {function} callback - Callback function with result
 */
async function executeTask(taskDescription, taskType = null, callback = null) {
  if (!currentSession.id) {
    const message = 'No active session. Start a session first.';
    console.log(`${colors.yellow}${message}${colors.reset}`);
    if (callback) callback({ error: message });
    return;
  }
  
  if (!process.env.OPENAI_API_KEY) {
    const message = 'OPENAI_API_KEY environment variable not set.';
    console.log(`${colors.red}Error: ${message}${colors.reset}`);
    console.log(`Please set your OpenAI API key by running: export OPENAI_API_KEY=your_key_here`);
    if (callback) callback({ error: message });
    return;
  }
  
  console.log(`\n${colors.cyan}Executing task:${colors.reset} ${taskDescription}`);
  
  // Create a task object
  const task = {
    id: generateId(),
    description: taskDescription,
    type: taskType,
    status: TaskStatus.RUNNING,
    startTime: Date.now(),
    endTime: null,
    result: null
  };
  
  // Add to tasks list
  currentSession.tasks.push(task);
  
  // Broadcast task started
  broadcastEvent('taskStarted', task);
  
  // Log event
  addLogEntry('info', 'Task started', { 
    taskId: task.id,
    description: taskDescription,
    type: taskType
  });
  
  try {
    // Find relevant files
    const relevantFiles = await findRelevantFiles(
      currentSession.projectDir,
      currentSession.projectInfo,
      taskDescription
    );
    
    // Build context
    const context = buildContext(relevantFiles, currentSession.projectInfo);
    
    // Determine task type if not provided
    let effectiveTaskType = taskType;
    if (!effectiveTaskType) {
      // Use a simple heuristic for guessing task type
      const taskLower = taskDescription.toLowerCase();
      if (taskLower.includes('create') || taskLower.includes('new component')) {
        effectiveTaskType = 'Create new component';
      } else if (taskLower.includes('fix') || taskLower.includes('bug')) {
        effectiveTaskType = 'Fix a bug';
      } else if (taskLower.includes('modify') || taskLower.includes('change')) {
        effectiveTaskType = 'Modify existing code';
      } else if (taskLower.includes('implement') || taskLower.includes('feature')) {
        effectiveTaskType = 'Implement a feature';
      } else {
        effectiveTaskType = 'Other';
      }
    }
    
    // If running in CLI mode, ask for details
    if (config.enableCLI && !taskType && !callback) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const taskTypes = [
        'Create new component',
        'Modify existing code',
        'Fix a bug',
        'Implement a feature',
        'Other'
      ];
      
      console.log(`\n${colors.cyan}What type of task is this?${colors.reset}`);
      taskTypes.forEach((type, i) => {
        console.log(`${i + 1}. ${type}`);
      });
      
      try {
        effectiveTaskType = await new Promise(resolve => {
          rl.question(`Enter number (1-${taskTypes.length}): `, (answer) => {
            const num = parseInt(answer);
            if (num >= 1 && num <= taskTypes.length) {
              resolve(taskTypes[num - 1]);
            } else {
              resolve(taskTypes[0]);
            }
          });
        });
      } catch (error) {
        // Use default
      } finally {
        rl.close();
      }
    }
    
    const spinner = createSpinner('Generating code with AI...').start();
    
    // Prepare file excerpts for context
    const fileExcerpts = {};
    Object.entries(context.fileContents)
      .slice(0, 3)
      .forEach(([path, content]) => {
        const lines = content.split('\n').slice(0, 200);
        fileExcerpts[path] = lines.join('\n');
      });
    
    // Prepare system message
    const systemMessage = `
You are an expert developer assistant specializing in Next.js, React, TypeScript, and modern web development.
Your task is to generate high-quality code based on the user's request, adhering to best practices and the project's existing patterns.

Project Information:
- Framework: ${context.projectInfo.framework}
- Router: ${context.projectInfo.routerType}
- TypeScript: ${context.projectInfo.hasTypeScript ? 'Yes' : 'No'}
- Styling: ${context.projectInfo.styling.join(', ')}
- State Management: ${context.projectInfo.stateManagement.join(', ') || 'None detected'}
- UI Libraries: ${context.projectInfo.uiLibraries.join(', ') || 'None detected'}

Task Type: ${effectiveTaskType}

When generating code:
1. Maintain consistency with the project's coding style and patterns
2. Use appropriate TypeScript types if the project uses TypeScript
3. Format your response with:
   - A brief explanation
   - The generated code in a code block
   - Implementation instructions if needed
`;

    // Prepare user message
    const userMessage = `
Task: ${taskDescription}

Here are excerpts from relevant files in the project:

${Object.entries(fileExcerpts)
  .map(([path, content]) => `--- ${path} ---\n${content}\n`)
  .join('\n\n')}

Additional Context:
- Components: ${Array.from(context.components).slice(0, 10).join(', ')}
- Common imports: ${Array.from(context.imports).slice(0, 10).join(', ')}
- Custom hooks: ${context.hooks.slice(0, 10).join(', ')}

Please provide a complete solution based on this context.
`;

    // Call OpenAI API
    const response = await openai.createChatCompletion({
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ]
    });
    
    spinner.succeed('Code generated successfully');
    
    // Process the response
    const content = response.choices[0].message.content;
    const { code, explanation } = extractCodeAndExplanation(content);
    
    // Update task status
    task.status = TaskStatus.COMPLETED;
    task.endTime = Date.now();
    task.result = {
      code,
      explanation
    };
    
    // Log event
    addLogEntry('info', 'Task completed', { 
      taskId: task.id,
      executionTime: task.endTime - task.startTime
    });
    
    // Broadcast task completed
    broadcastEvent('taskCompleted', task);
    
    // Display results in console if in CLI mode
    if (config.enableCLI && !callback) {
      console.log(`\n${colors.cyan}${colors.bold}Explanation:${colors.reset}`);
      console.log(explanation);
      
      if (code) {
        console.log(`\n${colors.cyan}${colors.bold}Generated Code:${colors.reset}`);
        console.log(boxify(code));
        
        // Ask if user wants to save the code
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        const shouldSave = await new Promise(resolve => {
          rl.question(`\n${colors.yellow}Do you want to save this code to a file? (y/n)${colors.reset} `, answer => {
            resolve(answer.toLowerCase() === 'y');
          });
        });
        
        if (shouldSave) {
          const filePath = await new Promise(resolve => {
            rl.question(`${colors.yellow}Enter file path:${colors.reset} `, answer => {
              resolve(answer);
            });
          });
          
          await saveFile(filePath, code);
        }
        
        rl.close();
      }
    }
    
    // Return result through callback if provided
    if (callback) {
      callback({
        success: true,
        taskId: task.id,
        code,
        explanation
      });
    }
    
    return task;
  } catch (error) {
    console.error(`Error executing task: ${error.message}`);
    
    // Update task status
    task.status = TaskStatus.FAILED;
    task.endTime = Date.now();
    task.error = error.message;
    
    // Log event
    addLogEntry('error', 'Task failed', { 
      taskId: task.id,
      error: error.message 
    });
    
    // Broadcast task failed
    broadcastEvent('taskFailed', task);
    
    // Return error through callback if provided
    if (callback) {
      callback({
        success: false,
        error: error.message
      });
    }
    
    return task;
  }
}

/**
 * Extracts code and explanation from AI response
 * @param {string} response - AI response
 * @returns {Object} Object with code and explanation
 */
function extractCodeAndExplanation(response) {
  // Extract code blocks
  const codeBlockRegex = /```(?:jsx?|tsx?|css|scss|html)?\n([\s\S]*?)```/g;
  const codeBlocks = [];
  let match;
  
  while ((match = codeBlockRegex.exec(response)) !== null) {
    codeBlocks.push(match[1]);
  }
  
  let code = '';
  let explanation = response;
  
  if (codeBlocks.length > 0) {
    code = codeBlocks.join('\n\n');
    
    // Extract explanation (text before first code block)
    const firstCodeBlockIndex = response.indexOf('```');
    if (firstCodeBlockIndex > 0) {
      explanation = response.substring(0, firstCodeBlockIndex).trim();
    }
  }
  
  return { code, explanation };
}

/**
 * Creates a box around text
 * @param {string} text - Text to boxify
 * @returns {string} Boxified text
 */
function boxify(text) {
  const lines = text.split('\n');
  const width = Math.min(
    Math.max(...lines.map(line => line.length)),
    process.stdout.columns - 4
  );
  
  const top = `┌${'─'.repeat(width + 2)}┐`;
  const bottom = `└${'─'.repeat(width + 2)}┘`;
  
  const boxedLines = lines.map(line => {
    // Truncate long lines
    const truncated = line.length > width 
      ? line.substring(0, width - 3) + '...'
      : line.padEnd(width);
    
    return `│ ${truncated} │`;
  });
  
  return `${colors.green}${top}\n${boxedLines.join('\n')}\n${bottom}${colors.reset}`;
}

/**
 * Save file from web UI
 * @param {string} filePath - Path to save file
 * @param {string} content - File content
 * @param {function} callback - Callback function with result
 */
async function saveFile(filePath, content, callback = null) {
  if (!currentSession.id) {
    const message = 'No active session.';
    console.log(`${colors.yellow}${message}${colors.reset}`);
    if (callback) callback({ error: message });
    return false;
  }
  
  try {
    const fullPath = path.isAbsolute(filePath) 
      ? filePath 
      : path.join(currentSession.projectDir, filePath);
    
    // Create directory if it doesn't exist
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Backup existing file
    if (fs.existsSync(fullPath)) {
      await backupFile(fullPath);
    }
    
    // Write file
    await fsp.writeFile(fullPath, content);
    
    console.log(`${colors.green}File saved successfully to ${fullPath}${colors.reset}`);
    currentSession.modifiedFiles.add(fullPath);
    
    // Log event
    addLogEntry('info', 'File saved', { 
      file: path.relative(currentSession.projectDir, fullPath) 
    });
    
    // Save session
    await saveSession();
    
    if (callback) callback({
      success: true,
      path: fullPath,
      relativePath: path.relative(currentSession.projectDir, fullPath)
    });
    
    return true;
  } catch (error) {
    console.error(`Error saving file: ${error.message}`);
    
    // Log event
    addLogEntry('error', 'File save failed', { 
      path: filePath, 
      error: error.message 
    });
    
    if (callback) callback({
      success: false,
      error: error.message
    });
    
    return false;
  }
}

/**
 * Saves the current session
 */
async function saveSession() {
  if (!currentSession.id) return false;
  
  try {
    const sessionPath = path.join(SESSIONS_DIR, `${currentSession.id}.json`);
    await fsp.writeFile(sessionPath, JSON.stringify({
      ...currentSession,
      modifiedFiles: Array.from(currentSession.modifiedFiles)
    }, null, 2));
    
    // Log event
    addLogEntry('info', 'Session saved', { sessionId: currentSession.id });
    
    return true;
  } catch (error) {
    console.error(`Error saving session: ${error.message}`);
    addLogEntry('error', 'Session save failed', { error: error.message });
    return false;
  }
}

/**
 * Loads a session
 * @param {string} sessionId - Session ID
 */
async function loadSession(sessionId) {
  const sessionPath = path.join(SESSIONS_DIR, `${sessionId}.json`);
  
  if (!fs.existsSync(sessionPath)) {
    console.log(`${colors.yellow}Session not found: ${sessionId}${colors.reset}`);
    addLogEntry('warning', 'Session not found', { sessionId });
    return false;
  }
  
  try {
    const sessionData = JSON.parse(await fsp.readFile(sessionPath, 'utf8'));
    currentSession = {
      ...sessionData,
      modifiedFiles: new Set(sessionData.modifiedFiles),
      logs: sessionData.logs || []
    };
    
    console.log(`${colors.green}Loaded session: ${sessionId}${colors.reset}`);
    
    // Log event
    addLogEntry('info', 'Session loaded', { sessionId });
    
    // Broadcast session change
    broadcastEvent('sessionLoaded', {
      ...currentSession,
      modifiedFiles: Array.from(currentSession.modifiedFiles)
    });
    
    return true;
  } catch (error) {
    console.error(`Error loading session: ${error.message}`);
    addLogEntry('error', 'Session load failed', { 
      sessionId, 
      error: error.message 
    });
    return false;
  }
}

/**
 * Starts a new session
 * @param {string} projectDir - Project directory
 * @param {function} callback - Callback function with result
 */
async function startSession(projectDir = null, callback = null) {
  if (!projectDir) {
    if (config.enableCLI && !callback) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      projectDir = await new Promise(resolve => {
        rl.question(`${colors.yellow}Enter project directory path (default: current directory):${colors.reset} `, (answer) => {
          resolve(answer || process.cwd());
        });
      });
      
      rl.close();
    } else {
      projectDir = process.cwd();
    }
  }
  
  const resolvedPath = path.resolve(projectDir);
  
  if (!fs.existsSync(resolvedPath)) {
    const message = `Directory does not exist: ${resolvedPath}`;
    console.log(`${colors.red}${message}${colors.reset}`);
    if (callback) callback({ error: message });
    return false;
  }
  
  // Create new session
  currentSession = {
    id: generateId(),
    startTime: Date.now(),
    projectDir: resolvedPath,
    tasks: [],
    modifiedFiles: new Set(),
    backups: [],
    status: 'running',
    logs: []
  };
  
  console.log(`${colors.green}Started new session with ID: ${currentSession.id}${colors.reset}`);
  
  // Log event
  addLogEntry('info', 'Session started', { 
    sessionId: currentSession.id,
    projectDir: resolvedPath
  });
  
  // Analyze project
  currentSession.projectInfo = await analyzeProject(resolvedPath);
  
  // Display project info
  displayProjectInfo();
  
  // Save initial session
  await saveSession();
  
  // Broadcast session change
  broadcastEvent('sessionStarted', {
    ...currentSession,
    modifiedFiles: Array.from(currentSession.modifiedFiles)
  });
  
  if (callback) callback({
    success: true,
    sessionId: currentSession.id,
    projectInfo: currentSession.projectInfo
  });
  
  return true;
}

/**
 * Displays project information
 */
function displayProjectInfo() {
  if (!currentSession.projectInfo) return;
  
  console.log(`\n${colors.cyan}${colors.bold}Project Information:${colors.reset}`);
  console.log(`${colors.gray}${'─'.repeat(50)}${colors.reset}`);
  
  const info = currentSession.projectInfo;
  
  console.log(`${colors.white}Path:${colors.reset} ${colors.yellow}${currentSession.projectDir}${colors.reset}`);
  console.log(`${colors.white}Framework:${colors.reset} ${colors.green}${info.framework}${colors.reset}`);
  console.log(`${colors.white}Router Type:${colors.reset} ${colors.green}${info.routerType}${colors.reset}`);
  console.log(`${colors.white}TypeScript:${colors.reset} ${colors.green}${info.hasTypeScript ? 'Yes' : 'No'}${colors.reset}`);
  console.log(`${colors.white}Styling:${colors.reset} ${colors.green}${info.styling.join(', ') || 'None detected'}${colors.reset}`);
  console.log(`${colors.white}State Management:${colors.reset} ${colors.green}${info.stateManagement.join(', ') || 'None detected'}${colors.reset}`);
  console.log(`${colors.white}UI Libraries:${colors.reset} ${colors.green}${info.uiLibraries.join(', ') || 'None detected'}${colors.reset}`);
}

/**
 * Displays help information
 */
function displayHelp() {
  console.log(`\n${colors.cyan}${colors.bold}Available Commands:${colors.reset}`);
  console.log(`${colors.gray}${'─'.repeat(50)}${colors.reset}`);
  
  console.log(`${colors.green}start${colors.reset}     - Start a new session`);
  console.log(`${colors.yellow}status${colors.reset}    - Display current session status`);
  console.log(`${colors.blue}task${colors.reset}      - Execute a new task (followed by description)`);
  console.log(`${colors.magenta}export${colors.reset}    - Export modified files`);
  console.log(`${colors.red}rollback${colors.reset}   - Rollback changes to a file`);
  console.log(`${colors.blue}load${colors.reset}      - Load a previous session`);
  console.log(`${colors.cyan}browse${colors.reset}    - Open the web interface in browser`);
  console.log(`${colors.green}help${colors.reset}      - Display this help information`);
  console.log(`${colors.red}exit${colors.reset}      - Exit the application`);
}

/**
 * Exports modified files
 */
async function exportModifiedFiles(callback = null) {
  if (!currentSession.id) {
    const message = 'No active session.';
    console.log(`${colors.yellow}${message}${colors.reset}`);
    if (callback) callback({ error: message });
    return null;
  }
  
  if (currentSession.modifiedFiles.size === 0) {
    const message = 'No modified files to export.';
    console.log(`${colors.yellow}${message}${colors.reset}`);
    if (callback) callback({ error: message });
    return null;
  }
  
  const exportId = generateId();
  const exportDir = path.join(EXPORTS_DIR, exportId);
  
  try {
    fs.mkdirSync(exportDir);
    
    for (const filePath of currentSession.modifiedFiles) {
      if (fs.existsSync(filePath)) {
        const relativePath = path.relative(currentSession.projectDir, filePath);
        const targetPath = path.join(exportDir, relativePath);
        
        // Create directory if it doesn't exist
        const targetDir = path.dirname(targetPath);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        
        // Copy file
        const content = await fsp.readFile(filePath, 'utf8');
        await fsp.writeFile(targetPath, content);
      }
    }
    
    // Create metadata file
    const metadata = {
      timestamp: Date.now(),
      sessionId: currentSession.id,
      projectDir: currentSession.projectDir,
      files: Array.from(currentSession.modifiedFiles).map(file => 
        path.relative(currentSession.projectDir, file)
      )
    };
    
    await fsp.writeFile(
      path.join(exportDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    console.log(`${colors.green}Exported ${currentSession.modifiedFiles.size} files to: ${exportDir}${colors.reset}`);
    
    // Log event
    addLogEntry('info', 'Files exported', { 
      exportId,
      count: currentSession.modifiedFiles.size 
    });
    
    const result = {
      success: true,
      exportId,
      exportDir,
      count: currentSession.modifiedFiles.size
    };
    
    if (callback) callback(result);
    return result;
  } catch (error) {
    console.error(`${colors.red}Error exporting files: ${error.message}${colors.reset}`);
    
    // Log event
    addLogEntry('error', 'Export failed', { error: error.message });
    
    const result = {
      success: false,
      error: error.message
    };
    
    if (callback) callback(result);
    return result;
  }
}

/**
 * Handle rollback
 * @param {string} backupId - Backup ID (optional)
 * @param {function} callback - Callback function with result
 */
async function handleRollback(backupId = null, callback = null) {
  if (!currentSession.id) {
    const message = 'No active session.';
    console.log(`${colors.yellow}${message}${colors.reset}`);
    if (callback) callback({ error: message });
    return null;
  }
  
  if (currentSession.backups.length === 0) {
    const message = 'No backups available.';
    console.log(`${colors.yellow}${message}${colors.reset}`);
    if (callback) callback({ error: message });
    return null;
  }
  
  // If backup ID is provided, restore directly
  if (backupId) {
    const success = await restoreFromBackup(backupId);
    
    if (success) {
      const backup = currentSession.backups.find(b => b.id === backupId);
      const relativePath = path.relative(currentSession.projectDir, backup.originalPath);
      
      console.log(`${colors.green}Successfully restored ${relativePath}${colors.reset}`);
      
      const result = {
        success: true,
        backupId,
        file: relativePath
      };
      
      if (callback) callback(result);
      return result;
    } else {
      const message = 'Failed to restore backup.';
      console.log(`${colors.red}${message}${colors.reset}`);
      
      const result = {
        success: false,
        error: message
      };
      
      if (callback) callback(result);
      return result;
    }
  }
  
  // Interactive mode for CLI
  if (!config.enableCLI && !callback) {
    const message = 'Cannot use interactive rollback in non-CLI mode.';
    console.log(`${colors.yellow}${message}${colors.reset}`);
    if (callback) callback({ error: message });
    return null;
  }
  
  // Group backups by file
  const fileBackups = {};
  for (const backup of currentSession.backups) {
    const relativePath = path.relative(currentSession.projectDir, backup.originalPath);
    
    if (!fileBackups[relativePath]) {
      fileBackups[relativePath] = [];
    }
    
    fileBackups[relativePath].push(backup);
  }
  
  // Display files with backups
  console.log(`\n${colors.cyan}${colors.bold}Files with backups:${colors.reset}`);
  
  const files = Object.keys(fileBackups);
  files.forEach((file, i) => {
    console.log(`${i + 1}. ${file} (${fileBackups[file].length} backups)`);
  });
  
  // Ask user to select a file
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const fileIndex = await new Promise(resolve => {
    rl.question(`\n${colors.yellow}Select a file (1-${files.length}):${colors.reset} `, answer => {
      const num = parseInt(answer);
      resolve(num >= 1 && num <= files.length ? num - 1 : 0);
    });
  });
  
  const selectedFile = files[fileIndex];
  const backups = fileBackups[selectedFile].sort((a, b) => b.timestamp - a.timestamp);
  
  // Display backups for the selected file
  console.log(`\n${colors.cyan}${colors.bold}Backups for ${selectedFile}:${colors.reset}`);
  
  backups.forEach((backup, i) => {
    const date = new Date(backup.timestamp).toLocaleString();
    console.log(`${i + 1}. ${date} (${backup.id})`);
  });
  
  // Ask user to select a backup
  const backupIndex = await new Promise(resolve => {
    rl.question(`\n${colors.yellow}Select a backup to restore (1-${backups.length}):${colors.reset} `, answer => {
      const num = parseInt(answer);
      resolve(num >= 1 && num <= backups.length ? num - 1 : 0);
    });
  });
  
  rl.close();
  
  const selectedBackup = backups[backupIndex];
  
  // Restore the backup
  const success = await restoreFromBackup(selectedBackup.id);
  
  if (success) {
    console.log(`${colors.green}Successfully restored ${selectedFile} to backup from ${new Date(selectedBackup.timestamp).toLocaleString()}${colors.reset}`);
    
    const result = {
      success: true,
      backupId: selectedBackup.id,
      file: selectedFile
    };
    
    if (callback) callback(result);
    return result;
  } else {
    console.log(`${colors.red}Failed to restore backup.${colors.reset}`);
    
    const result = {
      success: false,
      error: 'Failed to restore backup'
    };
    
    if (callback) callback(result);
    return result;
  }
}

/**
 * Display session status
 */
function displaySessionStatus() {
  if (!currentSession.id) {
    console.log(`${colors.yellow}No active session.${colors.reset}`);
    return null;
  }
  
  const duration = Math.floor((Date.now() - currentSession.startTime) / 1000);
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;
  
  console.log(`\n${colors.cyan}${colors.bold}Session Status:${colors.reset}`);
  console.log(`${colors.gray}${'─'.repeat(50)}${colors.reset}`);
  
  console.log(`${colors.white}Session ID:${colors.reset} ${colors.yellow}${currentSession.id}${colors.reset}`);
  console.log(`${colors.white}Status:${colors.reset} ${colors.green}${currentSession.status}${colors.reset}`);
  console.log(`${colors.white}Duration:${colors.reset} ${colors.yellow}${hours}h ${minutes}m ${seconds}s${colors.reset}`);
  console.log(`${colors.white}Project:${colors.reset} ${colors.yellow}${currentSession.projectDir}${colors.reset}`);
  console.log(`${colors.white}Modified Files:${colors.reset} ${colors.yellow}${currentSession.modifiedFiles.size}${colors.reset}`);
  console.log(`${colors.white}Backups:${colors.reset} ${colors.yellow}${currentSession.backups.length}${colors.reset}`);
  
  return {
    id: currentSession.id,
    status: currentSession.status,
    duration: `${hours}h ${minutes}m ${seconds}s`,
    projectDir: currentSession.projectDir,
    modifiedFiles: Array.from(currentSession.modifiedFiles),
    backups: currentSession.backups.length,
    tasks: currentSession.tasks.length
  };
}

/**
 * Initialize Express server
 */
function initializeServer() {
  const app = express();
  const server = require('http').createServer(app);
  const io = new Server(server);
  
  // Enable WebSocket support
  expressWs(app, server);
  
  // Enable CORS
  app.use(cors());
  
  // Parse JSON bodies
  app.use(express.json());
  
  // Serve static files from public directory
  app.use(express.static(PUBLIC_DIR));
  
  // API endpoints
  
  // Get server status
  app.get('/api/status', (req, res) => {
    res.json({
      version: '3.0.0',
      uptime: process.uptime(),
      hasSession: !!currentSession.id,
      sessionId: currentSession.id
    });
  });
  
  // Get session info
  app.get('/api/session', (req, res) => {
    if (!currentSession.id) {
      res.status(404).json({ error: 'No active session' });
      return;
    }
    
    res.json({
      ...currentSession,
      modifiedFiles: Array.from(currentSession.modifiedFiles)
    });
  });
  
  // Start a new session
  app.post('/api/session/start', async (req, res) => {
    try {
      const { projectDir } = req.body;
      
      const result = await startSession(projectDir, null);
      
      if (result === false) {
        res.status(400).json({ error: 'Failed to start session' });
        return;
      }
      
      res.json({
        success: true,
        session: {
          id: currentSession.id,
          projectDir: currentSession.projectDir,
          projectInfo: currentSession.projectInfo
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Load a session
  app.post('/api/session/load', async (req, res) => {
    try {
      const { sessionId } = req.body;
      
      const result = await loadSession(sessionId);
      
      if (!result) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }
      
      res.json({
        success: true,
        session: {
          id: currentSession.id,
          projectDir: currentSession.projectDir,
          projectInfo: currentSession.projectInfo
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get list of available sessions
  app.get('/api/sessions', async (req, res) => {
    try {
      const files = await fsp.readdir(SESSIONS_DIR);
      const sessions = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const content = await fsp.readFile(path.join(SESSIONS_DIR, file), 'utf8');
            const session = JSON.parse(content);
            
            sessions.push({
              id: session.id,
              startTime: session.startTime,
              projectDir: session.projectDir
            });
          } catch (error) {
            // Skip invalid session files
          }
        }
      }
      
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Execute a task
  app.post('/api/task', async (req, res) => {
    try {
      const { description, type } = req.body;
      
      if (!description) {
        res.status(400).json({ error: 'Task description is required' });
        return;
      }
      
      // Execute the task asynchronously
      executeTask(description, type, (result) => {
        // WebSocket will handle the real-time updates
      });
      
      res.json({ success: true, message: 'Task started' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Save a file
  app.post('/api/file/save', async (req, res) => {
    try {
      const { path: filePath, content } = req.body;
      
      if (!filePath || content === undefined) {
        res.status(400).json({ error: 'Path and content are required' });
        return;
      }
      
      const result = await saveFile(filePath, content);
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get file content
  app.get('/api/file', async (req, res) => {
    try {
      const { path: filePath } = req.query;
      
      if (!filePath) {
        res.status(400).json({ error: 'Path is required' });
        return;
      }
      
      if (!currentSession.id) {
        res.status(404).json({ error: 'No active session' });
        return;
      }
      
      const fullPath = path.isAbsolute(filePath) 
        ? filePath 
        : path.join(currentSession.projectDir, filePath);
      
      if (!fs.existsSync(fullPath)) {
        res.status(404).json({ error: 'File not found' });
        return;
      }
      
      const content = await fsp.readFile(fullPath, 'utf8');
      
      res.json({
        path: fullPath,
        relativePath: path.relative(currentSession.projectDir, fullPath),
        content
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Export modified files
  app.post('/api/export', async (req, res) => {
    try {
      const result = await exportModifiedFiles();
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Handle rollback
  app.post('/api/rollback', async (req, res) => {
    try {
      const { backupId } = req.body;
      
      if (!backupId) {
        res.status(400).json({ error: 'Backup ID is required' });
        return;
      }
      
      await handleRollback(backupId, (result) => {
        res.json(result);
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get backups
  app.get('/api/backups', (req, res) => {
    if (!currentSession.id) {
      res.status(404).json({ error: 'No active session' });
      return;
    }
    
    const backupsByFile = {};
    
    for (const backup of currentSession.backups) {
      const relativePath = path.relative(currentSession.projectDir, backup.originalPath);
      
      if (!backupsByFile[relativePath]) {
        backupsByFile[relativePath] = [];
      }
      
      backupsByFile[relativePath].push({
        id: backup.id,
        timestamp: backup.timestamp,
        path: relativePath
      });
    }
    
    res.json(backupsByFile);
  });
  
  // WebSocket endpoint for real-time updates
  app.ws('/ws', (ws, req) => {
    connectedClients.add(ws);
    
    console.log(`${colors.green}WebSocket client connected${colors.reset}`);
    
    // Send initial data
    if (currentSession.id) {
      ws.send(JSON.stringify({
        event: 'sessionStatus',
        data: {
          ...currentSession,
          modifiedFiles: Array.from(currentSession.modifiedFiles)
        }
      }));
    }
    
    // Handle client messages
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        
        // Handle specific client messages if needed
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (error) {
        console.error(`Error parsing WebSocket message: ${error.message}`);
      }
    });
    
    // Handle disconnection
    ws.on('close', () => {
      connectedClients.delete(ws);
      console.log(`${colors.yellow}WebSocket client disconnected${colors.reset}`);
    });
  });
  
  // Default route for SPA
  app.get('*', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
  });
  
  // Start the server
  const port = config.port || 3030;
  server.listen(port, () => {
    console.log(`${colors.green}Server running at http://localhost:${port}${colors.reset}`);
    
    // Log server start
    addLogEntry('info', 'Server started', { port });
    
    // Auto-open browser if configured
    if (config.enableBrowser) {
      open(`http://localhost:${port}`);
    }
  });
  
  return server;
}

/**
 * Main function - Interactive CLI
 */
async function startCLI() {
  displayBanner();
  
  // Initialize server if enabled
  if (config.enableBrowser) {
    initializeServer();
  }
  
  if (!config.enableCLI) {
    return;
  }
  
  console.log(`${colors.gray}Welcome to Project Assistant Pro! Type "help" for available commands.${colors.reset}`);
  
  // Read environment variable
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log(`${colors.yellow}Warning: OPENAI_API_KEY environment variable not set.${colors.reset}`);
    console.log(`To use AI features, set your OpenAI API key: export OPENAI_API_KEY=your_key_here\n`);
  }
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${colors.blue}Assistant>${colors.reset} `
  });
  
  rl.prompt();
  
  rl.on('line', async (line) => {
    const input = line.trim();
    
    try {
      if (input === 'help') {
        displayHelp();
      } else if (input === 'start') {
        await startSession();
      } else if (input === 'status') {
        displaySessionStatus();
      } else if (input === 'export') {
        await exportModifiedFiles();
      } else if (input === 'rollback') {
        await handleRollback();
      } else if (input === 'browse') {
        if (config.enableBrowser) {
          open(`http://localhost:${config.port || 3030}`);
        } else {
          console.log(`${colors.yellow}Web interface is disabled. Enable it in config.json.${colors.reset}`);
        }
      } else if (input.startsWith('load')) {
        const parts = input.split(' ');
        if (parts.length > 1) {
          await loadSession(parts[1]);
        } else {
          console.log(`${colors.yellow}Usage: load <session-id>${colors.reset}`);
        }
      } else if (input.startsWith('task')) {
        const taskDescription = input.substring(4).trim();
        if (taskDescription) {
          await executeTask(taskDescription);
        } else {
          console.log(`${colors.yellow}Usage: task <description>${colors.reset}`);
        }
      } else if (input === 'exit' || input === 'quit') {
        console.log(`${colors.green}Thank you for using Project Assistant Pro!${colors.reset}`);
        rl.close();
        process.exit(0);
      } else if (input) {
        // Assume it's a task if not a command
        if (currentSession.id && currentSession.status === 'running') {
          await executeTask(input);
        } else {
          console.log(`${colors.yellow}Unknown command. Type "help" for available commands.${colors.reset}`);
        }
      }
    } catch (error) {
      console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    }
    
    rl.prompt();
  });
}

// Handle signal interrupts
process.on('SIGINT', () => {
  console.log(`\n${colors.green}Exiting Project Assistant Pro. Goodbye!${colors.reset}`);
  process.exit(0);
});

// Export functions for use in other modules
module.exports = {
  startCLI,
  initializeServer,
  startSession,
  executeTask,
  saveFile,
  handleRollback,
  exportModifiedFiles,
  loadSession,
  saveSession
};