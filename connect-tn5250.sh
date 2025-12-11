#!/bin/bash
# =====================================================
# TN5250 Connection Script for pub400.com
# SUSE Ghostly Terminal - IBM i Access
# =====================================================

echo "🔌 Connecting to pub400.com via TN5250..."
echo "👤 User: THEOS"
echo "🔐 Password: winter25"
echo "🔌 Port: 23 (telnet)"
echo ""

# Connect to pub400.com on port 23
tn5250 pub400.com

echo ""
echo "🔌 Disconnected from pub400.com"
