# 🌑 Ghostly Terminal - Eternal Covenant Enhanced

An advanced terminal emulator with integrated Web4 identity, Hedera audit trails, and zero-knowledge privacy for secure enterprise access to legacy systems.

## Features

### 🔐 Eternal Covenant Security
- **Cryptographic verification** of all operations
- **RSA-2048 + AES-256** encryption
- **SHA512 master key** derivation
- **Session token authentication**

### 🖥️ Terminal Emulation
- **Blessed.js TUI** interface for local use
- **Web-based interface** for remote access
- **TN5250 protocol** support for IBM i systems
- **Multi-protocol support** (Telnet, SSH, etc.)

### 🆔 Web4 Identity Integration
- **DID Resolution** for decentralized identity
- **Hedera HCS** immutable audit logging
- **ZKP Privacy** proofs for authentication
- **Multi-method support** (Hedera, Ethereum, Key DIDs)

### 🏢 Enterprise Features
- **IBM i Integration** (pub400.com connectivity)
- **SUSE Server Support** (PAM authentication)
- **Compliance Ready** (GDPR, SOX, audit trails)
- **Session Management** with automatic logging

## Installation

```bash
# Install dependencies
npm install

# For web interface (optional)
npm install -g http-server
```

## Usage

### Terminal Interface
```bash
# Start TUI interface
npm start

# Or directly
node index.js
```

### Web Interface
```bash
# Start web server
npm run web

# Open browser to http://localhost:3000
```

### CLI Commands
```bash
# Verify Covenant
node index.js covenant verify

# Start web interface
node index.js web

# Run tests
npm test
```

## Configuration

### Environment Variables
```bash
# Covenant settings
COVENANT_FILE=/path/to/covenant.jpg
MASTER_KEY=your_sha512_master_key

# Hedera settings
HEDERA_NETWORK=testnet
HEDERA_ACCOUNT_ID=0.0.xxxx
HEDERA_PRIVATE_KEY=your_private_key

# TN5250 settings
TN5250_HOST=pub400.com
TN5250_USER=THEOS
TN5250_PASSWORD=winter25
```

### Terminal Commands

Once in the Ghostly Terminal interface:

```
covenant verify    - Verify Eternal Covenant integrity
tn5250 connect     - Connect to IBM i system
did resolve        - Test DID resolution
hedera log         - Log event to Hedera
zkp verify         - Test ZKP verification
web status         - Start web interface
help               - Show available commands
exit               - Exit terminal
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│                Ghostly Terminal                 │
├─────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │  Covenant   │ │   TN5250    │ │    Web4     │ │
│  │   Core      │ │   Client    │ │   Identity  │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ │
├─────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │    Hedera   │ │     ZKP     │ │    DID      │ │
│  │     HCS     │ │  Verifier   │ │  Resolver   │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ │
├─────────────────────────────────────────────────┤
│               Blessed.js TUI                     │
│              Express.js Web                       │
└─────────────────────────────────────────────────┘
```

## Security Features

### Eternal Covenant
- **Cryptographic signatures** on all operations
- **Master key derivation** from depicted SHA256
- **Session token validation**
- **Integrity verification**

### Web4 Identity
- **DID-based authentication** (no passwords)
- **Hedera audit trails** (immutable logging)
- **ZKP privacy proofs** (selective disclosure)
- **Multi-chain support**

### Enterprise Security
- **IBM i integration** with tn5250
- **SUSE PAM modules** for authentication
- **Compliance logging** for regulatory requirements
- **Zero-trust architecture**

## Development

### Project Structure
```
ghostly-terminal/
├── index.js              # Main application
├── covenant-core.js      # Eternal Covenant security
├── tn5250-client.js      # IBM i terminal client
├── did-resolver.js       # Decentralized identity
├── hedera-logger.js      # HCS audit logging
├── zkp-verifier.js       # Privacy proofs
├── public/               # Web interface assets
├── package.json          # Dependencies
└── README.md            # This file
```

### Adding New Features

1. **New Terminal Commands**: Add to `executeCommand()` in `index.js`
2. **New ZKP Circuits**: Implement in `zkp-verifier.js`
3. **New DID Methods**: Add to `did-resolver.js`
4. **New Protocols**: Create new client modules

## API Reference

### Covenant Core
```javascript
const covenant = new CovenantAuthenticator();

// Verify integrity
await covenant.verifyIntegrity();

// Generate session token
const token = covenant.generateSessionToken(sessionData);

// Encrypt/decrypt data
const encrypted = covenant.encryptData(data);
const decrypted = covenant.decryptData(encrypted);
```

### TN5250 Client
```javascript
const tn5250 = new TN5250Client();

// Connect to system
await tn5250.connect('pub400.com');

// Authenticate
await tn5250.authenticate('THEOS', 'winter25');

// Execute command
const result = await tn5250.executeCommand('DSPSYSVAL');
```

### Web4 Components
```javascript
const did = new DIDResolver();
const hedera = new HederaLogger();
const zkp = new ZKPVerifier();

// Resolve DID
const didDoc = await did.resolve('did:hedera:testnet:0.0.12345');

// Log to Hedera
await hedera.logEvent('AUTH_SUCCESS', { user: 'john' });

// Verify ZKP
const verified = await zkp.verifyProof(proof, publicSignals);
```

## Troubleshooting

### Common Issues

**"Covenant integrity failed"**
- Ensure Covenant files exist in correct location
- Check file permissions
- Verify cryptographic signatures

**"TN5250 connection failed"**
- Check network connectivity to IBM i system
- Verify firewall settings
- Ensure tn5250 protocol support

**"X11 display not found"**
- Run in web mode: `npm run web`
- Use SSH with X11 forwarding
- Check display environment variable

**"Hedera connection failed"**
- Verify network configuration
- Check account credentials
- Ensure Hedera SDK is properly installed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Eternal Covenant

This terminal is secured by the Eternal Covenant - a cryptographic framework ensuring the integrity and authenticity of all operations through decentralized verification and immutable audit trails.

*"Where Legacy Meets Web4"* 🏛️✨