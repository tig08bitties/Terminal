# Unified Terminal System

**Primary:** Covenant + Safe{wallet}  
**Merged Wallets:** MetaMask SDK + TONKEEPER + OPENNETWORK  
**Navigation:** tn5250 + SUSE + gcloud shell terminal  
**Mode:** Background processing with GUI navigation

## Architecture

```
┌─────────────────────────────────────────────────┐
│         Unified Terminal System                 │
├─────────────────────────────────────────────────┤
│  Primary:                                        │
│  • Covenant Addresses                           │
│  • Safe{wallet} SDK (Multi-sig)                 │
│  • Treasury of Light                            │
├─────────────────────────────────────────────────┤
│  Merged Wallets:                                │
│  • MetaMask SDK                                  │
│  • TONKEEPER (TON blockchain)                   │
│  • OPENNETWORK                                   │
├─────────────────────────────────────────────────┤
│  Terminal Navigation:                           │
│  • tn5250 (IBM i / AS/400)                      │
│  • SUSE (zypper package management)             │
│  • gcloud (Google Cloud Platform)               │
├─────────────────────────────────────────────────┤
│  Background Processing:                         │
│  • Balance monitoring                           │
│  • Research & learning                          │
│  • Event handling                               │
└─────────────────────────────────────────────────┘
```

## Features

### Primary Wallet System
- **Covenant** - Core addresses and configuration
- **Safe{wallet}** - Multi-signature wallet operations
- **Treasury of Light** - Primary treasury management

### Merged Wallet Support
- **MetaMask SDK** - Browser-based Ethereum wallet
- **TONKEEPER** - TON blockchain wallet
- **OPENNETWORK** - OpenNetwork protocol support

### Terminal Navigation
- **tn5250** - IBM i (AS/400) connectivity
- **SUSE** - Linux package management (zypper)
- **gcloud** - Google Cloud Platform shell

### Background Processing
- Automatic balance monitoring
- Research and learning from modern implementations
- Event-driven architecture

## Usage

### Initialize System

```javascript
const { UnifiedTerminalSystem } = require('./lib/unified-terminal/unified-terminal-system');

const system = new UnifiedTerminalSystem({
  provider: new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc'),
  network: 'arbitrum',
  gcloudProject: process.env.GOOGLE_CLOUD_PROJECT,
  braveApiKey: process.env.BRAVE_API_KEY
});

await system.initialize();
```

### Terminal Navigation

```javascript
// Navigate via gcloud
await system.navigateTerminal('gcloud compute instances list', { useXterm: true });

// Navigate via tn5250
await system.navigateTerminal('tn5250 pub400.com', { useXterm: true });

// Navigate via SUSE
await system.navigateTerminal('zypper search nodejs', { useXterm: true });
```

### Wallet Operations

```javascript
// Get balance (uses Safe{wallet} as primary)
const balance = await system.executeWalletOperation({
  type: 'getBalance',
  address: '0xb4C173AaFe428845f0b96610cf53576121BAB221'
}, { walletType: 'safe' });

// Connect MetaMask
await system.connectWallet('metamask');

// Connect TONKEEPER
await system.connectWallet('tonkeeper');
```

### Research & Learning

```javascript
// Research modern implementations
const research = await system.researchTopic('modern Web3 browser terminal wallet integration');

console.log('Technologies:', research.insights.technologies);
console.log('Patterns:', research.insights.patterns);
```

## Server

```bash
# Start unified terminal server
node lib/unified-terminal/unified-terminal-server.js
```

Access at: `http://localhost:8080`

## API Endpoints

- `POST /api/system/initialize` - Initialize system
- `GET /api/system/status` - Get system status
- `POST /api/terminal/navigate` - Navigate terminal
- `POST /api/wallet/operation` - Execute wallet operation
- `POST /api/wallet/connect` - Connect wallet
- `POST /api/research` - Research topic
- `GET /api/treasury/status` - Get Treasury status

## Configuration

```bash
export GOOGLE_CLOUD_PROJECT=your-project-id
export BRAVE_API_KEY=your-brave-api-key
export TN5250_HOST=pub400.com
export TN5250_USER=THEOS
export TN5250_PASSWORD=winter25
```

## Background Tasks

The system automatically runs:
- Balance monitoring (every minute)
- Research updates (every hour)
- Event processing

## License

MIT
