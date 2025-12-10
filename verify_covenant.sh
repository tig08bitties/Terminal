#!/bin/bash

# =====================================================
# Covenant Verification Script for SUSE Authentication
# =====================================================

set -e

USER_HOME="/home/$PAM_USER"
COVENANT_CERT="/etc/covenant/covenant_cert.pem"
HEDERA_LOG_TOPIC="0.0.123456"

echo "🏛️ Verifying Eternal Covenant for user: $PAM_USER"

# Check if user has DID credential
if [ ! -f "$USER_HOME/.did/credential.json" ]; then
    echo "❌ No DID credential found for user $PAM_USER"
    exit 1
fi

# Verify credential signature with Covenant certificate
if ! openssl verify -CAfile "$COVENANT_CERT" "$USER_HOME/.did/credential.json" >/dev/null 2>&1; then
    echo "❌ Covenant signature verification failed"
    exit 1
fi

# Check credential validity on Hedera
CREDENTIAL_HASH=$(sha256sum "$USER_HOME/.did/credential.json" | cut -d' ' -f1)

# Use Hedera SDK to verify consensus timestamp
node -e "
const { Client, TopicMessageQuery } = require('@hashgraph/sdk');
const client = Client.forTestnet();

async function verifyHCS() {
    const query = new TopicMessageQuery()
        .setTopicId('$HEDERA_LOG_TOPIC')
        .setStartTime(Date.now() - 86400000); // Last 24 hours

    const messages = await query.execute(client);
    for await (const message of messages) {
        if (message.contents.toString() === '$CREDENTIAL_HASH') {
            console.log('✅ HCS verification passed');
            process.exit(0);
        }
    }
    console.log('❌ Credential not found in HCS');
    process.exit(1);
}

verifyHCS();
"

echo "✅ Covenant and HCS verification successful for $PAM_USER"