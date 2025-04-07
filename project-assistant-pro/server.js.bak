/**
 * UNIFIED SERVER
 * Advanced integrated server for both Project Assistant Pro and Script Generator Pro
 * Implements modern best practices for performance, security, and reliability
 */

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');
const os = require('os');
const { exec, spawn } = require('child_process');
const http = require('http');
const https = require('https');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { WebSocketServer } = require('ws');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const winston = require('winston');
const open = require('open');

// Application directories
const APP_BASE_DIR = path.join(os.homedir(), '.unified-assistant');
const PROJECT_ASSISTANT_DIR = path.join(APP_BASE_DIR, 'project-assistant');
const SCRIPT_GEN_DIR = path.join(APP_BASE_DIR, 'script-generator');
const CACHE_DIR = path.join(APP_BASE_DIR, 'cache');
const SESSIONS_DIR = path.join(APP_BASE_DIR, 'sessions');
const BACKUPS_DIR = path.join(APP_BASE_DIR, 'backups');
const EXPORTS_DIR = path.join(APP_BASE_DIR, 'exports');
const LOGS_DIR = path.join(APP_BASE_DIR, 'logs');
const CONFIG_FILE = path.join(APP_BASE_DIR, 'config.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

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

// Create required directories
[
  APP_BASE_DIR,
  PROJECT_ASSISTANT_DIR,
  SCRIPT_GEN_DIR,
  CACHE_DIR,
  SESSIONS_DIR,
  BACKUPS_DIR,
  EXPORTS_DIR,
  LOGS_DIR,
  path.join(PUBLIC_DIR, 'project-assistant'),
  path.join(PUBLIC_DIR, 'script-generator')
].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Default configuration
const DEFAULT_CONFIG = {
  server: {
    port: 4000,
    hostname: 'localhost',
    enableHTTPS: false,
    sslKey: null,
    sslCert: null,
    requestTimeout: 30000,
    maxRequestSize: '50mb',
    rateLimitWindow: 15 * 60 * 1000, // 15 minutes
    rateLimitMax: 1000, // requests per window
    autoLaunchBrowser: true,
    enableCLI: true,
    socketPingInterval: 30000,
    socketPingTimeout: 10000,
    keepAliveTimeout: 65000,
    headersTimeout: 66000,
    logLevel: 'info',
    logFormat: 'combined'
  },
  projectAssistant: {
    model: 'gpt-4-turbo-preview',
    maxTokens: 4096,
    temperature: 0.7,
    cacheEnabled: true,
    debug: false,
    formatCode: true,
    maxContextFiles: 10,
    ignoreDirs: ['node_modules', '.git', '.next', 'out', 'dist', 'build', 'public'],
    maxFileSizeKb: 500,
    preferredFileTypes: ['.tsx', '.ts', '.jsx', '.js', '.css', '.json', '.md'],
    sessionTimeout: 7200,
    maxParallelTasks: 3,
    autosaveInterval: 60000
  },
  scriptGenerator: {
    model: 'gpt-4-turbo-preview',
    maxTokens: 4096,
    temperature: 0.7,
    defaultScriptsPerBatch: 5,
    defaultUpdateInterval: 30,
    maxScriptsPerBatch: 20,
    minUpdateInterval: 5,
    defaultScriptTypes: ['bash', 'powershell'],
    maxParallelJobs: 3,
    cacheEnabled: true,
    seoKeywordEnabled: true,
    maxSEOKeywords: 100,
    balanceCategories: true,
    defaultCategories: ['windows', 'mac', 'linux', 'network', 'security'],
    autoStart: false
  },
  ui: {
    theme: 'matrix',
    animationsEnabled: true,
    terminalHistory: 1000,
    notificationDuration: 5000
  }
};

// Load user configuration
let config = { ...DEFAULT_CONFIG };
if (fs.existsSync(CONFIG_FILE)) {
  try {
    const userConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    // Deep merge configuration
    config = mergeConfigs(DEFAULT_CONFIG, userConfig);
  } catch (error) {
    console.error(`${colors.red}Error loading config file:${colors.reset}`, error);
  }
}

// Deep merge configuration objects
function mergeConfigs(target, source) {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = mergeConfigs(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

// Save configuration
function saveConfig() {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error(`${colors.red}Error saving config:${colors.reset}`, error);
    return false;
  }
}

// Configure Winston logger
const logger = winston.createLogger({
  level: config.server.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'unified-server' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ 
      filename: path.join(LOGS_DIR, 'error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(LOGS_DIR, 'combined.log')
    })
  ]
});

// Helper class for handling API responses
class ApiResponse {
  static success(data = null, message = 'Success') {
    return {
      success: true,
      message,
      data,
      timestamp: Date.now()
    };
  }
  
  static error(message = 'Error', statusCode = 500, details = null) {
    return {
      success: false,
      message,
      statusCode,
      details,
      timestamp: Date.now()
    };
  }
}

// Task status enum
const TaskStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELED: 'canceled'
};

// WebSocket message types
const WsMessageType = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  TASK_STARTED: 'task_started',
  TASK_PROGRESS: 'task_progress',
  TASK_COMPLETED: 'task_completed',
  TASK_FAILED: 'task_failed',
  LOG: 'log',
  SESSION_STARTED: 'session_started',
  SESSION_LOADED: 'session_loaded',
  SESSION_STATUS: 'session_status',
  GENERATOR_STATUS: 'generator_status',
  JOB_STARTED: 'job_started',
  JOB_PROGRESS: 'job_progress',
  JOB_COMPLETED: 'job_completed',
  JOB_FAILED: 'job_failed',
  SCRIPT_GENERATED: 'script_generated',
  NOTIFICATION: 'notification',
  PONG: 'pong'
};

// Connected clients
const connectedClients = new Map();

