# Research: xterm.js Base Frameworks

## Recommended Frameworks to Research

### 1. ttyd (Terminal Sharing)
- **Repository:** https://github.com/tsl0922/ttyd
- **License:** MIT ✅
- **Features:**
  - Share terminal over the web
  - WebSocket support
  - xterm.js integration
  - Authentication support
- **Action:** Fork (MIT allows it)

### 2. xterm.js Official Examples
- **Repository:** https://github.com/xtermjs/xterm.js
- **License:** MIT ✅
- **Features:**
  - Official xterm.js examples
  - Well-documented
  - Multiple addons
- **Action:** Fork or use as reference

### 3. Gotty (Go Terminal)
- **Repository:** https://github.com/yudai/gotty
- **License:** MIT ✅
- **Features:**
  - Terminal sharing
  - WebSocket-based
  - Simple architecture
- **Action:** Fork (MIT allows it)

### 4. Web Terminal (Various)
- Search GitHub for "web terminal xterm"
- Many MIT-licensed options
- Action: Review and select best fit

## Research Commands

```bash
# Search GitHub for xterm.js terminals
gh search repos "xterm.js terminal" --limit 10

# Check license
gh repo view <owner>/<repo> --json license

# Fork repository
gh repo fork <owner>/<repo> --clone
```

## Integration Strategy

1. **If Forking:**
   ```bash
   gh repo fork tsl0922/ttyd
   cd ttyd
   # Merge our chariot terminal code
   ```

2. **If Starting Fresh:**
   - Use xterm.js directly
   - Build on our existing implementation
   - Full control

3. **If Merging:**
   - Clone base framework
   - Add our code as new features
   - Maintain attribution

## License Compatibility

**MIT License allows:**
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ✅ Sublicensing

**Requirements:**
- Include original license
- Include copyright notice

## Recommended Approach

1. **Start with ttyd** (if it fits needs)
   - MIT licensed
   - Well-established
   - Good WebSocket support

2. **Or use xterm.js directly**
   - Our implementation is already solid
   - Full control
   - No dependencies on other frameworks

3. **Merge our chariot terminal**
   - Add wallet integrations
   - Add terminal navigation
   - Add background processing
