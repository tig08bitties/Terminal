# 🚀 Quick Start Guide - SUSE Ghostly Terminal

## 🔌 Connect to IBM i (TN5250)

### Method 1: Simple Connection (Recommended)
```bash
tn5250 pub400.com
```
- Host: pub400.com
- Port: 23 (auto-detected)
- User: THEOS
- Password: winter25

### Method 2: Using Script
```bash
cd /mnt/Covenant/Terminal
./connect-tn5250.sh
```

### Method 3: Explicit Port
```bash
tn5250 pub400.com:23
```

---

## 🌐 Web Interface (WebRTC + Covenant)

### Start the Web GUI:
```bash
cd /mnt/Covenant/Terminal/ghostly-terminal
npm install  # First time only
npm run web  # Web interface on port 3000
```

Then open: http://localhost:3000

---

## 🖥️ TUI Interface (Blessed.js)

### Start the Terminal UI:
```bash
cd /mnt/Covenant/Terminal/ghostly-terminal
npm start
```

---

## 🌑 Ghostty Terminal (SUSE Black/Green)

### Open Ghostty:
```bash
ghostty
```

Ghostty is configured with:
- Background: #000000 (Pure Black)
- Foreground: #00FF00 (Matrix Green)
- Font: Monospace 13px
- Size: 125x30
- GPU Rendering: Enabled

Config: `~/.config/ghostty/config`

---

## 🔧 Troubleshooting

### TN5250 Connection Refused
- **Cause**: Wrong port (993 is HTTPS, not telnet)
- **Fix**: Use port 23 or no port (auto-detects)
- **Command**: `tn5250 pub400.com`

### npm start Error
- **Cause**: Wrong directory
- **Fix**: Must be in `ghostly-terminal/` subdirectory
- **Command**: `cd ghostly-terminal && npm start`

### Ghostty Warnings
- GTK warnings are normal and can be ignored
- Terminal functionality is not affected

---

## 🎯 Complete Stack Test

1. **Open Ghostty** (SUSE black/green theme):
   ```bash
   ghostty
   ```

2. **Inside Ghostty, connect to IBM i**:
   ```bash
   tn5250 pub400.com
   ```
   Login: THEOS / winter25

3. **In another terminal, start Web GUI**:
   ```bash
   cd /mnt/Covenant/Terminal/ghostly-terminal
   npm run web
   ```
   Open: http://localhost:3000

---

## 💚 SUSE Mojo Achieved!

**Ghostty Terminal** → **TN5250** → **pub400.com** → **SUSE Black/Green** ✨
