// =====================================================
// WebRTC Signaling Server for Ghostly Terminal
// Based on Official WebRTC Architecture
// Eternal Covenant Secure Signaling
// =====================================================

import { EventEmitter } from 'events';
import { WebSocketServer } from 'ws';
import crypto from 'crypto';

export class WebRTCSignalingServer extends EventEmitter {
    constructor(port = 8080) {
        super();
        this.port = port;
        this.wss = null;
        this.clients = new Map(); // Map of client ID to WebSocket connection
        this.rooms = new Map(); // Map of room ID to Set of client IDs
        this.covenantAuth = null;
    }

    async initialize(covenantAuth = null) {
        console.log('🔌 Initializing WebRTC Signaling Server...');

        this.covenantAuth = covenantAuth;

        this.wss = new WebSocketServer({ 
            port: this.port,
            perMessageDeflate: {
                zlibDeflateOptions: {
                    chunkSize: 1024,
                    memLevel: 7,
                    level: 3
                },
                zlibInflateOptions: {
                    chunkSize: 10 * 1024
                },
                clientNoContextTakeover: true,
                serverNoContextTakeover: true,
                serverMaxWindowBits: 10,
                concurrencyLimit: 10,
                threshold: 1024
            }
        });

        this.wss.on('connection', (ws, req) => {
            this.handleConnection(ws, req);
        });

        this.wss.on('error', (error) => {
            console.error('❌ Signaling server error:', error.message);
            this.emit('error', error);
        });

        console.log(`✅ WebRTC Signaling Server listening on port ${this.port}`);
        return true;
    }

    handleConnection(ws, req) {
        const clientId = this.generateClientId();
        const clientIp = req.socket.remoteAddress;

        console.log(`🔗 New client connected: ${clientId} from ${clientIp}`);

        this.clients.set(clientId, {
            ws: ws,
            id: clientId,
            ip: clientIp,
            rooms: new Set(),
            authenticated: false,
            covenantVerified: false,
            did: null
        });

        // Send welcome message with client ID
        this.send(clientId, {
            type: 'welcome',
            clientId: clientId,
            timestamp: Date.now(),
            covenant: 'SIGNALING_SERVER'
        });

        ws.on('message', async (data) => {
            await this.handleMessage(clientId, data);
        });

        ws.on('close', () => {
            this.handleDisconnect(clientId);
        });

        ws.on('error', (error) => {
            console.error(`❌ Client ${clientId} error:`, error.message);
        });

        this.emit('connection', clientId);
    }

    async handleMessage(clientId, data) {
        try {
            const message = JSON.parse(data.toString());
            const client = this.clients.get(clientId);

            if (!client) {
                console.error(`❌ Unknown client: ${clientId}`);
                return;
            }

            console.log(`📨 Message from ${clientId}: ${message.type}`);

            switch (message.type) {
                case 'authenticate':
                    await this.handleAuthenticate(clientId, message);
                    break;

                case 'join-room':
                    this.handleJoinRoom(clientId, message);
                    break;

                case 'leave-room':
                    this.handleLeaveRoom(clientId, message);
                    break;

                case 'offer':
                    this.handleOffer(clientId, message);
                    break;

                case 'answer':
                    this.handleAnswer(clientId, message);
                    break;

                case 'ice-candidate':
                    this.handleIceCandidate(clientId, message);
                    break;

                case 'ping':
                    this.send(clientId, { type: 'pong', timestamp: Date.now() });
                    break;

                default:
                    console.warn(`⚠️ Unknown message type: ${message.type}`);
            }

            this.emit('message', clientId, message);
        } catch (error) {
            console.error(`❌ Error handling message from ${clientId}:`, error.message);
        }
    }

    async handleAuthenticate(clientId, message) {
        const client = this.clients.get(clientId);

        if (!client) return;

        // Verify Covenant token if provided
        if (message.covenantToken && this.covenantAuth) {
            try {
                const verified = await this.verifyCovenantToken(message.covenantToken);
                client.covenantVerified = verified;
                client.did = message.did || null;
            } catch (error) {
                console.error(`❌ Covenant verification failed for ${clientId}:`, error.message);
            }
        }

        client.authenticated = true;

        this.send(clientId, {
            type: 'authenticated',
            clientId: clientId,
            covenantVerified: client.covenantVerified,
            timestamp: Date.now()
        });

        console.log(`✅ Client ${clientId} authenticated (Covenant: ${client.covenantVerified})`);
    }

