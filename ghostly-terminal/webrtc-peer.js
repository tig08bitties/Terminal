// =====================================================
// WebRTC Peer Connection Manager
// Official WebRTC Architecture Implementation
// Eternal Covenant Secure P2P Connections
// =====================================================

import { EventEmitter } from 'events';

export class WebRTCPeerConnection extends EventEmitter {
    constructor(config = null) {
        super();
        
        this.config = config || {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' }
            ],
            iceCandidatePoolSize: 10,
            bundlePolicy: 'max-bundle',
            rtcpMuxPolicy: 'require',
            iceTransportPolicy: 'all' // can be 'relay' for TURN only
        };

        this.pc = null;
        this.dataChannels = new Map();
        this.connected = false;
        this.localStreams = new Map();
        this.remoteStreams = new Map();
        this.connectionState = 'new';
        this.iceConnectionState = 'new';
        this.signalingState = 'stable';
        this.stats = {
            packetsLost: 0,
            jitter: 0,
            rtt: 0,
            bytesReceived: 0,
            bytesSent: 0
        };
    }

    async initialize() {
        console.log('🔗 Initializing WebRTC Peer Connection...');

        try {
            // Create RTCPeerConnection with configuration
            this.pc = new RTCPeerConnection(this.config);

            // Setup event handlers
            this.setupEventHandlers();

            console.log('✅ WebRTC Peer Connection initialized');
            return true;
        } catch (error) {
            console.error('❌ PeerConnection initialization error:', error.message);
            throw error;
        }
    }

    setupEventHandlers() {
        // ICE Candidate handling
        this.pc.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('🧊 New ICE candidate:', event.candidate.type);
                this.emit('icecandidate', event.candidate);
            } else {
                console.log('🧊 ICE candidate gathering complete');
                this.emit('icegatheringcomplete');
            }
        };

        // ICE Connection State changes
        this.pc.oniceconnectionstatechange = () => {
            this.iceConnectionState = this.pc.iceConnectionState;
            console.log('🧊 ICE connection state:', this.iceConnectionState);
            this.emit('iceconnectionstatechange', this.iceConnectionState);

            if (this.iceConnectionState === 'connected' || this.iceConnectionState === 'completed') {
                console.log('✅ ICE connection established');
                this.connected = true;
                this.emit('connected');
            } else if (this.iceConnectionState === 'failed') {
                console.error('❌ ICE connection failed');
                this.emit('failed');
            } else if (this.iceConnectionState === 'disconnected') {
                console.warn('⚠️ ICE connection disconnected');
                this.connected = false;
                this.emit('disconnected');
            }
        };

        // Connection State changes
        this.pc.onconnectionstatechange = () => {
            this.connectionState = this.pc.connectionState;
            console.log('🔗 Connection state:', this.connectionState);
            this.emit('connectionstatechange', this.connectionState);
        };

        // Signaling State changes
        this.pc.onsignalingstatechange = () => {
            this.signalingState = this.pc.signalingState;
            console.log('📡 Signaling state:', this.signalingState);
            this.emit('signalingstatechange', this.signalingState);
        };

        // Data Channel received
        this.pc.ondatachannel = (event) => {
            const channel = event.channel;
            console.log('📡 Received data channel:', channel.label);
            this.setupDataChannel(channel);
            this.emit('datachannel', channel);
        };

        // Track received (for media streams)
        this.pc.ontrack = (event) => {
            console.log('🎥 Received track:', event.track.kind);
            const streamId = event.streams[0]?.id || 'remote-stream';
            this.remoteStreams.set(streamId, event.streams[0]);
            this.emit('track', event.track, event.streams);
        };

        // ICE Gathering State changes
        this.pc.onicegatheringstatechange = () => {
            console.log('🧊 ICE gathering state:', this.pc.iceGatheringState);
            this.emit('icegatheringstatechange', this.pc.iceGatheringState);
        };

        // Negotiation needed
        this.pc.onnegotiationneeded = () => {
            console.log('🔄 Negotiation needed');
            this.emit('negotiationneeded');
        };
    }

    async createOffer(options = {}) {
        try {
            if (!this.pc) {
                throw new Error('PeerConnection not initialized');
            }

            console.log('📤 Creating offer...');

            const offer = await this.pc.createOffer(options);
            await this.pc.setLocalDescription(offer);

            console.log('✅ Offer created and set as local description');
            return offer;
        } catch (error) {
            console.error('❌ Error creating offer:', error.message);
            throw error;
        }
    }

    async createAnswer(options = {}) {
        try {
            if (!this.pc) {
                throw new Error('PeerConnection not initialized');
            }

            console.log('📥 Creating answer...');

            const answer = await this.pc.createAnswer(options);
            await this.pc.setLocalDescription(answer);

            console.log('✅ Answer created and set as local description');
            return answer;
        } catch (error) {
            console.error('❌ Error creating answer:', error.message);
            throw error;
        }
    }

    async setRemoteDescription(description) {
        try {
            if (!this.pc) {
                throw new Error('PeerConnection not initialized');
            }

            console.log(`📩 Setting remote description (${description.type})...`);
            await this.pc.setRemoteDescription(new RTCSessionDescription(description));
            console.log('✅ Remote description set');
            return true;
        } catch (error) {
            console.error('❌ Error setting remote description:', error.message);
            throw error;
        }
    }

    async addIceCandidate(candidate) {
        try {
            if (!this.pc) {
                throw new Error('PeerConnection not initialized');
            }

            if (!candidate) {
                console.log('🧊 End of candidates signal received');
                return true;
            }

            await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
            console.log('✅ ICE candidate added');
            return true;
        } catch (error) {
            console.error('❌ Error adding ICE candidate:', error.message);
            // Don't throw - ICE candidates can fail but connection might still work
            return false;
        }
    }

    createDataChannel(label, options = {}) {
        try {
            if (!this.pc) {
                throw new Error('PeerConnection not initialized');
            }

            console.log(`📡 Creating data channel: ${label}`);

            const defaultOptions = {
                ordered: true,
                maxRetransmits: 10,
                protocol: 'eternal-covenant-v1'
            };

            const channel = this.pc.createDataChannel(label, { ...defaultOptions, ...options });
            this.setupDataChannel(channel);

            console.log('✅ Data channel created');
            return channel;
        } catch (error) {
            console.error('❌ Error creating data channel:', error.message);
            throw error;
        }
    }

    setupDataChannel(channel) {
        this.dataChannels.set(channel.label, channel);

        channel.onopen = () => {
            console.log(`✅ Data channel opened: ${channel.label}`);
            this.emit('channelopen', channel);
        };

        channel.onclose = () => {
            console.log(`🔌 Data channel closed: ${channel.label}`);
            this.dataChannels.delete(channel.label);
            this.emit('channelclose', channel);
        };

        channel.onmessage = (event) => {
            console.log(`📥 Message on ${channel.label}:`, event.data.substring(0, 100));
            this.emit('message', channel.label, event.data);
        };

        channel.onerror = (error) => {
            console.error(`❌ Data channel error on ${channel.label}:`, error);
            this.emit('channelerror', channel, error);
        };

        channel.onbufferedamountlow = () => {
            console.log(`📊 Buffer low on ${channel.label}`);
            this.emit('bufferedamountlow', channel);
        };
    }

    send(channelLabel, data) {
        const channel = this.dataChannels.get(channelLabel);

        if (!channel) {
            console.error(`❌ Data channel not found: ${channelLabel}`);
            return false;
        }

        if (channel.readyState !== 'open') {
            console.error(`❌ Data channel not open: ${channelLabel} (${channel.readyState})`);
            return false;
        }

        try {
            channel.send(data);
            console.log(`📤 Sent on ${channelLabel}:`, data.substring(0, 100));
            return true;
        } catch (error) {
            console.error(`❌ Error sending on ${channelLabel}:`, error.message);
            return false;
        }
    }

    async addMediaStream(stream, streamId = 'local-stream') {
        try {
            if (!this.pc) {
                throw new Error('PeerConnection not initialized');
            }

            console.log(`🎥 Adding media stream: ${streamId}`);

            for (const track of stream.getTracks()) {
                this.pc.addTrack(track, stream);
                console.log(`✅ Added track: ${track.kind}`);
            }

            this.localStreams.set(streamId, stream);
            console.log('✅ Media stream added');
            return true;
        } catch (error) {
            console.error('❌ Error adding media stream:', error.message);
            throw error;
        }
    }

    removeMediaStream(streamId) {
        const stream = this.localStreams.get(streamId);

        if (!stream) {
            console.error(`❌ Stream not found: ${streamId}`);
            return false;
        }

        const senders = this.pc.getSenders();
        for (const sender of senders) {
            if (stream.getTracks().includes(sender.track)) {
                this.pc.removeTrack(sender);
                console.log(`✅ Removed track: ${sender.track.kind}`);
            }
        }

        this.localStreams.delete(streamId);
        console.log(`✅ Media stream removed: ${streamId}`);
        return true;
    }

    async getStats() {
        if (!this.pc) {
            return this.stats;
        }

        try {
            const stats = await this.pc.getStats();
            const statsReport = {};

            stats.forEach((report) => {
                if (report.type === 'inbound-rtp') {
                    statsReport.packetsLost = report.packetsLost || 0;
                    statsReport.jitter = report.jitter || 0;
                    statsReport.bytesReceived = report.bytesReceived || 0;
                }
                if (report.type === 'outbound-rtp') {
                    statsReport.bytesSent = report.bytesSent || 0;
                    statsReport.packetsSent = report.packetsSent || 0;
                }
                if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                    statsReport.rtt = report.currentRoundTripTime || 0;
                }
            });

            this.stats = { ...this.stats, ...statsReport };
            return this.stats;
        } catch (error) {
            console.error('❌ Error getting stats:', error.message);
            return this.stats;
        }
    }

    getState() {
        return {
            connectionState: this.connectionState,
            iceConnectionState: this.iceConnectionState,
            signalingState: this.signalingState,
            connected: this.connected,
            dataChannels: Array.from(this.dataChannels.keys()),
            localStreams: Array.from(this.localStreams.keys()),
            remoteStreams: Array.from(this.remoteStreams.keys()),
            stats: this.stats
        };
    }

    async restart() {
        console.log('🔄 Restarting ICE...');

        if (!this.pc) {
            throw new Error('PeerConnection not initialized');
        }

        try {
            const offer = await this.pc.createOffer({ iceRestart: true });
            await this.pc.setLocalDescription(offer);
            console.log('✅ ICE restart initiated');
            return offer;
        } catch (error) {
            console.error('❌ Error restarting ICE:', error.message);
            throw error;
        }
    }

    async close() {
        console.log('🔌 Closing peer connection...');

        // Close all data channels
        for (const [label, channel] of this.dataChannels) {
            try {
                channel.close();
                console.log(`✅ Closed data channel: ${label}`);
            } catch (error) {
                console.error(`❌ Error closing channel ${label}:`, error.message);
            }
        }

        this.dataChannels.clear();

        // Stop all local tracks
        for (const [streamId, stream] of this.localStreams) {
            for (const track of stream.getTracks()) {
                track.stop();
            }
            console.log(`✅ Stopped local stream: ${streamId}`);
        }

        this.localStreams.clear();
        this.remoteStreams.clear();

        // Close peer connection
        if (this.pc) {
            this.pc.close();
            this.pc = null;
        }

        this.connected = false;
        this.connectionState = 'closed';

        console.log('✅ Peer connection closed');
    }
}

