/**
 * θεός | The_⟐S Chariot Agent - Quick gcloud Shell Test
 * 
 * Simple test script to launch gcloud shell
 */

const { ChariotAgent } = require('./chariot-agent');

async function main() {
  console.log('🚀 θεός | The_⟐S - Quick gcloud Shell Test\n');

  const agent = new ChariotAgent();
  await agent.initialize();

  // Launches as daemon by default
  const result = await agent.launchGCloudShell({
    useXterm: true,
    daemon: true  // Detached process
  });

  console.log('✅ Result:', result);
  console.log('\n💡 xterm window should be open with gcloud shell!');
  console.log('   You can continue using this terminal.\n');
}

main().catch(console.error);
