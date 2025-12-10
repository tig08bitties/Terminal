#!/usr/bin/env node
/**
 * Start Web Terminal Server
 */

const { WebTerminalServer } = require('./web-terminal-server');
const { ethers } = require('ethers');
const config = require('../../config/production');

// Configuration
const PORT = process.env.PORT || 3000;
const RPC_URL = process.env.RPC_URL || 'https://arb1.arbitrum.io/rpc';
const NETWORK = process.env.NETWORK || 'arbitrum';

// Initialize provider
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Create and start server
const server = new WebTerminalServer({
  port: PORT,
  provider,
  network: NETWORK,
  braveApiKey: config.apiKeys.brave || process.env.BRAVE_API_KEY
});

server.start();
