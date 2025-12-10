# ⚡ Web Terminal Quick Start

## Start Server

```bash
# Option 1: Using npm script
npm run terminal

# Option 2: Direct
node lib/web-terminal/start-server.js

# Option 3: With custom port
PORT=8080 node lib/web-terminal/start-server.js
```

## Open Browser

```
http://localhost:3000
```

## Quick Commands

```bash
# Connect wallet
connect

# Check balance
balance 0xb4C173AaFe428845f0b96610cf53576121BAB221

# Get Safe status
safe-status 0xb4C173AaFe428845f0b96610cf53576121BAB221

# Get Treasury status
treasury-status

# Show help
help

# Clear terminal
clear
```

## Treasury of Light

**Address:** `0xb4C173AaFe428845f0b96610cf53576121BAB221`  
**Network:** Arbitrum One  
**Threshold:** 2-of-2

## Features

✅ Web-based terminal (xterm.js)  
✅ MetaMask integration  
✅ Safe{wallet} SDK  
✅ Balance checking  
✅ Transaction history  
✅ Multi-sig wallet operations

## API Endpoints

- `GET /api/wallet/balance/:address`
- `GET /api/safe/status/:address`
- `GET /api/treasury/status`
- `POST /api/wallet/connect`
- `POST /api/safe/transaction`

---

**Ready to use!** 🚀
