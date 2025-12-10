/**
 * θεός | The_⟐S Chariot Agent
 * Terminal-based agent using xterm, gcloud, and tn5250
 * Provides terminal emulation and command execution capabilities
 */

const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const { EventEmitter } = require('events');

const execAsync = promisify(exec);

class ChariotAgent extends EventEmitter {
  constructor(opts = {}) {
    super();
    this.brand = 'θεός | The_⟐S';
    this.name = opts.name || 'chariot-agent';
    this.terminal = opts.terminal || 'xterm';
    this.gcloudProject = opts.gcloudProject || process.env.GOOGLE_CLOUD_PROJECT;
    this.tn5250Config = opts.tn5250Config || {
      host: 'pub400.com',
      user: 'THEOS',
      password: 'winter25'
    };
    this.activeSessions = new Map();
  }

  /**
   * Initialize the agent
   */
  async initialize() {
    // Check if xterm is available
    try {
      // Try multiple common locations for xterm
      await execAsync('which xterm || command -v xterm || test -f /usr/bin/xterm');
      this.terminalAvailable = true;
    } catch (error) {
      // Also check if xterm binary exists even if not in PATH
      try {
        await execAsync('test -f /usr/bin/xterm');
        this.terminalAvailable = true;
      } catch (e) {
        this.terminalAvailable = false;
        console.warn('xterm not found, terminal emulation may be limited');
      }
    }

    // Check if gcloud is available
    try {
      await execAsync('which gcloud');
      this.gcloudAvailable = true;
    } catch (error) {
      this.gcloudAvailable = false;
      console.warn('gcloud not found');
    }

    // Check if tn5250 is available
    try {
      await execAsync('which tn5250');
      this.tn5250Available = true;
    } catch (error) {
      this.tn5250Available = false;
      console.warn('tn5250 not found');
    }

    // Check if SUSE/zypper is available
    try {
      await execAsync('which zypper');
      this.suseAvailable = true;
      // Detect SUSE version
      try {
        const { stdout } = await execAsync('cat /etc/os-release | grep -i "opensuse\|suse" | head -1');
        this.suseVersion = stdout.trim();
      } catch (e) {
        this.suseVersion = 'SUSE (version unknown)';
      }
    } catch (error) {
      this.suseAvailable = false;
      console.warn('SUSE/zypper not found');
    }

    this.emit('initialized', {
      brand: this.brand,
      agent: this.name,
      terminal: this.terminalAvailable,
      gcloud: this.gcloudAvailable,
      tn5250: this.tn5250Available,
      suse: this.suseAvailable
    });

    return {
      success: true,
      brand: this.brand,
      agent: this.name,
      capabilities: {
        terminal: this.terminalAvailable,
        gcloud: this.gcloudAvailable,
        tn5250: this.tn5250Available,
        suse: this.suseAvailable,
        suseVersion: this.suseVersion
      }
    };
  }

