# Web Terminal with Safe{wallet} SDK Integration

Web-based terminal emulator with integrated cryptocurrency wallet functionality using Safe{wallet} SDK.

## Features

- **xterm.js Terminal Emulator** - Full-featured web terminal
- **MetaMask Integration** - Connect and interact with MetaMask wallets
- **WalletConnect Support** - Connect via WalletConnect protocol
- **Safe{wallet} SDK** - Multi-sig wallet operations
- **Treasury of Light** - Direct access to Treasury operations
- **Terminal Commands** - Wallet operations via command-line interface

## Installation

```bash
cd lib/web-terminal
npm install express ethers
```

## Usage

### Start Server

```bash
node start-server.js
```

Or with environment variables:

```bash
PORT=3000 RPC_URL=https://arb1.arbitrum.io/rpc NETWORK=arbitrum node start-server.js
```

### Access Terminal

Open your browser to:
```
http://localhost:3000
```

## Terminal Commands

### Wallet Commands

- `connect` - Connect MetaMask wallet
- `balance <address>` - Get wallet balance (ETH)
- `safe-status <address>` - Get Safe wallet status
- `treasury-status` - Get Treasury of Light status
- `help` - Show available commands
- `clear` - Clear terminal

### Examples

```bash
# Connect wallet
theos@terminal$ connect

# Check balance
theos@terminal$ balance 0xb4C173AaFe428845f0b96610cf53576121BAB221

# Get Safe status
theos@terminal$ safe-status 0xb4C173AaFe428845f0b96610cf53576121BAB221

# Get Treasury of Light status
theos@terminal$ treasury-status
```

## API Endpoints

### `POST /api/wallet/connect`
Connect wallet.

**Body:**
```json
{
  "provider": "metamask",
  "address": "0x..."
}
```

### `GET /api/wallet/balance/:address`
Get wallet balance.

**Response:**
```json
{
  "success": true,
  "address": "0x...",
  "balance": "1.234",
  "balanceWei": "1234000000000000000"
}
```

### `GET /api/safe/status/:address`
Get Safe wallet status.

**Response:**
```json
{
  "success": true,
  "address": "0x...",
  "owners": ["0x...", "0x..."],
  "threshold": 2,
  "balance": "1.234",
  "version": "1.3.0",
  "nonce": 5
}
```

### `GET /api/treasury/status`
Get Treasury of Light status.

### `POST /api/safe/transaction`
Create Safe transaction.

**Body:**
```json
{
  "safeAddress": "0x...",
  "to": "0x...",
  "value": "1000000000000000000",
  "data": "0x"
}
```

## Architecture

```
lib/web-terminal/
├── web-terminal-server.js    # Express server with API endpoints
├── start-server.js           # Server startup script
├── public/
│   ├── index.html            # Main HTML page
│   ├── styles.css            # Terminal styling
│   └── app.js                # Frontend terminal application
└── README.md                 # This file
```

## Dependencies

- **express** - Web server
- **ethers** - Ethereum library
- **@safe-global/safe-core-sdk** - Safe SDK
- **xterm.js** - Terminal emulator (CDN)

## Network Support

- **Arbitrum One** (default)
- **Ethereum Mainnet**
- Custom RPC endpoints

## Security Notes

- Wallet connections are handled client-side via MetaMask
- Server does not store private keys
- Safe transactions require multi-sig approval
- All operations are read-only unless explicitly signed

## License

MIT
