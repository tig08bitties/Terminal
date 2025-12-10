/**
 * Safe Smart Account Client
 * 
 * Integration with Safe (formerly Gnosis Safe) for multi-sig wallet operations
 * 
 * Repository: https://github.com/safe-fndn/safe-smart-account
 * Safe Factory: 0xFc43582532E90Fa8726FE9cdb5FAd48f4e487d27 (Ethereum Mainnet)
 */

const { Safe, SafeFactory, SafeAccountConfig } = require('@safe-global/safe-core-sdk');
const { EthersAdapter } = require('@safe-global/safe-ethers-lib');
const { SafeServiceClient } = require('@safe-global/safe-service-client');
const { ethers } = require('ethers');

class SafeClient {
  constructor(provider, signer, network = 'arbitrum') {
    this.provider = provider;
    this.signer = signer;
    this.network = network;
    
    // Network configurations
    this.networks = {
      ethereum: {
        chainId: 1,
        safeServiceUrl: 'https://safe-transaction-mainnet.safe.global',
        safeFactory: '0xFc43582532E90Fa8726FE9cdb5FAd48f4e487d27',
      },
      arbitrum: {
        chainId: 42161,
        safeServiceUrl: 'https://safe-transaction-arbitrum.safe.global',
        safeFactory: '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2', // Arbitrum Safe Factory
      },
    };

    this.config = this.networks[network] || this.networks.arbitrum;
    
    // Initialize adapters
    this.ethAdapter = new EthersAdapter({
      ethers,
      signerOrProvider: this.signer || this.provider,
    });

    // Initialize Safe Service Client
    this.serviceClient = new SafeServiceClient({
      txServiceUrl: this.config.safeServiceUrl,
      ethAdapter: this.ethAdapter,
    });
  }

  /**
   * Get Safe instance for existing Safe
   * @param {string} safeAddress - Safe address
   * @returns {Promise<Safe>} - Safe SDK instance
   */
  async getSafe(safeAddress) {
    const safe = await Safe.init({
      ethAdapter: this.ethAdapter,
      safeAddress,
    });
    return safe;
  }

  /**
   * Get Safe Factory instance
   * @returns {Promise<SafeFactory>} - Safe Factory instance
   */
  async getSafeFactory() {
    const safeFactory = await SafeFactory.init({
      ethAdapter: this.ethAdapter,
      contractNetworks: {
        [this.config.chainId]: {
          safeMasterCopyAddress: this.config.safeFactory,
          safeProxyFactoryAddress: this.config.safeFactory,
          multiSendAddress: '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
          multiSendCallOnlyAddress: '0x40A2aCCbd92BCA938b02010E17A5b8929b49130D',
          fallbackHandlerAddress: '0xf48f2B2d2a534e402487b3ee7C18c33Aec0Fe5e4',
          signMessageLibAddress: '0xA65387F16B013cf2NF4603F1B0c9b6dE96F192',
          createCallAddress: '0x7cbB62EaA69F79e6873cD1ecB2392971036cFbA4',
        },
      },
    });
    return safeFactory;
  }

  /**
   * Deploy a new Safe
   * @param {object} config - Safe configuration
   * @param {string[]} config.owners - Array of owner addresses
   * @param {number} config.threshold - Number of required signatures
   * @returns {Promise<Safe>} - Deployed Safe instance
   */
  async deploySafe(config) {
    const safeFactory = await this.getSafeFactory();
    
    const safeAccountConfig = {
      owners: config.owners,
      threshold: config.threshold,
    };

    const safeSdk = await safeFactory.deploySafe({ safeAccountConfig });
    return safeSdk;
  }

  /**
   * Get Safe information
   * @param {string} safeAddress - Safe address
   * @returns {Promise<object>} - Safe information
   */
  async getSafeInfo(safeAddress) {
    const safe = await this.getSafe(safeAddress);
    const owners = await safe.getOwners();
    const threshold = await safe.getThreshold();
    const version = await safe.getContractVersion();
    const nonce = await safe.getNonce();
    const balance = await this.provider.getBalance(safeAddress);

    return {
      address: safeAddress,
      owners,
      threshold,
      version,
      nonce,
      balance: ethers.formatEther(balance),
      chainId: this.config.chainId,
      network: this.network,
    };
  }

