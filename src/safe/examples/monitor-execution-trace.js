/**
 * Example: Monitor Safe Transaction Execution with Full Trace
 * 
 * This script demonstrates how to monitor a Treasury of Light transaction
 * after execution, including full trace analysis from Tenderly.
 */

require('dotenv').config();
const { ethers } = require('ethers');
const { SafeTenderlyIntegration } = require('../../integration/safe-tenderly-integration');

// Treasury of Light address
const TREASURY_OF_LIGHT = '0xb4C173AaFe428845f0b96610cf53576121BAB221';

async function monitorExecution(txHash) {
  if (!txHash) {
    console.error('❌ Please provide a transaction hash');
    console.log('Usage: node monitor-execution-trace.js <txHash>');
    process.exit(1);
  }

  console.log('🔍 Monitoring Safe Transaction Execution...\n');
  console.log('Transaction Hash:', txHash);
  console.log('Safe Address:', TREASURY_OF_LIGHT);
  console.log('');

  // Initialize provider (Arbitrum One)
  const provider = new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');

  // Initialize integration
  const integration = new SafeTenderlyIntegration(
    provider,
    null,
    process.env.TENDERLY_API_KEY,
    process.env.TENDERLY_ACCOUNT_SLUG,
    process.env.TENDERLY_PROJECT_SLUG,
    'arbitrum'
  );

  try {
    // Monitor transaction
    const result = await integration.monitorSafeTransaction(
      TREASURY_OF_LIGHT,
      txHash
    );

    // Status Reporting
    const status = result.transaction.status;
    const statusIcon = status ? '✅' : '❌';
    const statusText = status ? 'SUCCESS' : 'FAILED';
    
    console.log('✅ Monitoring Complete\n');
    
    // Transaction Details with Enhanced Status
    console.log('📊 Transaction Details:');
    console.log(`  Hash: ${result.transaction.hash}`);
    console.log(`  Status: ${statusIcon} ${statusText}`);
    console.log('  Block Number:', result.transaction.block_number || 'Pending');
    console.log('  Block Hash:', result.transaction.block_hash || 'N/A');
    console.log('  Transaction Index:', result.transaction.transaction_index || 'N/A');
    console.log('  Gas Used:', result.transaction.gas_used || 'N/A');
    console.log('  Gas Limit:', result.transaction.gas || 'N/A');
    console.log('  Gas Price:', result.transaction.gas_price ? `${result.transaction.gas_price} wei` : 'N/A');
    console.log('  Effective Gas Price:', result.transaction.effective_gas_price ? `${result.transaction.effective_gas_price} wei` : 'N/A');
    console.log('  From:', result.transaction.from);
    console.log('  To:', result.transaction.to || 'Contract Creation');
    console.log('  Value:', ethers.formatEther(result.transaction.value || '0'), 'ETH');
    console.log('  Nonce:', result.transaction.nonce || 'N/A');
    
    // Status-specific information
    if (status) {
      console.log('\n✅ Transaction Status: EXECUTED SUCCESSFULLY');
      console.log('   All operations completed as expected');
    } else {
      console.log('\n❌ Transaction Status: EXECUTION FAILED');
      if (result.transaction.error) {
        console.log('   Error:', result.transaction.error);
      }
      if (result.transaction.revert_reason) {
        console.log('   Revert Reason:', result.transaction.revert_reason);
      }
    }

    // Safe Information
    console.log('\n🏛️ Safe Information:');
    console.log('  Address:', result.safe.address);
    console.log('  Owners:', result.safe.owners.join(', '));
    console.log('  Threshold:', `${result.safe.threshold}-of-${result.safe.owners.length}`);
    console.log('  Balance:', result.safe.balance, 'ETH');

    // Trace Information with Enhanced Details
    if (result.trace && result.trace.length > 0) {
      console.log('\n🔍 Transaction Trace:');
      console.log('  Total Calls:', result.trace.length);
      console.log('  Trace Depth:', Math.max(...result.trace.map(c => (c.depth || 0))) + 1);
      
      let successCount = 0;
      let failureCount = 0;
      
      result.trace.forEach((call, index) => {
        const callStatus = call.error ? '❌' : '✅';
        const callType = call.type || 'call';
        
        console.log(`\n  Call ${index + 1} ${callStatus}:`);
        console.log('    Type:', callType);
        console.log('    Depth:', call.depth || 0);
        console.log('    From:', call.from);
        console.log('    To:', call.to || 'N/A');
        console.log('    Value:', ethers.formatEther(call.value || '0'), 'ETH');
        console.log('    Gas Used:', call.gas_used || 'N/A');
        
        if (call.input) {
          const inputPreview = call.input.length > 66 ? call.input.substring(0, 66) + '...' : call.input;
          console.log('    Input:', inputPreview);
          console.log('    Input Length:', call.input.length, 'bytes');
        }
        
        if (call.output) {
          const outputPreview = call.output.length > 66 ? call.output.substring(0, 66) + '...' : call.output;
          console.log('    Output:', outputPreview);
          console.log('    Output Length:', call.output.length, 'bytes');
        }
        
        if (call.error) {
          console.log('    Error:', call.error);
          failureCount++;
        } else {
          successCount++;
        }
        
        if (call.revert_reason) {
          console.log('    Revert Reason:', call.revert_reason);
        }
      });
      
      console.log('\n📊 Trace Summary:');
      console.log('  Successful Calls:', successCount);
      console.log('  Failed Calls:', failureCount);
      console.log('  Success Rate:', `${((successCount / result.trace.length) * 100).toFixed(1)}%`);
    } else {
      console.log('\n⚠️  No trace information available');
    }

    // Safe Transaction Details
    if (result.safeTransaction) {
      console.log('\n📋 Safe Transaction Details:');
      console.log('  Safe Tx Hash:', result.safeTransaction.safeTxHash);
      console.log('  Executor:', result.safeTransaction.executor);
      console.log('  Is Executed:', result.safeTransaction.isExecuted);
      console.log('  Confirmations:', result.safeTransaction.confirmations?.length || 0);
    }

    // Tenderly URL
    console.log('\n🔗 View on Tenderly:');
    console.log(`  https://dashboard.tenderly.co/${process.env.TENDERLY_ACCOUNT_SLUG}/${process.env.TENDERLY_PROJECT_SLUG}/tx/${result.networkId}/${txHash}`);

    // Arbiscan URL
    console.log('\n🔗 View on Arbiscan:');
    console.log(`  https://arbiscan.io/tx/${txHash}`);

  } catch (error) {
    console.error('\n❌ Monitoring Failed\n');
    console.error('Error Details:');
    console.error('  Message:', error.message);
    
    if (error.response) {
      console.error('  HTTP Status:', error.response.status);
      console.error('  Status Text:', error.response.statusText);
      if (error.response.data) {
        console.error('  Response Data:', JSON.stringify(error.response.data, null, 2));
      }
    }
    
    if (error.code) {
      console.error('  Error Code:', error.code);
    }
    
    if (error.cause) {
      console.error('  Cause:', error.cause);
    }
    
    if (error.stack) {
      console.error('\nStack Trace:');
      console.error(error.stack);
    }
    
    console.error('\n💡 Troubleshooting:');
    console.error('  1. Verify transaction hash is correct');
    console.error('  2. Check transaction exists on network');
    console.error('  3. Ensure Tenderly API key is valid');
    console.error('  4. Verify network ID matches transaction network');
    console.error('  5. Check if transaction has been mined');
    
    process.exit(1);
  }
}

// Get transaction hash from command line
const txHash = process.argv[2];

// Run if executed directly
if (require.main === module) {
  monitorExecution(txHash).catch(console.error);
}

module.exports = { monitorExecution };
