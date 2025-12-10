/**
 * Unified Terminal Application
 * Integrates: Covenant + Safe{wallet} + MetaMask + TONKEEPER + OPENNETWORK
 * Navigation: tn5250 + SUSE + gcloud shell
 */

class UnifiedTerminal {
  constructor() {
    this.terminal = null;
    this.fitAddon = null;
    this.apiBase = window.location.origin;
    this.connectedWallet = null;
    this.systemInitialized = false;
    
    this.init();
  }

  async init() {
    // Initialize xterm.js
    this.terminal = new Terminal({
      cursorBlink: true,
      theme: {
        background: '#0d1117',
        foreground: '#c9d1d9',
        cursor: '#58a6ff',
        selection: '#264f78'
      }
    });

    this.fitAddon = new FitAddon.FitAddon();
    this.terminal.loadAddon(this.fitAddon);
    this.terminal.open(document.getElementById('terminal'));
    this.fitAddon.fit();

    window.addEventListener('resize', () => {
      this.fitAddon.fit();
    });

    // Initialize system
    await this.initializeSystem();
    
    // Setup terminal
    this.writePrompt();
    this.setupInput();
    this.setupButtons();
    this.setupNavigation();

    // Display welcome
    this.terminal.writeln('\r\n╔═══════════════════════════════════════════════════════════╗');
    this.terminal.writeln('║   ⚡ THEOS Unified Terminal System ⚡                    ║');
    this.terminal.writeln('║   Covenant + Safe{wallet} + Multi-Wallet                  ║');
    this.terminal.writeln('╚═══════════════════════════════════════════════════════════╝\r\n');
    this.terminal.writeln('Primary: Covenant + Safe{wallet}');
    this.terminal.writeln('Merged: MetaMask SDK + TONKEEPER + OPENNETWORK');
    this.terminal.writeln('Navigation: tn5250 + SUSE + gcloud shell');
    this.terminal.writeln('Mode: Background processing with GUI\r\n');
    this.showHelp();
  }

  async initializeSystem() {
    try {
      const response = await fetch(`${this.apiBase}/api/system/initialize`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        this.systemInitialized = true;
        this.updateStatus('system-status', 'System: Ready');
        return true;
      }
    } catch (error) {
      console.error('System initialization error:', error);
    }
    return false;
  }

  writePrompt() {
    const prompt = this.connectedWallet 
      ? `theos@${this.connectedWallet.slice(0, 8)}...$ `
      : 'theos@unified$ ';
    this.terminal.write(`\r\n${prompt}`);
  }

