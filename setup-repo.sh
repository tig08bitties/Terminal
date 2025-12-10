#!/bin/bash
# Setup Terminal Repository for GitHub
# Based on xterm.js framework with merged chariot terminal

set -e

echo "🚀 Setting up THEOS Terminal Repository..."

# Check if gh CLI is available
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI found"
    
    # Check if repo exists
    if gh repo view tig08bitties/Terminal &> /dev/null; then
        echo "📦 Repository exists, cloning..."
        cd /mnt/Covenant/Theos
        if [ -d "Terminal" ]; then
            cd Terminal
            git remote set-url origin https://github.com/tig08bitties/Terminal.git
            git pull origin main || git pull origin master
        else
            git clone https://github.com/tig08bitties/Terminal.git
            cd Terminal
        fi
    else
        echo "📦 Creating new repository..."
        gh repo create tig08bitties/Terminal --public --description "THEOS Unified Terminal System - Web3 Wallet Integration" --clone=false
        
        cd /mnt/Covenant/Theos/Terminal
        git remote add origin https://github.com/tig08bitties/Terminal.git || true
    fi
else
    echo "⚠️  GitHub CLI not found. Manual setup required:"
    echo "   1. Create repo at: https://github.com/tig08bitties/Terminal"
    echo "   2. Run: git remote add origin https://github.com/tig08bitties/Terminal.git"
fi

# Initialize git if not already
if [ ! -d ".git" ]; then
    git init
    git branch -M main
fi

# Add all files
git add .

# Create initial commit
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ Repository is clean"
else
    git commit -m "Initial commit: THEOS Unified Terminal System

- Covenant + Safe{wallet} (Primary)
- MetaMask SDK + TONKEEPER + OPENNETWORK (Merged)
- Terminal Navigation (tn5250 + SUSE + gcloud)
- Background processing
- Research & learning integration"
fi

echo ""
echo "✅ Repository setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Research xterm.js base frameworks:"
echo "      - ttyd: https://github.com/tsl0922/ttyd (MIT)"
echo "      - xterm.js: https://github.com/xtermjs/xterm.js (MIT)"
echo ""
echo "   2. Fork or merge base framework:"
echo "      gh repo fork <original-repo>"
echo ""
echo "   3. Push to GitHub:"
echo "      git push -u origin main"
echo ""
