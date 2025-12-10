/**
 * Simple test server to verify terminal UI works
 * Bypasses Safe SDK dependencies for now
 */

const express = require('express');
const path = require('path');
const { BraveSearchAPI } = require('../brave/brave-search-api');
const config = require('../../config/production');

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize Brave Search API
const braveSearch = config.apiKeys.brave 
  ? new BraveSearchAPI({ apiKey: config.apiKeys.brave })
  : null;

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mock API endpoints
app.get('/api/wallet/balance/:address', (req, res) => {
  res.json({
    success: true,
    address: req.params.address,
    balance: '1.234',
    balanceWei: '1234000000000000000'
  });
});

app.get('/api/safe/status/:address', (req, res) => {
  res.json({
    success: true,
    address: req.params.address,
    owners: [
      '0x3df07977140Ad97465075129C37Aec7237d74415',
      '0x3BBa654A3816A228284E3e0401Cff4EA6dFc5cea'
    ],
    threshold: 2,
    balance: '1.234',
    version: '1.3.0',
    nonce: 5
  });
});

app.get('/api/treasury/status', (req, res) => {
  res.json({
    success: true,
    address: '0xb4C173AaFe428845f0b96610cf53576121BAB221',
    balance: '1.234',
    threshold: 2,
    owners: [
      '0x3df07977140Ad97465075129C37Aec7237d74415',
      '0x3BBa654A3816A228284E3e0401Cff4EA6dFc5cea'
    ],
    network: 'Arbitrum One'
  });
});

app.post('/api/wallet/connect', (req, res) => {
  res.json({
    success: true,
    walletId: `wallet-${Date.now()}`,
    address: req.body.address || '0x0000000000000000000000000000000000000000'
  });
});

// Brave Search API endpoints
app.post('/api/brave/search', async (req, res) => {
  if (!braveSearch) {
    return res.status(503).json({
      success: false,
      error: 'Brave Search API not configured. Set BRAVE_API_KEY environment variable.'
    });
  }

  try {
    const { query, type = 'web', count = 10, options = {} } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query required' });
    }

    let result;
    switch (type) {
      case 'web':
        result = await braveSearch.webSearch(query, { count, ...options });
        break;
      case 'image':
        result = await braveSearch.imageSearch(query, { count, ...options });
        break;
      case 'video':
        result = await braveSearch.videoSearch(query, { count, ...options });
        break;
      case 'news':
        result = await braveSearch.newsSearch(query, { count, ...options });
        break;
      default:
        result = await braveSearch.webSearch(query, { count, ...options });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/brave/suggestions/:query', async (req, res) => {
  if (!braveSearch) {
    return res.status(503).json({
      success: false,
      error: 'Brave Search API not configured'
    });
  }

  try {
    const { query } = req.params;
    const result = await braveSearch.getSuggestions(query);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GCloud shell execution
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

app.post('/api/gcloud/execute', async (req, res) => {
  try {
    const { command } = req.body;
    
    if (!command) {
      return res.status(400).json({ error: 'Command required' });
    }

    // Execute gcloud command
    const fullCommand = `gcloud ${command}`;
    const { stdout, stderr } = await execAsync(fullCommand, {
      env: { ...process.env, GOOGLE_CLOUD_PROJECT: process.env.GOOGLE_CLOUD_PROJECT },
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });

    res.json({
      success: true,
      command: fullCommand,
      stdout: stdout,
      stderr: stderr,
      exitCode: 0
    });
  } catch (error) {
    res.json({
      success: false,
      command: `gcloud ${req.body.command}`,
      error: error.message,
      stdout: error.stdout || '',
      stderr: error.stderr || '',
      exitCode: error.code || 1
    });
  }
});

app.get('/api/gcloud/status', async (req, res) => {
  try {
    // Check if gcloud is installed
    const { stdout } = await execAsync('which gcloud');
    const installed = stdout.trim().length > 0;

    if (!installed) {
      return res.json({
        success: false,
        installed: false,
        error: 'gcloud not found in PATH'
      });
    }

    // Get gcloud version
    const versionResult = await execAsync('gcloud --version').catch(() => ({ stdout: '' }));
    
    // Check authentication
    const authResult = await execAsync('gcloud auth list --filter=status:ACTIVE --format="value(account)"').catch(() => ({ stdout: '' }));
    const authenticated = authResult.stdout.trim().length > 0;

    // Get current project
    const projectResult = await execAsync('gcloud config get-value project').catch(() => ({ stdout: '' }));
    const project = projectResult.stdout.trim() || null;

    res.json({
      success: true,
      installed: true,
      version: versionResult.stdout.split('\n')[0] || 'unknown',
      authenticated: authenticated,
      account: authenticated ? authResult.stdout.trim() : null,
      project: project
    });
  } catch (error) {
    res.json({
      success: false,
      installed: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Web Terminal Test Server running on http://localhost:${PORT}`);
  console.log(`📱 Terminal UI available at: http://localhost:${PORT}`);
  console.log(`\nOpen in browser: http://localhost:${PORT}`);
});