// Project Assistant session state
let projectAssistantSession = {
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

// Script Generator state
let scriptGeneratorState = {
  id: null,
  startTime: null,
  isRunning: false,
  isPaused: false,
  apiUsage: 0,
  scripts: [],
  jobs: [],
  categories: [
    { id: 'windows', name: 'Windows', count: 0, enabled: true },
    { id: 'mac', name: 'Mac', count: 0, enabled: true },
    { id: 'linux', name: 'Linux', count: 0, enabled: true },
    { id: 'network', name: 'Network', count: 0, enabled: true },
    { id: 'security', name: 'Security', count: 0, enabled: true }
  ],
  keywords: [],
  settings: { ...config.scriptGenerator },
  logs: []
};

/**
 * Generates a unique ID
 */
function generateId() {
  return crypto.randomBytes(4).toString('hex');
}

/**
 * Creates a visual spinner for indicating progress
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
 * Enhanced OpenAI API client with retries and stream support
 */
class OpenAIClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.openai.com/v1';
    this.maxRetries = 3;
    this.retryDelay = 1000;
  }
  
  async createChatCompletion(options, retryCount = 0) {
    const data = JSON.stringify({
      model: options.model || config.projectAssistant.model,
      messages: options.messages,
      max_tokens: options.max_tokens || config.projectAssistant.maxTokens,
      temperature: options.temperature || config.projectAssistant.temperature,
      stream: options.stream || false
    });
    
    return new Promise((resolve, reject) => {
      const req = https.request(
        `${this.baseURL}/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Length': Buffer.byteLength(data)
          },
          timeout: 60000 // 60 second timeout
        },
        (res) => {
          // Handle streaming response
          if (options.stream && res.statusCode >= 200 && res.statusCode < 300) {
            return resolve(res);
          }
          
          let responseData = '';
          
          res.on('data', (chunk) => {
            responseData += chunk;
          });
          
          res.on('end', () => {
            try {
              // Check if response is valid JSON
              let parsedData;
              try {
                parsedData = JSON.parse(responseData);
              } catch (error) {
                if (retryCount < this.maxRetries) {
                  logger.warn(`Failed to parse OpenAI response, retrying (${retryCount + 1}/${this.maxRetries})...`);
                  setTimeout(() => {
                    this.createChatCompletion(options, retryCount + 1)
                      .then(resolve)
                      .catch(reject);
                  }, this.retryDelay * Math.pow(2, retryCount));
                  return;
                } else {
                  reject(new Error(`Failed to parse response: ${error.message}`));
                  return;
                }
              }
              
              if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve(parsedData);
              } else {
                const error = parsedData.error || { message: 'Unknown API error' };
                
                // Handle rate limiting
                if (res.statusCode === 429) {
                  if (retryCount < this.maxRetries) {
                    const delay = (parseInt(res.headers['retry-after']) || 1) * 1000;
                    logger.warn(`Rate limited by OpenAI API, retrying in ${delay}ms...`);
                    setTimeout(() => {
                      this.createChatCompletion(options, retryCount + 1)
                        .then(resolve)
                        .catch(reject);
                    }, delay);
                    return;
                  }
                }
                
                // Handle server errors
                if (res.statusCode >= 500 && retryCount < this.maxRetries) {
                  logger.warn(`OpenAI server error, retrying (${retryCount + 1}/${this.maxRetries})...`);
                  setTimeout(() => {
                    this.createChatCompletion(options, retryCount + 1)
                      .then(resolve)
                      .catch(reject);
                  }, this.retryDelay * Math.pow(2, retryCount));
                  return;
                }
                
                reject(new Error(`API Error (${res.statusCode}): ${error.message}`));
              }
            } catch (error) {
              reject(new Error(`Failed to process response: ${error.message}`));
            }
          });
        }
      );
      
      req.on('error', (error) => {
        if (retryCount < this.maxRetries) {
          logger.warn(`Network error with OpenAI API, retrying (${retryCount + 1}/${this.maxRetries})...`);
          setTimeout(() => {
            this.createChatCompletion(options, retryCount + 1)
              .then(resolve)
              .catch(reject);
          }, this.retryDelay * Math.pow(2, retryCount));
        } else {
          reject(new Error(`Network error: ${error.message}`));
        }
      });
      
      req.on('timeout', () => {
        req.destroy();
        if (retryCount < this.maxRetries) {
          logger.warn(`Timeout with OpenAI API, retrying (${retryCount + 1}/${this.maxRetries})...`);
          setTimeout(() => {
            this.createChatCompletion(options, retryCount + 1)
              .then(resolve)
              .catch(reject);
          }, this.retryDelay * Math.pow(2, retryCount));
        } else {
          reject(new Error('Request timed out'));
        }
      });
      
      req.write(data);
      req.end();
    });
  }
  
  /**
   * Stream response from OpenAI
   * @param {Object} options - Options for the API call
   * @param {Function} onMessage - Callback for each message chunk
   * @param {Function} onComplete - Callback when streaming is complete
   * @param {Function} onError - Callback for errors
   */
  async streamChatCompletion(options, onMessage, onComplete, onError) {
    try {
      options.stream = true;
      const response = await this.createChatCompletion(options);
      
      let fullContent = '';
      
      response.on('data', (chunk) => {
        try {
          const text = chunk.toString();
          const lines = text.split('\n').filter(line => line.trim() !== '' && line.trim() !== 'data: [DONE]');
          
          for (const line of lines) {
            if (line.includes('data: ')) {
              const data = line.replace('data: ', '');
              if (data === '[DONE]') continue;
              
              try {
                const parsedData = JSON.parse(data);
                const content = parsedData.choices[0]?.delta?.content || '';
                if (content) {
                  fullContent += content;
                  onMessage && onMessage(content, fullContent);
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        } catch (error) {
          onError && onError(error);
        }
      });
      
      response.on('end', () => {
        onComplete && onComplete(fullContent);
      });
      
      response.on('error', (error) => {
        onError && onError(error);
      });
    } catch (error) {
      onError && onError(error);
    }
  }
}

// Initialize OpenAI client if API key is available
const openai = new OpenAIClient(process.env.OPENAI_API_KEY);

/**
 * Add a log entry to Project Assistant session
 */
function addProjectAssistantLog(level, message, data = {}) {
  const logEntry = {
    id: generateId(),
    timestamp: Date.now(),
    level,
    message,
    data
  };
  
  projectAssistantSession.logs.push(logEntry);
  
  // Broadcast log event to connected clients
  broadcastToProjectAssistant(WsMessageType.LOG, logEntry);
  
  // Also log to Winston based on level
  switch (level) {
    case 'error':
      logger.error(message, data);
      break;
    case 'warning':
      logger.warn(message, data);
      break;
    case 'info':
      logger.info(message, data);
      break;
    default:
      logger.debug(message, data);
  }
  
  // Keep logs at a reasonable size
  if (projectAssistantSession.logs.length > config.ui.terminalHistory) {
    projectAssistantSession.logs = projectAssistantSession.logs.slice(-config.ui.terminalHistory);
  }
  
  return logEntry;
}

/**
 * Add a log entry to Script Generator state
 */
function addScriptGeneratorLog(level, message, data = {}) {
  const logEntry = {
    id: generateId(),
    timestamp: Date.now(),
    level,
    message,
    data
  };
  
  scriptGeneratorState.logs.push(logEntry);
  
  // Broadcast log event
  broadcastToScriptGenerator(WsMessageType.LOG, logEntry);
  
  // Also log to Winston based on level
  switch (level) {
    case 'error':
      logger.error(message, data);
      break;
    case 'warning':
      logger.warn(message, data);
      break;
    case 'info':
      logger.info(message, data);
      break;
    default:
      logger.debug(message, data);
  }
  
  // Keep logs at a reasonable size
  if (scriptGeneratorState.logs.length > config.ui.terminalHistory) {
    scriptGeneratorState.logs = scriptGeneratorState.logs.slice(-config.ui.terminalHistory);
  }
  
  return logEntry;
}

/**
 * Broadcast a message to all Project Assistant clients
 */
function broadcastToProjectAssistant(type, data) {
  const message = JSON.stringify({ type, data, timestamp: Date.now() });
  
  for (const [clientId, client] of connectedClients.entries()) {
    if (client.app === 'project-assistant' && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(message);
      } catch (error) {
        logger.error(`Error broadcasting to client ${clientId}: ${error.message}`);
      }
    }
  }
}

/**
 * Broadcast a message to all Script Generator clients
 */
function broadcastToScriptGenerator(type, data) {
  const message = JSON.stringify({ type, data, timestamp: Date.now() });
  
  for (const [clientId, client] of connectedClients.entries()) {
    if (client.app === 'script-generator' && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(message);
      } catch (error) {
        logger.error(`Error broadcasting to client ${clientId}: ${error.message}`);
      }
    }
  }
}

/**
 * Send a message to a specific client
 */
function sendToClient(clientId, type, data) {
  const client = connectedClients.get(clientId);
  if (!client || client.ws.readyState !== WebSocket.OPEN) return false;
  
  try {
    client.ws.send(JSON.stringify({ 
      type, 
      data, 
      timestamp: Date.now() 
    }));
    return true;
  } catch (error) {
    logger.error(`Error sending to client ${clientId}: ${error.message}`);
    return false;
  }
}

/**
 * PROJECT ASSISTANT FUNCTIONALITY
 */

/**
 * Analyzes project structure
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
  addProjectAssistantLog('info', 'Project analyzed', projectInfo);
  
  return projectInfo;
}

/**
 * Identifies relevant files for a task
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
      logger.error(`Error finding files: ${error.message}`);
    }
  }
  
  // Score and filter files
  const relevantFiles = [];
  for (const file of allFiles) {
    try {
      const stats = await fsp.stat(file);
      
      // Skip files that are too large
      if (stats.size > config.projectAssistant.maxFileSizeKb * 1024) continue;
      
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
  const result = relevantFiles.slice(0, config.projectAssistant.maxContextFiles);
  
  spinner.succeed(`Identified ${result.length} relevant files`);
  
  // Log event
  addProjectAssistantLog('info', 'Identified relevant files', { 
    count: result.length, 
    files: result.map(f => path.relative(projectDir, f.path)) 
  });
  
  return result;
}

/**
 * Simple file finder function
 */
async function findFiles(dir, callback) {
  if (!fs.existsSync(dir)) return;
  
  const files = await fsp.readdir(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = await fsp.stat(fullPath);
    
    if (stat.isDirectory()) {
      // Skip ignored directories
      if (config.projectAssistant.ignoreDirs.includes(file)) continue;
      await findFiles(fullPath, callback);
    } else {
      callback(fullPath);
    }
  }
}

/**
 * Builds context from relevant files
 */
function buildContext(relevantFiles, projectInfo) {
  const context = {
    fileContents: {},
    components: new Set(),
    imports: new Set(),
    hooks: []
  };
  
  for (const file of relevantFiles) {
    const relativePath = path.relative(projectAssistantSession.projectDir, file.path);
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
 */
async function backupFile(filePath) {
  try {
    const backupId = generateId();
    const content = await fsp.readFile(filePath, 'utf8');
    const backupPath = path.join(BACKUPS_DIR, `${backupId}_${path.basename(filePath)}`);
    await fsp.writeFile(backupPath, content);
    
    projectAssistantSession.backups.push({
      id: backupId,
      originalPath: filePath,
      backupPath,
      timestamp: Date.now()
    });
    
    // Log event
    addProjectAssistantLog('info', 'File backed up', { 
      file: path.relative(projectAssistantSession.projectDir, filePath),
      backupId 
    });
    
    return backupId;
  } catch (error) {
    logger.error(`Error backing up file: ${error.message}`);
    addProjectAssistantLog('error', 'Backup failed', { 
      file: path.relative(projectAssistantSession.projectDir, filePath),
      error: error.message 
    });
    return null;
  }
}

/**
 * Restores a file from backup
 */
async function restoreFromBackup(backupId) {
  const backup = projectAssistantSession.backups.find(b => b.id === backupId);
  if (!backup) return false;
  
  try {
    const content = await fsp.readFile(backup.backupPath, 'utf8');
    await fsp.writeFile(backup.originalPath, content);
    
    // Log event
    addProjectAssistantLog('info', 'File restored from backup', { 
      file: path.relative(projectAssistantSession.projectDir, backup.originalPath),
      backupId 
    });
    
    return true;
  } catch (error) {
    logger.error(`Error restoring backup: ${error.message}`);
    addProjectAssistantLog('error', 'Restore failed', { 
      backupId,
      error: error.message 
    });
    return false;
  }
}

/**
 * Handles an AI-powered task for Project Assistant
 */
async function executeProjectAssistantTask(taskDescription, taskType = null, clientId = null) {
  if (!projectAssistantSession.id) {
    const message = 'No active session. Start a session first.';
    logger.warn(message);
    
    if (clientId) {
      sendToClient(clientId, WsMessageType.ERROR, {
        message,
        code: 'NO_SESSION'
      });
    }
    
    return {
      success: false,
      error: message
    };
  }
  
  if (!process.env.OPENAI_API_KEY) {
    const message = 'OPENAI_API_KEY environment variable not set.';
    logger.error(message);
    
    if (clientId) {
      sendToClient(clientId, WsMessageType.ERROR, {
        message,
        code: 'NO_API_KEY'
      });
    }
    
    return {
      success: false,
      error: message
    };
  }
  
  logger.info(`Executing task: ${taskDescription}`);
  
  // Create a task object
  const task = {
    id: generateId(),
    description: taskDescription,
    type: taskType,
    status: TaskStatus.RUNNING,
    startTime: Date.now(),
    endTime: null,
    result: null,
    progress: 0
  };
  
  // Add to tasks list
  projectAssistantSession.tasks.push(task);
  
  // Broadcast task started
  broadcastToProjectAssistant(WsMessageType.TASK_STARTED, task);
  
  // Log event
  addProjectAssistantLog('info', 'Task started', { 
    taskId: task.id,
    description: taskDescription,
    type: taskType
  });
  
  try {
    // Update progress to 10%
    task.progress = 10;
    broadcastToProjectAssistant(WsMessageType.TASK_PROGRESS, task);
    
    // Find relevant files
    const relevantFiles = await findRelevantFiles(
      projectAssistantSession.projectDir,
      projectAssistantSession.projectInfo,
      taskDescription
    );
    
    // Update progress to 30%
    task.progress = 30;
    broadcastToProjectAssistant(WsMessageType.TASK_PROGRESS, task);
    
    // Build context
    const context = buildContext(relevantFiles, projectAssistantSession.projectInfo);
    
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
    
    // Update progress to 40%
    task.progress = 40;
    broadcastToProjectAssistant(WsMessageType.TASK_PROGRESS, task);
    
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

    // Update progress to 50%
    task.progress = 50;
    broadcastToProjectAssistant(WsMessageType.TASK_PROGRESS, task);
    
    // Initialize results
    let explanation = '';
    let code = '';
    
    // Call OpenAI API with streaming
    await new Promise((resolve, reject) => {
      openai.streamChatCompletion(
        {
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userMessage }
          ],
          model: config.projectAssistant.model,
          max_tokens: config.projectAssistant.maxTokens,
          temperature: config.projectAssistant.temperature
        },
        // onMessage callback
        (chunk, fullContent) => {
          // Calculate progress between 50% and 90% based on token count
          const expectedLength = 2000; // rough estimate
          const progress = 50 + Math.min(40, Math.floor((fullContent.length / expectedLength) * 40));
          
          task.progress = progress;
          task.partialResult = fullContent;
          
          broadcastToProjectAssistant(WsMessageType.TASK_PROGRESS, task);
        },
        // onComplete callback
        (finalContent) => {
          // Process the final content
          const result = extractCodeAndExplanation(finalContent);
          code = result.code;
          explanation = result.explanation;
          
          // Set progress to 90%
          task.progress = 90;
          broadcastToProjectAssistant(WsMessageType.TASK_PROGRESS, task);
          
          resolve();
        },
        // onError callback
        (error) => {
          reject(error);
        }
      );
    });
    
    // Update task status
    task.status = TaskStatus.COMPLETED;
    task.endTime = Date.now();
    task.result = {
      code,
      explanation
    };
    task.progress = 100;
    
    // Log event
    addProjectAssistantLog('info', 'Task completed', { 
      taskId: task.id,
      executionTime: task.endTime - task.startTime
    });
    
    // Broadcast task completed
    broadcastToProjectAssistant(WsMessageType.TASK_COMPLETED, task);
    
    // Save session
    await saveProjectAssistantSession();
    
    return {
      success: true,
      taskId: task.id,
      code,
      explanation
    };
  } catch (error) {
    logger.error(`Error executing task: ${error.message}`);
    
    // Update task status
    task.status = TaskStatus.FAILED;
    task.endTime = Date.now();
    task.error = error.message;
    task.progress = 0;
    
    // Log event
    addProjectAssistantLog('error', 'Task failed', { 
      taskId: task.id,
      error: error.message 
    });
    
    // Broadcast task failed
    broadcastToProjectAssistant(WsMessageType.TASK_FAILED, task);
    
    if (clientId) {
      sendToClient(clientId, WsMessageType.ERROR, {
        message: `Task failed: ${error.message}`,
        code: 'TASK_FAILED',
        taskId: task.id
      });
    }
    
    return {
      success: false,
      error: error.message,
      taskId: task.id
    };
  }
}

/**
 * Extracts code and explanation from AI response
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
 * Save file for Project Assistant
 */
async function saveProjectAssistantFile(filePath, content, clientId = null) {
  if (!projectAssistantSession.id) {
    const message = 'No active session.';
    logger.warn(message);
    
    if (clientId) {
      sendToClient(clientId, WsMessageType.ERROR, {
        message,
        code: 'NO_SESSION'
      });
    }
    
    return {
      success: false,
      error: message
    };
  }
  
  try {
    const fullPath = path.isAbsolute(filePath) 
      ? filePath 
      : path.join(projectAssistantSession.projectDir, filePath);
    
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
    
    logger.info(`File saved successfully to ${fullPath}`);
    projectAssistantSession.modifiedFiles.add(fullPath);
    
    // Log event
    addProjectAssistantLog('info', 'File saved', { 
      file: path.relative(projectAssistantSession.projectDir, fullPath) 
    });
    
    // Save session
    await saveProjectAssistantSession();
    
    const result = {
      success: true,
      path: fullPath,
      relativePath: path.relative(projectAssistantSession.projectDir, fullPath)
    };
    
    // Send notification if client provided
    if (clientId) {
      sendToClient(clientId, WsMessageType.NOTIFICATION, {
        type: 'success',
        message: `File saved successfully: ${filePath}`
      });
    }
    
    return result;
  } catch (error) {
    logger.error(`Error saving file: ${error.message}`);
    
    // Log event
    addProjectAssistantLog('error', 'File save failed', { 
      path: filePath, 
      error: error.message 
    });
    
    if (clientId) {
      sendToClient(clientId, WsMessageType.ERROR, {
        message: `Failed to save file: ${error.message}`,
        code: 'SAVE_FAILED'
      });
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Saves the current Project Assistant session
 */
async function saveProjectAssistantSession() {
  if (!projectAssistantSession.id) return false;
  
  try {
    const sessionPath = path.join(SESSIONS_DIR, `project-assistant-${projectAssistantSession.id}.json`);
    await fsp.writeFile(sessionPath, JSON.stringify({
      ...projectAssistantSession,
      modifiedFiles: Array.from(projectAssistantSession.modifiedFiles)
    }, null, 2));
    
    // Log event
    addProjectAssistantLog('info', 'Session saved', { sessionId: projectAssistantSession.id });
    
    return true;
  } catch (error) {
    logger.error(`Error saving session: ${error.message}`);
    addProjectAssistantLog('error', 'Session save failed', { error: error.message });
    return false;
  }
}

/**
 * Loads a Project Assistant session
 */
async function loadProjectAssistantSession(sessionId, clientId = null) {
  const sessionPath = path.join(SESSIONS_DIR, `project-assistant-${sessionId}.json`);
  
  if (!fs.existsSync(sessionPath)) {
    const message = `Session not found: ${sessionId}`;
    logger.warn(message);
    
    if (clientId) {
      sendToClient(clientId, WsMessageType.ERROR, {
        message,
        code: 'SESSION_NOT_FOUND'
      });
    }
    
    return {
      success: false,
      error: message
    };
  }
  
  try {
    const sessionData = JSON.parse(await fsp.readFile(sessionPath, 'utf8'));
    projectAssistantSession = {
      ...sessionData,
      modifiedFiles: new Set(sessionData.modifiedFiles),
      logs: sessionData.logs || []
    };
    
    logger.info(`Loaded session: ${sessionId}`);
    
    // Log event
    addProjectAssistantLog('info', 'Session loaded', { sessionId });
    
    // Broadcast session change
    broadcastToProjectAssistant(WsMessageType.SESSION_LOADED, {
      ...projectAssistantSession,
      modifiedFiles: Array.from(projectAssistantSession.modifiedFiles)
    });
    
    return {
      success: true,
      session: {
        ...projectAssistantSession,
        modifiedFiles: Array.from(projectAssistantSession.modifiedFiles)
      }
    };
  } catch (error) {
    logger.error(`Error loading session: ${error.message}`);
    
    if (clientId) {
      sendToClient(clientId, WsMessageType.ERROR, {
        message: `Failed to load session: ${error.message}`,
        code: 'SESSION_LOAD_FAILED'
      });
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Starts a new Project Assistant session
 */
async function startProjectAssistantSession(projectDir = null, clientId = null) {
  if (!projectDir) {
    projectDir = process.cwd();
  }
  
  const resolvedPath = path.resolve(projectDir);
  
  if (!fs.existsSync(resolvedPath)) {
    const message = `Directory does not exist: ${resolvedPath}`;
    logger.error(message);
    
    if (clientId) {
      sendToClient(clientId, WsMessageType.ERROR, {
        message,
        code: 'INVALID_DIRECTORY'
      });
    }
    
    return {
      success: false,
      error: message
    };
  }
  
  // Create new session
  projectAssistantSession = {
    id: generateId(),
    startTime: Date.now(),
    projectDir: resolvedPath,
    tasks: [],
    modifiedFiles: new Set(),
    backups: [],
    status: 'running',
    logs: []
  };
  
  logger.info(`Started new session with ID: ${projectAssistantSession.id}`);
  
  // Log event
  addProjectAssistantLog('info', 'Session started', { 
    sessionId: projectAssistantSession.id,
    projectDir: resolvedPath
  });
  
  // Analyze project
  projectAssistantSession.projectInfo = await analyzeProject(resolvedPath);
  
  // Save initial session
  await saveProjectAssistantSession();
  
  // Broadcast session change
  broadcastToProjectAssistant(WsMessageType.SESSION_STARTED, {
    ...projectAssistantSession,
    modifiedFiles: Array.from(projectAssistantSession.modifiedFiles)
  });
  
  return {
    success: true,
    sessionId: projectAssistantSession.id,
    projectInfo: projectAssistantSession.projectInfo
  };
}

/**
 * SCRIPT GENERATOR FUNCTIONALITY
 */

/**
 * Initializes the Script Generator state
 */
function initScriptGenerator() {
  if (scriptGeneratorState.id) return;
  
  scriptGeneratorState = {
    id: generateId(),
    startTime: Date.now(),
    isRunning: false,
    isPaused: false,
    apiUsage: 0,
    scripts: [],
    jobs: [],
    categories: [
      { id: 'windows', name: 'Windows', count: 0, enabled: true },
      { id: 'mac', name: 'Mac', count: 0, enabled: true },
      { id: 'linux', name: 'Linux', count: 0, enabled: true },
      { id: 'network', name: 'Network', count: 0, enabled: true },
      { id: 'security', name: 'Security', count: 0, enabled: true }
    ],
    keywords: [],
    settings: { ...config.scriptGenerator },
    logs: []
  };
  
  // Log event
  addScriptGeneratorLog('info', 'Script Generator initialized', { 
    generatorId: scriptGeneratorState.id 
  });
  
  // Save state
  saveScriptGeneratorState();
  
  // Auto-start if configured
  if (config.scriptGenerator.autoStart) {
    startScriptGenerator();
  }
  
  return scriptGeneratorState;
}

/**
 * Saves the current Script Generator state
 */
async function saveScriptGeneratorState() {
  if (!scriptGeneratorState.id) return false;
  
  try {
    const statePath = path.join(SCRIPT_GEN_DIR, `state-${scriptGeneratorState.id}.json`);
    await fsp.writeFile(statePath, JSON.stringify({
      ...scriptGeneratorState,
      // Convert scripts array to object for more efficient storage
      scripts: scriptGeneratorState.scripts.slice(0, 100) // Limit saved scripts to 100
    }, null, 2));
    
    // Log event
    addScriptGeneratorLog('info', 'State saved', { generatorId: scriptGeneratorState.id });
    
    return true;
  } catch (error) {
    logger.error(`Error saving Script Generator state: ${error.message}`);
    addScriptGeneratorLog('error', 'State save failed', { error: error.message });
    return false;
  }
}

/**
 * Loads a Script Generator state
 */
async function loadScriptGeneratorState(stateId, clientId = null) {
  const statePath = path.join(SCRIPT_GEN_DIR, `state-${stateId}.json`);
  
  if (!fs.existsSync(statePath)) {
    const message = `State not found: ${stateId}`;
    logger.warn(message);
    
    if (clientId) {
      sendToClient(clientId, WsMessageType.ERROR, {
        message,
        code: 'STATE_NOT_FOUND'
      });
    }
    
    return {
      success: false,
      error: message
    };
  }
  
  try {
    const stateData = JSON.parse(await fsp.readFile(statePath, 'utf8'));
    scriptGeneratorState = {
      ...stateData,
      logs: stateData.logs || []
    };
    
    logger.info(`Loaded Script Generator state: ${stateId}`);
    
    // Log event
    addScriptGeneratorLog('info', 'State loaded', { stateId });
    
    // Broadcast state change
    broadcastToScriptGenerator(WsMessageType.GENERATOR_STATUS, scriptGeneratorState);
    
    return {
      success: true,
      state: scriptGeneratorState
    };
  } catch (error) {
    logger.error(`Error loading Script Generator state: ${error.message}`);
    
    if (clientId) {
      sendToClient(clientId, WsMessageType.ERROR, {
        message: `Failed to load state: ${error.message}`,
        code: 'STATE_LOAD_FAILED'
      });
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Starts the Script Generator
 */
function startScriptGenerator(clientId = null) {
  if (!scriptGeneratorState.id) {
    initScriptGenerator();
  }
  
  if (scriptGeneratorState.isRunning) {
    const message = 'Script Generator is already running';
    
    if (clientId) {
      sendToClient(clientId, WsMessageType.NOTIFICATION, {
        type: 'warning',
        message
      });
    }
    
    return {
      success: false,
      error: message
    };
  }
  
  // Check if we have an API key
  if (!process.env.OPENAI_API_KEY) {
    const message = 'OPENAI_API_KEY environment variable not set.';
    logger.error(message);
    
    if (clientId) {
      sendToClient(clientId, WsMessageType.ERROR, {
        message,
        code: 'NO_API_KEY'
      });
    }
    
    return {
      success: false,
      error: message
    };
  }
  
  scriptGeneratorState.isRunning = true;
  scriptGeneratorState.isPaused = false;
  
  // Log event
  addScriptGeneratorLog('info', 'Script Generator started');
  
  // Create an auto job
  createAutoGeneratorJob();
  
  // Broadcast state change
  broadcastToScriptGenerator(WsMessageType.GENERATOR_STATUS, scriptGeneratorState);
  
  // Save state
  saveScriptGeneratorState();
  
  return {
    success: true,
    message: 'Script Generator started successfully'
  };
}

/**
 * Creates an automatic generator job
 */
function createAutoGeneratorJob() {
  // Check if we already have an active auto job
  const hasActiveAutoJob = scriptGeneratorState.jobs.some(
    job => job.id.startsWith('auto-') && ['pending', 'running'].includes(job.status)
  );
  
  if (hasActiveAutoJob) return;
  
  const jobId = `auto-${generateId()}`;
  
  const keywords = scriptGeneratorState.keywords.length > 0
    ? scriptGeneratorState.keywords.map(k => k.text).join(', ')
    : 'system administration, automation, script generation';
  
  const job = {
    id: jobId,
    name: 'Auto Generation',
    keywords: keywords,
    category: 'all',
    scriptCount: scriptGeneratorState.settings.defaultScriptsPerBatch,
    generateBash: scriptGeneratorState.settings.defaultScriptTypes.includes('bash'),
    generatePowershell: scriptGeneratorState.settings.defaultScriptTypes.includes('powershell'),
    status: 'pending',
    progress: 0,
    scriptsGenerated: 0,
    startTime: Date.now(),
    estimatedEndTime: Date.now() + (scriptGeneratorState.settings.defaultScriptsPerBatch * 30000),
    manualMode: false
  };
  
  // Add to jobs list
  scriptGeneratorState.jobs.push(job);
  
  // Log event
  addScriptGeneratorLog('info', 'Auto job created', { jobId });
  
  // Broadcast job created
  broadcastToScriptGenerator(WsMessageType.JOB_STARTED, job);
  
  // Start job after a short delay
  setTimeout(() => {
    executeGeneratorJob(jobId);
  }, 1000);
  
  return job;
}

/**
 * Creates a manual generator job
 */
function createManualGeneratorJob(params, clientId = null) {
  if (!scriptGeneratorState.id) {
    initScriptGenerator();
  }
  
  // Validate params
  if (!params.keywords) {
    const message = 'Keywords are required for manual job';
    
    if (clientId) {
      sendToClient(clientId, WsMessageType.ERROR, {
        message,
        code: 'INVALID_PARAMS'
      });
    }
    
    return {
      success: false,
      error: message
    };
  }
  
  if (!params.generateBash && !params.generatePowershell) {
    const message = 'At least one script type must be selected';
    
    if (clientId) {
      sendToClient(clientId, WsMessageType.ERROR, {
        message,
        code: 'INVALID_PARAMS'
      });
    }
    
    return {
      success: false,
      error: message
    };
  }
  
  const jobId = `manual-${generateId()}`;
  
  const job = {
    id: jobId,
    name: params.name || `Manual Job ${jobId.substring(7, 11)}`,
    keywords: params.keywords,
    category: params.category || 'all',
    scriptCount: params.scriptCount || scriptGeneratorState.settings.defaultScriptsPerBatch,
    generateBash: params.generateBash !== undefined 
      ? params.generateBash 
      : scriptGeneratorState.settings.defaultScriptTypes.includes('bash'),
    generatePowershell: params.generatePowershell !== undefined 
      ? params.generatePowershell 
      : scriptGeneratorState.settings.defaultScriptTypes.includes('powershell'),
    status: 'pending',
    progress: 0,
    scriptsGenerated: 0,
    startTime: Date.now(),
    estimatedEndTime: Date.now() + (
      (params.scriptCount || scriptGeneratorState.settings.defaultScriptsPerBatch) * 30000
    ),
    manualMode: true
  };
  
  // Add to jobs list
  scriptGeneratorState.jobs.push(job);
  
  // Log event
  addScriptGeneratorLog('info', 'Manual job created', { 
    jobId,
    params
  });
  
  // Broadcast job created
  broadcastToScriptGenerator(WsMessageType.JOB_STARTED, job);
  
  // Start job
  executeGeneratorJob(jobId);
  
  // Save state
  saveScriptGeneratorState();
  
  return {
    success: true,
    job
  };
}

/**
 * Executes a generator job
 */
async function executeGeneratorJob(jobId) {
  const jobIndex = scriptGeneratorState.jobs.findIndex(j => j.id === jobId);
  if (jobIndex === -1) {
    logger.warn(`Job not found: ${jobId}`);
    return false;
  }
  
  const job = scriptGeneratorState.jobs[jobIndex];
  
  // Update job status
  job.status = 'running';
  
  // Broadcast job update
  broadcastToScriptGenerator(WsMessageType.JOB_PROGRESS, job);
  
  // Log job start
  addScriptGeneratorLog('info', `Started job: ${job.name}`, { jobId });
  
  // Simulate progress updates
  const updateInterval = setInterval(() => {
    // Skip if job was removed
    if (!scriptGeneratorState.jobs.find(j => j.id === jobId)) {
      clearInterval(updateInterval);
      return;
    }
    
    // Skip if job is paused or no longer running
    if (job.status !== 'running' || scriptGeneratorState.isPaused) {
      return;
    }
    
    // Update progress
    const progressIncrement = Math.floor(Math.random() * 5) + 1;
    job.progress = Math.min(100, job.progress + progressIncrement);
    
    // Check if this increment should generate a script
    if (Math.random() < 0.3 && job.scriptsGenerated < job.scriptCount) {
      job.scriptsGenerated++;
      
      // Generate a script
      generateScript(job)
        .then(script => {
          if (script) {
            // Broadcast script created
            broadcastToScriptGenerator(WsMessageType.SCRIPT_GENERATED, script);
          }
        })
        .catch(error => {
          logger.error(`Error generating script: ${error.message}`);
        });
    }
    
    // Broadcast job update
    broadcastToScriptGenerator(WsMessageType.JOB_PROGRESS, job);
    
    // Check if job is complete
    if (job.progress >= 100 || job.scriptsGenerated >= job.scriptCount) {
      clearInterval(updateInterval);
      job.progress = 100;
      job.status = 'completed';
      job.endTime = Date.now();
      
      // Broadcast job completed
      broadcastToScriptGenerator(WsMessageType.JOB_COMPLETED, job);
      
      // Log job completion
      addScriptGeneratorLog('info', `Job completed: ${job.name}`, { 
        jobId,
        scriptsGenerated: job.scriptsGenerated
      });
      
      // Save state
      saveScriptGeneratorState();
      
      // If this was an auto job and the generator is still running, create a new one
      if (job.id.startsWith('auto-') && scriptGeneratorState.isRunning && !scriptGeneratorState.isPaused) {
        // Schedule next auto job based on update interval
        setTimeout(() => {
          createAutoGeneratorJob();
        }, scriptGeneratorState.settings.defaultUpdateInterval * 60 * 1000);
      }
    }
  }, Math.floor(Math.random() * 1000) + 500);
  
  return true;
}

/**
 * Generates a script for a job
 */
async function generateScript(job) {
  try {
    // Determine script type
    let scriptType = 'bash';
    if (job.generateBash && job.generatePowershell) {
      scriptType = Math.random() > 0.5 ? 'bash' : 'powershell';
    } else if (job.generatePowershell) {
      scriptType = 'powershell';
    }
    
    // Determine category
    let category = job.category;
    if (category === 'all') {
      // Select a random enabled category
      const enabledCategories = scriptGeneratorState.categories.filter(cat => cat.enabled);
      if (enabledCategories.length > 0) {
        category = enabledCategories[Math.floor(Math.random() * enabledCategories.length)].id;
      } else {
        category = 'windows'; // Default if no categories enabled
      }
    }
    
    // Get keywords
    let keywords = [];
    if (job.manualMode) {
      // Manual mode: Use provided keywords
      keywords = job.keywords.split(/[,;]+/).map(k => k.trim()).filter(k => k);
    } else {
      // Auto mode: Use random keywords from the state
      if (scriptGeneratorState.keywords.length > 0) {
        const randomKeywordIndex = Math.floor(Math.random() * scriptGeneratorState.keywords.length);
        keywords = scriptGeneratorState.keywords[randomKeywordIndex].text.split(/\s+/);
      } else {
        // Default keywords if none available
        keywords = ['system', 'administration', 'automation'];
      }
    }
    
    const keywordsText = keywords.join(' ');
    
    // Call OpenAI to generate the script
    const systemPrompt = `You are an expert script generator specializing in creating high-quality, practical ${scriptType} scripts for ${category} systems. 
Your task is to generate a complete, functional script based on the following keywords: ${keywordsText}.

The script should:
1. Be well-commented with clear explanations
2. Include proper error handling
3. Follow best practices for ${scriptType} scripting
4. Be practical and useful for system administrators
5. Be safe to execute (no destructive operations without clear warnings)
6. Include a detailed header comment explaining its purpose, usage, and parameters

Format your response as a complete script without any explanation before or after - just the script itself with comments.`;

    const userPrompt = `Create a practical, useful ${scriptType} script for ${category} systems based on these keywords: ${keywordsText}.
Make it comprehensive and ready to use.`;

    // Try to get from cache first
    const cacheKey = `script_${scriptType}_${category}_${keywordsText.replace(/\s+/g, '_')}`;
    const cachePath = path.join(CACHE_DIR, `${cacheKey}.json`);
    
    let scriptCode = null;
    
    // Check cache if enabled
    if (scriptGeneratorState.settings.cacheEnabled && fs.existsSync(cachePath)) {
      try {
        const cachedData = JSON.parse(await fsp.readFile(cachePath, 'utf8'));
        scriptCode = cachedData.code;
        logger.info(`Using cached script for: ${keywordsText}`);
      } catch (error) {
        logger.warn(`Error reading script cache: ${error.message}`);
      }
    }
    
    // Generate script if not in cache
    if (!scriptCode) {
      const response = await openai.createChatCompletion({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        model: scriptGeneratorState.settings.model,
        max_tokens: scriptGeneratorState.settings.maxTokens,
        temperature: scriptGeneratorState.settings.temperature
      });
      
      scriptCode = response.choices[0].message.content.trim();
      
      // Save to cache if enabled
      if (scriptGeneratorState.settings.cacheEnabled) {
        try {
          await fsp.writeFile(cachePath, JSON.stringify({
            code: scriptCode,
            timestamp: Date.now(),
            keywords: keywordsText,
            type: scriptType,
            category
          }));
        } catch (error) {
          logger.warn(`Error writing to script cache: ${error.message}`);
        }
      }
    }
    
    // Create script object
    const script = {
      id: `script-${generateId()}`,
      title: `${job.manualMode ? 'Manual' : 'Auto'} ${scriptType === 'bash' ? 'Bash' : 'PowerShell'} Script for "${keywordsText}"`,
      description: `${job.manualMode ? 'Manually' : 'Automatically'} generated script for ${category} - ${keywords.join(', ')}`,
      type: scriptType,
      category: category,
      keywords: keywords,
      code: scriptCode,
      created: Date.now(),
      jobId: job.id,
      seoScore: Math.floor(Math.random() * 20) + 80
    };
    
    // Add to scripts list (at the beginning)
    scriptGeneratorState.scripts.unshift(script);
    
    // Increment category count
    const catIndex = scriptGeneratorState.categories.findIndex(c => c.id === category);
    if (catIndex !== -1) {
      scriptGeneratorState.categories[catIndex].count++;
    }
    
    // Log script generation
    addScriptGeneratorLog('info', `Generated script: ${script.title}`, {
      scriptId: script.id,
      jobId: job.id
    });
    
    return script;
  } catch (error) {
    logger.error(`Error generating script: ${error.message}`);
    addScriptGeneratorLog('error', 'Script generation failed', {
      jobId: job.id,
      error: error.message
    });
    return null;
  }
}

/**
 * Express server setup
 */
function createServer() {
  // Create express app
  const app = express();
  
  // Create HTTP server
  const server = http.createServer(app);
  
  // Set up WebSocket server
  const wss = new WebSocketServer({ 
    server,
    perMessageDeflate: true
  });
  
  // Configure WebSocket server
  setupWebSocketServer(wss);
  
/**
 * WebSocket Server Configuration
 */
function setupWebSocketServer(wss) {
  wss.on('connection', (ws, req) => {
    // Generate client ID
    const clientId = generateId();
    
    // Parse URL to determine which app is being connected to
    const url = req.url;
    const app = url.includes('project-assistant') 
      ? 'project-assistant' 
      : (url.includes('script-generator') ? 'script-generator' : 'unknown');
    
    // Save client connection
    connectedClients.set(clientId, { 
      ws, 
      app, 
      connectedAt: Date.now(),
      lastPing: Date.now(),
      isAlive: true
    });
    
    logger.info(`WebSocket client connected: ${clientId} (${app})`);
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: WsMessageType.CONNECT,
      data: {
        clientId,
        app
      },
      timestamp: Date.now()
    }));
    
    // Send initial state based on app
    if (app === 'project-assistant') {
      if (projectAssistantSession.id) {
        ws.send(JSON.stringify({
          type: WsMessageType.SESSION_STATUS,
          data: {
            ...projectAssistantSession,
            modifiedFiles: Array.from(projectAssistantSession.modifiedFiles)
          },
          timestamp: Date.now()
        }));
      }
    } else if (app === 'script-generator') {
      if (!scriptGeneratorState.id) {
        initScriptGenerator();
      }
      
      ws.send(JSON.stringify({
        type: WsMessageType.GENERATOR_STATUS,
        data: scriptGeneratorState,
        timestamp: Date.now()
      }));
    }
    
    // Handle messages from client
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        handleWebSocketMessage(clientId, message);
      } catch (error) {
        logger.error(`Error handling WebSocket message: ${error.message}`);
        
        // Send error response
        ws.send(JSON.stringify({
          type: WsMessageType.ERROR,
          data: {
            message: 'Invalid message format',
            error: error.message
          },
          timestamp: Date.now()
        }));
      }
    });
    
    // Handle client disconnection
    ws.on('close', () => {
      connectedClients.delete(clientId);
      logger.info(`WebSocket client disconnected: ${clientId}`);
    });
    
    // Handle errors
    ws.on('error', (error) => {
      logger.error(`WebSocket error for client ${clientId}: ${error.message}`);
      
      try {
        connectedClients.delete(clientId);
        ws.terminate();
      } catch (e) {
        // Ignore errors when closing an already closed connection
      }
    });
    
    // Handle pings to keep connection alive
    ws.on('pong', () => {
      const client = connectedClients.get(clientId);
      if (client) {
        client.isAlive = true;
        client.lastPing = Date.now();
      }
    });
  });
  
  // Set up ping interval to check for stale connections
  const pingInterval = setInterval(() => {
    for (const [clientId, client] of connectedClients.entries()) {
      if (!client.isAlive) {
        logger.warn(`WebSocket client ${clientId} not responding, terminating connection`);
        connectedClients.delete(clientId);
        client.ws.terminate();
        continue;
      }
      
      // Mark as not alive until pong is received
      client.isAlive = false;
      
      try {
        client.ws.ping();
      } catch (error) {
        logger.error(`Error sending ping to client ${clientId}: ${error.message}`);
        connectedClients.delete(clientId);
        client.ws.terminate();
      }
    }
  }, config.server.socketPingInterval);
  
  // Clean up interval on server close
  wss.on('close', () => {
    clearInterval(pingInterval);
  });
}

/**
 * Handle WebSocket messages
 */
function handleWebSocketMessage(clientId, message) {
  const client = connectedClients.get(clientId);
  if (!client) return;
  
  const { type, data } = message;
  
  switch (type) {
    case 'ping':
      // Respond with pong
      sendToClient(clientId, WsMessageType.PONG, { timestamp: Date.now() });
      break;
      
    case 'task':
      // Execute task from WebSocket
      if (client.app === 'project-assistant') {
        executeProjectAssistantTask(data.description, data.type, clientId);
      }
      break;
      
    case 'job':
      // Create generator job from WebSocket
      if (client.app === 'script-generator') {
        createManualGeneratorJob(data, clientId);
      }
      break;
      
    case 'save_file':
      // Save file from WebSocket
      if (client.app === 'project-assistant') {
        saveProjectAssistantFile(data.path, data.content, clientId);
      }
      break;
      
    default:
      logger.warn(`Unknown WebSocket message type: ${type}`);
      sendToClient(clientId, WsMessageType.ERROR, {
        message: `Unknown message type: ${type}`
      });
  }
}
  
  // Configure middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "cdnjs.cloudflare.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
        fontSrc: ["'self'", "cdnjs.cloudflare.com"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'", "ws:", "wss:"]
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
  
  app.use(compression());
  app.use(cookieParser());
  app.use(cors());
  app.use(express.json({ limit: config.server.maxRequestSize }));
  app.use(express.urlencoded({ extended: true, limit: config.server.maxRequestSize }));
  
  // Request timeout middleware
  app.use((req, res, next) => {
    res.setTimeout(config.server.requestTimeout, () => {
      logger.warn(`Request timeout: ${req.method} ${req.url}`);
      res.status(408).json(ApiResponse.error('Request timeout', 408));
    });
    next();
  });
  
  // Logging middleware
  app.use(morgan(config.server.logFormat, {
    stream: {
      write: (message) => logger.http(message.trim())
    }
  }));
  
  // Rate limiting middleware
  const apiLimiter = rateLimit({
    windowMs: config.server.rateLimitWindow,
    max: config.server.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests from this IP, please try again later' }
  });
  
  app.use('/api/', apiLimiter);
  
  // Static files
  app.use(express.static(PUBLIC_DIR, {
    maxAge: '1d',
    etag: true
  }));
  
  // Configure server timeouts
  server.keepAliveTimeout = config.server.keepAliveTimeout;
  server.headersTimeout = config.server.headersTimeout;
  
  /**
   * COMMON API ROUTES
   */
  
  // Server status
  app.get('/api/status', (req, res) => {
    res.json(ApiResponse.success({
      version: '3.0.0',
      uptime: process.uptime(),
      projectAssistantActive: !!projectAssistantSession.id,
      scriptGeneratorActive: !!scriptGeneratorState.id,
      projectAssistantSessionId: projectAssistantSession.id,
      scriptGeneratorStateId: scriptGeneratorState.id
    }));
  });
  
  // Update configuration
  app.post('/api/config', (req, res) => {
    try {
      // Validate configuration
      const newConfig = req.body;
      
      // Deep merge with current config
      config = mergeConfigs(config, newConfig);
      
      // Save config
      const saved = saveConfig();
      
      if (saved) {
        res.json(ApiResponse.success(config, 'Configuration updated successfully'));
      } else {
        res.status(500).json(ApiResponse.error('Failed to save configuration'));
      }
    } catch (error) {
      logger.error(`Error updating config: ${error.message}`);
      res.status(500).json(ApiResponse.error(`Failed to update configuration: ${error.message}`));
    }
  });
  
  // Get configuration
  app.get('/api/config', (req, res) => {
    res.json(ApiResponse.success(config));
  });
  
  /**
   * PROJECT ASSISTANT API ROUTES
   */
  
  // Get Project Assistant session info
  app.get('/api/project-assistant/session', (req, res) => {
    if (!projectAssistantSession.id) {
      res.status(404).json(ApiResponse.error('No active session', 404));
      return;
    }
    
    res.json(ApiResponse.success({
      ...projectAssistantSession,
      modifiedFiles: Array.from(projectAssistantSession.modifiedFiles)
    }));
  });
  
  // Start a new Project Assistant session
  app.post('/api/project-assistant/session/start', async (req, res) => {
    try {
      const { projectDir } = req.body;
      const result = await startProjectAssistantSession(projectDir);
      
      if (!result.success) {
        res.status(400).json(ApiResponse.error(result.error, 400));
        return;
      }
      
      res.json(ApiResponse.success({
        id: projectAssistantSession.id,
        projectDir: projectAssistantSession.projectDir,
        projectInfo: projectAssistantSession.projectInfo
      }));
    } catch (error) {
      logger.error(`Error starting session: ${error.message}`);
      res.status(500).json(ApiResponse.error(`Failed to start session: ${error.message}`, 500));
    }
  });
  
  // Load a Project Assistant session
  app.post('/api/project-assistant/session/load', async (req, res) => {
    try {
      const { sessionId } = req.body;
      
      if (!sessionId) {
        res.status(400).json(ApiResponse.error('Session ID is required', 400));
        return;
      }
      
      const result = await loadProjectAssistantSession(sessionId);
      
      if (!result.success) {
        res.status(404).json(ApiResponse.error(result.error, 404));
        return;
      }
      
      res.json(ApiResponse.success({
        id: projectAssistantSession.id,
        projectDir: projectAssistantSession.projectDir,
        projectInfo: projectAssistantSession.projectInfo
      }));
    } catch (error) {
      logger.error(`Error loading session: ${error.message}`);
      res.status(500).json(ApiResponse.error(`Failed to load session: ${error.message}`, 500));
    }
  });
  
  // Get list of available Project Assistant sessions
  app.get('/api/project-assistant/sessions', async (req, res) => {
    try {
      const files = await fsp.readdir(SESSIONS_DIR);
      const sessions = [];
      
      for (const file of files) {
        if (file.startsWith('project-assistant-') && file.endsWith('.json')) {
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
      
      res.json(ApiResponse.success(sessions));
    } catch (error) {
      logger.error(`Error listing sessions: ${error.message}`);
      res.status(500).json(ApiResponse.error(`Failed to list sessions: ${error.message}`, 500));
    }
  });
  
  // Execute a task for Project Assistant
  app.post('/api/project-assistant/task', async (req, res) => {
    try {
      const { description, type } = req.body;
      
      if (!description) {
        res.status(400).json(ApiResponse.error('Task description is required', 400));
        return;
      }
      
      // Execute the task asynchronously to avoid timeout
      executeProjectAssistantTask(description, type);
      
      // Return immediately
      res.json(ApiResponse.success(null, 'Task started'));
    } catch (error) {
      logger.error(`Error starting task: ${error.message}`);
      res.status(500).json(ApiResponse.error(`Failed to start task: ${error.message}`, 500));
    }
  });
  
  // Save a file for Project Assistant
  app.post('/api/project-assistant/file/save', async (req, res) => {
    try {
      const { path: filePath, content } = req.body;
      
      if (!filePath || content === undefined) {
        res.status(400).json(ApiResponse.error('Path and content are required', 400));
        return;
      }
      
      const result = await saveProjectAssistantFile(filePath, content);
      
      if (!result.success) {
        res.status(500).json(ApiResponse.error(result.error, 500));
        return;
      }
      
      res.json(ApiResponse.success({
        path: result.path,
        relativePath: result.relativePath
      }));
    } catch (error) {
      logger.error(`Error saving file: ${error.message}`);
      res.status(500).json(ApiResponse.error(`Failed to save file: ${error.message}`, 500));
    }
  });
  
  // Get file content for Project Assistant
  app.get('/api/project-assistant/file', async (req, res) => {
    try {
      const { path: filePath } = req.query;
      
      if (!filePath) {
        res.status(400).json(ApiResponse.error('Path is required', 400));
        return;
      }
      
      if (!projectAssistantSession.id) {
        res.status(404).json(ApiResponse.error('No active session', 404));
        return;
      }
      
      const fullPath = path.isAbsolute(filePath) 
        ? filePath 
        : path.join(projectAssistantSession.projectDir, filePath);
      
      if (!fs.existsSync(fullPath)) {
        res.status(404).json(ApiResponse.error('File not found', 404));
        return;
      }
      
      const content = await fsp.readFile(fullPath, 'utf8');
      
      res.json(ApiResponse.success({
        path: fullPath,
        relativePath: path.relative(projectAssistantSession.projectDir, fullPath),
        content
      }));
    } catch (error) {
      logger.error(`Error reading file: ${error.message}`);
      res.status(500).json(ApiResponse.error(`Failed to read file: ${error.message}`, 500));
    }
  });
  
  /**
   * SCRIPT GENERATOR API ROUTES
   */
  
  // Initialize Script Generator
  app.post('/api/script-generator/init', (req, res) => {
    try {
      const state = initScriptGenerator();
      res.json(ApiResponse.success(state, 'Script Generator initialized'));
    } catch (error) {
      logger.error(`Error initializing Script Generator: ${error.message}`);
      res.status(500).json(ApiResponse.error(`Failed to initialize Script Generator: ${error.message}`, 500));
    }
  });
  
  // Get Script Generator state
  app.get('/api/script-generator/state', (req, res) => {
    if (!scriptGeneratorState.id) {
      initScriptGenerator();
    }
    
    res.json(ApiResponse.success(scriptGeneratorState));
  });
  
  // Start Script Generator
  app.post('/api/script-generator/start', (req, res) => {
    try {
      const result = startScriptGenerator();
      
      if (!result.success) {
        res.status(400).json(ApiResponse.error(result.error, 400));
        return;
      }
      
      res.json(ApiResponse.success(null, result.message));
    } catch (error) {
      logger.error(`Error starting Script Generator: ${error.message}`);
      res.status(500).json(ApiResponse.error(`Failed to start Script Generator: ${error.message}`, 500));
    }
  });
  
  // Stop Script Generator
  app.post('/api/script-generator/stop', (req, res) => {
    try {
      if (!scriptGeneratorState.id || !scriptGeneratorState.isRunning) {
        res.status(400).json(ApiResponse.error('Script Generator is not running', 400));
        return;
      }
      
      scriptGeneratorState.isRunning = false;
      scriptGeneratorState.isPaused = false;
      
      // Log event
      addScriptGeneratorLog('info', 'Script Generator stopped');
      
      // Broadcast state change
      broadcastToScriptGenerator(WsMessageType.GENERATOR_STATUS, scriptGeneratorState);
      
      // Save state
      saveScriptGeneratorState();
      
      res.json(ApiResponse.success(null, 'Script Generator stopped successfully'));
    } catch (error) {
      logger.error(`Error stopping Script Generator: ${error.message}`);
      res.status(500).json(ApiResponse.error(`Failed to stop Script Generator: ${error.message}`, 500));
    }
  });
  
  // Pause/Resume Script Generator
  app.post('/api/script-generator/pause', (req, res) => {
    try {
      if (!scriptGeneratorState.id || !scriptGeneratorState.isRunning) {
        res.status(400).json(ApiResponse.error('Script Generator is not running', 400));
        return;
      }
      
      scriptGeneratorState.isPaused = !scriptGeneratorState.isPaused;
      
      // Log event
      addScriptGeneratorLog('info', scriptGeneratorState.isPaused 
        ? 'Script Generator paused' 
        : 'Script Generator resumed'
      );
      
      // Broadcast state change
      broadcastToScriptGenerator(WsMessageType.GENERATOR_STATUS, scriptGeneratorState);
      
      // Save state
      saveScriptGeneratorState();
      
      res.json(ApiResponse.success({
        isPaused: scriptGeneratorState.isPaused
      }, scriptGeneratorState.isPaused 
        ? 'Script Generator paused successfully'
        : 'Script Generator resumed successfully'
      ));
    } catch (error) {
      logger.error(`Error toggling Script Generator pause state: ${error.message}`);
      res.status(500).json(ApiResponse.error(`Failed to toggle Script Generator pause state: ${error.message}`, 500));
    }
  });
  
  // Create manual job
  app.post('/api/script-generator/job', (req, res) => {
    try {
      const jobParams = req.body;
      
      if (!jobParams.keywords) {
        res.status(400).json(ApiResponse.error('Keywords are required', 400));
        return;
      }
      
      const result = createManualGeneratorJob(jobParams);
      
      if (!result.success) {
        res.status(400).json(ApiResponse.error(result.error, 400));
        return;
      }
      
      res.json(ApiResponse.success(result.job, 'Job created successfully'));
    } catch (error) {
      logger.error(`Error creating job: ${error.message}`);
      res.status(500).json(ApiResponse.error(`Failed to create job: ${error.message}`, 500));
    }
  });
  
  // Cancel job
  app.delete('/api/script-generator/job/:jobId', (req, res) => {
    try {
      const { jobId } = req.params;
      
      if (!scriptGeneratorState.id) {
        res.status(400).json(ApiResponse.error('Script Generator is not initialized', 400));
        return;
      }
      
      const jobIndex = scriptGeneratorState.jobs.findIndex(j => j.id === jobId);
      
      if (jobIndex === -1) {
        res.status(404).json(ApiResponse.error('Job not found', 404));
        return;
      }
      
      const job = scriptGeneratorState.jobs[jobIndex];
      job.status = 'canceled';
      job.endTime = Date.now();
      
      // Log event
      addScriptGeneratorLog('info', `Job canceled: ${job.name}`, { jobId });
      
      // Broadcast job update
      broadcastToScriptGenerator(WsMessageType.JOB_FAILED, job);
      
      // Remove job from list after a short delay
      setTimeout(() => {
        const currentJobIndex = scriptGeneratorState.jobs.findIndex(j => j.id === jobId);
        if (currentJobIndex !== -1) {
          scriptGeneratorState.jobs.splice(currentJobIndex, 1);
          
          // Save state
          saveScriptGeneratorState();
        }
      }, 5000);
      
      res.json(ApiResponse.success(null, 'Job canceled successfully'));
    } catch (error) {
      logger.error(`Error canceling job: ${error.message}`);
      res.status(500).json(ApiResponse.error(`Failed to cancel job: ${error.message}`, 500));
    }
  });
  
  // Get script
  app.get('/api/script-generator/script/:scriptId', (req, res) => {
    try {
      const { scriptId } = req.params;
      
      if (!scriptGeneratorState.id) {
        res.status(400).json(ApiResponse.error('Script Generator is not initialized', 400));
        return;
      }
      
      const script = scriptGeneratorState.scripts.find(s => s.id === scriptId);
      
      if (!script) {
        res.status(404).json(ApiResponse.error('Script not found', 404));
        return;
      }
      
      res.json(ApiResponse.success(script));
    } catch (error) {
      logger.error(`Error getting script: ${error.message}`);
      res.status(500).json(ApiResponse.error(`Failed to get script: ${error.message}`, 500));
    }
  });
  
  // Update script
  app.put('/api/script-generator/script/:scriptId', (req, res) => {
    try {
      const { scriptId } = req.params;
      const updates = req.body;
      
      if (!scriptGeneratorState.id) {
        res.status(400).json(ApiResponse.error('Script Generator is not initialized', 400));
        return;
      }
      
      const scriptIndex = scriptGeneratorState.scripts.findIndex(s => s.id === scriptId);
      
      if (scriptIndex === -1) {
        res.status(404).json(ApiResponse.error('Script not found', 404));
        return;
      }
      
      // Update the script properties
      const script = scriptGeneratorState.scripts[scriptIndex];
      
      // Only update allowed properties
      if (updates.title) script.title = updates.title;
      if (updates.description) script.description = updates.description;
      if (updates.category) script.category = updates.category;
      if (updates.keywords) script.keywords = updates.keywords;
      if (updates.code) script.code = updates.code;
      
      // Log event
      addScriptGeneratorLog('info', `Script updated: ${script.title}`, { scriptId });
      
      // Save state
      saveScriptGeneratorState();
      
      res.json(ApiResponse.success(script, 'Script updated successfully'));
    } catch (error) {
      logger.error(`Error updating script: ${error.message}`);
      res.status(500).json(ApiResponse.error(`Failed to update script: ${error.message}`, 500));
    }
  });
  
  // Delete script
  app.delete('/api/script-generator/script/:scriptId', (req, res) => {
    try {
      const { scriptId } = req.params;
      
      if (!scriptGeneratorState.id) {
        res.status(400).json(ApiResponse.error('Script Generator is not initialized', 400));
        return;
      }
      
      const scriptIndex = scriptGeneratorState.scripts.findIndex(s => s.id === scriptId);
      
      if (scriptIndex === -1) {
        res.status(404).json(ApiResponse.error('Script not found', 404));
        return;
      }
      
      // Remove the script
      const script = scriptGeneratorState.scripts.splice(scriptIndex, 1)[0];
      
      // Log event
      addScriptGeneratorLog('info', `Script deleted: ${script.title}`, { scriptId });
      
      // Save state
      saveScriptGeneratorState();
      
      res.json(ApiResponse.success(null, 'Script deleted successfully'));
    } catch (error) {
      logger.error(`Error deleting script: ${error.message}`);
      res.status(500).json(ApiResponse.error(`Failed to delete script: ${error.message}`, 500));
    }
  });
  
  // Add keyword
  app.post('/api/script-generator/keyword', (req, res) => {
    try {
      const { text, volume, growth } = req.body;
      
      if (!text) {
        res.status(400).json(ApiResponse.error('Keyword text is required', 400));
        return;
      }
      
      if (!scriptGeneratorState.id) {
        initScriptGenerator();
      }
      
      // Check if keyword already exists
      const existingKeyword = scriptGeneratorState.keywords.find(k => 
        k.text.toLowerCase() === text.toLowerCase()
      );
      
      if (existingKeyword) {
        res.status(400).json(ApiResponse.error('Keyword already exists', 400));
        return;
      }
      
      // Add keyword
      const keyword = {
        id: generateId(),
        text: text,
        volume: volume || Math.floor(Math.random() * 10000) + 1000,
        growth: growth || `+${Math.floor(Math.random() * 30) + 1}%`
      };
      
      scriptGeneratorState.keywords.push(keyword);
      
      // Log event
      addScriptGeneratorLog('info', `Keyword added: ${text}`);
      
      // Save state
      saveScriptGeneratorState();
      
      res.json(ApiResponse.success(keyword, 'Keyword added successfully'));
    } catch (error) {
      logger.error(`Error adding keyword: ${error.message}`);
      res.status(500).json(ApiResponse.error(`Failed to add keyword: ${error.message}`, 500));
    }
  });
  
  // Delete keyword
  app.delete('/api/script-generator/keyword/:keywordId', (req, res) => {
    try {
      const { keywordId } = req.params;
      
      if (!scriptGeneratorState.id) {
        res.status(400).json(ApiResponse.error('Script Generator is not initialized', 400));
        return;
      }
      
      const keywordIndex = scriptGeneratorState.keywords.findIndex(k => k.id === keywordId);
      
      if (keywordIndex === -1) {
        res.status(404).json(ApiResponse.error('Keyword not found', 404));
        return;
      }
      
      // Remove the keyword
      const keyword = scriptGeneratorState.keywords.splice(keywordIndex, 1)[0];
      
      // Log event
      addScriptGeneratorLog('info', `Keyword deleted: ${keyword.text}`, { keywordId });
      
      // Save state
      saveScriptGeneratorState();
      
      res.json(ApiResponse.success(null, 'Keyword deleted successfully'));
    } catch (error) {
      logger.error(`Error deleting keyword: ${error.message}`);
      res.status(500).json(ApiResponse.error(`Failed to delete keyword: ${error.message}`, 500));
    }
  });
  
  // Fetch trending keywords
  app.get('/api/script-generator/trending-keywords', async (req, res) => {
    try {
      if (!scriptGeneratorState.id) {
        initScriptGenerator();
      }
      
      // In a real implementation, this would fetch from a third-party API
      // Here we'll generate some fake trending keywords
      
      const trendingKeywords = [
        { text: 'windows security updates automation', volume: 22500, growth: '+18%' },
        { text: 'linux server performance optimization', volume: 15800, growth: '+22%' },
        { text: 'mac system cleanup scripts', volume: 12300, growth: '+10%' },
        { text: 'network firewall configuration automation', volume: 19700, growth: '+25%' },
        { text: 'security audit automation tools', volume: 18200, growth: '+30%' },
        { text: 'cross-platform deployment scripts', volume: 14500, growth: '+15%' },
        { text: 'database backup automation', volume: 17800, growth: '+12%' },
        { text: 'cloud resource management scripts', volume: 21000, growth: '+28%' }
      ];
      
      res.json(ApiResponse.success(trendingKeywords));
    } catch (error) {
      logger.error(`Error fetching trending keywords: ${error.message}`);
      res.status(500).json(ApiResponse.error(`Failed to fetch trending keywords: ${error.message}`, 500));
    }
  });
  
  // Update category
  app.put('/api/script-generator/category/:categoryId', (req, res) => {
    try {
      const { categoryId } = req.params;
      const { enabled } = req.body;
      
      if (!scriptGeneratorState.id) {
        initScriptGenerator();
      }
      
      const categoryIndex = scriptGeneratorState.categories.findIndex(c => c.id === categoryId);
      
      if (categoryIndex === -1) {
        res.status(404).json(ApiResponse.error('Category not found', 404));
        return;
      }
      
      if (enabled !== undefined) {
        scriptGeneratorState.categories[categoryIndex].enabled = enabled;
      }
      
      // Log event
      const category = scriptGeneratorState.categories[categoryIndex];
      addScriptGeneratorLog('info', `Category ${category.name} ${enabled ? 'enabled' : 'disabled'}`);
      
      // Save state
      saveScriptGeneratorState();
      
      res.json(ApiResponse.success(category, `Category ${enabled ? 'enabled' : 'disabled'}`));
    } catch (error) {
      logger.error(`Error updating category: ${error.message}`);
      res.status(500).json(ApiResponse.error(`Failed to update category: ${error.message}`, 500));
    }
  });
  
  // Add category
  app.post('/api/script-generator/category', (req, res) => {
    try {
      const { name, description } = req.body;
      
      if (!name) {
        res.status(400).json(ApiResponse.error('Category name is required', 400));
        return;
      }
      
      if (!scriptGeneratorState.id) {
        initScriptGenerator();
      }
      
      const id = name.toLowerCase().replace(/\s+/g, '-');
      
      // Check if category already exists
      const existingCategory = scriptGeneratorState.categories.find(c => c.id === id);
      
      if (existingCategory) {
        res.status(400).json(ApiResponse.error('Category already exists', 400));
        return;
      }
      
      // Add category
      const category = {
        id,
        name,
        description: description || '',
        count: 0,
        enabled: true
      };
      
      scriptGeneratorState.categories.push(category);
      
      // Log event
      addScriptGeneratorLog('info', `Category added: ${name}`);
      
      // Save state
      saveScriptGeneratorState();
      
      res.json(ApiResponse.success(category, 'Category added successfully'));
    } catch (error) {
      logger.error(`Error adding category: ${error.message}`);
      res.status(500).json(ApiResponse.error(`Failed to add category: ${error.message}`, 500));
    }
  });
  
  // Update generator settings
  app.put('/api/script-generator/settings', (req, res) => {
    try {
      const updates = req.body;
      
      if (!scriptGeneratorState.id) {
        initScriptGenerator();
      }
      
      // Update settings
      Object.assign(scriptGeneratorState.settings, updates);
      
      // Log event
      addScriptGeneratorLog('info', 'Settings updated');
      
      // Save state
      saveScriptGeneratorState();
      
      res.json(ApiResponse.success(scriptGeneratorState.settings, 'Settings updated successfully'));
    } catch (error) {
      logger.error(`Error updating settings: ${error.message}`);
      res.status(500).json(ApiResponse.error(`Failed to update settings: ${error.message}`, 500));
    }
  });
  
  // Default route handlers for SPAs
  app.get('/project-assistant*', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'project-assistant', 'index.html'));
  });
  
  app.get('/script-generator*', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'script-generator', 'index.html'));
  });
  
  // Root route redirects to the selection page
  app.get('/', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
  });
  
  // 404 Error handler
  app.use((req, res, next) => {
    res.status(404).json(ApiResponse.error('Not found', 404));
  });
  
  // General error handler
  app.use((err, req, res, next) => {
    logger.error(`Unhandled error: ${err.message}`);
    logger.error(err.stack);
    
    res.status(500).json(ApiResponse.error('Internal server error', 500, {
      message: err.message
    }));
  });
  
  return server;
}

/**
 * Start the server
 */
function startServer() {
  const server = createServer();
  const port = config.server.port || 4000;
  const hostname = config.server.hostname || 'localhost';
  
  server.listen(port, hostname, () => {
    logger.info(`Server running at http://${hostname}:${port}`);
    
    // Initialize state
    if (!projectAssistantSession.id) {
      logger.info('No active Project Assistant session');
    }
    
    if (!scriptGeneratorState.id) {
      initScriptGenerator();
    }
    
    // Auto-open browser if configured
    if (config.server.autoLaunchBrowser) {
      setTimeout(() => {
        open(`http://${hostname}:${port}`);
      }, 1000);
    }
  });
  
  // Handle server errors
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      logger.error(`Port ${port} is already in use. Please choose a different port.`);
      process.exit(1);
    } else {
      logger.error(`Server error: ${error.message}`);
    }
  });
  
  return server;
}

