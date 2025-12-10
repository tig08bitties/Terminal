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

    if (!initResult.capabilities.terminal) {
      console.error('❌ xterm is not available');
      console.log('   Install: sudo apt-get install xterm');
      process.exit(1);
    }

    // Launch gcloud shell
    console.log('🌐 Launching gcloud shell terminal...');
    console.log('   Project:', agent.gcloudProject || 'default');
    console.log('');

    const shellResult = await agent.launchGCloudShell({
      useXterm: true
    });

    console.log('✅ gcloud shell launched');
    console.log('   Session ID:', shellResult.sessionId);
    console.log('   XTerm:', shellResult.xterm);
    console.log('');
    console.log('💡 The gcloud shell terminal window should now be open.');
    console.log('   You can run gcloud commands interactively.');
    console.log('   Close the terminal window when done.');

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
