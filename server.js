const express = require('express')
const http = require('http')
const { Server } = require('socket.io')

const app = express()
const httpserver = http.createServer(app)

const activeRooms = new Map();

const io = new Server(httpserver, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    }
})

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("create-room", ({ roomId, roomName, creatorName }) => {
        activeRooms.set(roomId, {
            name: roomName,
            creator: socket.id,
            participants: new Map([[socket.id, creatorName]]),
            createdAt: new Date()
        });

        socket.join(roomId);
        
        console.log(`Room created: ${roomId} (${roomName}) by ${creatorName}`);
        
        io.to(socket.id).emit("room-created", { 
            roomId, 
            roomName,
            success: true 
        });
    });

    socket.on("join-room", ({ roomId, userName }) => {
        if (activeRooms.has(roomId)) {
            activeRooms.get(roomId).participants.set(socket.id, userName);
            
            socket.join(roomId);
            
            socket.to(roomId).emit("user-joined", { 
                userId: socket.id, 
                userName,
                timestamp: new Date()
            });
            const uniqueParticipants = [...new Set(
                Array.from(activeRooms.get(roomId).participants.values())
            )];
            
            io.to(socket.id).emit("room-joined", {
                roomId,
                roomName: activeRooms.get(roomId).name,
                participants: uniqueParticipants,
                success: true
            });
            
            console.log(`User ${userName} joined room: ${roomId}`);
        } else {
            io.to(socket.id).emit("room-error", { 
                error: "Room not found", 
                success: false 
            });
            
            console.log(`Failed join attempt: Room ${roomId} not found`);
        }
    });    socket.on("send-message", (messageData) => {
        const { roomId, sender } = messageData;
        
        // If no messageId is provided, generate one
        if (!messageData.messageId) {
            messageData.messageId = require('crypto').randomBytes(8).toString('hex');
        }
        
        // Initialize readBy with the sender (messages are automatically read by the sender)
        messageData.readBy = [sender];
        
        if (activeRooms.has(roomId)) {
            // Forward the message to everyone else in the room
            socket.to(roomId).emit("receive-message", messageData);
            
            // Log appropriate message based on message type
            if (messageData.mediaUrl) {
                console.log(`Media message in room ${roomId} from ${sender} (${messageData.mediaType})`);
            } else {
                console.log(`Text message in room ${roomId} from ${sender}`);
            }
        }
    });    socket.on("leave-room", ({ roomId }) => {
        if (activeRooms.has(roomId)) {
            const room = activeRooms.get(roomId);
            const userName = room.participants.get(socket.id);
            
            room.participants.delete(socket.id);
            
            socket.leave(roomId);
            
            socket.to(roomId).emit("user-left", { 
                userId: socket.id, 
                userName,
                timestamp: new Date()
            });
            
            console.log(`User ${userName} left room: ${roomId}`);
            
            if (room.participants.size === 0) {
                activeRooms.delete(roomId);
                console.log(`Room ${roomId} deleted (no participants)`);
            }
        }
    });
    
    socket.on("mark-message-read", ({ messageId, roomId, userName }) => {
        // Broadcast to all users in the room that this user has read the message
        if (messageId && roomId && userName) {
            socket.to(roomId).emit("message-read", { 
                messageId, 
                userName,
                timestamp: new Date()
            });
            
            console.log(`Message ${messageId} marked as read by ${userName}`);
        }
    });
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        
        activeRooms.forEach((room, roomId) => {
            if (room.participants.has(socket.id)) {
                const userName = room.participants.get(socket.id);
                
                room.participants.delete(socket.id);
                
                socket.to(roomId).emit("user-left", { 
                    userId: socket.id, 
                    userName,
                    timestamp: new Date()
                });
                
                console.log(`User ${userName} removed from room ${roomId} due to disconnect`);
                if (room.participants.size === 0) {
                    activeRooms.delete(roomId);
                    console.log(`Room ${roomId} deleted (no participants)`);
                }
            }
        });
    });
});

const PORT = process.env.PORT || 5000;
httpserver.listen(PORT, () => {
    console.log(`Socket.io server running on port ${PORT}`);
});