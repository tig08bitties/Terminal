#!/bin/bash
# =====================================================
# TN5250 Native Connection Script
# Properly configured for pub400.com
# =====================================================

echo "🌑 SUSE Ghostly Terminal - TN5250 Connection"
echo "═══════════════════════════════════════════════════"
echo ""
echo "🔌 Connecting to pub400.com..."
echo "👤 User: THEOS"
echo "🔐 Password: winter25"
echo ""
echo "💡 Press Ctrl+] then Enter to exit"
echo ""

# Set proper environment variables to prevent segfault
export TERM=xterm-256color
export DISPLAY=""
export ESCDELAY=100

# Connect with proper terminal type and character map
tn5250 env.TERM=IBM-3179-2 map=37 env.DEVNAME=COVENANT pub400.com

echo ""
echo "🔌 Disconnected from pub400.com"
