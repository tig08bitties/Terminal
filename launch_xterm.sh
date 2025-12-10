#!/bin/bash

# =====================================================
# Launch Eternal Covenant X Terminal
# =====================================================

# Load X resources
xrdb -merge ~/.Xresources

# Set display (for Cloud Shell, may need X11 forwarding)
export DISPLAY=:0

# Launch xterm with Covenant branding
xterm -title "🏛️ Eternal Covenant Terminal" \
      -bg "#1a1a1a" \
      -fg "#ffffff" \
      -fa "Monospace" \
      -fs 12 \
      -geometry 120x30 \
      -sb \
      -rightbar \
      -sl 10000 \
      -e "echo '🏛️ Welcome to Eternal Covenant Terminal'; echo 'Available commands:'; echo '- tn5250: IBM i terminal access'; echo '- node hedera.js: Hedera operations'; echo '- snarkjs: ZKP proofs'; echo '- openssl: Covenant crypto'; echo ''; bash"