  /**
   * Launch interactive gcloud shell terminal as daemon
   * Uses gcloud cloud-shell ssh for full Cloud Shell experience
   * Configured with custom xterm appearance: 115x85, Rxvt scheme, custom colors
   */
  async launchGCloudShell(options = {}) {
    if (!this.gcloudAvailable) {
      throw new Error('gcloud is not available');
    }

    const sessionId = `gcloud-shell-${Date.now()}`;
    const useXterm = options.useXterm !== false && this.terminalAvailable;
    const daemon = options.daemon !== false; // Default to daemon mode

    return new Promise((resolve, reject) => {
      if (useXterm) {
        // Launch xterm with gcloud cloud-shell ssh for full Cloud Shell experience
        // This connects to Google Cloud Shell which provides an xterm-like environment
        const env = {
          ...process.env,
          GOOGLE_CLOUD_PROJECT: this.gcloudProject || process.env.GOOGLE_CLOUD_PROJECT || '',
          TERM: 'xterm-256color' // Set TERM for proper xterm compatibility
        };

        // Build the command: gcloud cloud-shell ssh with optional project flag
        let cloudShellCmd = 'gcloud cloud-shell ssh';
        if (this.gcloudProject) {
          cloudShellCmd += ` --project=${this.gcloudProject}`;
        }

        // xterm configuration:
        // - Geometry: 115 columns x 85 rows
        // - Font: Monospace size 13
        // - Background: #171421
        // - Built-in scheme: Rxvt
        // - Bold text in bright colors enabled
        // - Default text color: #FFFFFF
        // - Daemon mode: detached process
        const xtermArgs = [
          '-geometry', '115x85',           // 115 columns x 85 rows
          '-fn', '*-monospace-*-*-*-13-*', // Monospace font size 13
          '-bg', '#171421',                // Background color
          '-fg', '#FFFFFF',                // Default text color (foreground)
          '-cr', '#FFFFFF',                // Cursor color
          '-bd', '#FFFFFF',                // Border color
          '-ms', '#FFFFFF',                // Mouse pointer foreground
          '-rv',                           // Reverse video (Rxvt scheme)
          '+bc',                           // Enable bold text in bright colors
          '-T', `θεός | The_⟐S - Google Cloud Shell`, // Window title
          '-e',
          'bash',
          '-c',
          `echo "🚀 θεός | The_⟐S - Connecting to Google Cloud Shell..."; echo "Project: ${this.gcloudProject || 'default'}"; echo ""; ${cloudShellCmd} || { echo "⚠️  Cloud Shell SSH failed, using local gcloud environment"; echo "Setting TERM=xterm-256color"; export TERM=xterm-256color; export GOOGLE_CLOUD_PROJECT="${this.gcloudProject || ''}"; echo "θεός | The_⟐S gcloud Shell (Local)"; echo "Type gcloud commands or exit to close"; exec bash; }`
        ];

        // Launch xterm as daemon (detached process)
        const xtermProcess = spawn('xterm', xtermArgs, {
          env: env,
          detached: daemon,  // Detach from parent process if daemon mode
          stdio: daemon ? 'ignore' : 'inherit'  // Ignore stdio if daemon
        });

        if (daemon) {
          // Unref the process so parent can exit independently
          xtermProcess.unref();
        }

        this.activeSessions.set(sessionId, xtermProcess);
        this.emit('gcloud-shell-launched', { 
          sessionId, 
          xterm: true, 
          project: this.gcloudProject,
          method: 'cloud-shell-ssh',
          daemon: daemon,
          geometry: '115x85',
          scheme: 'Rxvt'
        });

        // For daemon mode, resolve immediately
        if (daemon) {
          resolve({
            success: true,
            sessionId,
            xterm: true,
            method: 'cloud-shell-ssh',
            daemon: true,
            pid: xtermProcess.pid,
            message: 'gcloud shell launched as daemon - window should be visible'
          });
        } else {
          // For non-daemon mode, wait for process to close
          xtermProcess.on('close', (code) => {
            this.activeSessions.delete(sessionId);
            resolve({
              success: code === 0,
              sessionId,
              exitCode: code,
              xterm: true,
              method: 'cloud-shell-ssh',
              daemon: false
            });
          });

          xtermProcess.on('error', (error) => {
            this.activeSessions.delete(sessionId);
            reject(error);
          });
        }
      } else {
        // Fallback: show gcloud config and provide instructions
        execAsync('gcloud config list', {
          env: { ...process.env, GOOGLE_CLOUD_PROJECT: this.gcloudProject }
        }).then(result => {
          resolve({
            success: true,
            sessionId,
            stdout: result.stdout,
            stderr: result.stderr,
            xterm: false,
            message: 'gcloud cloud-shell ssh requires xterm for interactive Cloud Shell connection',
            instructions: 'Install xterm: sudo apt-get install xterm, then run again'
          });
        }).catch(error => {
          reject(error);
        });
      }
    });
  }

  /**
   * Execute gcloud command in xterm
   */
  async executeGCloud(command, options = {}) {
    if (!this.gcloudAvailable) {
      throw new Error('gcloud is not available');
    }

    const sessionId = `gcloud-${Date.now()}`;
    const fullCommand = `gcloud ${command}`;

    return new Promise((resolve, reject) => {
      if (options.useXterm && this.terminalAvailable) {
        // Launch xterm with gcloud command
        const xtermProcess = spawn('xterm', [
          '-T', `θεός | The_⟐S - gcloud: ${command.split(' ')[0]}`,
          '-e',
          'bash',
          '-c',
          `${fullCommand}; echo ""; echo "Press Enter to close..."; read`
        ], {
          env: { ...process.env, GOOGLE_CLOUD_PROJECT: this.gcloudProject }
        });

        this.activeSessions.set(sessionId, xtermProcess);

        xtermProcess.on('close', (code) => {
          this.activeSessions.delete(sessionId);
          resolve({
            success: code === 0,
            sessionId,
            exitCode: code
          });
        });

        xtermProcess.on('error', (error) => {
          this.activeSessions.delete(sessionId);
          reject(error);
        });
      } else {
        // Execute directly without xterm
        execAsync(fullCommand, {
          env: { ...process.env, GOOGLE_CLOUD_PROJECT: this.gcloudProject }
        }).then(result => {
          resolve({
            success: true,
            sessionId,
            stdout: result.stdout,
            stderr: result.stderr
          });
        }).catch(error => {
          reject(error);
        });
      }
    });
  }

