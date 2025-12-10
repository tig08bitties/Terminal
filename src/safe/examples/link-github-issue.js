/**
 * Example: Link Safe Transaction to GitHub Issue/PR
 * 
 * This script demonstrates how to create a Safe transaction,
 * simulate it on Tenderly, and link it to a GitHub issue or PR.
 */

require('dotenv').config();
const { ethers } = require('ethers');
const { CompleteSafeIntegration } = require('../../integration/complete-safe-integration');

// Treasury of Light address
const TREASURY_OF_LIGHT = '0xb4C173AaFe428845f0b96610cf53576121BAB221';

async function linkToGitHubIssue(issueNumber, txParams) {
  console.log('🔗 Linking Safe Transaction to GitHub Issue...\n');
  console.log('Issue Number:', issueNumber);
  console.log('Repository: tig08bitties/chariot');
  console.log('');

  // Initialize provider (Arbitrum One)
  const provider = new ethers.JsonRpcProvider('https://arb1.arbitrum.io/rpc');
  
  // Initialize signer (needed for signing transactions)
  // In production, use a secure key management solution
  const signer = process.env.PRIVATE_KEY 
    ? new ethers.Wallet(process.env.PRIVATE_KEY, provider)
    : null;

  if (!signer) {
    console.warn('⚠️  No signer provided - simulation only (no signing)');
  }

  // Initialize complete integration
  const integration = new CompleteSafeIntegration(
    provider,
    signer,
    process.env.GITHUB_TOKEN,
    process.env.TENDERLY_API_KEY,
    process.env.TENDERLY_ACCOUNT_SLUG,
    process.env.TENDERLY_PROJECT_SLUG
  );

  // Sender must be a Treasury owner
  const senderAddress = signer ? await signer.getAddress() : '0x3BBa654A3816A228284E3e0401Cff4EA6dFc5cea';

  try {
    // Create complete workflow with GitHub linking
    const result = await integration.createTreasuryTransactionWorkflow(
      txParams,
      senderAddress,
      'tig08bitties',
      'chariot',
      issueNumber
    );

    // Enhanced Status Reporting
    const simStatus = result.simulation.transaction.status;
    const simIcon = simStatus ? '✅' : '❌';
    const simText = simStatus ? 'SUCCESS' : 'FAILED';
    
    console.log('✅ Complete Workflow Executed\n');
    
    // Simulation Results with Detailed Status
    console.log('🔬 Simulation Results:');
    console.log(`  Status: ${simIcon} ${simText}`);
    console.log('  Gas Used:', result.simulation.transaction.gas_used || 'N/A');
    console.log('  Gas Limit:', result.simulation.transaction.gas || 'N/A');
    
    if (result.simulation.transaction.transaction_info) {
      const txInfo = result.simulation.transaction.transaction_info;
      console.log('  From:', txInfo.from || 'N/A');
      console.log('  To:', txInfo.to || 'N/A');
      console.log('  Value:', txInfo.value ? ethers.formatEther(txInfo.value) + ' ETH' : '0 ETH');
    }
    
    if (!simStatus) {
      const errorInfo = result.simulation.transaction.transaction_info;
      console.log('\n❌ Simulation Failed:');
      if (errorInfo?.error_message) {
        console.log('  Error Message:', errorInfo.error_message);
      }
      if (errorInfo?.error_reason) {
        console.log('  Error Reason:', errorInfo.error_reason);
      }
      console.log('\n⚠️  Transaction will fail - DO NOT proceed with execution');
    } else {
      console.log('\n✅ Simulation successful - transaction is safe to execute');
    }
    
    if (result.simulation.simulation?.id) {
      console.log('\n🔗 Simulation Details:');
      console.log('  Simulation ID:', result.simulation.simulation.id);
      console.log('  Simulation URL:');
      const simUrl = `https://dashboard.tenderly.co/${process.env.TENDERLY_ACCOUNT_SLUG}/${process.env.TENDERLY_PROJECT_SLUG}/simulator/${result.simulation.simulation.id}`;
      console.log(`    ${simUrl}`);
    }

    // Safe Transaction
    console.log('\n📋 Safe Transaction:');
    console.log('  Safe Tx Hash:', result.safeTxHash);
    console.log('  Treasury:', result.treasury.address);
    console.log('  Threshold:', result.treasury.threshold);
    console.log('  Network:', result.treasury.network);

    // Proposal with Status
    const proposalStatus = result.proposal.status || 'proposed';
    const proposalIcon = proposalStatus === 'proposed' ? '📝' : proposalStatus === 'executed' ? '✅' : '⏳';
    
    console.log('\n📝 Proposal Status:');
    console.log(`  Status: ${proposalIcon} ${proposalStatus.toUpperCase()}`);
    console.log('  Safe Address:', result.proposal.safeAddress);
    console.log('  Safe Tx Hash:', result.safeTxHash);
    
    if (proposalStatus === 'proposed') {
      console.log('\n⏳ Next Steps:');
      console.log('  1. Second owner must sign the transaction');
      console.log('  2. Once 2-of-2 threshold is met, transaction can be executed');
      console.log('  3. Monitor execution with: node monitor-execution-trace.js <txHash>');
    } else if (proposalStatus === 'executed') {
      console.log('\n✅ Transaction has been executed');
    }

    // GitHub Context with Enhanced Details
    if (result.github) {
      const githubStatus = result.github.issue.state || 'open';
      const githubIcon = githubStatus === 'open' ? '🔓' : githubStatus === 'closed' ? '🔒' : '📌';
      
      console.log('\n🔗 GitHub Context:');
      console.log(`  Issue Status: ${githubIcon} ${githubStatus.toUpperCase()}`);
      console.log('  Issue Title:', result.github.issue.title);
      console.log('  Issue URL:', result.github.issue.url);
      console.log('  Author:', result.github.issue.author?.login || 'N/A');
      console.log('  Repository:', result.github.githubContext.owner + '/' + result.github.githubContext.repo);
      console.log('  Issue Number:', result.github.githubContext.issueNumber);
      
      if (result.github.issue.body) {
        const bodyPreview = result.github.issue.body.substring(0, 100);
        console.log('  Issue Preview:', bodyPreview + (result.github.issue.body.length > 100 ? '...' : ''));
      }
    } else {
      console.log('\n⚠️  GitHub context not available');
      console.log('   Ensure GITHUB_TOKEN is set and issue exists');
    }

    // Next Steps with Status-based Guidance
    console.log('\n📌 Next Steps:');
    if (simStatus) {
      console.log('  ✅ Simulation successful - proceed with execution');
      console.log('  1. Second owner should review and sign');
      console.log('  2. Once 2-of-2 threshold is met, execute transaction');
      console.log('  3. Monitor execution: node monitor-execution-trace.js <txHash>');
    } else {
      console.log('  ❌ Simulation failed - DO NOT execute');
      console.log('  1. Review error details above');
      console.log('  2. Fix transaction parameters');
      console.log('  3. Re-run simulation before proposing');
    }

    // Return status
    return simStatus ? 0 : 1;

  } catch (error) {
    console.error('\n❌ Workflow Failed\n');
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
    
    // Specific error handling
    if (error.message.includes('not an owner')) {
      console.error('\n💡 Owner Error:');
      console.error('  The sender address must be an owner of the Safe');
      console.error('  Treasury owners:', TREASURY_OF_LIGHT);
      console.error('  Check that sender address matches one of the owners');
    }
    
    if (error.message.includes('Tenderly')) {
      console.error('\n💡 Tenderly Error:');
      console.error('  Check Tenderly API key and account/project slugs');
      console.error('  Verify network ID is correct');
    }
    
    if (error.message.includes('GitHub')) {
      console.error('\n💡 GitHub Error:');
      console.error('  Check GITHUB_TOKEN is valid');
      console.error('  Verify repository and issue number exist');
    }
    
    if (error.stack) {
      console.error('\nStack Trace:');
      console.error(error.stack);
    }
    
    console.error('\n💡 General Troubleshooting:');
    console.error('  1. Verify all environment variables are set');
    console.error('  2. Check network connectivity');
    console.error('  3. Ensure Safe address is correct');
    console.error('  4. Verify transaction parameters are valid');
    
    process.exit(1);
  }
}

