#!/bin/bash
# Web Terminal Deployment Script

set -e

echo "🚀 Deploying THEOS Web Terminal..."

# Configuration
PORT=${PORT:-8080}
RPC_URL=${RPC_URL:-https://arb1.arbitrum.io/rpc}
NETWORK=${NETWORK:-arbitrum}

# Check if running in Docker
if [ -f /.dockerenv ]; then
    echo "📦 Running in Docker container"
    cd /app/lib/web-terminal
    exec node web-terminal-server.js
fi

# Check if PM2 is available
if command -v pm2 &> /dev/null; then
    echo "📦 Deploying with PM2..."
    pm2 start lib/web-terminal/web-terminal-server.js \
        --name "theos-web-terminal" \
        --env PORT=$PORT \
        --env RPC_URL=$RPC_URL \
        --env NETWORK=$NETWORK \
        --log-date-format "YYYY-MM-DD HH:mm:ss Z"
    pm2 save
    echo "✅ Deployed with PM2"
    echo "   View logs: pm2 logs theos-web-terminal"
    echo "   Stop: pm2 stop theos-web-terminal"
    exit 0
fi

# Check if systemd is available
if command -v systemctl &> /dev/null && [ "$EUID" -eq 0 ]; then
    echo "📦 Creating systemd service..."
    cat > /etc/systemd/system/theos-web-terminal.service <<EOF
[Unit]
Description=THEOS Web Terminal
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
Environment="PORT=$PORT"
Environment="RPC_URL=$RPC_URL"
Environment="NETWORK=$NETWORK"
ExecStart=$(which node) lib/web-terminal/web-terminal-server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    systemctl daemon-reload
    systemctl enable theos-web-terminal
    systemctl start theos-web-terminal
    echo "✅ Deployed as systemd service"
    echo "   Status: systemctl status theos-web-terminal"
    echo "   Logs: journalctl -u theos-web-terminal -f"
    exit 0
fi

# Fallback: direct execution
echo "📦 Starting directly..."
cd "$(dirname "$0")/../.."
PORT=$PORT RPC_URL=$RPC_URL NETWORK=$NETWORK node lib/web-terminal/web-terminal-server.js
