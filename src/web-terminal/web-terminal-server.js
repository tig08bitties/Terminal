/**
 * Web Terminal Server with Safe{wallet} SDK Integration
 * Express server providing terminal emulator with cryptocurrency wallet functionality
 */

const express = require('express');
const { ethers } = require('ethers');
const { SafeClient } = require('../safe/safe-client');
const { TreasuryOfLight } = require('../safe/treasury-of-light');
const { BraveSearchAPI } = require('../brave/brave-search-api');
const path = require('path');

class WebTerminalServer {
  constructor(opts = {}) {
    this.app = express();
    this.port = opts.port || 3000;
    this.provider = opts.provider || new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');
    this.signer = opts.signer || null;
    this.network = opts.network || 'arbitrum';
    
    // Initialize Safe clients
    this.safeClient = null;
    this.treasury = null;
    
    // Initialize Brave Search
    this.braveSearch = opts.braveApiKey 
      ? new BraveSearchAPI({ apiKey: opts.braveApiKey })
      : (process.env.BRAVE_API_KEY ? new BraveSearchAPI({ apiKey: process.env.BRAVE_API_KEY }) : null);
    
    // Connected wallets
    this.connectedWallets = new Map();
    
    // Setup middleware
    this.setupMiddleware();
    
    // Setup routes
    this.setupRoutes();
  }

  setupMiddleware() {
    // CORS headers
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
    // Serve main terminal page
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // API: Connect wallet
    this.app.post('/api/wallet/connect', async (req, res) => {
      try {
        const { provider, address } = req.body;
        
        if (!provider || !address) {
          return res.status(400).json({ error: 'Provider and address required' });
        }

        // Store connected wallet
        const walletId = `wallet-${Date.now()}`;
        this.connectedWallets.set(walletId, {
          address,
          provider,
          connectedAt: new Date().toISOString()
        });

        res.json({
          success: true,
          walletId,
          address
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // API: Get balance
    this.app.get('/api/wallet/balance/:address', async (req, res) => {
      try {
        const { address } = req.params;
        const balance = await this.provider.getBalance(address);
        const ethBalance = ethers.formatEther(balance);
        
        res.json({
          success: true,
          address,
          balance: ethBalance,
          balanceWei: balance.toString()
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // API: Get Safe status
    this.app.get('/api/safe/status/:address', async (req, res) => {
      try {
        const { address } = req.params;
        
        if (!this.safeClient) {
          this.safeClient = new SafeClient(this.provider, this.signer, this.network);
        }

        const safeInfo = await this.safeClient.getSafeInfo(address);

        res.json({
          success: true,
          ...safeInfo
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // API: Get Treasury of Light status
    this.app.get('/api/treasury/status', async (req, res) => {
      try {
        if (!this.treasury) {
          this.treasury = new TreasuryOfLight(this.provider, this.signer);
        }

        const status = await this.treasury.getStatus();
        res.json({
          success: true,
          ...status
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // API: Get transaction history
    this.app.get('/api/wallet/transactions/:address', async (req, res) => {
      try {
        const { address } = req.params;
        const { limit = 10 } = req.query;

        // Get recent transactions from block explorer or provider
        const blockNumber = await this.provider.getBlockNumber();
        const transactions = [];

        // Simple implementation - get recent blocks and filter
        for (let i = 0; i < Math.min(limit, 10); i++) {
          try {
            const block = await this.provider.getBlock(blockNumber - i, true);
            if (block && block.transactions) {
              for (const tx of block.transactions) {
                if (tx.from && tx.from.toLowerCase() === address.toLowerCase() ||
                    tx.to && tx.to.toLowerCase() === address.toLowerCase()) {
                  transactions.push({
                    hash: tx.hash,
                    from: tx.from,
                    to: tx.to,
                    value: ethers.formatEther(tx.value || 0),
                    blockNumber: tx.blockNumber,
                    timestamp: block.timestamp
                  });
                }
              }
            }
          } catch (e) {
            // Skip block if error
          }
        }

        res.json({
          success: true,
          address,
          transactions: transactions.slice(0, limit)
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // API: Create Safe transaction
    this.app.post('/api/safe/transaction', async (req, res) => {
      try {
        const { safeAddress, to, value, data } = req.body;

        if (!this.safeClient) {
          this.safeClient = new SafeClient(this.provider, this.signer, this.network);
        }

        const safe = await this.safeClient.getSafe(safeAddress);
        const safeTransaction = await safe.createTransaction({
          safeTransactionData: {
            to,
            value: value || '0',
            data: data || '0x'
          }
        });

        res.json({
          success: true,
          safeTxHash: await safe.getTransactionHash(safeTransaction),
          transaction: safeTransaction
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // API: Execute command (terminal commands)
    this.app.post('/api/terminal/command', async (req, res) => {
      try {
        const { command, args } = req.body;
        const result = await this.executeCommand(command, args || {});
        res.json({ success: true, result });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // API: Brave Search
    this.app.post('/api/brave/search', async (req, res) => {
      if (!this.braveSearch) {
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
            result = await this.braveSearch.webSearch(query, { count, ...options });
            break;
          case 'image':
            result = await this.braveSearch.imageSearch(query, { count, ...options });
            break;
          case 'video':
            result = await this.braveSearch.videoSearch(query, { count, ...options });
            break;
          case 'news':
            result = await this.braveSearch.newsSearch(query, { count, ...options });
            break;
          default:
            result = await this.braveSearch.webSearch(query, { count, ...options });
        }

        res.json(result);
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // API: Brave Search Suggestions
    this.app.get('/api/brave/suggestions/:query', async (req, res) => {
      if (!this.braveSearch) {
        return res.status(503).json({
          success: false,
          error: 'Brave Search API not configured'
        });
      }

      try {
        const { query } = req.params;
        const result = await this.braveSearch.getSuggestions(query);
        res.json(result);
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });
  }

  async executeCommand(command, args) {
    switch (command) {
      case 'balance':
        if (!args.address) {
          throw new Error('Address required');
        }
        const balance = await this.provider.getBalance(args.address);
        return {
          command: 'balance',
          address: args.address,
          balance: ethers.formatEther(balance),
          balanceWei: balance.toString()
        };

      case 'safe-status':
        if (!args.address) {
          throw new Error('Safe address required');
        }
        if (!this.safeClient) {
          this.safeClient = new SafeClient(this.provider, this.signer, this.network);
        }
        const safeInfo = await this.safeClient.getSafeInfo(args.address);
        return {
          command: 'safe-status',
          ...safeInfo
        };

      case 'treasury-status':
        if (!this.treasury) {
          this.treasury = new TreasuryOfLight(this.provider, this.signer);
        }
        const status = await this.treasury.getStatus();
        return {
          command: 'treasury-status',
          ...status
        };

      case 'help':
        return {
          command: 'help',
          commands: [
            'balance <address> - Get wallet balance',
            'safe-status <address> - Get Safe wallet status',
            'treasury-status - Get Treasury of Light status',
            'connect - Connect wallet (MetaMask/WalletConnect)',
            'help - Show this help message'
          ]
        };

      default:
        throw new Error(`Unknown command: ${command}`);
    }
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 Web Terminal Server running on http://localhost:${this.port}`);
      console.log(`📱 Safe{wallet} SDK integrated`);
      console.log(`🔗 Network: ${this.network}`);
    });
  }
}

module.exports = { WebTerminalServer };