    handleJoinRoom(clientId, message) {
        const roomId = message.roomId;
        const client = this.clients.get(clientId);

        if (!client) return;

        // Create room if it doesn't exist
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Set());
            console.log(`🏠 Created room: ${roomId}`);
        }

        const room = this.rooms.get(roomId);
        room.add(clientId);
        client.rooms.add(roomId);

        // Notify client of successful join
        this.send(clientId, {
            type: 'room-joined',
            roomId: roomId,
            clients: Array.from(room).filter(id => id !== clientId),
            timestamp: Date.now()
        });

        // Notify other clients in the room
        this.broadcastToRoom(roomId, {
            type: 'peer-joined',
            clientId: clientId,
            roomId: roomId,
            timestamp: Date.now()
        }, clientId);

        console.log(`✅ Client ${clientId} joined room ${roomId} (${room.size} members)`);
    }

    handleLeaveRoom(clientId, message) {
        const roomId = message.roomId;
        const client = this.clients.get(clientId);

        if (!client) return;

        const room = this.rooms.get(roomId);
        if (room) {
            room.delete(clientId);
            client.rooms.delete(roomId);

            // Notify other clients
            this.broadcastToRoom(roomId, {
                type: 'peer-left',
                clientId: clientId,
                roomId: roomId,
                timestamp: Date.now()
            });

            // Delete empty rooms
            if (room.size === 0) {
                this.rooms.delete(roomId);
                console.log(`🏠 Deleted empty room: ${roomId}`);
            }

            console.log(`👋 Client ${clientId} left room ${roomId}`);
        }
    }

    handleOffer(clientId, message) {
        const targetId = message.targetId;
        const targetClient = this.clients.get(targetId);

        if (!targetClient) {
            console.error(`❌ Target client not found: ${targetId}`);
            return;
        }

        this.send(targetId, {
            type: 'offer',
            offer: message.offer,
            senderId: clientId,
            timestamp: Date.now()
        });

        console.log(`📤 Forwarded offer from ${clientId} to ${targetId}`);
    }

    handleAnswer(clientId, message) {
        const targetId = message.targetId;
        const targetClient = this.clients.get(targetId);

        if (!targetClient) {
            console.error(`❌ Target client not found: ${targetId}`);
            return;
        }

        this.send(targetId, {
            type: 'answer',
            answer: message.answer,
            senderId: clientId,
            timestamp: Date.now()
        });

        console.log(`📥 Forwarded answer from ${clientId} to ${targetId}`);
    }

    handleIceCandidate(clientId, message) {
        const targetId = message.targetId;
        const targetClient = this.clients.get(targetId);

        if (!targetClient) {
            console.error(`❌ Target client not found: ${targetId}`);
            return;
        }

        this.send(targetId, {
            type: 'ice-candidate',
            candidate: message.candidate,
            senderId: clientId,
            timestamp: Date.now()
        });

        console.log(`🧊 Forwarded ICE candidate from ${clientId} to ${targetId}`);
    }

    handleDisconnect(clientId) {
        const client = this.clients.get(clientId);

        if (!client) return;

        console.log(`🔌 Client disconnected: ${clientId}`);

        // Remove from all rooms
        for (const roomId of client.rooms) {
            const room = this.rooms.get(roomId);
            if (room) {
                room.delete(clientId);

                // Notify other clients
                this.broadcastToRoom(roomId, {
                    type: 'peer-left',
                    clientId: clientId,
                    roomId: roomId,
                    timestamp: Date.now()
                });

                // Delete empty rooms
                if (room.size === 0) {
                    this.rooms.delete(roomId);
                }
            }
        }

        this.clients.delete(clientId);
        this.emit('disconnect', clientId);
    }

    send(clientId, message) {
        const client = this.clients.get(clientId);

        if (!client || client.ws.readyState !== 1) {
            console.error(`❌ Cannot send to client ${clientId}: not connected`);
            return false;
        }

        try {
            client.ws.send(JSON.stringify(message));
            return true;
        } catch (error) {
            console.error(`❌ Error sending to ${clientId}:`, error.message);
            return false;
        }
    }

    broadcastToRoom(roomId, message, excludeClientId = null) {
        const room = this.rooms.get(roomId);

        if (!room) {
            console.error(`❌ Room not found: ${roomId}`);
            return;
        }

        for (const clientId of room) {
            if (clientId !== excludeClientId) {
                this.send(clientId, message);
            }
        }
    }

    broadcast(message, excludeClientId = null) {
        for (const [clientId, client] of this.clients) {
            if (clientId !== excludeClientId) {
                this.send(clientId, message);
            }
        }
    }

    generateClientId() {
        return `client_${crypto.randomBytes(16).toString('hex')}`;
    }

    async verifyCovenantToken(token) {
        // Verify Covenant JWT token
        if (!this.covenantAuth) {
            return false;
        }

        try {
            // Parse JWT token (simplified - in production use proper JWT library)
            const parts = token.split('.');
            if (parts.length !== 3) {
                return false;
            }

            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

            // Verify covenant hash in payload
            if (payload.covenant && this.covenantAuth.getMasterKey) {
                const expectedHash = this.covenantAuth.getMasterKey().substring(0, 32);
                return payload.covenant === expectedHash;
            }

            return false;
        } catch (error) {
            console.error('❌ Token verification error:', error.message);
            return false;
        }
    }

    getStats() {
        const roomStats = Array.from(this.rooms.entries()).map(([roomId, clients]) => ({
            roomId: roomId,
            clients: clients.size
        }));

        return {
            totalClients: this.clients.size,
            totalRooms: this.rooms.size,
            authenticatedClients: Array.from(this.clients.values()).filter(c => c.authenticated).length,
            covenantVerifiedClients: Array.from(this.clients.values()).filter(c => c.covenantVerified).length,
            rooms: roomStats
        };
    }

    async close() {
        console.log('🔌 Closing WebRTC Signaling Server...');

        // Disconnect all clients
        for (const [clientId, client] of this.clients) {
            try {
                client.ws.close();
            } catch (error) {
                console.error(`❌ Error closing client ${clientId}:`, error.message);
            }
        }

        this.clients.clear();
        this.rooms.clear();

        if (this.wss) {
            this.wss.close();
            this.wss = null;
        }

        console.log('✅ WebRTC Signaling Server closed');
    }
}

