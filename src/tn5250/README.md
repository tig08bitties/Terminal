# tn5250 Integration

This directory contains tn5250 resources for THEOS Terminal System.

## Files

- `tn5250_connect.sh` - Connection script for pub400.com
- `tn5250-0.17.4.tar.gz` - Source archive (if included) or reference to `/mnt/Covenant/Archive/`

## Installation

tn5250 should be installed system-wide. Check with:

```bash
which tn5250
```

If not installed, you can build from source:

```bash
cd /tmp
tar -xzf /mnt/Covenant/Archive/tn5250-0.17.4.tar.gz
cd tn5250-0.17.4
./configure
make
sudo make install
```

## Usage

### Direct Connection

```bash
tn5250 pub400.com
```

### Using Connection Script

```bash
./tn5250_connect.sh pub400.com
```

### Via Chariot Agent

```javascript
const { ChariotAgent } = require('../chariot-agent/chariot-agent');

const agent = new ChariotAgent({
  tn5250Config: {
    host: 'pub400.com',
    user: 'THEOS',
    password: 'winter25'
  }
});

await agent.initialize();
await agent.connectTN5250({ useXterm: true });
```

## Default Configuration

- **Host:** `pub400.com`
- **User:** `THEOS`
- **Password:** `winter25`
- **Port:** `23` (default telnet)

## Integration

tn5250 is integrated into the Chariot Agent for terminal navigation within the Unified Terminal System. It can be launched in an xterm window for GUI interaction.
