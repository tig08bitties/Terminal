# Chariot Agent - Terminal-based Agent

Terminal-based agent using xterm, gcloud, and tn5250 for autonomous operations.

## Features

- **xterm Integration** - Terminal emulation for command execution
- **gcloud Support** - Google Cloud Platform operations
- **tn5250 Support** - IBM i (AS/400) connectivity via 5250 terminal emulation (defaults to xterm)
- **SUSE Linux Integration** - zypper package management and SUSE system commands
- **Session Management** - Track and manage active terminal sessions

## Configuration

### Environment Variables

```bash
# Google Cloud
GOOGLE_CLOUD_PROJECT=your-project-id

# TN5250 (IBM i / AS/400)
TN5250_HOST=pub400.com
TN5250_USER=THEOS
TN5250_PASSWORD=winter25
```

### Default Configuration

The agent is pre-configured with:
- **TN5250 Host:** `pub400.com`
- **TN5250 User:** `THEOS`
- **TN5250 Password:** `winter25`

## Usage

### Direct Usage

```javascript
const { ChariotAgent } = require('./lib/chariot-agent/chariot-agent');

const agent = new ChariotAgent({
  gcloudProject: process.env.GOOGLE_CLOUD_PROJECT,
  tn5250Config: {
    host: 'pub400.com',
    user: 'THEOS',
    password: 'winter25'
  }
});

// Initialize
await agent.initialize();

// Execute gcloud command in xterm
await agent.executeGCloud('compute instances list', {
  useXterm: true
});

// Connect to IBM i via tn5250 (defaults to xterm if available)
await agent.connectTN5250({
  useXterm: true
});

// Launch xterm with tn5250 (convenience method)
await agent.launchTN5250InXterm();

// SUSE package management
await agent.suseInstall('nodejs npm', { useXterm: true });
await agent.suseUpdate({ useXterm: true });
await agent.suseSearch('python', { useXterm: true });

// Execute custom command in xterm
await agent.executeInXterm('ls -la', {
  env: { CUSTOM_VAR: 'value' }
});
```

### Via API Cycler

```javascript
const { APICycler } = require('./lib/api-cycler/api-cycler');

const cycler = new APICycler({
  chariotAgentOptions: {
    gcloudProject: process.env.GOOGLE_CLOUD_PROJECT,
    tn5250Config: {
      host: 'pub400.com',
      user: 'THEOS',
      password: 'winter25'
    }
  }
});

// Execute gcloud command
const result = await cycler.execute({
  type: 'chariot-gcloud',
  command: 'compute instances list',
  options: { useXterm: true }
}, {
  serviceType: 'agent'
});

// Connect to IBM i (launches in xterm by default)
const connection = await cycler.execute({
  type: 'chariot-tn5250-launch'
}, {
  serviceType: 'agent'
});

// Or use standard tn5250 connection
const connection2 = await cycler.execute({
  type: 'chariot-tn5250',
  options: { useXterm: true }
}, {
  serviceType: 'agent'
});

// Get agent status
const status = await cycler.execute({
  type: 'chariot-status'
}, {
  serviceType: 'agent'
});
```

## Available Operations

### `chariot-gcloud`
Execute gcloud command (optionally in xterm window).

**Parameters:**
- `command` (string): gcloud command (without 'gcloud' prefix)
- `options.useXterm` (boolean): Launch in xterm window (default: false)

**Example:**
```javascript
await cycler.execute({
  type: 'chariot-gcloud',
  command: 'compute instances list --zone=us-central1-a',
  options: { useXterm: true }
});
```

### `chariot-tn5250`
Connect to IBM i (AS/400) via tn5250.

**Parameters:**
- `options.useXterm` (boolean): Launch in xterm window (default: false)
- `options.host` (string): Override default host
- `options.user` (string): Override default user
- `options.password` (string): Override default password

**Example:**
```javascript
await cycler.execute({
  type: 'chariot-tn5250',
  options: {
    useXterm: true,
    host: 'pub400.com',
    user: 'THEOS',
    password: 'winter25'
  }
});
```

### `chariot-xterm`
Execute arbitrary command in xterm window.

**Parameters:**
- `command` (string): Command to execute
- `options.env` (object): Environment variables

**Example:**
```javascript
await cycler.execute({
  type: 'chariot-xterm',
  command: 'ls -la /mnt/Covenant/Theos',
  options: { env: { CUSTOM_VAR: 'value' } }
});
```

### `chariot-tn5250-launch`
Launch xterm with tn5250 connection (convenience method).

