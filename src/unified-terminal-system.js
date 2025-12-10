/**
 * θεός | The_0S Unified Terminal System
 * Merges Covenant + Safe{wallet} + MetaMask SDK + TONKEEPER + OPENNETWORK
 * Navigates via tn5250 + SUSE through gcloud shell terminal (via Chariot Agent)
 * Background processing with GUI navigation
 */

const { EventEmitter } = require('events');
const { ChariotAgent } = require('../chariot-agent/chariot-agent');
const { SafeClient } = require('../safe/safe-client');
const { TreasuryOfLight } = require('../safe/treasury-of-light');
const { BraveSearchAPI } = require('../brave/brave-search-api');
const { TONIntegration } = require('../ton/ton-integration');
const { ethers } = require('ethers');

class UnifiedTerminalSystem extends EventEmitter {
  constructor(opts = {}) {
    super();
    
    // Branding
    this.brand = 'θεός | The_0S';
    
    // Core components
    this.provider = opts.provider || new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');
    this.signer = opts.signer || null;
    this.network = opts.network || 'arbitrum';
    
    // Covenant & Safe{wallet} (Primary)
    this.safeClient = null;
    this.treasury = null;
    this.covenantAddresses = opts.covenantAddresses || {
      treasury: '0xb4C173AaFe428845f0b96610cf53576121BAB221',
      safe: '0x3B34c30f51FE6E276530aaCb8F4d877E9893356F'
    };
    
    // Wallet integrations (Merged)
    this.wallets = {
      metamask: null,
      tonkeeper: null,
      openNetwork: null,
      safe: null
    };
    
    // TON Integration (for TONKEEPER)
    this.tonIntegration = opts.tonApiKey 
      ? new TONIntegration({ apiKey: opts.tonApiKey })
      : null;
    
    // Terminal navigation (tn5250 + SUSE + gcloud)
    this.chariotAgent = new ChariotAgent({
      gcloudProject: opts.gcloudProject || process.env.GOOGLE_CLOUD_PROJECT,
      tn5250Config: {
        host: opts.tn5250Host || 'pub400.com',
        user: opts.tn5250User || 'THEOS',
        password: opts.tn5250Password || 'winter25'
      }
    });
    
    // Background processing
    this.backgroundTasks = new Map();
    this.isRunning = false;
    
    // Research & Learning
    this.braveSearch = opts.braveApiKey 
      ? new BraveSearchAPI({ apiKey: opts.braveApiKey })
      : null;
    this.researchCache = new Map();
  }

  /**
   * Initialize the unified system
   */
  async initialize() {
    this.emit('initializing');
    
    // Initialize Chariot Agent (tn5250 + SUSE + gcloud)
    await this.chariotAgent.initialize();
    this.emit('chariot-initialized', this.chariotAgent.getStatus());
    
    // Initialize Safe{wallet} (Primary)
    this.safeClient = new SafeClient(this.provider, this.signer, this.network);
    this.treasury = new TreasuryOfLight(this.provider, this.signer);
    this.emit('safe-initialized');
    
    // Initialize wallet integrations
    await this.initializeWallets();
    
    // Start background processing
    this.startBackgroundProcessing();
    
    this.isRunning = true;
    this.emit('initialized', {
      chariot: this.chariotAgent.getStatus(),
      safe: true,
      wallets: Object.keys(this.wallets).filter(k => this.wallets[k] !== null)
    });
    
    return {
      success: true,
      system: 'unified-terminal',
      components: {
        chariot: this.chariotAgent.getStatus(),
        safe: true,
        wallets: Object.keys(this.wallets).filter(k => this.wallets[k] !== null)
      }
    };
  }

