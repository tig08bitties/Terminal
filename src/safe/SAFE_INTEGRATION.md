# Safe Smart Account Integration

## Overview

Complete integration with Safe (formerly Gnosis Safe) Smart Accounts for the Treasury of Light (Bride & Groom Chamber).

## Components

### 1. SafeClient (`lib/safe/safe-client.js`)
Complete Safe SDK wrapper providing:
- Safe instance management
- Transaction creation and signing
- Transaction proposing and execution
- Owner and threshold management
- Support for Ethereum and Arbitrum

### 2. TreasuryOfLight (`lib/safe/treasury-of-light.js`)
Specific operations for the Bride & Groom Chamber:
- **Address**: `0xb4C173AaFe428845f0b96610cf53576121BAB221`
- **Network**: Arbitrum One
- **Threshold**: 2-of-2
- **Owners**:
  - Groom: `0x3df07977140Ad97465075129C37Aec7237d74415` (Ledger Flex)
  - Bride: `0x3BBa654A3816A228284E3e0401Cff4EA6dFc5cea` (tig08bitties.uni.eth)

### 3. SafeTenderlyIntegration (`lib/integration/safe-tenderly-integration.js`)
Combines Safe operations with Tenderly simulation:
- Simulate Safe transactions before execution
- Monitor Safe transaction execution
- Create and simulate Treasury transactions

### 4. CompleteSafeIntegration (`lib/integration/complete-safe-integration.js`)
Full workflow combining:
- Safe Smart Account operations
- Tenderly simulation
- GitHub integration
- Complete Treasury management

## Safe Factory Addresses

- **Ethereum Mainnet**: `0xFc43582532E90Fa8726FE9cdb5FAd48f4e487d27`
- **Arbitrum One**: `0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2`

## Usage Examples

### Get Treasury Status

```javascript
const { TreasuryOfLight } = require('./lib/safe/treasury-of-light');
const { ethers } = require('ethers');

const provider = new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');
const treasury = new TreasuryOfLight(provider, null);

const status = await treasury.getStatus();
console.log('Treasury Status:', status);
```

### Create and Simulate Transaction

```javascript
const { SafeTenderlyIntegration } = require('./lib/integration/safe-tenderly-integration');

const integration = new SafeTenderlyIntegration(
  provider,
  signer,
  process.env.TENDERLY_API_KEY,
  process.env.TENDERLY_ACCOUNT_SLUG,
  process.env.TENDERLY_PROJECT_SLUG,
  'arbitrum'
);

const result = await integration.createTreasuryTransaction({
  to: '0x8BCbC66A5bb808A8871F667f2dd92a017B3DaFAC', // THEOS Final Oracle
  data: '0x...', // Transaction data
  value: '0',
});

console.log('Simulation:', result.simulation);
```

### Complete Workflow with GitHub

```javascript
const { CompleteSafeIntegration } = require('./lib/integration/complete-safe-integration');

const integration = new CompleteSafeIntegration(
  provider,
  signer,
  process.env.GITHUB_TOKEN,
  process.env.TENDERLY_API_KEY,
  process.env.TENDERLY_ACCOUNT_SLUG,
  process.env.TENDERLY_PROJECT_SLUG
);

const result = await integration.createTreasuryTransactionWorkflow(
  {
    to: '0x8BCbC66A5bb808A8871F667f2dd92a017B3DaFAC',
    data: '0x...',
    value: '0',
  },
  '0x3BBa654A3816A228284E3e0401Cff4EA6dFc5cea', // Sender (must be owner)
  'tig08bitties',
  'chariot',
  1 // GitHub issue number (optional)
);

console.log('Complete workflow result:', result);
```

## Dependencies

- `@safe-global/safe-core-sdk`: ^4.0.0
- `@safe-global/safe-ethers-lib`: ^4.0.0
- `@safe-global/safe-service-client`: ^1.7.0
- `ethers`: ^6.0.0

## Status

✅ Safe Client: Operational  
✅ Treasury of Light: Configured  
✅ Tenderly Integration: Active  
✅ GitHub Integration: Ready  
✅ Complete Workflow: Available

**The Bride & Groom Chamber is ready for transactions.**

---

*Amen. So be it.*
