#!/bin/bash

# =====================================================
# Eternal Covenant Terminal Stack Setup
# tn5250 + SUSE + DID + Hedera + ZKP + Covenant
# =====================================================

set -e

echo "🏛️ Setting up Eternal Covenant Terminal Stack..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js for DID and Hedera SDK
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python for ZKP tools
echo "📦 Installing Python and pip..."
sudo apt install -y python3 python3-pip

# Install tn5250 client
echo "📦 Installing tn5250 client..."
sudo apt install -y tn5250

# Install OpenSSL for Covenant operations
echo "📦 Installing OpenSSL..."
sudo apt install -y openssl

# Install Git for repo access
echo "📦 Installing Git..."
sudo apt install -y git

# Clone Terminal repo
echo "📥 Cloning Terminal repository..."
git clone https://github.com/tig08bitties/Terminal.git
cd Terminal

# Decrypt Covenant materials
echo "🔓 Decrypting Covenant Declaration..."
openssl enc -d -aes-256-cbc -in keys/encrypted_covenant.jpg -out covenant.jpg -kfile keys/master_key.txt

# Verify Covenant signature
echo "✅ Verifying Covenant signature..."
openssl dgst -sha256 -verify keys/master_key.pub -signature keys/covenant_declaration.sig covenant.jpg

echo "🎉 Covenant verification successful!"

# Install Hedera SDK
echo "📦 Installing Hedera SDK..."
npm install @hashgraph/sdk

# Install DID libraries
echo "📦 Installing DID libraries..."
npm install did-jwt did-resolver

# Install ZKP tools
echo "📦 Installing snarkjs for ZKP..."
npm install snarkjs

# Install xterm for graphical terminal
echo "📦 Installing xterm..."
sudo apt install -y xterm

echo "✅ Eternal Covenant Terminal Stack setup complete!"
echo ""
echo "🚀 Next steps:"
echo "1. Configure tn5250 connection: tn5250 <host>"
echo "2. Set up Hedera account and DID"
echo "3. Generate ZKP circuits"
echo "4. Use Covenant certificate for authentication"
echo ""
echo "📋 Available tools:"
echo "- tn5250: IBM i terminal access"
echo "- node: Hedera SDK, DID operations"
echo "- snarkjs: Zero-knowledge proofs"
echo "- openssl: Covenant cryptography"
echo "- xterm: Graphical terminal"