// Covenant-secured WebRTC connection wrapper
export class CovenantWebRTCConnection extends WebRTCPeerConnection {
    constructor(covenantAuth, config = null) {
        super(config);
        this.covenantAuth = covenantAuth;
        this.covenantVerified = false;
        this.encryptionEnabled = true;
    }

    async initialize() {
        console.log('🏛️ Initializing Covenant-secured WebRTC connection...');

        // Verify Covenant integrity
        const covenantValid = await this.covenantAuth.verifyIntegrity();
        if (!covenantValid) {
            throw new Error('Covenant integrity verification failed');
        }

        this.covenantVerified = true;

        // Initialize base peer connection
        await super.initialize();

        console.log('✅ Covenant-secured WebRTC connection initialized');
        return true;
    }

    async createCovenantOffer() {
        const offer = await this.createOffer();

        // Add Covenant signature to offer
        const covenantSignature = this.signWithCovenant(offer.sdp);

        return {
            ...offer,
            covenant: {
                verified: true,
                signature: covenantSignature,
                timestamp: Date.now()
            }
        };
    }

    async createCovenantAnswer() {
        const answer = await this.createAnswer();

        // Add Covenant signature to answer
        const covenantSignature = this.signWithCovenant(answer.sdp);

        return {
            ...answer,
            covenant: {
                verified: true,
                signature: covenantSignature,
                timestamp: Date.now()
            }
        };
    }

    signWithCovenant(data) {
        // Generate Covenant signature for SDP
        const masterKey = this.covenantAuth.getMasterKey();
        const crypto = require('crypto');
        const signature = crypto
            .createHmac('sha256', masterKey)
            .update(data)
            .digest('hex');
        
        console.log('🔐 Covenant signature generated');
        return signature;
    }

    verifyCovenantSignature(data, signature) {
        const expectedSignature = this.signWithCovenant(data);
        return expectedSignature === signature;
    }

    getState() {
        return {
            ...super.getState(),
            covenantVerified: this.covenantVerified,
            encryptionEnabled: this.encryptionEnabled,
            covenant: 'ETERNAL'
        };
    }
}