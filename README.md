# ⚡ THEOS Terminal

**Unified Terminal System with Web3 Wallet Integration**

Based on xterm.js with integrated:
- **Primary:** Covenant + Safe{wallet}
- **Merged:** MetaMask SDK + TONKEEPER + OPENNETWORK
- **Navigation:** tn5250 + SUSE + gcloud shell
- **Mode:** Background processing with GUI

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│         Unified Terminal System                 │
├─────────────────────────────────────────────────┤
│  Primary: Covenant + Safe{wallet}               │
│  Merged: MetaMask + TONKEEPER + OPENNETWORK     │
│  Navigation: tn5250 + SUSE + gcloud            │
│  Background: Processing & Research              │
└─────────────────────────────────────────────────┘
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start unified terminal
npm start

# Or web terminal
npm run terminal
```

Access at: `http://localhost:8080`

## 📦 Features

- **xterm.js Terminal** - Full-featured web terminal
- **Safe{wallet} SDK** - Multi-sig wallet operations
- **MetaMask Integration** - Browser wallet connection
- **TONKEEPER** - TON blockchain wallet
- **OPENNETWORK** - OpenNetwork protocol
- **Terminal Navigation** - tn5250, SUSE, gcloud
- **Background Processing** - Auto-monitoring & research
- **Brave Search** - Research & learning

## 🔧 Configuration

```bash
export BRAVE_API_KEY=your-key
export GOOGLE_CLOUD_PROJECT=your-project
export TON_API_KEY=your-ton-key
export TN5250_HOST=pub400.com
export TN5250_USER=THEOS
export TN5250_PASSWORD=winter25
```

## 📝 Terminal Commands

- `connect <type>` - Connect wallet (metamask/tonkeeper/openNetwork/safe)
- `navigate <command>` - Navigate terminal (gcloud/tn5250/zypper)
- `balance <address>` - Get wallet balance
- `treasury-status` - Get Treasury of Light status
- `research <topic>` - Research Web3 topics
- `status` - Get system status
- `help` - Show commands

## 📁 Structure

```
src/
├── unified-terminal/    # Unified terminal system
├── web-terminal/        # Web terminal server
├── chariot-agent/      # Terminal agent (tn5250, SUSE, gcloud)
├── safe/               # Safe{wallet} SDK integration
└── brave/              # Brave Search API
```

## 📄 License

MIT

## 🔗 Repository

https://github.com/tig08bitties/Terminal
