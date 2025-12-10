/**
 * Example: Simulate Safe Transaction on Tenderly Before Execution
 * 
 * This script demonstrates how to simulate a Treasury of Light transaction
 * on Tenderly before actually executing it on-chain.
 */

require('dotenv').config();
const { ethers } = require('ethers');
const { SafeTenderlyIntegration } = require('../../integration/safe-tenderly-integration');

// Treasury of Light address
const TREASURY_OF_LIGHT = '0xb4C173AaFe428845f0b96610cf53576121BAB221';

async function simulateBeforeExecution() {
  console.log('🔬 Simulating Safe Transaction on Tenderly...\n');

  // Initialize provider (Arbitrum One)
  const provider = new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');
  
  // Initialize signer (optional - needed for signing, not simulation)
  // const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // Initialize integration
  const integration = new SafeTenderlyIntegration(
    provider,
    null, // No signer needed for simulation
    process.env.TENDERLY_API_KEY,
    process.env.TENDERLY_ACCOUNT_SLUG,
    process.env.TENDERLY_PROJECT_SLUG,
    'arbitrum'
  );

  // Example: Simulate calling THEOS Final Oracle
  const THEOS_ORACLE = '0x8BCbC66A5bb808A8871F667f2dd92a017B3DaFAC';
  
  // Create transaction data (example: call getAll() function)
  const oracleInterface = new ethers.Interface([
    'function getAll() external view returns (address, address, address, address, address, bytes32, address)'
  ]);
  const txData = oracleInterface.encodeFunctionData('getAll', []);

  const txParams = {
    to: THEOS_ORACLE,
    data: txData,
    value: '0',
    gas: '8000000',
  };

  try {
    // Simulate transaction
    const result = await integration.simulateSafeTransaction(
      TREASURY_OF_LIGHT,
      txParams
    );

    console.log('✅ Simulation Complete\n');
    
    // Detailed Status Reporting
    const status = result.simulation.transaction.status;
    const statusIcon = status ? '✅' : '❌';
    const statusText = status ? 'SUCCESS' : 'FAILED';
    
    console.log('📊 Simulation Results:');
    console.log(`  Status: ${statusIcon} ${statusText}`);
    console.log('  Gas Used:', result.simulation.transaction.gas_used || 'N/A');
    console.log('  Network:', result.networkId);
    console.log('  Network Name:', result.networkId === '42161' ? 'Arbitrum One' : 'Ethereum Mainnet');
    
    // Transaction Details
    if (result.simulation.transaction.transaction_info) {
      const txInfo = result.simulation.transaction.transaction_info;
      console.log('\n📋 Transaction Details:');
      console.log('  From:', txInfo.from || 'N/A');
      console.log('  To:', txInfo.to || 'N/A');
      console.log('  Value:', txInfo.value ? ethers.formatEther(txInfo.value) + ' ETH' : '0 ETH');
      console.log('  Gas Limit:', txInfo.gas || 'N/A');
    }
    
    // Error Details (if failed)
    if (!status) {
      const errorInfo = result.simulation.transaction.transaction_info;
      console.log('\n❌ Error Details:');
      if (errorInfo?.error_message) {
        console.log('  Message:', errorInfo.error_message);
      }
      if (errorInfo?.error_reason) {
        console.log('  Reason:', errorInfo.error_reason);
      }
      if (errorInfo?.call_trace) {
        console.log('  Call Trace Available:', 'Yes');
      }
      console.log('\n⚠️  Transaction will fail - DO NOT execute');
      console.log('   Review error details and fix transaction parameters');
    } else {
      console.log('\n✅ Transaction will succeed - safe to execute');
      console.log('   Proceed with signing and proposing transaction');
    }
    
    console.log('\n📋 Safe Information:');
    console.log('  Address:', result.safe.address);
    console.log('  Owners:', result.safe.owners.length);
    console.log('  Threshold:', `${result.safe.threshold}-of-${result.safe.owners.length}`);
    console.log('  Balance:', result.safe.balance, 'ETH');
    console.log('  Nonce:', result.safe.nonce);
    console.log('  Version:', result.safe.version);

    // Save simulation URL if available
    if (result.simulation.simulation?.id) {
      console.log('\n🔗 Simulation URL:');
      const simUrl = `https://dashboard.tenderly.co/${process.env.TENDERLY_ACCOUNT_SLUG}/${process.env.TENDERLY_PROJECT_SLUG}/simulator/${result.simulation.simulation.id}`;
      console.log(`  ${simUrl}`);
    }

    // Return status code
    return status ? 0 : 1;

  } catch (error) {
    console.error('\n❌ Simulation Failed\n');
    console.error('Error Details:');
    console.error('  Message:', error.message);
    
    if (error.response) {
      console.error('  Status:', error.response.status);
      console.error('  Status Text:', error.response.statusText);
      if (error.response.data) {
        console.error('  Response Data:', JSON.stringify(error.response.data, null, 2));
      }
    }
    
    if (error.code) {
      console.error('  Error Code:', error.code);
    }
    
    if (error.stack) {
      console.error('\nStack Trace:');
      console.error(error.stack);
    }
    
    console.error('\n💡 Troubleshooting:');
    console.error('  1. Check Tenderly API key is valid');
    console.error('  2. Verify network ID is correct (42161 for Arbitrum)');
    console.error('  3. Ensure Safe address is correct');
    console.error('  4. Verify transaction parameters are valid');
    
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  simulateBeforeExecution()
    .then(exitCode => {
      process.exit(exitCode || 0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { simulateBeforeExecution };
