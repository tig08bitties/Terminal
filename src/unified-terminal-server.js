/**
 * Unified Terminal Server
 * Web server for the unified terminal system
 * Integrates: Covenant + Safe{wallet} + MetaMask + TONKEEPER + OPENNETWORK
 * Navigation: tn5250 + SUSE + gcloud shell
 */

const express = require('express');
const { UnifiedTerminalSystem } = require('./unified-terminal-system');
const path = require('path');
const config = require('../../config/production');
const { ethers } = require('ethers');

class UnifiedTerminalServer {
  constructor(opts = {}) {
    this.app = express();
    this.port = opts.port || 8080;
    
    // Initialize unified system
    this.system = new UnifiedTerminalSystem({
      provider: opts.provider || new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc'),
      network: opts.network || 'arbitrum',
      gcloudProject: config.chariotAgent?.gcloudProject,
      braveApiKey: config.apiKeys.brave,
      tonApiKey: process.env.TON_API_KEY,
      tonMnemonic: process.env.TON_MNEMONIC
    });
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      next();
    });
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  setupRoutes() {
    // Serve main interface
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // System initialization
    this.app.post('/api/system/initialize', async (req, res) => {
      try {
        const result = await this.system.initialize();
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // System status
    this.app.get('/api/system/status', (req, res) => {
      res.json(this.system.getStatus());
    });

    // Terminal navigation
    this.app.post('/api/terminal/navigate', async (req, res) => {
      try {
        const { command, options = {} } = req.body;
        const result = await this.system.navigateTerminal(command, options);
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Wallet operations
    this.app.post('/api/wallet/operation', async (req, res) => {
      try {
        const { operation, options = {} } = req.body;
        const result = await this.system.executeWalletOperation(operation, options);
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Connect wallet
    this.app.post('/api/wallet/connect', async (req, res) => {
      try {
        const { walletType = 'safe' } = req.body;
        const result = await this.system.connectWallet(walletType);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Research
    this.app.post('/api/research', async (req, res) => {
      try {
        const { topic } = req.body;
        const result = await this.system.researchTopic(topic);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Treasury operations (Safe{wallet} primary)
    this.app.get('/api/treasury/status', async (req, res) => {
      try {
        const status = await this.system.treasury.getStatus();
        res.json({ success: true, ...status });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  setupEventHandlers() {
    this.system.on('initialized', (data) => {
      console.log('✅ Unified Terminal System initialized:', data);
    });

    this.system.on('chariot-initialized', (status) => {
      console.log('✅ Chariot Agent ready:', status);
    });

    this.system.on('wallet-initialized', (data) => {
      console.log(`✅ Wallet initialized: ${data.type}`, data.primary ? '(Primary)' : '');
    });

    this.system.on('balance-update', (data) => {
      console.log(`💰 Balance update: ${data.address} = ${data.balance} ETH`);
    });

    this.system.on('research-complete', (data) => {
      console.log(`📚 Research complete: ${data.topic}`);
      console.log(`   Insights: ${JSON.stringify(data.insights)}`);
    });
  }

  async start() {
    // Initialize system
    await this.system.initialize();
    
    // Start server
    this.app.listen(this.port, () => {
      console.log(`🚀 Unified Terminal Server running on http://localhost:${this.port}`);
      console.log(`📱 System Components:`);
      console.log(`   - Covenant & Safe{wallet} (Primary)`);
      console.log(`   - MetaMask SDK`);
      console.log(`   - TONKEEPER`);
      console.log(`   - OPENNETWORK`);
      console.log(`   - Terminal Navigation (tn5250 + SUSE + gcloud)`);
      console.log(`   - Background Processing`);
    });
  }
}

module.exports = { UnifiedTerminalServer };
