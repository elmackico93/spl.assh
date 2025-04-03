/**
 * PROJECT ASSISTANT PRO - API ROUTES
 * Handles API routes for the web interface
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs-extra');
const appCore = require('./app');

// Get server status
router.get('/status', (req, res) => {
  res.json({
    version: '3.0.0',
    uptime: process.uptime(),
    hasSession: !!appCore.getCurrentSession().id,
    sessionId: appCore.getCurrentSession().id
  });
});

// Get session info
router.get('/session', (req, res) => {
  const currentSession = appCore.getCurrentSession();
  
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
router.post('/session/start', async (req, res) => {
  try {
    const { projectDir } = req.body;
    
    if (!projectDir) {
      res.status(400).json({ error: 'Project directory is required' });
      return;
    }
    
    await appCore.startSession(projectDir, (result) => {
      if (result.success) {
        res.json({
          success: true,
          session: {
            id: result.sessionId,
            projectDir,
            projectInfo: result.projectInfo
          }
        });
      } else {
        res.status(400).json({ error: result.error });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Load a session
router.post('/session/load', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      res.status(400).json({ error: 'Session ID is required' });
      return;
    }
    
    const result = await appCore.loadSession(sessionId);
    
    if (result) {
      res.json({
        success: true,
        session: appCore.getCurrentSession()
      });
    } else {
      res.status(404).json({ error: 'Session not found or could not be loaded' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get list of available sessions
router.get('/sessions', async (req, res) => {
  try {
    const SESSIONS_DIR = path.join(require('os').homedir(), '.project-assistant', 'sessions');
    const files = await fs.readdir(SESSIONS_DIR);
    const sessions = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        try {
          const content = await fs.readFile(path.join(SESSIONS_DIR, file), 'utf8');
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
router.post('/task', async (req, res) => {
  try {
    const { description, type } = req.body;
    
    if (!description) {
      res.status(400).json({ error: 'Task description is required' });
      return;
    }
    
    // Start the task asynchronously
    appCore.executeTask(description, type, (result) => {
      // The WebSocket will handle real-time updates
    });
    
    res.json({ success: true, message: 'Task started' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save a file
router.post('/file/save', async (req, res) => {
  try {
    const { path: filePath, content } = req.body;
    
    if (!filePath || content === undefined) {
      res.status(400).json({ error: 'Path and content are required' });
      return;
    }
    
    await appCore.saveFile(filePath, content, (result) => {
      if (result.success) {
        res.json({ success: true, path: result.path });
      } else {
        res.status(400).json({ error: result.error });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get file content
router.get('/file', async (req, res) => {
  try {
    const { path: filePath } = req.query;
    const currentSession = appCore.getCurrentSession();
    
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
    
    const content = await fs.readFile(fullPath, 'utf8');
    
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
router.post('/export', async (req, res) => {
  try {
    await appCore.exportModifiedFiles((result) => {
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json({ error: result.error });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Handle rollback
router.post('/rollback', async (req, res) => {
  try {
    const { backupId } = req.body;
    
    if (!backupId) {
      res.status(400).json({ error: 'Backup ID is required' });
      return;
    }
    
    await appCore.handleRollback(backupId, (result) => {
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json({ error: result.error });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get backups
router.get('/backups', (req, res) => {
  const currentSession = appCore.getCurrentSession();
  
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

module.exports = router;