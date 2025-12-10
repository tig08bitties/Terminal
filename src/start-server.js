#!/usr/bin/env node
/**
 * Start Unified Terminal Server
 */

const { UnifiedTerminalServer } = require('./unified-terminal-server');
const { ethers } = require('ethers');
const config = require('../../config/production');

// Configuration
const PORT = process.env.PORT || 8080;
const RPC_URL = process.env.RPC_URL || 'https://arb1.arbitrum.io/rpc';
const NETWORK = process.env.NETWORK || 'arbitrum';

// Initialize provider
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Create and start server
const server = new UnifiedTerminalServer({
  port: PORT,
  provider,
  network: NETWORK
});

server.start().catch(console.error);