// Example usage
async function example() {
  // Example: Call THEOS Final Oracle getAll() function
  const THEOS_ORACLE = '0x8BCbC66A5bb808A8871F667f2dd92a017B3DaFAC';
  
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

  // Link to GitHub issue #1
  await linkToGitHubIssue(1, txParams);
}

// Get issue number from command line or use example
const issueNumber = process.argv[2] ? parseInt(process.argv[2]) : null;

// Run if executed directly
if (require.main === module) {
  if (issueNumber) {
    // Use provided issue number with example transaction
    const THEOS_ORACLE = '0x8BCbC66A5bb808A8871F667f2dd92a017B3DaFAC';
    const oracleInterface = new ethers.Interface([
      'function getAll() external view returns (address, address, address, address, address, bytes32, address)'
    ]);
    const txData = oracleInterface.encodeFunctionData('getAll', []);
    
    linkToGitHubIssue(issueNumber, {
      to: THEOS_ORACLE,
      data: txData,
      value: '0',
      gas: '8000000',
    })
      .then(exitCode => {
        process.exit(exitCode || 0);
      })
      .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
      });
  } else {
    example()
      .then(exitCode => {
        process.exit(exitCode || 0);
      })
      .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
      });
  }
}

module.exports = { linkToGitHubIssue };
