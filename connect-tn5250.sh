#!/bin/bash
# =====================================================
# TN5250 Connection Script for pub400.com
# SUSE Ghostly Terminal - IBM i Access
# =====================================================

echo "🔌 Connecting to pub400.com via TN5250..."
echo "👤 User: THEOS"
echo "🔐 Port: 993"
echo ""

# Connect to pub400.com
# Note: tn5250 will prompt for password
tn5250 pub400.com:993

echo ""
echo "🔌 Disconnected from pub400.com"