/**
 * Display application banner
 */
function displayBanner() {
  const banner = `
╔══════════════════════════════════════════════════════════════════╗
║                   UNIFIED SERVER - v3.0.0                         ║
║  Integrated Server for Project Assistant Pro & Script Generator   ║
║                                                                  ║
║  Copyright © 2025                                                ║
╚══════════════════════════════════════════════════════════════════╝
  `;
  
  console.log(`${colors.cyan}${banner}${colors.reset}`);
  console.log(`${colors.gray}Started: ${new Date().toLocaleString()}${colors.reset}\n`);
}

/**
 * Interactive CLI
 */
async function startCLI() {
  // If CLI is disabled, just start the server
  if (!config.server.enableCLI) {
    startServer();
    return;
  }
  
  displayBanner();
  
  // Start server
  const server = startServer();
  
  // Check for OpenAI API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    logger.warn('OPENAI_API_KEY environment variable not set. AI features will not work properly.');
    console.log(`${colors.yellow}Warning: OPENAI_API_KEY environment variable not set.${colors.reset}`);
    console.log(`To use AI features, set your OpenAI API key: export OPENAI_API_KEY=your_key_here\n`);
  }
  
  console.log(`${colors.gray}Type "help" for available commands.${colors.reset}`);
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${colors.cyan}server>${colors.reset} `
  });
  
  rl.prompt();
  
  rl.on('line', async (line) => {
    const input = line.trim();
    const [command, ...args] = input.split(' ');
    
    try {
      switch (command.toLowerCase()) {
        case 'help':
          console.log(`\n${colors.cyan}${colors.bold}Available Commands:${colors.reset}`);
          console.log(`${colors.gray}${'─'.repeat(50)}${colors.reset}`);
          console.log(`${colors.green}status${colors.reset}    - Display server status`);
          console.log(`${colors.blue}start${colors.reset}      - Start a Project Assistant session`);
          console.log(`${colors.yellow}task${colors.reset}      - Execute a Project Assistant task`);
          console.log(`${colors.green}scripts${colors.reset}   - Start Script Generator`);
          console.log(`${colors.blue}job${colors.reset}        - Create a Script Generator job`);
          console.log(`${colors.magenta}config${colors.reset}    - Display or update configuration`);
          console.log(`${colors.yellow}logs${colors.reset}      - Display recent logs`);
          console.log(`${colors.red}quit${colors.reset}       - Exit the application`);
          break;
          
        case 'status':
          console.log(`\n${colors.cyan}${colors.bold}Server Status:${colors.reset}`);
          console.log(`${colors.gray}${'─'.repeat(50)}${colors.reset}`);
          console.log(`${colors.white}Server:${colors.reset} Running on http://${config.server.hostname}:${config.server.port}`);
          console.log(`${colors.white}Project Assistant:${colors.reset} ${projectAssistantSession.id ? 'Active' : 'Inactive'}`);
          if (projectAssistantSession.id) {
            console.log(`  ${colors.white}Session ID:${colors.reset} ${projectAssistantSession.id}`);
            console.log(`  ${colors.white}Project:${colors.reset} ${projectAssistantSession.projectDir}`);
            console.log(`  ${colors.white}Framework:${colors.reset} ${projectAssistantSession.projectInfo?.framework || 'Unknown'}`);
            console.log(`  ${colors.white}Tasks:${colors.reset} ${projectAssistantSession.tasks.length}`);
          }
          console.log(`${colors.white}Script Generator:${colors.reset} ${scriptGeneratorState.id ? 'Active' : 'Inactive'}`);
          if (scriptGeneratorState.id) {
            console.log(`  ${colors.white}Status:${colors.reset} ${scriptGeneratorState.isRunning ? (scriptGeneratorState.isPaused ? 'Paused' : 'Running') : 'Stopped'}`);
            console.log(`  ${colors.white}Scripts:${colors.reset} ${scriptGeneratorState.scripts.length}`);
            console.log(`  ${colors.white}Active Jobs:${colors.reset} ${scriptGeneratorState.jobs.filter(j => ['pending', 'running'].includes(j.status)).length}`);
          }
          console.log(`${colors.white}Connected Clients:${colors.reset} ${connectedClients.size}`);
          break;
          
        case 'start':
          const projectDir = args.join(' ') || process.cwd();
          const result = await startProjectAssistantSession(projectDir);
          if (result.success) {
            console.log(`${colors.green}Project Assistant session started successfully.${colors.reset}`);
            console.log(`Session ID: ${projectAssistantSession.id}`);
            console.log(`Project Directory: ${projectAssistantSession.projectDir}`);
          } else {
            console.log(`${colors.red}Failed to start session: ${result.error}${colors.reset}`);
          }
          break;
          
        case 'task':
          if (!projectAssistantSession.id) {
            console.log(`${colors.yellow}No active Project Assistant session. Start a session first.${colors.reset}`);
            break;
          }
          
          const taskDescription = args.join(' ');
          if (!taskDescription) {
            console.log(`${colors.yellow}Please provide a task description.${colors.reset}`);
            break;
          }
          
          console.log(`${colors.green}Executing task: ${taskDescription}${colors.reset}`);
          executeProjectAssistantTask(taskDescription);
          break;
          
        case 'scripts':
          if (!scriptGeneratorState.id) {
            initScriptGenerator();
          }
          
          if (scriptGeneratorState.isRunning) {
            scriptGeneratorState.isRunning = false;
            console.log(`${colors.yellow}Script Generator stopped.${colors.reset}`);
          } else {
            const result = startScriptGenerator();
            if (result.success) {
              console.log(`${colors.green}Script Generator started successfully.${colors.reset}`);
            } else {
              console.log(`${colors.red}Failed to start Script Generator: ${result.error}${colors.reset}`);
            }
          }
          break;
          
        case 'job':
          if (!scriptGeneratorState.id) {
            initScriptGenerator();
          }
          
          if (args.length === 0) {
            console.log(`${colors.yellow}Please provide keywords for the job.${colors.reset}`);
            break;
          }
          
          const jobResult = createManualGeneratorJob({
            name: 'CLI Job',
            keywords: args.join(' '),
            generateBash: true,
            generatePowershell: true,
            scriptCount: 3
          });
          
          if (jobResult.success) {
            console.log(`${colors.green}Job created successfully. ID: ${jobResult.job.id}${colors.reset}`);
          } else {
            console.log(`${colors.red}Failed to create job: ${jobResult.error}${colors.reset}`);
          }
          break;
          
        case 'config':
          if (args.length === 0) {
            console.log(`\n${colors.cyan}${colors.bold}Current Configuration:${colors.reset}`);
            console.log(JSON.stringify(config, null, 2));
          } else {
            console.log(`${colors.yellow}Configuration editing via CLI not implemented yet.${colors.reset}`);
          }
          break;
          
        case 'logs':
          const count = parseInt(args[0]) || 10;
          console.log(`\n${colors.cyan}${colors.bold}Recent Logs:${colors.reset}`);
          
          const projectLogs = projectAssistantSession.logs.slice(-count);
          const scriptLogs = scriptGeneratorState.logs.slice(-count);
          
          if (projectLogs.length > 0) {
            console.log(`\n${colors.green}Project Assistant Logs:${colors.reset}`);
            for (const log of projectLogs) {
              const time = new Date(log.timestamp).toLocaleTimeString();
              const color = log.level === 'error' ? colors.red : (log.level === 'warning' ? colors.yellow : colors.white);
              console.log(`${colors.gray}[${time}]${colors.reset} ${color}${log.message}${colors.reset}`);
            }
          }
          
          if (scriptLogs.length > 0) {
            console.log(`\n${colors.green}Script Generator Logs:${colors.reset}`);
            for (const log of scriptLogs) {
              const time = new Date(log.timestamp).toLocaleTimeString();
              const color = log.level === 'error' ? colors.red : (log.level === 'warning' ? colors.yellow : colors.white);
              console.log(`${colors.gray}[${time}]${colors.reset} ${color}${log.message}${colors.reset}`);
            }
          }
          break;
          
        case 'quit':
        case 'exit':
          console.log(`${colors.green}Exiting server. Goodbye!${colors.reset}`);
          rl.close();
          server.close();
          process.exit(0);
          break;
          
        default:
          if (input) {
            console.log(`${colors.yellow}Unknown command: ${command}. Type "help" for available commands.${colors.reset}`);
          }
      }
    } catch (error) {
      console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    }
    
    rl.prompt();
  });
  
  // Handle SIGINT (Ctrl+C)
  rl.on('SIGINT', () => {
    console.log(`\n${colors.green}Exiting server. Goodbye!${colors.reset}`);
    rl.close();
    server.close();
    process.exit(0);
  });
}

// Export the main functions
module.exports = {
  startServer,
  startCLI,
  config
};

// Run if called directly
if (require.main === module) {
  startCLI();
}