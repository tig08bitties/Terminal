#!/bin/bash

# =====================================================
# Eternal Covenant Terminal Stack Master Script
# Orchestrates: tn5250 + SUSE + DID + Hedera + ZKP + Covenant
# =====================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COVENANT_DIR="$SCRIPT_DIR/keys"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
}

warn() {
    echo -e "${YELLOW}[WARN] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "🏛️ Checking Eternal Covenant prerequisites..."

    # Check Covenant materials
    if [ ! -f "$COVENANT_DIR/master_key.txt" ]; then
        error "Master key not found. Run setup_cloud_shell.sh first."
        exit 1
    fi

    # Check tools
    command -v tn5250 >/dev/null 2>&1 || { error "tn5250 not installed."; exit 1; }
    command -v node >/dev/null 2>&1 || { error "Node.js not installed."; exit 1; }
    command -v openssl >/dev/null 2>&1 || { error "OpenSSL not installed."; exit 1; }

    log "✅ Prerequisites verified"
}

# Initialize Covenant
init_covenant() {
    log "🔑 Initializing Eternal Covenant..."

    # Decrypt covenant if needed
    if [ ! -f "$SCRIPT_DIR/covenant.jpg" ]; then
        openssl enc -d -aes-256-cbc -in "$COVENANT_DIR/encrypted_covenant.jpg" \
            -out "$SCRIPT_DIR/covenant.jpg" -kfile "$COVENANT_DIR/master_key.txt"
        log "✅ Covenant decrypted"
    fi

    # Verify signature
    if openssl dgst -sha256 -verify "$COVENANT_DIR/master_key.pub" \
        -signature "$COVENANT_DIR/covenant_declaration.sig" "$SCRIPT_DIR/covenant.jpg" >/dev/null 2>&1; then
        log "✅ Covenant signature verified"
    else
        error "Covenant signature verification failed"
        exit 1
    fi
}

# Setup Hedera connection
setup_hedera() {
    log "🔗 Setting up Hedera Consensus Service..."

    # Create Hedera config if not exists
    if [ ! -f "$SCRIPT_DIR/hedera_config.js" ]; then
        cat > "$SCRIPT_DIR/hedera_config.js" << 'EOF'
const { Client } = require('@hashgraph/sdk');

// Hedera Testnet Configuration
const client = Client.forTestnet();

// Replace with your account ID and private key
// const accountId = "0.0.XXXXX";
// const privateKey = "302e020100300506032b657004220420...";
// client.setOperator(accountId, privateKey);

module.exports = { client };
EOF
        warn "⚠️  Configure hedera_config.js with your account credentials"
    fi

    log "✅ Hedera configuration ready"
}

# Setup DID
setup_did() {
    log "🆔 Setting up Decentralized Identity..."

    # Create DID directory
    mkdir -p "$SCRIPT_DIR/did"

    # Create sample DID resolver
    if [ ! -f "$SCRIPT_DIR/did/resolver.js" ]; then
        cat > "$SCRIPT_DIR/did/resolver.js" << 'EOF'
const { Resolver } = require('did-resolver');
const { getResolver } = require('did-jwt');

// Configure resolvers for different DID methods
const resolver = new Resolver({
    ...getResolver(),
    // Add Hedera DID resolver when available
    hedera: async (did) => {
        // Implement Hedera DID resolution
        console.log('Resolving Hedera DID:', did);
        return null; // Placeholder
    }
});

async function resolveDID(did) {
    try {
        const doc = await resolver.resolve(did);
        return doc;
    } catch (error) {
        console.error('DID resolution failed:', error);
        return null;
    }
}

module.exports = { resolveDID };
EOF
        log "✅ DID resolver created"
    fi
}

# Setup ZKP
setup_zkp() {
    log "🔒 Setting up Zero-Knowledge Proofs..."

    # Create ZKP directory
    mkdir -p "$SCRIPT_DIR/zkp"

    # Create sample ZKP circuit
    if [ ! -f "$SCRIPT_DIR/zkp/circuit.circom" ]; then
        cat > "$SCRIPT_DIR/zkp/circuit.circom" << 'EOF'
// Sample ZKP circuit for credential verification
pragma circom 2.0.0;

template CredentialVerifier() {
    signal input secret;
    signal input hash;
    signal output verified;

    component hasher = Poseidon(1);
    hasher.inputs[0] <== secret;
    verified <== hasher.out === hash ? 1 : 0;
}

component main = CredentialVerifier();
EOF
        log "✅ Sample ZKP circuit created"
    fi
}

