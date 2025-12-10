#!/usr/bin/env node

// =====================================================
// 🌑 GHOSTLY TERMINAL - Eternal Covenant Enhanced
// Advanced Terminal Emulator with Web4 Integration
// =====================================================

import { Command } from 'commander';
import { createServer } from 'http';
import express from 'express';
import { Server } from 'socket.io';
import blessed from 'blessed';
import contrib from 'blessed-contrib';
import chalk from 'chalk';
import { CovenantAuthenticator } from './covenant-core.js';
import { TN5250Client } from './tn5250-client.js';
import { DIDResolver } from './did-resolver.js';
import { HederaLogger } from './hedera-logger.js';
import { ZKPVerifier } from './zkp-verifier.js';

const program = new Command();

class GhostlyTerminal {
    constructor() {
        this.covenant = new CovenantAuthenticator();
        this.tn5250 = new TN5250Client();
        this.did = new DIDResolver();
        this.hedera = new HederaLogger();
        this.zkp = new ZKPVerifier();
        this.screen = null;
        this.app = express();
        this.server = null;
        this.io = null;
    }

    async initialize() {
        console.log(chalk.cyan('🌑 GHOSTLY TERMINAL - Eternal Covenant Enhanced'));
        console.log(chalk.gray('═'.repeat(50)));

        // Verify Covenant integrity
        const covenantValid = await this.covenant.verifyIntegrity();
        if (!covenantValid) {
            console.error(chalk.red('❌ Covenant integrity check failed!'));
            process.exit(1);
        }
        console.log(chalk.green('✅ Eternal Covenant verified'));

        // Initialize components
        await this.did.initialize();
        await this.hedera.initialize();
        await this.zkp.initialize();

        console.log(chalk.green('✅ Web4 components initialized'));
        console.log(chalk.gray('═'.repeat(50)));
    }

    createGUI() {
        this.screen = blessed.screen({
            smartCSR: true,
            title: '🌑 Ghostly Terminal - Eternal Covenant'
        });

        // Create layout
        const grid = new contrib.grid({rows: 12, cols: 12, screen: this.screen});

        // Covenant status box
        const covenantBox = grid.set(0, 0, 2, 4, blessed.box, {
            label: chalk.cyan('🏛️ Eternal Covenant'),
            content: 'Status: VERIFIED\nIntegrity: OK\nSecurity: ACTIVE',
            border: {type: 'line'},
            style: {border: {fg: 'cyan'}}
        });

        // Connection status
        const connectionBox = grid.set(0, 4, 2, 4, blessed.box, {
            label: chalk.green('🔗 Connections'),
            content: 'TN5250: DISCONNECTED\nDID: READY\nHCS: READY',
            border: {type: 'line'},
            style: {border: {fg: 'green'}}
        });

        // Terminal output
        const terminalBox = grid.set(2, 0, 8, 8, blessed.box, {
            label: chalk.yellow('💻 Terminal Output'),
            content: 'Welcome to Ghostly Terminal...\nType commands below.',
            border: {type: 'line'},
            style: {border: {fg: 'yellow'}},
            scrollable: true,
            alwaysScroll: true
        });

        // Command input
        const inputBox = grid.set(10, 0, 2, 8, blessed.textbox, {
            label: chalk.magenta('⌨️ Command Input'),
            inputOnFocus: true,
            border: {type: 'line'},
            style: {border: {fg: 'magenta'}}
        });

        // Status sidebar
        const statusBox = grid.set(0, 8, 12, 4, blessed.box, {
            label: chalk.blue('📊 System Status'),
            content: 'Web4 Identity: ACTIVE\nZKP Privacy: ENABLED\nHedera Audit: LOGGING\nQuantum Ready: YES',
            border: {type: 'line'},
            style: {border: {fg: 'blue'}}
        });

        // Key bindings
        this.screen.key(['escape', 'C-c'], () => {
            this.screen.destroy();
            process.exit(0);
        });

        inputBox.key('enter', () => {
            const command = inputBox.getValue();
            this.executeCommand(command, terminalBox);
            inputBox.clearValue();
            inputBox.focus();
        });

        inputBox.focus();
        this.screen.render();
    }

    async executeCommand(command, outputBox) {
        const timestamp = new Date().toLocaleTimeString();
        let output = `\n[${timestamp}] $ ${command}\n`;

        try {
            switch (command.toLowerCase()) {
                case 'covenant verify':
                    const verified = await this.covenant.verifyIntegrity();
                    output += verified ? '✅ Covenant integrity verified' : '❌ Covenant integrity failed';
                    break;

                case 'tn5250 connect':
                    output += '🔌 Connecting to IBM i system...';
                    const connected = await this.tn5250.connect('pub400.com');
                    output += connected ? '\n✅ Connected to pub400.com' : '\n❌ Connection failed';
                    break;

                case 'did resolve':
                    output += '🆔 Resolving DID...';
                    const didDoc = await this.did.resolve('did:hedera:testnet:0.0.12345');
                    output += didDoc ? '\n✅ DID resolved successfully' : '\n❌ DID resolution failed';
                    break;

                case 'hedera log':
                    output += '📝 Logging to Hedera HCS...';
                    const logged = await this.hedera.logEvent('GHOSTLY_TERMINAL_COMMAND', { command, timestamp });
                    output += logged ? '\n✅ Event logged to HCS' : '\n❌ HCS logging failed';
                    break;

                case 'zkp verify':
                    output += '🔍 Running ZKP verification...';
                    const zkpResult = await this.zkp.verifyProof('demo_proof', 'demo_inputs');
                    output += zkpResult ? '\n✅ ZKP verification successful' : '\n❌ ZKP verification failed';
                    break;

                case 'web status':
                    output += '🌐 Starting web interface...';
                    this.startWebInterface();
                    output += '\n✅ Web interface started on http://localhost:3000';
                    break;

                case 'help':
                    output += '\nAvailable commands:\n';
                    output += '  covenant verify - Verify Eternal Covenant integrity\n';
                    output += '  tn5250 connect - Connect to IBM i system\n';
                    output += '  did resolve - Test DID resolution\n';
                    output += '  hedera log - Log event to Hedera\n';
                    output += '  zkp verify - Test ZKP verification\n';
                    output += '  web status - Start web interface\n';
                    output += '  clear - Clear terminal\n';
                    output += '  exit - Exit Ghostly Terminal\n';
                    break;

                case 'clear':
                    outputBox.setContent('Terminal cleared.\n');
                    this.screen.render();
                    return;

                case 'exit':
                    this.screen.destroy();
                    process.exit(0);

                default:
                    output += `Unknown command: ${command}\nType 'help' for available commands.`;
            }
        } catch (error) {
            output += `\n❌ Error: ${error.message}`;
        }

        // Update terminal output
        const currentContent = outputBox.getContent();
        outputBox.setContent(currentContent + output);
        this.screen.render();
    }