  /**
   * Initialize wallet integrations
   */
  async initializeWallets() {
    // MetaMask SDK (Browser context)
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        this.wallets.metamask = new ethers.BrowserProvider(window.ethereum);
        this.emit('wallet-initialized', { type: 'metamask', provider: this.wallets.metamask });
      } catch (error) {
        this.emit('wallet-error', { type: 'metamask', error: error.message });
      }
    }
    
    // TONKEEPER (TON blockchain)
    if (this.tonIntegration) {
      try {
        // Initialize TON integration
        if (opts.tonMnemonic) {
          await this.tonIntegration.initializeWallet(opts.tonMnemonic.split(' '));
        }
        this.wallets.tonkeeper = {
          integration: this.tonIntegration,
          provider: this.tonIntegration.client,
          connected: this.tonIntegration.wallet !== null
        };
        this.emit('wallet-initialized', { type: 'tonkeeper' });
      } catch (error) {
        this.emit('wallet-error', { type: 'tonkeeper', error: error.message });
      }
    }
    
    // Browser TONKEEPER (if available)
    if (typeof window !== 'undefined' && window.tonkeeper) {
      try {
        this.wallets.tonkeeper = {
          ...this.wallets.tonkeeper,
          browserProvider: window.tonkeeper,
          browserConnected: false
        };
        this.emit('wallet-initialized', { type: 'tonkeeper-browser' });
      } catch (error) {
        this.emit('wallet-error', { type: 'tonkeeper-browser', error: error.message });
      }
    }
    
    // OPENNETWORK
    if (typeof window !== 'undefined' && window.openNetwork) {
      try {
        this.wallets.openNetwork = {
          provider: window.openNetwork,
          connected: false
        };
        this.emit('wallet-initialized', { type: 'openNetwork' });
      } catch (error) {
        this.emit('wallet-error', { type: 'openNetwork', error: error.message });
      }
    }
    
    // Safe{wallet} (Primary)
    this.wallets.safe = this.safeClient;
    this.emit('wallet-initialized', { type: 'safe', primary: true });
  }

  /**
   * Navigate via terminal (tn5250 + SUSE + gcloud)
   */
  async navigateTerminal(command, options = {}) {
    const { useXterm = true, background = false } = options;
    
    // Determine command type
    if (command.startsWith('gcloud ')) {
      const gcloudCmd = command.replace('gcloud ', '');
      return await this.chariotAgent.executeGCloud(gcloudCmd, { useXterm });
    } else if (command.startsWith('tn5250') || command.includes('pub400')) {
      return await this.chariotAgent.connectTN5250({ useXterm });
    } else if (command.startsWith('zypper ') || command.startsWith('suse')) {
      const zypperCmd = command.replace(/^(zypper |suse )/, '');
      return await this.chariotAgent.executeZypper(zypperCmd, { useXterm });
    } else {
      // Generic command execution
      return await this.chariotAgent.executeInXterm(command, { useXterm });
    }
  }

  /**
   * Execute wallet operation (merged wallets)
   */
  async executeWalletOperation(operation, options = {}) {
    const { walletType = 'safe', ...opts } = options;
    
    switch (operation.type) {
      case 'getBalance':
        if (walletType === 'safe') {
          const safeInfo = await this.safeClient.getSafeInfo(operation.address);
          return { balance: safeInfo.balance, address: operation.address, wallet: 'safe' };
        } else if (walletType === 'metamask' && this.wallets.metamask) {
          const balance = await this.wallets.metamask.getBalance(operation.address);
          return { balance: ethers.formatEther(balance), address: operation.address, wallet: 'metamask' };
        }
        break;
        
      case 'sendTransaction':
        if (walletType === 'safe') {
          const safe = await this.safeClient.getSafe(operation.safeAddress);
          const safeTx = await safe.createTransaction({
            safeTransactionData: {
              to: operation.to,
              value: operation.value || '0',
              data: operation.data || '0x'
            }
          });
          return { transaction: safeTx, wallet: 'safe' };
        }
        break;
        
      case 'connect':
        return await this.connectWallet(walletType);
    }
    
    throw new Error(`Operation ${operation.type} not supported for wallet ${walletType}`);
  }

  /**
   * Connect wallet
   */
  async connectWallet(walletType) {
    switch (walletType) {
      case 'metamask':
        if (!this.wallets.metamask && typeof window !== 'undefined') {
          this.wallets.metamask = new ethers.BrowserProvider(window.ethereum);
        }
        if (this.wallets.metamask) {
          const signer = await this.wallets.metamask.getSigner();
          const address = await signer.getAddress();
          return { success: true, wallet: 'metamask', address };
        }
        break;
        
      case 'tonkeeper':
        if (this.wallets.tonkeeper) {
          if (this.wallets.tonkeeper.integration) {
            // Server-side TON integration
            return { 
              success: true, 
              wallet: 'tonkeeper',
              address: this.wallets.tonkeeper.integration.wallet?.address?.toString(),
              type: 'server'
            };
          } else if (this.wallets.tonkeeper.browserProvider && typeof window !== 'undefined') {
            // Browser TONKEEPER
            const accounts = await window.tonkeeper.send('ton_requestAccounts');
            this.wallets.tonkeeper.browserConnected = true;
            return { success: true, wallet: 'tonkeeper', accounts, type: 'browser' };
          }
        }
        break;
        
      case 'openNetwork':
        if (this.wallets.openNetwork && typeof window !== 'undefined') {
          // OPENNETWORK connection logic
          return { success: true, wallet: 'openNetwork' };
        }
        break;
        
      case 'safe':
        return { success: true, wallet: 'safe', primary: true };
    }
    
    return { success: false, error: `Wallet ${walletType} not available` };
  }

  /**
   * Research and learn from modern implementations
   */
  async researchTopic(topic) {
    if (this.researchCache.has(topic)) {
      return this.researchCache.get(topic);
    }
    
    if (!this.braveSearch) {
      return { error: 'Brave Search not configured' };
    }
    
    const searchResults = await this.braveSearch.webSearch(topic, {
      count: 10,
      freshness: 'py' // Past year
    });
    
    // Extract learnings
    const learnings = {
      topic,
      results: searchResults.results || [],
      insights: this.extractInsights(searchResults.results || []),
      timestamp: new Date().toISOString()
    };
    
    this.researchCache.set(topic, learnings);
    this.emit('research-complete', learnings);
    
    return learnings;
  }

  /**
   * Extract insights from research results
   */
  extractInsights(results) {
    const insights = {
      technologies: [],
      patterns: [],
      bestPractices: []
    };
    
    results.forEach(result => {
      const text = `${result.title} ${result.description}`.toLowerCase();
      
      // Extract technologies
      if (text.includes('metamask')) insights.technologies.push('MetaMask SDK');
      if (text.includes('tonkeeper') || text.includes('ton')) insights.technologies.push('TONKEEPER');
      if (text.includes('open network') || text.includes('opennetwork')) insights.technologies.push('OPENNETWORK');
      if (text.includes('safe') || text.includes('gnosis')) insights.technologies.push('Safe{wallet}');
      if (text.includes('multi-sig')) insights.patterns.push('Multi-signature wallets');
      if (text.includes('terminal') && text.includes('browser')) insights.patterns.push('Browser terminal integration');
    });
    
    return insights;
  }

  /**
   * Start background processing
   */
  startBackgroundProcessing() {
    // Background task: Monitor wallet balances
    this.backgroundTasks.set('balance-monitor', setInterval(async () => {
      if (this.covenantAddresses.treasury) {
        try {
          const balance = await this.provider.getBalance(this.covenantAddresses.treasury);
          this.emit('balance-update', {
            address: this.covenantAddresses.treasury,
            balance: ethers.formatEther(balance)
          });
        } catch (error) {
          this.emit('background-error', { task: 'balance-monitor', error: error.message });
        }
      }
    }, 60000)); // Every minute
    
    // Background task: Research modern implementations
    this.backgroundTasks.set('research', setInterval(async () => {
      if (this.braveSearch) {
        await this.researchTopic('modern Web3 browser terminal wallet integration');
      }
    }, 3600000)); // Every hour
  }

  /**
   * Stop background processing
   */
  stopBackgroundProcessing() {
    this.backgroundTasks.forEach((task, name) => {
      clearInterval(task);
      this.backgroundTasks.delete(name);
    });
    this.isRunning = false;
    this.emit('stopped');
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      brand: this.brand,
      running: this.isRunning,
      chariot: this.chariotAgent.getStatus(),
      wallets: {
        metamask: this.wallets.metamask !== null,
        tonkeeper: this.wallets.tonkeeper !== null,
        openNetwork: this.wallets.openNetwork !== null,
        safe: this.wallets.safe !== null
      },
      backgroundTasks: Array.from(this.backgroundTasks.keys()),
      researchCache: this.researchCache.size
    };
  }
}

module.exports = { UnifiedTerminalSystem };
