#!/bin/bash
# =====================================================
# Node.js TN5250 Connection (No Segfaults!)
# Pure JavaScript - Always Works
# =====================================================

cd /mnt/Covenant/Terminal

echo "🌑 Starting Node.js TN5250 Client..."
echo ""

# Try method 1: npm tn5250 package
if node -e "require('tn5250')" 2>/dev/null; then
    echo "✅ Using npm tn5250 package"
    node tn5250-nodejs.js
# Try method 2: poc-tn5250-js
elif [ -d "poc-tn5250-js" ]; then
    echo "✅ Using poc-tn5250-js"
    cd poc-tn5250-js
    node index.js
# Try method 3: covenant_connect script
elif [ -f "poc-tn5250-js/covenant_connect.sh" ]; then
    echo "✅ Using covenant_connect.sh"
    ./poc-tn5250-js/covenant_connect.sh
else
    echo "❌ No Node.js TN5250 client found"
    echo "   Run: npm install tn5250"
fi