**Parameters:**
- `options.useXterm` (boolean): Launch in xterm window (default: true)
- `options.host` (string): Override default host
- `options.user` (string): Override default user
- `options.password` (string): Override default password

**Example:**
```javascript
await cycler.execute({
  type: 'chariot-tn5250-launch'
}, {
  serviceType: 'agent'
});
```

### `chariot-status`
Get agent status and capabilities.

**Example:**
```javascript
const status = await cycler.execute({
  type: 'chariot-status'
});
```

### SUSE Operations

#### `suse-zypper`
Execute zypper command.

**Parameters:**
- `command` (string): zypper command (without 'zypper' prefix)
- `options.useXterm` (boolean): Launch in xterm window (default: true)

**Example:**
```javascript
await cycler.execute({
  type: 'suse-zypper',
  command: 'install -y nodejs',
  options: { useXterm: true }
}, {
  serviceType: 'agent'
});
```

#### `suse-install`
Install SUSE packages.

**Parameters:**
- `packages` (string|array): Package name(s) to install
- `options.useXterm` (boolean): Launch in xterm window (default: true)

**Example:**
```javascript
await cycler.execute({
  type: 'suse-install',
  packages: ['nodejs', 'npm'],
  options: { useXterm: true }
}, {
  serviceType: 'agent'
});
```

#### `suse-update`
Update SUSE system packages.

**Parameters:**
- `options.useXterm` (boolean): Launch in xterm window (default: true)

**Example:**
```javascript
await cycler.execute({
  type: 'suse-update',
  options: { useXterm: true }
}, {
  serviceType: 'agent'
});
```

#### `suse-search`
Search SUSE packages.

**Parameters:**
- `query` (string): Search query
- `options.useXterm` (boolean): Launch in xterm window (default: true)

**Example:**
```javascript
await cycler.execute({
  type: 'suse-search',
  query: 'python',
  options: { useXterm: true }
}, {
  serviceType: 'agent'
});
```

#### `suse-remove`
Remove SUSE packages.

**Parameters:**
- `packages` (string|array): Package name(s) to remove
- `options.useXterm` (boolean): Launch in xterm window (default: true)

**Example:**
```javascript
await cycler.execute({
  type: 'suse-remove',
  packages: ['old-package'],
  options: { useXterm: true }
}, {
  serviceType: 'agent'
});
```

#### `suse-refresh`
Refresh SUSE repositories.

**Parameters:**
- `options.useXterm` (boolean): Launch in xterm window (default: true)

**Example:**
```javascript
await cycler.execute({
  type: 'suse-refresh',
  options: { useXterm: true }
}, {
  serviceType: 'agent'
});
```

#### `suse-list-installed`
List installed packages.

**Parameters:**
- `options.useXterm` (boolean): Launch in xterm window (default: true)

**Example:**
```javascript
await cycler.execute({
  type: 'suse-list-installed',
  options: { useXterm: true }
}, {
  serviceType: 'agent'
});
```

#### `suse-command`
Execute custom SUSE system command.

**Parameters:**
- `command` (string): Command to execute
- `options.useXterm` (boolean): Launch in xterm window (default: true)
- `options.env` (object): Environment variables

**Example:**
```javascript
await cycler.execute({
  type: 'suse-command',
  command: 'cat /etc/os-release | grep -i suse',
  options: { useXterm: true }
}, {
  serviceType: 'agent'
});
```

## Session Management

```javascript
// Get active sessions
const sessions = agent.getActiveSessions();
console.log('Active sessions:', sessions);

// Close specific session
agent.closeSession('session-id');

// Close all sessions
agent.closeAllSessions();
```

## Requirements

### xterm
Terminal emulator for X Window System.

**Installation:**
```bash
# Ubuntu/Debian
sudo apt-get install xterm

# macOS
brew install xterm

# Or use system package manager
```

### gcloud
Google Cloud SDK.

**Installation:**
```bash
# Follow: https://cloud.google.com/sdk/docs/install
```

### tn5250
5250 terminal emulator for IBM i (AS/400).

**Installation:**
```bash
# Ubuntu/Debian
sudo apt-get install tn5250

# macOS
brew install tn5250

# SUSE/openSUSE
sudo zypper install tn5250

# Or use system package manager
```

### SUSE/zypper
SUSE Linux package manager (zypper).

**Note:** SUSE integration is automatically detected if zypper is available on the system.

**Installation:**
```bash
# SUSE/openSUSE - zypper is included by default
# Verify installation:
zypper --version
```

## Files

- `chariot-agent.js` - Main chariot agent implementation
- `README.md` - This file

## License

MIT
