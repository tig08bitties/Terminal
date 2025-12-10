/**
 * θεός | The_⟐S Chariot Agent - gcloud Shell Example
 * 
 * Demonstrates launching an interactive gcloud shell terminal
 */

const { ChariotAgent } = require('./chariot-agent');

async function main() {
  console.log('🚀 θεός | The_⟐S Chariot Agent - gcloud Shell');
  console.log('');

  // Initialize agent
  const agent = new ChariotAgent({
    gcloudProject: process.env.GOOGLE_CLOUD_PROJECT
  });

  try {
    // Initialize
    console.log('📋 Initializing agent...');
    const initResult = await agent.initialize();
    console.log('✅ Initialized:', initResult.brand);
    console.log('   Capabilities:', initResult.capabilities);
    console.log('');

    if (!initResult.capabilities.gcloud) {
      console.error('❌ gcloud is not available');
      console.log('   Install: https://cloud.google.com/sdk/docs/install');
      process.exit(1);
    }

    // Launch gcloud shell
    console.log('🌐 Launching gcloud shell terminal...');
    console.log('   Project:', agent.gcloudProject || 'default');
    console.log('');

    if (!initResult.capabilities.terminal) {
      console.warn('⚠️  xterm is not available - will use fallback mode');
      console.log('   Install xterm for full interactive terminal: sudo apt-get install xterm');
      console.log('');
    }

    try {
      const shellResult = await agent.launchGCloudShell({
        useXterm: initResult.capabilities.terminal,
        daemon: true  // Launch as daemon (detached process)
      });

      if (shellResult.xterm) {
        console.log('✅ gcloud shell launched in xterm window (daemon mode)');
        console.log('   Session ID:', shellResult.sessionId);
        if (shellResult.pid) {
          console.log('   Process ID:', shellResult.pid);
        }
        console.log('   Geometry: 115x85 (115 columns x 85 rows)');
        console.log('   Scheme: Rxvt');
        console.log('   Background: #171421');
        console.log('   Text Color: #FFFFFF');
        console.log('');
        console.log('💡 The gcloud shell terminal window should now be open.');
        console.log('   Running as daemon - you can continue using this terminal.');
        console.log('   The xterm window is independent and will stay open.');
        console.log('   Close the xterm window when done.');
      } else {
        console.log('✅ gcloud shell info retrieved');
        console.log('   Session ID:', shellResult.sessionId);
        console.log('   Note: Interactive shell requires xterm');
        if (shellResult.message) {
          console.log('   Message:', shellResult.message);
        }
        if (shellResult.stdout) {
          console.log('');
          console.log('📋 Current gcloud configuration:');
          console.log(shellResult.stdout);
        }
      }
    } catch (error) {
      console.error('❌ Failed to launch gcloud shell:', error.message);
      console.log('');
      console.log('💡 Troubleshooting:');
      console.log('   1. Ensure gcloud is installed and authenticated');
      console.log('   2. Install xterm: sudo apt-get install xterm');
      console.log('   3. Set GOOGLE_CLOUD_PROJECT if needed');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