  /**
   * Connect to IBM i (AS/400) via tn5250
   * Defaults to launching in xterm if available
   */
  async connectTN5250(options = {}) {
    if (!this.tn5250Available) {
      throw new Error('tn5250 is not available');
    }

    const config = { ...this.tn5250Config, ...options };
    const sessionId = `tn5250-${Date.now()}`;
    // Default to using xterm if available
    const useXterm = options.useXterm !== false && this.terminalAvailable;

    return new Promise((resolve, reject) => {
      if (useXterm) {
        // Launch xterm with tn5250
        const xtermProcess = spawn('xterm', [
          '-T', `tn5250 - ${config.host}`,
          '-e',
          'tn5250',
          config.host,
          '-u', config.user,
          '-p', config.password
        ]);

        this.activeSessions.set(sessionId, xtermProcess);
        this.emit('tn5250-launched', { sessionId, host: config.host, user: config.user, xterm: true });

        xtermProcess.on('close', (code) => {
          this.activeSessions.delete(sessionId);
          resolve({
            success: code === 0,
            sessionId,
            host: config.host,
            user: config.user,
            exitCode: code,
            xterm: true
          });
        });

        xtermProcess.on('error', (error) => {
          this.activeSessions.delete(sessionId);
          reject(error);
        });
      } else {
        // Execute tn5250 directly
        const tn5250Process = spawn('tn5250', [
          config.host,
          '-u', config.user,
          '-p', config.password
        ]);

        this.activeSessions.set(sessionId, tn5250Process);
        this.emit('tn5250-launched', { sessionId, host: config.host, user: config.user, xterm: false });

        tn5250Process.on('close', (code) => {
          this.activeSessions.delete(sessionId);
          resolve({
            success: code === 0,
            sessionId,
            host: config.host,
            user: config.user,
            exitCode: code,
            xterm: false
          });
        });

        tn5250Process.on('error', (error) => {
          this.activeSessions.delete(sessionId);
          reject(error);
        });
      }
    });
  }

  /**
   * Launch xterm with tn5250 (convenience method)
   */
  async launchTN5250InXterm(options = {}) {
    return this.connectTN5250({ ...options, useXterm: true });
  }

  /**
   * Execute command in xterm
   */
  async executeInXterm(command, options = {}) {
    if (!this.terminalAvailable) {
      throw new Error('xterm is not available');
    }

    const sessionId = `xterm-${Date.now()}`;

    return new Promise((resolve, reject) => {
      const xtermProcess = spawn('xterm', [
        '-e',
        'bash',
        '-c',
        `${command}; echo "Press Enter to close..."; read`
      ], {
        env: { ...process.env, ...options.env }
      });

      this.activeSessions.set(sessionId, xtermProcess);

      xtermProcess.on('close', (code) => {
        this.activeSessions.delete(sessionId);
        resolve({
          success: code === 0,
          sessionId,
          exitCode: code
        });
      });

      xtermProcess.on('error', (error) => {
        this.activeSessions.delete(sessionId);
        reject(error);
      });
    });
  }

  /**
   * Get active sessions
   */
  getActiveSessions() {
    return Array.from(this.activeSessions.keys());
  }