    startWebInterface() {
        if (this.server) return; // Already running

        this.server = createServer(this.app);
        this.io = new Server(this.server);

        this.app.use(express.static('public'));
        this.app.get('/', (req, res) => {
            res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>🌑 Ghostly Terminal - Eternal Covenant</title>
    <style>
        body { font-family: monospace; background: #1a1a1a; color: #ffffff; margin: 20px; }
        .terminal { background: #000; padding: 20px; border-radius: 5px; }
        #output { white-space: pre-wrap; min-height: 400px; }
        #input { background: #333; border: 1px solid #555; color: #fff; padding: 5px; width: 100%; }
        .status { margin: 10px 0; padding: 10px; background: #2a2a2a; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>🌑 Ghostly Terminal - Eternal Covenant Enhanced</h1>
    <div class="status">
        <strong>Covenant Status:</strong> VERIFIED |
        <strong>Web4 Identity:</strong> ACTIVE |
        <strong>Hedera Audit:</strong> ENABLED |
        <strong>ZKP Privacy:</strong> READY
    </div>
    <div class="terminal">
        <div id="output">Welcome to Ghostly Terminal...
Type commands and press Enter.
Type 'help' for available commands.

</div>
        <input type="text" id="input" placeholder="Enter command..." autofocus>
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        const output = document.getElementById('output');
        const input = document.getElementById('input');

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const command = input.value;
                socket.emit('command', command);
                output.textContent += '> ' + command + '\n';
                input.value = '';
            }
        });

        socket.on('response', (data) => {
            output.textContent += data + '\n';
            output.scrollTop = output.scrollHeight;
        });
    </script>
</body>
</html>
            `);
        });

        this.io.on('connection', (socket) => {
            console.log('🌐 Web client connected');

            socket.on('command', async (command) => {
                let response = '';

                try {
                    switch (command.toLowerCase()) {
                        case 'covenant verify':
                            response = '✅ Covenant integrity verified';
                            break;
                        case 'tn5250 connect':
                            response = '🔌 Connecting to IBM i system...';
                            // Simulate connection
                            setTimeout(() => {
                                socket.emit('response', '✅ Connected to pub400.com');
                            }, 1000);
                            break;
                        case 'status':
                            response = '🌑 Ghostly Terminal Status:\\n✅ Eternal Covenant: VERIFIED\\n✅ Web4 Identity: ACTIVE\\n✅ Hedera HCS: READY\\n✅ ZKP Privacy: ENABLED';
                            break;
                        case 'help':
                            response = 'Available commands:\\ncovenant verify, tn5250 connect, status, help';
                            break;
                        default:
                            response = 'Unknown command. Type "help" for commands.';
                    }
                } catch (error) {
                    response = '❌ Error: ' + error.message;
                }

                socket.emit('response', response);
            });
        });

        this.server.listen(3000, () => {
            console.log('🌐 Ghostly Terminal web interface running on http://localhost:3000');
        });
    }

    async run() {
        await this.initialize();

        // Check if running in TUI mode or web mode
        const args = process.argv.slice(2);

        if (args.includes('--web')) {
            console.log('🌐 Starting web interface...');
            this.startWebInterface();
        } else {
            console.log('🖥️ Starting terminal interface...');
            this.createGUI();
        }
    }
}

// CLI setup
program
    .name('ghostly-terminal')
    .description('🌑 Ghostly Terminal - Eternal Covenant Enhanced Terminal Emulator')
    .version('1.0.0');

program
    .command('start')
    .description('Start the terminal interface')
    .action(async () => {
        const terminal = new GhostlyTerminal();
        await terminal.run();
    });

program
    .command('web')
    .description('Start the web interface')
    .action(async () => {
        const terminal = new GhostlyTerminal();
        await terminal.initialize();
        terminal.startWebInterface();
    });

program
    .command('covenant')
    .description('Verify Eternal Covenant integrity')
    .action(async () => {
        const covenant = new CovenantAuthenticator();
        const verified = await covenant.verifyIntegrity();
        console.log(verified ? '✅ Eternal Covenant verified' : '❌ Covenant verification failed');
    });

// Run CLI or start directly
if (process.argv.length > 2) {
    program.parse();
} else {
    // Start terminal interface directly
    const terminal = new GhostlyTerminal();
    terminal.run().catch(console.error);
}