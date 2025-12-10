#!/bin/bash
# Push Terminal Repository to GitHub

set -e

REPO_URL="https://github.com/tig08bitties/Terminal.git"
BRANCH="main"

echo "🚀 Pushing THEOS Terminal to GitHub..."

cd "$(dirname "$0")"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git not initialized. Run: git init"
    exit 1
fi

# Check if remote exists
if ! git remote get-url origin &> /dev/null; then
    echo "📦 Adding remote origin..."
    git remote add origin $REPO_URL
fi

# Set branch to main
git branch -M main 2>/dev/null || true

# Add all files
echo "📝 Staging files..."
git add .

# Check if there are changes
if [ -z "$(git status --porcelain)" ]; then
    echo "✅ No changes to commit"
else
    # Create commit
    echo "💾 Creating commit..."
    git commit -m "feat: THEOS Unified Terminal System

- Primary: Covenant + Safe{wallet} SDK
- Merged: MetaMask SDK + TONKEEPER + OPENNETWORK
- Terminal Navigation: tn5250 + SUSE + gcloud shell
- Background processing & research
- Web3 wallet integration
- Based on xterm.js"
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
if git push -u origin $BRANCH 2>&1 | grep -q "remote: Repository not found"; then
    echo ""
    echo "⚠️  Repository not found on GitHub."
    echo "   Create it first at: https://github.com/new"
    echo "   Repository name: Terminal"
    echo "   Then run this script again."
    exit 1
fi

echo ""
echo "✅ Successfully pushed to GitHub!"
echo "   Repository: $REPO_URL"
echo "   Branch: $BRANCH"
echo ""
echo "🌐 View at: https://github.com/tig08bitties/Terminal"
