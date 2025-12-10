#!/bin/bash

# =====================================================
# Hedera Consensus Service Logging Script
# For SUSE session audit trails
# =====================================================

SESSION_DATA="User: $PAM_USER, Service: $PAM_SERVICE, TTY: $PAM_TTY, Time: $(date +%s)"
SESSION_HASH=$(echo "$SESSION_DATA" | sha256sum | cut -d' ' -f1)

node -e "
const { Client, TopicMessageSubmitTransaction, PrivateKey } = require('@hashgraph/sdk');

// Load from environment or config
const accountId = process.env.HEDERA_ACCOUNT_ID || '0.0.12345';
const privateKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY || '302e020100300506032b657004220420...');

const client = Client.forTestnet().setOperator(accountId, privateKey);

async function logToHCS() {
    const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(process.env.HEDERA_LOG_TOPIC || '0.0.123456')
        .setMessage('$SESSION_HASH');

    const submitTx = await transaction.execute(client);
    const receipt = await submitTx.getReceipt(client);

    console.log('📝 Session logged to HCS:', receipt.status.toString());
}

logToHCS().catch(console.error);
"