// Signaling Client for connecting to signaling server
export class WebRTCSignalingClient extends EventEmitter {
    constructor(serverUrl = 'ws://localhost:8080') {
        super();
        this.serverUrl = serverUrl;
        this.ws = null;
        this.clientId = null;
        this.connected = false;
        this.authenticated = false;
    }

    async connect() {
        return new Promise((resolve, reject) => {
            console.log(`🔗 Connecting to signaling server: ${this.serverUrl}`);

            this.ws = new WebSocket(this.serverUrl);

            this.ws.on('open', () => {
                console.log('✅ Connected to signaling server');
                this.connected = true;
                resolve();
            });

            this.ws.on('message', (data) => {
                this.handleMessage(data);
            });

            this.ws.on('close', () => {
                console.log('🔌 Disconnected from signaling server');
                this.connected = false;
                this.emit('disconnect');
            });

            this.ws.on('error', (error) => {
                console.error('❌ Signaling client error:', error.message);
                reject(error);
            });
        });
    }

    handleMessage(data) {
        try {
            const message = JSON.parse(data.toString());
            console.log(`📨 Received: ${message.type}`);

            switch (message.type) {
                case 'welcome':
                    this.clientId = message.clientId;
                    console.log(`✅ Assigned client ID: ${this.clientId}`);
                    this.emit('welcome', message);
                    break;

                case 'authenticated':
                    this.authenticated = true;
                    this.emit('authenticated', message);
                    break;

                case 'room-joined':
                    this.emit('room-joined', message);
                    break;

                case 'peer-joined':
                    this.emit('peer-joined', message);
                    break;

                case 'peer-left':
                    this.emit('peer-left', message);
                    break;

                case 'offer':
                    this.emit('offer', message);
                    break;

                case 'answer':
                    this.emit('answer', message);
                    break;

                case 'ice-candidate':
                    this.emit('ice-candidate', message);
                    break;

                case 'pong':
                    this.emit('pong', message);
                    break;

                default:
                    console.warn(`⚠️ Unknown message type: ${message.type}`);
            }
        } catch (error) {
            console.error('❌ Error handling message:', error.message);
        }
    }

    send(message) {
        if (!this.connected || this.ws.readyState !== 1) {
            console.error('❌ Cannot send: not connected');
            return false;
        }

        try {
            this.ws.send(JSON.stringify(message));
            return true;
        } catch (error) {
            console.error('❌ Error sending message:', error.message);
            return false;
        }
    }

    authenticate(covenantToken = null, did = null) {
        return this.send({
            type: 'authenticate',
            covenantToken: covenantToken,
            did: did,
            timestamp: Date.now()
        });
    }

    joinRoom(roomId) {
        return this.send({
            type: 'join-room',
            roomId: roomId,
            timestamp: Date.now()
        });
    }

    leaveRoom(roomId) {
        return this.send({
            type: 'leave-room',
            roomId: roomId,
            timestamp: Date.now()
        });
    }

    sendOffer(targetId, offer) {
        return this.send({
            type: 'offer',
            targetId: targetId,
            offer: offer,
            timestamp: Date.now()
        });
    }

    sendAnswer(targetId, answer) {
        return this.send({
            type: 'answer',
            targetId: targetId,
            answer: answer,
            timestamp: Date.now()
        });
    }

    sendIceCandidate(targetId, candidate) {
        return this.send({
            type: 'ice-candidate',
            targetId: targetId,
            candidate: candidate,
            timestamp: Date.now()
        });
    }

    ping() {
        return this.send({
            type: 'ping',
            timestamp: Date.now()
        });
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.connected = false;
        this.authenticated = false;
    }
}