  setupInput() {
    let currentLine = '';
    this.terminal.onData((data) => {
      if (data === '\r') {
        this.terminal.write('\r\n');
        this.handleCommand(currentLine.trim());
        currentLine = '';
        this.writePrompt();
      } else if (data === '\x7f' || data === '\b') {
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          this.terminal.write('\b \b');
        }
      } else if (data >= ' ') {
        currentLine += data;
        this.terminal.write(data);
      }
    });
  }

  setupButtons() {
    document.getElementById('connect-metamask').addEventListener('click', () => {
      this.connectWallet('metamask');
    });
    document.getElementById('connect-tonkeeper').addEventListener('click', () => {
      this.connectWallet('tonkeeper');
    });
    document.getElementById('connect-opennetwork').addEventListener('click', () => {
      this.connectWallet('openNetwork');
    });
    document.getElementById('connect-safe').addEventListener('click', () => {
      this.connectWallet('safe');
    });
    document.getElementById('disconnect-wallet').addEventListener('click', () => {
      this.disconnectWallet();
    });
  }

  setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const command = btn.dataset.command;
        this.executeNavigationCommand(command);
      });
    });
  }

  async executeNavigationCommand(command) {
    switch (command) {
      case 'gcloud-status':
        await this.navigateTerminal('gcloud --version');
        break;
      case 'tn5250':
        await this.navigateTerminal('tn5250 pub400.com');
        break;
      case 'suse-status':
        await this.navigateTerminal('zypper --version');
        break;
      case 'treasury-status':
        await this.getTreasuryStatus();
        break;
      case 'safe-status':
        this.terminal.writeln('Enter Safe address:');
        break;
      case 'wallet-balance':
        if (this.connectedWallet) {
          await this.getBalance(this.connectedWallet);
        } else {
          this.terminal.writeln('Connect a wallet first');
        }
        break;
      case 'research-web3':
        await this.researchTopic('modern Web3 browser terminal wallet integration');
        break;
    }
  }

  async handleCommand(input) {
    if (!input) return;

    const [command, ...args] = input.split(' ');
    const argString = args.join(' ');

    try {
      switch (command.toLowerCase()) {
        case 'help':
          this.showHelp();
          break;
        case 'connect':
          await this.connectWallet(argString || 'metamask');
          break;
        case 'navigate':
          await this.navigateTerminal(argString);
          break;
        case 'balance':
          if (!argString) {
            this.terminal.writeln('Error: Address required');
            break;
          }
          await this.getBalance(argString);
          break;
        case 'treasury-status':
          await this.getTreasuryStatus();
          break;
        case 'research':
          await this.researchTopic(argString || 'modern Web3 browser terminal wallet');
          break;
        case 'status':
          await this.getSystemStatus();
          break;
        case 'clear':
          this.terminal.clear();
          break;
        default:
          // Try as terminal navigation command
          await this.navigateTerminal(input);
      }
    } catch (error) {
      this.terminal.writeln(`Error: ${error.message}`);
    }
  }

  showHelp() {
    this.terminal.writeln('\r\nAvailable Commands:');
    this.terminal.writeln('  connect <type>           - Connect wallet (metamask/tonkeeper/openNetwork/safe)');
    this.terminal.writeln('  navigate <command>       - Navigate terminal (gcloud/tn5250/zypper)');
    this.terminal.writeln('  balance <address>        - Get wallet balance');
    this.terminal.writeln('  treasury-status          - Get Treasury of Light status');
    this.terminal.writeln('  research <topic>          - Research Web3 topics');
    this.terminal.writeln('  status                    - Get system status');
    this.terminal.writeln('  help                     - Show this help');
    this.terminal.writeln('  clear                    - Clear terminal');
  }

  async connectWallet(walletType) {
    this.terminal.writeln(`Connecting to ${walletType}...`);
    
    try {
      if (walletType === 'metamask' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          this.connectedWallet = accounts[0];
          this.terminal.writeln(`✅ Connected: ${this.connectedWallet}`);
          this.updateWalletUI();
          this.updateStatus('wallet-status', `Wallet: ${walletType} - ${this.connectedWallet.slice(0, 8)}...`);
        }
      } else {
        const response = await fetch(`${this.apiBase}/api/wallet/connect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletType })
        });
        const data = await response.json();
        if (data.success) {
          this.terminal.writeln(`✅ Connected to ${walletType}`);
          if (data.address) {
            this.connectedWallet = data.address;
            this.updateWalletUI();
          }
        } else {
          this.terminal.writeln(`Error: ${data.error}`);
        }
      }
    } catch (error) {
      this.terminal.writeln(`Error: ${error.message}`);
    }
  }

  async navigateTerminal(command) {
    this.terminal.writeln(`Executing: ${command}...`);
    
    try {
      const response = await fetch(`${this.apiBase}/api/terminal/navigate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, options: { useXterm: true } })
      });
      const data = await response.json();
      if (data.success) {
        this.terminal.writeln(`✅ Command executed`);
        if (data.result.stdout) {
          this.terminal.writeln(data.result.stdout);
        }
      } else {
        this.terminal.writeln(`Error: ${data.error}`);
      }
    } catch (error) {
      this.terminal.writeln(`Error: ${error.message}`);
    }
  }

  async getBalance(address) {
    try {
      const response = await fetch(`${this.apiBase}/api/wallet/operation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: { type: 'getBalance', address },
          options: { walletType: 'safe' }
        })
      });
      const data = await response.json();
      if (data.success) {
        this.terminal.writeln(`\r\nBalance: ${data.result.balance} ETH`);
        this.terminal.writeln(`Address: ${data.result.address}`);
      }
    } catch (error) {
      this.terminal.writeln(`Error: ${error.message}`);
    }
  }

  async getTreasuryStatus() {
    try {
      const response = await fetch(`${this.apiBase}/api/treasury/status`);
      const data = await response.json();
      if (data.success) {
        this.terminal.writeln(`\r\nTreasury of Light:`);
        this.terminal.writeln(`  Address: ${data.address}`);
        this.terminal.writeln(`  Balance: ${data.balance} ETH`);
        this.terminal.writeln(`  Threshold: ${data.threshold} of ${data.owners.length}`);
      }
    } catch (error) {
      this.terminal.writeln(`Error: ${error.message}`);
    }
  }

  async researchTopic(topic) {
    this.terminal.writeln(`Researching: ${topic}...`);
    
    try {
      const response = await fetch(`${this.apiBase}/api/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });
      const data = await response.json();
      if (data.insights) {
        this.terminal.writeln(`\r\nResearch Insights:`);
        this.terminal.writeln(`  Technologies: ${data.insights.technologies.join(', ')}`);
        this.terminal.writeln(`  Patterns: ${data.insights.patterns.join(', ')}`);
      }
    } catch (error) {
      this.terminal.writeln(`Error: ${error.message}`);
    }
  }

  async getSystemStatus() {
    try {
      const response = await fetch(`${this.apiBase}/api/system/status`);
      const data = await response.json();
      this.terminal.writeln(`\r\nSystem Status:`);
      this.terminal.writeln(`  Running: ${data.running ? 'Yes' : 'No'}`);
      this.terminal.writeln(`  Wallets: ${Object.keys(data.wallets).filter(k => data.wallets[k]).join(', ')}`);
      this.terminal.writeln(`  Background Tasks: ${data.backgroundTasks.length}`);
    } catch (error) {
      this.terminal.writeln(`Error: ${error.message}`);
    }
  }

  updateWalletUI() {
    const walletInfo = document.getElementById('wallet-info');
    const walletAddress = document.getElementById('wallet-address');
    
    if (this.connectedWallet) {
      walletInfo.classList.remove('hidden');
      walletAddress.textContent = `${this.connectedWallet.slice(0, 6)}...${this.connectedWallet.slice(-4)}`;
    } else {
      walletInfo.classList.add('hidden');
    }
  }

  disconnectWallet() {
    this.connectedWallet = null;
    this.updateWalletUI();
    this.updateStatus('wallet-status', 'Wallet: Not Connected');
    this.terminal.writeln('Wallet disconnected');
  }

  updateStatus(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = text;
    }
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new UnifiedTerminal();
  });
} else {
  new UnifiedTerminal();
}
