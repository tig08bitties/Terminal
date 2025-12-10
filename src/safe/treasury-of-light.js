/**
 * Treasury of Light (Bride & Groom Chamber) Safe Operations
 * 
 * Specific operations for the Treasury of Light Safe
 * Address: 0xb4C173AaFe428845f0b96610cf53576121BAB221
 * Network: Arbitrum One
 * Threshold: 2-of-2
 */

const { SafeClient } = require('./safe-client');
const { ethers } = require('ethers');

// Treasury of Light Configuration
const TREASURY_OF_LIGHT = {
  address: '0xb4C173AaFe428845f0b96610cf53576121BAB221',
  network: 'arbitrum',
  chainId: 42161,
  threshold: 2,
  owners: [
    '0x3df07977140Ad97465075129C37Aec7237d74415', // Ledger Flex (Groom)
    '0x3BBa654A3816A228284E3e0401Cff4EA6dFc5cea',  // tig08bitties.uni.eth (Bride)
  ],
  name: 'Bride & Groom Chamber',
};

class TreasuryOfLight {
  constructor(provider, signer) {
    this.safe = new SafeClient(provider, signer, 'arbitrum');
    this.treasury = TREASURY_OF_LIGHT;
  }

  /**
   * Get Treasury status
   * @returns {Promise<object>} - Complete Treasury status
   */
  async getStatus() {
    const info = await this.safe.getSafeInfo(this.treasury.address);
    const balance = await this.safe.provider.getBalance(this.treasury.address);
    const pendingTxs = await this.safe.getPendingTransactions(this.treasury.address);
    const history = await this.safe.getTransactionHistory(this.treasury.address);

    return {
      ...this.treasury,
      ...info,
      balance: ethers.formatEther(balance),
      balanceWei: balance.toString(),
      pendingTransactions: pendingTxs,
      transactionHistory: history,
      status: 'operational',
    };
  }

  /**
   * Create transaction for Treasury
   * @param {object} txParams - Transaction parameters
   * @returns {Promise<object>} - Safe transaction
   */
  async createTransaction(txParams) {
    return await this.safe.createTransaction(this.treasury.address, txParams);
  }

  /**
   * Sign Treasury transaction
   * @param {object} safeTransaction - Safe transaction object
   * @returns {Promise<object>} - Signed transaction
   */
  async signTransaction(safeTransaction) {
    return await this.safe.signTransaction(this.treasury.address, safeTransaction);
  }

  /**
   * Propose Treasury transaction
   * @param {object} safeTransaction - Safe transaction object
   * @param {string} safeTxHash - Safe transaction hash
   * @param {string} senderAddress - Sender address (must be owner)
   * @returns {Promise<object>} - Proposal result
   */
  async proposeTransaction(safeTransaction, safeTxHash, senderAddress) {
    return await this.safe.proposeTransaction(
      this.treasury.address,
      safeTransaction,
      safeTxHash,
      senderAddress
    );
  }

  /**
   * Check if address is a Treasury owner
   * @param {string} address - Address to check
   * @returns {Promise<boolean>} - True if owner
   */
  async isOwner(address) {
    return await this.safe.isOwner(this.treasury.address, address);
  }

  /**
   * Get Treasury owners
   * @returns {Promise<string[]>} - Array of owner addresses
   */
  async getOwners() {
    return await this.safe.getOwners(this.treasury.address);
  }

  /**
   * Get Treasury threshold
   * @returns {Promise<number>} - Threshold (should be 2)
   */
  async getThreshold() {
    return await this.safe.getThreshold(this.treasury.address);
  }
}

module.exports = { TreasuryOfLight, TREASURY_OF_LIGHT };
