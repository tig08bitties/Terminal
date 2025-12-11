#!/usr/bin/env node
// =====================================================
// Node.js TN5250 Client for pub400.com
// SUSE Ghostly Terminal - No Segfaults!
// Uses pure JavaScript implementation
// =====================================================

const net = require('net');
const readline = require('readline');

// Connection settings
const HOST = 'pub400.com';
const PORT = 23;
const USER = 'THEOS';
const PASSWORD = 'winter25';

console.log('🌑 SUSE Ghostly Terminal - TN5250 Node.js Client');
console.log('═══════════════════════════════════════════════════\n');
console.log(`🔌 Connecting to ${HOST}:${PORT}...`);
console.log(`👤 User: ${USER}`);
console.log(`🔐 Password: ${PASSWORD}\n`);

// Try to use the installed tn5250 package
try {
  const TN5250 = require('tn5250');
  
  const client = new TN5250({
    host: HOST,
    port: PORT,
    deviceName: 'IBM-5251-11'
  });

  client.on('connect', () => {
    console.log('✅ Connected to pub400.com!\n');
    console.log('📺 IBM i 7.5 Welcome Screen\n');
  });

  client.on('data', (data) => {
    process.stdout.write(data.toString());
  });

  client.on('screen', (screen) => {
    console.log('📺 Screen update received');
  });

  client.on('error', (err) => {
    console.error('❌ Error:', err.message);
  });

  client.on('close', () => {
    console.log('\n🔌 Disconnected from pub400.com');
    process.exit(0);
  });

  client.connect();

  // Handle input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('line', (input) => {
    client.write(input + '\n');
  });

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n\n👋 Closing connection...');
    client.disconnect();
    rl.close();
  });

} catch (err) {
  console.log('⚠️  npm tn5250 package not available');
  console.log('   Falling back to raw telnet connection...\n');
  
  // Fallback: raw telnet connection
  const client = net.createConnection({ host: HOST, port: PORT }, () => {
    console.log('✅ Connected to pub400.com (raw telnet)!\n');
  });

  client.on('data', (data) => {
    process.stdout.write(data.toString());
  });

  client.on('error', (err) => {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
  });

  client.on('end', () => {
    console.log('\n🔌 Disconnected from pub400.com');
    process.exit(0);
  });

  // Handle input
  process.stdin.on('data', (data) => {
    client.write(data);
  });

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n\n👋 Closing connection...');
    client.end();
    process.exit(0);
  });

  // Enable raw mode for better terminal handling
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
}