# Connect to tn5250
connect_tn5250() {
    local host="$1"
    local port="${2:-23}"

    if [ -z "$host" ]; then
        error "Host required for tn5250 connection"
        echo "Usage: $0 connect-tn5250 <host> [port]"
        exit 1
    fi

    log "🔌 Connecting to IBM i system at $host:$port"
    info "Use Ctrl+] to exit tn5250"

    # Verify Covenant before connection
    init_covenant

    # Launch tn5250
    tn5250 "$host:$port"
}

# Show menu
show_menu() {
    echo
    echo "🏛️  Eternal Covenant Terminal Stack"
    echo "=================================="
    echo
    echo "Available operations:"
    echo "  init          Initialize the full stack"
    echo "  covenant      Verify Covenant integrity"
    echo "  hedera        Setup Hedera connection"
    echo "  did           Setup DID resolver"
    echo "  zkp           Setup ZKP circuits"
    echo "  connect-tn5250 <host> [port]  Connect to IBM i system"
    echo "  launch-xterm  Launch graphical terminal"
    echo "  status        Show stack status"
    echo "  help          Show this menu"
    echo
}

# Show status
show_status() {
    echo
    echo "🏛️  Eternal Covenant Terminal Status"
    echo "=================================="
    echo

    # Covenant status
    if [ -f "$COVENANT_DIR/master_key.txt" ] && [ -f "$SCRIPT_DIR/covenant.jpg" ]; then
        echo -e "✅ Covenant: ${GREEN}Ready${NC}"
    else
        echo -e "❌ Covenant: ${RED}Not initialized${NC}"
    fi

    # Tool status
    command -v tn5250 >/dev/null 2>&1 && echo -e "✅ tn5250: ${GREEN}Installed${NC}" || echo -e "❌ tn5250: ${RED}Not installed${NC}"
    command -v node >/dev/null 2>&1 && echo -e "✅ Node.js: ${GREEN}Installed${NC}" || echo -e "❌ Node.js: ${RED}Not installed${NC}"
    command -v openssl >/dev/null 2>&1 && echo -e "✅ OpenSSL: ${GREEN}Installed${NC}" || echo -e "❌ OpenSSL: ${RED}Not installed${NC}"
    command -v snarkjs >/dev/null 2>&1 && echo -e "✅ snarkjs: ${GREEN}Installed${NC}" || echo -e "❌ snarkjs: ${RED}Not installed${NC}"

    # Config status
    [ -f "$SCRIPT_DIR/hedera_config.js" ] && echo -e "✅ Hedera: ${GREEN}Configured${NC}" || echo -e "⚠️  Hedera: ${YELLOW}Not configured${NC}"
    [ -d "$SCRIPT_DIR/did" ] && echo -e "✅ DID: ${GREEN}Configured${NC}" || echo -e "⚠️  DID: ${YELLOW}Not configured${NC}"
    [ -d "$SCRIPT_DIR/zkp" ] && echo -e "✅ ZKP: ${GREEN}Configured${NC}" || echo -e "⚠️  ZKP: ${YELLOW}Not configured${NC}"

    echo
}

# Main logic
case "${1:-help}" in
    init)
        check_prerequisites
        init_covenant
        setup_hedera
        setup_did
        setup_zkp
        log "🎉 Eternal Covenant Terminal Stack initialized!"
        ;;
    covenant)
        init_covenant
        ;;
    hedera)
        setup_hedera
        ;;
    did)
        setup_did
        ;;
    zkp)
        setup_zkp
        ;;
    connect-tn5250)
        connect_tn5250 "$2" "$3"
        ;;
    launch-xterm)
        if command -v xterm >/dev/null 2>&1; then
            ./launch_xterm.sh
        else
            error "xterm not installed. Run setup_cloud_shell.sh first."
        fi
        ;;
    status)
        show_status
        ;;
    help|--help|-h)
        show_menu
        ;;
    *)
        error "Unknown command: $1"
        show_menu
        exit 1
        ;;
esac