  /**
   * Create a Safe transaction
   * @param {string} safeAddress - Safe address
   * @param {object} txParams - Transaction parameters
   * @param {string} txParams.to - To address
   * @param {string} txParams.value - Value in wei (optional)
   * @param {string} txParams.data - Transaction data (optional)
   * @returns {Promise<object>} - Safe transaction
   */
  async createTransaction(safeAddress, txParams) {
    const safe = await this.getSafe(safeAddress);
    
    const safeTransaction = await safe.createTransaction({
      safeTransactionData: {
        to: txParams.to,
        value: txParams.value || '0',
        data: txParams.data || '0x',
      },
    });

    return safeTransaction;
  }

  /**
   * Sign a Safe transaction
   * @param {string} safeAddress - Safe address
   * @param {object} safeTransaction - Safe transaction object
   * @returns {Promise<object>} - Signed transaction
   */
  async signTransaction(safeAddress, safeTransaction) {
    const safe = await this.getSafe(safeAddress);
    const signedTx = await safe.signTransaction(safeTransaction);
    return signedTx;
  }

  /**
   * Propose a Safe transaction (via Safe Service)
   * @param {string} safeAddress - Safe address
   * @param {object} safeTransaction - Safe transaction object
   * @param {string} safeTxHash - Safe transaction hash
   * @param {string} senderAddress - Sender address
   * @returns {Promise<object>} - Proposal result
   */
  async proposeTransaction(safeAddress, safeTransaction, safeTxHash, senderAddress) {
    const safeServiceTransaction = {
      safeAddress,
      safeTransaction,
      safeTxHash,
      senderAddress,
      origin: 'THEOS Sovereign OS',
    };

    await this.serviceClient.proposeTransaction({
      safeAddress,
      safeServiceTransaction,
    });

    return {
      safeAddress,
      safeTxHash,
      status: 'proposed',
    };
  }

  /**
   * Get pending transactions for a Safe
   * @param {string} safeAddress - Safe address
   * @returns {Promise<object[]>} - Pending transactions
   */
  async getPendingTransactions(safeAddress) {
    const pendingTxs = await this.serviceClient.getPendingTransactions(safeAddress);
    return pendingTxs;
  }

  /**
   * Get transaction history for a Safe
   * @param {string} safeAddress - Safe address
   * @returns {Promise<object[]>} - Transaction history
   */
  async getTransactionHistory(safeAddress) {
    const history = await this.serviceClient.getAllTransactions(safeAddress);
    return history;
  }

  /**
   * Execute a Safe transaction
   * @param {string} safeAddress - Safe address
   * @param {object} safeTransaction - Safe transaction object
   * @returns {Promise<object>} - Execution result
   */
  async executeTransaction(safeAddress, safeTransaction) {
    const safe = await this.getSafe(safeAddress);
    const executeTxResponse = await safe.executeTransaction(safeTransaction);
    const receipt = await executeTxResponse.transactionResponse?.wait();

    return {
      safeAddress,
      txHash: receipt?.hash,
      status: receipt?.status === 1 ? 'success' : 'failed',
      receipt,
    };
  }

  /**
   * Get Safe owners
   * @param {string} safeAddress - Safe address
   * @returns {Promise<string[]>} - Array of owner addresses
   */
  async getOwners(safeAddress) {
    const safe = await this.getSafe(safeAddress);
    return await safe.getOwners();
  }

  /**
   * Get Safe threshold
   * @param {string} safeAddress - Safe address
   * @returns {Promise<number>} - Threshold value
   */
  async getThreshold(safeAddress) {
    const safe = await this.getSafe(safeAddress);
    return await safe.getThreshold();
  }

  /**
   * Check if address is an owner
   * @param {string} safeAddress - Safe address
   * @param {string} address - Address to check
   * @returns {Promise<boolean>} - True if address is an owner
   */
  async isOwner(safeAddress, address) {
    const owners = await this.getOwners(safeAddress);
    return owners.map(o => o.toLowerCase()).includes(address.toLowerCase());
  }
}

module.exports = { SafeClient };
