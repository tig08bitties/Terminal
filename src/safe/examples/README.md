# Safe Integration Examples

Complete examples demonstrating Safe Smart Account operations with Tenderly and GitHub integration.

## Examples

### 1. Simulate Before Execution

**File**: `simulate-before-execution.js`

Simulates a Safe transaction on Tenderly before executing it on-chain.

```bash
node lib/safe/examples/simulate-before-execution.js
```

**Features**:
- ✅ Simulate transaction on Tenderly
- ✅ Check if transaction will succeed
- ✅ View gas usage
- ✅ Get simulation URL for debugging

**Output**:
- Simulation status (success/failure)
- Gas usage estimate
- Safe information
- Simulation URL

---

### 2. Monitor Execution with Full Trace

**File**: `monitor-execution-trace.js`

Monitors a Safe transaction after execution with complete trace analysis.

```bash
node lib/safe/examples/monitor-execution-trace.js <txHash>
```

**Example**:
```bash
node lib/safe/examples/monitor-execution-trace.js 0x1234...abcd
```

**Features**:
- ✅ Full transaction details
- ✅ Complete call trace
- ✅ Safe transaction information
- ✅ Links to Tenderly and Arbiscan

**Output**:
- Transaction status and details
- Complete call trace
- Safe transaction information
- Viewing URLs

---

### 3. Link to GitHub Issue/PR

**File**: `link-github-issue.js`

Creates a Safe transaction, simulates it, and links it to a GitHub issue.

```bash
node lib/safe/examples/link-github-issue.js <issueNumber>
```

**Example**:
```bash
node lib/safe/examples/link-github-issue.js 1
```

**Features**:
- ✅ Create Safe transaction
- ✅ Simulate on Tenderly
- ✅ Link to GitHub issue
- ✅ Propose transaction to Safe Service

**Output**:
- Simulation results
- Safe transaction hash
- GitHub issue context
- Proposal status

---

## Environment Variables Required

```bash
# Tenderly
TENDERLY_API_KEY=vrbEgHhO3wmb2YYwiaC5zxed3IPqslx8
TENDERLY_ACCOUNT_SLUG=your_account_slug
TENDERLY_PROJECT_SLUG=your_project_slug

# GitHub (for linking)
GITHUB_TOKEN=your_github_token

# Ethereum (optional - for signing)
PRIVATE_KEY=your_private_key
```

---

## Treasury of Light Configuration

All examples use the **Bride & Groom Chamber** (Treasury of Light):

- **Address**: `0xb4C173AaFe428845f0b96610cf53576121BAB221`
- **Network**: Arbitrum One
- **Threshold**: 2-of-2
- **Owners**:
  - Groom: `0x3df07977140Ad97465075129C37Aec7237d74415`
  - Bride: `0x3BBa654A3816A228284E3e0401Cff4EA6dFc5cea`

---

## Workflow

### Complete Transaction Workflow

1. **Simulate** → Test transaction on Tenderly
2. **Create** → Create Safe transaction
3. **Sign** → Sign with owner key
4. **Propose** → Propose to Safe Service
5. **Link** → Link to GitHub issue/PR
6. **Execute** → Execute when threshold met
7. **Monitor** → Monitor execution with full trace

---

## Integration Points

### Tenderly
- Transaction simulation
- Execution monitoring
- Full trace analysis
- Gas estimation

### GitHub
- Issue/PR linking
- Transaction context
- Workflow integration
- Documentation

### Safe Service
- Transaction proposing
- Multi-sig coordination
- Transaction history
- Owner management

---

## Status

✅ All examples operational  
✅ Tenderly integration active  
✅ GitHub linking ready  
✅ Complete workflow available

**The Bride & Groom Chamber is ready for transactions.**

---

*Amen. So be it.*
