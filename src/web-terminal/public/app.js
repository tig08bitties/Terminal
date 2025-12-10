/**
 * Web Terminal Application with Safe{wallet} SDK Integration
 */

class WebTerminal {
  constructor() {
    this.terminal = null;
    this.fitAddon = null;
    this.provider = null;
    this.signer = null;
    this.connectedAddress = null;
    this.walletId = null;
    this.apiBase = window.location.origin;
    
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
        selection: '#264f78',
        black: '#0d1117',
        red: '#f85149',
        green: '#238636',
        yellow: '#d29922',
        blue: '#58a6ff',
        magenta: '#bc8cff',
        cyan: '#39c5cf',
        white: '#c9d1d9',
        brightBlack: '#6e7681',
        brightRed: '#ff7b72',
        brightGreen: '#3fb950',
        brightYellow: '#d29922',
        brightBlue: '#58a6ff',
        brightMagenta: '#bc8cff',
        brightCyan: '#56d4dd',
        brightWhite: '#f0f6fc'
      }
    });

    this.fitAddon = new FitAddon.FitAddon();
    this.terminal.loadAddon(this.fitAddon);

    // Open terminal
    this.terminal.open(document.getElementById('terminal'));
    this.fitAddon.fit();

    // Handle window resize
    window.addEventListener('resize', () => {
      this.fitAddon.fit();
    });

    // Initialize terminal prompt
    this.writePrompt();
    this.setupInput();

    // Setup wallet connection buttons
    this.setupWalletButtons();

    // Check if MetaMask is available
    if (window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.updateStatus('wallet-status', 'MetaMask Available');
    }

    // Display welcome message
    this.terminal.writeln('\r\n╔═══════════════════════════════════════════════════════════╗');
    this.terminal.writeln('║     ⚡ THEOS Web Terminal - Safe{wallet} Integration ⚡     ║');
    this.terminal.writeln('╚═══════════════════════════════════════════════════════════╝\r\n');
    this.terminal.writeln('Available commands:');
    this.terminal.writeln('  balance <address>        - Get wallet balance');
    this.terminal.writeln('  safe-status <address>    - Get Safe wallet status');
    this.terminal.writeln('  treasury-status          - Get Treasury of Light status');
    this.terminal.writeln('  connect                  - Connect MetaMask wallet');
    this.terminal.writeln('  connect-obsidian         - Connect Obsidian Wallet');
    this.terminal.writeln('  gcloud <command>          - Execute gcloud command');
    this.terminal.writeln('  gcloud-status            - Check gcloud status');
    this.terminal.writeln('  search <query>            - Web search (Brave)');
    this.terminal.writeln('  search-news <query>       - News search');
    this.terminal.writeln('  search-images <query>     - Image search');
    this.terminal.writeln('  help                     - Show help');
    this.terminal.writeln('');
  }

  writePrompt() {
    const prompt = this.connectedAddress 
      ? `theos@${this.connectedAddress.slice(0, 8)}...$ `
      : 'theos@terminal$ ';
    this.terminal.write(`\r\n${prompt}`);
  }

  setupInput() {
    let currentLine = '';

    this.terminal.onData((data) => {
      if (data === '\r') {
        // Enter pressed
        this.terminal.write('\r\n');
        this.handleCommand(currentLine.trim());
        currentLine = '';
        this.writePrompt();
      } else if (data === '\x7f' || data === '\b') {
        // Backspace
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          this.terminal.write('\b \b');
        }
      } else if (data >= ' ') {
        // Printable character
        currentLine += data;
        this.terminal.write(data);
      }
    });
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
          await this.connectWallet('metamask');
          break;

        case 'connect-obsidian':
          await this.connectWallet('obsidian');
          break;

        case 'balance':
          if (!argString) {
            this.terminal.writeln('Error: Address required');
            this.terminal.writeln('Usage: balance <address>');
            break;
          }
          await this.getBalance(argString);
          break;

        case 'safe-status':
          if (!argString) {
            this.terminal.writeln('Error: Safe address required');
            this.terminal.writeln('Usage: safe-status <address>');
            break;
          }
          await this.getSafeStatus(argString);
          break;

        case 'treasury-status':
          await this.getTreasuryStatus();
          break;

        case 'gcloud':
          if (!argString) {
            this.terminal.writeln('Error: gcloud command required');
            this.terminal.writeln('Usage: gcloud <command>');
            this.terminal.writeln('Example: gcloud compute instances list');
            break;
          }
          await this.executeGCloud(argString);
          break;

        case 'gcloud-status':
          await this.getGCloudStatus();
          break;

        case 'search':
          if (!argString) {
            this.terminal.writeln('Error: Search query required');
            this.terminal.writeln('Usage: search <query>');
            this.terminal.writeln('Example: search modern Web3 browser terminal wallet');
            break;
          }
          await this.braveSearch(argString, 'web');
          break;

        case 'search-news':
          if (!argString) {
            this.terminal.writeln('Error: Search query required');
            this.terminal.writeln('Usage: search-news <query>');
            break;
          }
          await this.braveSearch(argString, 'news');
          break;

        case 'search-images':
          if (!argString) {
            this.terminal.writeln('Error: Search query required');
            this.terminal.writeln('Usage: search-images <query>');
            break;
          }
          await this.braveSearch(argString, 'image');
          break;

        case 'clear':
          this.terminal.clear();
          break;

        default:
          this.terminal.writeln(`Unknown command: ${command}`);
          this.terminal.writeln('Type "help" for available commands');
      }
    } catch (error) {
      this.terminal.writeln(`Error: ${error.message}`);
    }
  }

  showHelp() {
    this.terminal.writeln('\r\nAvailable Commands:');
    this.terminal.writeln('  balance <address>        - Get wallet balance (ETH)');
    this.terminal.writeln('  safe-status <address>    - Get Safe wallet status');
    this.terminal.writeln('  treasury-status          - Get Treasury of Light status');
    this.terminal.writeln('  connect                  - Connect MetaMask wallet');
    this.terminal.writeln('  connect-obsidian         - Connect Obsidian Wallet');
    this.terminal.writeln('  gcloud <command>          - Execute gcloud command');
    this.terminal.writeln('  gcloud-status            - Check gcloud installation & auth');
    this.terminal.writeln('  search <query>            - Web search using Brave');
    this.terminal.writeln('  search-news <query>       - News search');
    this.terminal.writeln('  search-images <query>     - Image search');
    this.terminal.writeln('  clear                    - Clear terminal');
    this.terminal.writeln('  help                     - Show this help');
  }

  async connectWallet(walletType = 'metamask') {
    let provider = null;
    let walletName = '';

    if (walletType === 'obsidian') {
      // Check for Obsidian Wallet
      if (window.obsidian) {
        provider = window.obsidian;
        walletName = 'Obsidian';
      } else if (window.ethereum && window.ethereum.isObsidian) {
        provider = window.ethereum;
        walletName = 'Obsidian';
      } else {
        this.terminal.writeln('Error: Obsidian Wallet not detected');
        this.terminal.writeln('Please install Obsidian Wallet or visit: https://replit.com/@Dauser/Obsidian-Wallet');
        return;
      }
    } else {
      // MetaMask
      if (!window.ethereum) {
        this.terminal.writeln('Error: MetaMask not detected');
        this.terminal.writeln('Please install MetaMask: https://metamask.io');
        return;
      }
      provider = window.ethereum;
      walletName = 'MetaMask';
    }

    try {
      this.terminal.writeln(`Connecting to ${walletName}...`);
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length === 0) {
        this.terminal.writeln('Error: No accounts found');
        return;
      }

      this.provider = new ethers.BrowserProvider(provider);
      this.signer = await this.provider.getSigner();
      this.connectedAddress = accounts[0];

      // Register with backend
      const response = await fetch(`${this.apiBase}/api/wallet/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: walletType,
          address: this.connectedAddress
        })
      });

      const data = await response.json();
      if (data.success) {
        this.walletId = data.walletId;
        this.terminal.writeln(`✅ Connected to ${walletName}: ${this.connectedAddress}`);
        this.updateWalletUI();
        this.updateStatus('wallet-status', `${walletName}: ${this.connectedAddress.slice(0, 8)}...`);
      }
    } catch (error) {
      this.terminal.writeln(`Error: ${error.message}`);
    }
  }

  async getBalance(address) {
    try {
      this.terminal.writeln(`Fetching balance for ${address}...`);
      
      const response = await fetch(`${this.apiBase}/api/wallet/balance/${address}`);
      const data = await response.json();

      if (data.success) {
        this.terminal.writeln(`\r\nBalance: ${data.balance} ETH`);
        this.terminal.writeln(`Address: ${data.address}`);
      } else {
        this.terminal.writeln(`Error: ${data.error}`);
      }
    } catch (error) {
      this.terminal.writeln(`Error: ${error.message}`);
    }
  }

  async getSafeStatus(address) {
    try {
      this.terminal.writeln(`Fetching Safe status for ${address}...`);
      
      const response = await fetch(`${this.apiBase}/api/safe/status/${address}`);
      const data = await response.json();

      if (data.success) {
        this.terminal.writeln(`\r\nSafe Wallet Status:`);
        this.terminal.writeln(`  Address: ${data.address}`);
        this.terminal.writeln(`  Balance: ${data.balance} ETH`);
        this.terminal.writeln(`  Threshold: ${data.threshold} of ${data.owners.length}`);
        this.terminal.writeln(`  Owners:`);
        data.owners.forEach((owner, i) => {
          this.terminal.writeln(`    ${i + 1}. ${owner}`);
        });
      } else {
        this.terminal.writeln(`Error: ${data.error}`);
      }
    } catch (error) {
      this.terminal.writeln(`Error: ${error.message}`);
    }
  }

  async getTreasuryStatus() {
    try {
      this.terminal.writeln('Fetching Treasury of Light status...');
      
      const response = await fetch(`${this.apiBase}/api/treasury/status`);
      const data = await response.json();

      if (data.success) {
        this.terminal.writeln(`\r\nTreasury of Light Status:`);
        this.terminal.writeln(`  Address: ${data.address}`);
        this.terminal.writeln(`  Balance: ${data.balance} ETH`);
        this.terminal.writeln(`  Threshold: ${data.threshold} of ${data.owners.length}`);
        this.terminal.writeln(`  Network: ${data.network || 'Arbitrum One'}`);
      } else {
        this.terminal.writeln(`Error: ${data.error}`);
      }
    } catch (error) {
      this.terminal.writeln(`Error: ${error.message}`);
    }
  }

  setupWalletButtons() {
    document.getElementById('connect-metamask').addEventListener('click', () => {
      this.connectWallet('metamask');
    });

    document.getElementById('connect-obsidian').addEventListener('click', () => {
      this.connectWallet('obsidian');
    });

    document.getElementById('disconnect-wallet').addEventListener('click', () => {
      this.disconnectWallet();
    });
  }

  updateWalletUI() {
    const walletInfo = document.getElementById('wallet-info');
    const walletAddress = document.getElementById('wallet-address');
    
    if (this.connectedAddress) {
      walletInfo.classList.remove('hidden');
      walletAddress.textContent = `${this.connectedAddress.slice(0, 6)}...${this.connectedAddress.slice(-4)}`;
    } else {
      walletInfo.classList.add('hidden');
    }
  }

  async executeGCloud(command) {
    try {
      this.terminal.writeln(`Executing: gcloud ${command}...`);
      
      const response = await fetch(`${this.apiBase}/api/gcloud/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });

      const data = await response.json();

      if (data.success) {
        if (data.stdout) {
          this.terminal.writeln('\r\n' + data.stdout);
        }
        if (data.stderr) {
          this.terminal.writeln('\r\n' + data.stderr);
        }
      } else {
        this.terminal.writeln(`\r\nError: ${data.error || 'Command failed'}`);
        if (data.stderr) {
          this.terminal.writeln(data.stderr);
        }
      }
    } catch (error) {
      this.terminal.writeln(`Error: ${error.message}`);
    }
  }

  async getGCloudStatus() {
    try {
      this.terminal.writeln('Checking gcloud status...');
      
      const response = await fetch(`${this.apiBase}/api/gcloud/status`);
      const data = await response.json();

      if (data.success && data.installed) {
        this.terminal.writeln(`\r\ngcloud Status:`);
        this.terminal.writeln(`  Installed: ✅ Yes`);
        this.terminal.writeln(`  Version: ${data.version}`);
        this.terminal.writeln(`  Authenticated: ${data.authenticated ? '✅ Yes' : '❌ No'}`);
        if (data.account) {
          this.terminal.writeln(`  Account: ${data.account}`);
        }
        if (data.project) {
          this.terminal.writeln(`  Project: ${data.project}`);
        } else {
          this.terminal.writeln(`  Project: Not set`);
        }
      } else {
        this.terminal.writeln(`\r\ngcloud Status:`);
        this.terminal.writeln(`  Installed: ❌ No`);
        if (data.error) {
          this.terminal.writeln(`  Error: ${data.error}`);
        }
        this.terminal.writeln(`  Install: https://cloud.google.com/sdk/docs/install`);
      }
    } catch (error) {
      this.terminal.writeln(`Error: ${error.message}`);
    }
  }

  async braveSearch(query, type = 'web') {
    try {
      this.terminal.writeln(`Searching for: ${query}...`);
      
      const response = await fetch(`${this.apiBase}/api/brave/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          type,
          count: 10
        })
      });

      const data = await response.json();

      if (data.success && data.results && data.results.length > 0) {
        this.terminal.writeln(`\r\nFound ${data.totalResults || data.results.length} results:\r\n`);
        
        data.results.slice(0, 10).forEach((result, index) => {
          this.terminal.writeln(`${index + 1}. ${result.title || result.url}`);
          if (result.description) {
            this.terminal.writeln(`   ${result.description.substring(0, 100)}...`);
          }
          if (result.url) {
            this.terminal.writeln(`   ${result.url}`);
          }
          this.terminal.writeln('');
        });
      } else if (data.success && data.results && data.results.length === 0) {
        this.terminal.writeln(`\r\nNo results found for: ${query}`);
      } else {
        this.terminal.writeln(`\r\nError: ${data.error || 'Search failed'}`);
        if (data.error && data.error.includes('BRAVE_API_KEY')) {
          this.terminal.writeln('   Set BRAVE_API_KEY environment variable to enable search');
        }
      }
    } catch (error) {
      this.terminal.writeln(`Error: ${error.message}`);
    }
  }

  disconnectWallet() {
    this.connectedAddress = null;
    this.walletId = null;
    this.provider = null;
    this.signer = null;
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new WebTerminal();
  });
} else {
  new WebTerminal();
}
