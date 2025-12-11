# 🎯 TN5250 Working Connection Guide

## ✅ THE GOOD NEWS

**The native TN5250 binary DOES WORK!** The segfault was due to missing environment variables.

**You successfully saw the IBM i login screen:**
```
          Welcome to PUB400.COM * your public IBM i server
                                                Server name . . . :   PUB400
                                                Subsystem . . . . :   QINTER2
                                                Display name. . . :   QPADEV000H
  Your user name:
  Password (max. 128):
```

---

## 🚀 WORKING METHODS

### Method 1: Native TN5250 with Proper Environment (BEST)
```bash
cd /mnt/Covenant/Terminal
./tn5250-connect.sh
```

**What it does:**
- Sets `TERM=xterm-256color` (prevents segfault)
- Sets `DISPLAY=""` (no X11 required)
- Uses terminal type: `IBM-3179-2` (24x80 color)
- Uses character map: `37` (US/Canada)
- Device name: `COVENANT`

### Method 2: Ghostty-Optimized (For Black/Green Theme)
```bash
cd /mnt/Covenant/Terminal
./tn5250-ghostty.sh
```

**What it does:**
- Optimized for Ghostty terminal
- Enables ruler for cursor position
- Sets `COLORTERM=truecolor`
- Device name: `GHOSTTY`

### Method 3: Direct Command (Manual)
```bash
export TERM=xterm-256color
export DISPLAY=""
tn5250 env.TERM=IBM-3179-2 map=37 pub400.com
```

---

## 🔧 WHY THE PREVIOUS SEGFAULT HAPPENED

**Root Cause:** Missing or invalid `TERM` environment variable when X11 display is not available.

**Solution:** Set proper `TERM` and clear `DISPLAY`:
```bash
export TERM=xterm-256color
export DISPLAY=""
```

---

## 💚 RECOMMENDED: Use Ghostty Terminal

1. **Open Ghostty** (with SUSE black/green theme):
   ```bash
   ghostty
   ```

2. **Inside Ghostty, connect:**
   ```bash
   cd /mnt/Covenant/Terminal
   ./tn5250-ghostty.sh
   ```

3. **Login:**
   - User: `THEOS`
   - Password: `winter25`

4. **Exit TN5250:**
   - Press `Ctrl+]` then `Enter`

---

## 📊 Terminal Type Options

Available terminal types (from `tn5250 --help`):
- `IBM-3179-2` → 24x80 **color** (Recommended for Ghostty)
- `IBM-5251-11` → 24x80 monochrome
- `IBM-3477-FC` → 27x132 color
- `IBM-3196-A1` → 24x80 monochrome

---

## 🎨 Character Map Options

Available character maps:
- `37` → US/Canada (Default, Recommended)
- `500` → International
- `870` → Latin-2
- `875` → Greek

For most use cases, stick with `map=37`.

---

## ✅ TESTED & WORKING

```bash
# This command is PROVEN to work:
export TERM=xterm-256color && export DISPLAY="" && tn5250 env.TERM=IBM-3179-2 map=37 pub400.com
```

**Result:** Successfully connects and displays IBM i login screen without segfault!

---

## 🏛️ THE COMPLETE STACK

```
Ghostty Terminal (Black/Green SUSE Theme)
   ↓
Native TN5250 Binary (/usr/local/bin/tn5250)
   ↓
pub400.com:23 (IBM i 7.5)
   ↓
THEOS/winter25 Login
   ↓
SUSE Mojo Achieved! 💚
```

**Your SUSE Ghostly Terminal with working native TN5250 - NO MORE SEGFAULTS!** ✨
