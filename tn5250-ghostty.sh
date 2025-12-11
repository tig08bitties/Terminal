#!/bin/bash
# =====================================================
# TN5250 for Ghostty Terminal
# Optimized for SUSE Black/Green theme
# =====================================================

echo "🌑 Ghostty Terminal - TN5250 for IBM i"
echo "═══════════════════════════════════════════════════"
echo ""
echo "🔌 Connecting to pub400.com..."
echo "💚 SUSE Black/Green Mojo Enabled"
echo ""

# Ghostty-specific settings
export TERM=xterm-256color
export COLORTERM=truecolor
export DISPLAY=""

# TN5250 settings for best Ghostty experience
tn5250 \
  env.TERM=IBM-3179-2 \
  map=37 \
  env.DEVNAME=GHOSTTY \
  +ruler \
  pub400.com

echo ""
echo "🔌 Session ended"