  /**
   * Close a session
   */
  closeSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.kill();
      this.activeSessions.delete(sessionId);
      return { success: true, sessionId };
    }
    return { success: false, error: 'Session not found' };
  }

  /**
   * Close all sessions
   */
  closeAllSessions() {
    const sessionIds = Array.from(this.activeSessions.keys());
    sessionIds.forEach(id => this.closeSession(id));
    return { success: true, closed: sessionIds.length };
  }

  /**
   * Execute SUSE zypper command
   */
  async executeZypper(command, options = {}) {
    if (!this.suseAvailable) {
      throw new Error('SUSE/zypper is not available');
    }

    const sessionId = `zypper-${Date.now()}`;
    const fullCommand = `zypper ${command}`;
    const useXterm = options.useXterm !== false && this.terminalAvailable;

    return new Promise((resolve, reject) => {
      if (useXterm) {
        // Launch xterm with zypper command
        const xtermProcess = spawn('xterm', [
          '-T', `zypper - ${command}`,
          '-e',
          'bash',
          '-c',
          `sudo ${fullCommand}; echo "Press Enter to close..."; read`
        ], {
          env: { ...process.env, ...options.env }
        });

        this.activeSessions.set(sessionId, xtermProcess);
        this.emit('zypper-executed', { sessionId, command, xterm: true });

        xtermProcess.on('close', (code) => {
          this.activeSessions.delete(sessionId);
          resolve({
            success: code === 0,
            sessionId,
            command: fullCommand,
            exitCode: code,
            xterm: true
          });
        });

        xtermProcess.on('error', (error) => {
          this.activeSessions.delete(sessionId);
          reject(error);
        });
      } else {
        // Execute zypper directly
        execAsync(`sudo ${fullCommand}`, {
          env: { ...process.env, ...options.env }
        }).then(result => {
          resolve({
            success: true,
            sessionId,
            command: fullCommand,
            stdout: result.stdout,
            stderr: result.stderr,
            xterm: false
          });
        }).catch(error => {
          reject(error);
        });
      }
    });
  }

  /**
   * SUSE package management operations
   */
  async suseInstall(packages, options = {}) {
    const packageList = Array.isArray(packages) ? packages.join(' ') : packages;
    return this.executeZypper(`install -y ${packageList}`, options);
  }

  async suseUpdate(options = {}) {
    return this.executeZypper('update -y', options);
  }

  async suseSearch(query, options = {}) {
    return this.executeZypper(`search ${query}`, options);
  }

  async suseRemove(packages, options = {}) {
    const packageList = Array.isArray(packages) ? packages.join(' ') : packages;
    return this.executeZypper(`remove -y ${packageList}`, options);
  }

  async suseRefresh(options = {}) {
    return this.executeZypper('refresh', options);
  }

  async suseListInstalled(options = {}) {
    return this.executeZypper('search -i', options);
  }

  /**
   * Execute SUSE system command
   */
  async executeSUSECommand(command, options = {}) {
    if (!this.suseAvailable) {
      throw new Error('SUSE is not available');
    }

    const sessionId = `suse-${Date.now()}`;
    const useXterm = options.useXterm !== false && this.terminalAvailable;

    return new Promise((resolve, reject) => {
      if (useXterm) {
        const xtermProcess = spawn('xterm', [
          '-T', `SUSE - ${command}`,
          '-e',
          'bash',
          '-c',
          `${command}; echo "Press Enter to close..."; read`
        ], {
          env: { ...process.env, ...options.env }
        });

        this.activeSessions.set(sessionId, xtermProcess);
        this.emit('suse-command-executed', { sessionId, command, xterm: true });

        xtermProcess.on('close', (code) => {
          this.activeSessions.delete(sessionId);
          resolve({
            success: code === 0,
            sessionId,
            command,
            exitCode: code,
            xterm: true
          });
        });

        xtermProcess.on('error', (error) => {
          this.activeSessions.delete(sessionId);
          reject(error);
        });
      } else {
        execAsync(command, {
          env: { ...process.env, ...options.env }
        }).then(result => {
          resolve({
            success: true,
            sessionId,
            command,
            stdout: result.stdout,
            stderr: result.stderr,
            xterm: false
          });
        }).catch(error => {
          reject(error);
        });
      }
    });
  }

  /**
   * Get status
   */
  getStatus() {
    return {
      brand: this.brand,
      name: this.name,
      terminal: this.terminalAvailable,
      gcloud: this.gcloudAvailable,
      gcloudProject: this.gcloudProject,
      tn5250: this.tn5250Available,
      suse: this.suseAvailable,
      suseVersion: this.suseVersion,
      activeSessions: this.activeSessions.size,
      sessions: this.getActiveSessions()
    };
  }
}

module.exports = { ChariotAgent };
