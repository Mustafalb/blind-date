const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

const waitingUsers = new Set();
const activeRooms = new Map();

const topics = [
    "What's your favorite hobby?",
    "Where would you love to travel?",
    "What's your dream job?",
    "What's your favorite movie?",
    "Do you have any pets?",
    "What's your ideal weekend?",
    "What's your favorite food?",
    "What's your favorite season?",
    "Do you like sports?",
    "What makes you laugh?"
];

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinQueue', () => {
        if (waitingUsers.size > 0) {
            const partner = [...waitingUsers][0];
            waitingUsers.delete(partner);

            const roomId = `room_${partner}_${socket.id}`;
            socket.join(roomId);
            io.sockets.sockets.get(partner)?.join(roomId);

            activeRooms.set(roomId, {
                user1: partner,
                user2: socket.id,
                currentTopic: 0,
                usedTopics: [],
                choices: new Map()
            });

            io.to(roomId).emit('matched', { roomId });
        } else {
            waitingUsers.add(socket.id);
        }
    });

    socket.on('readyForTopics', ({ roomId }) => {
        const room = activeRooms.get(roomId);
        if (room) {
            let availableTopics = topics.filter(t => !room.usedTopics.includes(t));
            if (availableTopics.length === 0) {
                availableTopics = topics;
                room.usedTopics = [];
            }
            const randomTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)];
            room.usedTopics.push(randomTopic);
            room.currentTopic++;

            io.to(roomId).emit('newTopic', {
                topic: randomTopic,
                topicNumber: room.currentTopic
            });
        }
    });

    socket.on('offer', ({ offer, roomId }) => {
        socket.to(roomId).emit('offer', offer);
    });

    socket.on('answer', ({ answer, roomId }) => {
        socket.to(roomId).emit('answer', answer);
    });

    socket.on('ice', ({ ice, roomId }) => {
        socket.to(roomId).emit('ice', ice);
    });

    socket.on('dateChoice', ({ roomId, interested }) => {
        const room = activeRooms.get(roomId);
        if (room) {
            room.choices.set(socket.id, interested);

            if (room.choices.size === 2) {
                const bothInterested = Array.from(room.choices.values()).every(choice => choice === true);
                io.to(roomId).emit('matchResult', { 
                    matched: bothInterested,
                    message: bothInterested ? 'You both matched!' : 'No match. Better luck next time!'
                });
                activeRooms.delete(roomId);
            } else {
                // Notify the user that we're waiting for the other person's choice
                socket.emit('waitingForChoice');
            }
        }
    });

    socket.on('disconnect', () => {
        waitingUsers.delete(socket.id);
        for (const [roomId, room] of activeRooms.entries()) {
            if (room.user1 === socket.id || room.user2 === socket.id) {
                socket.to(roomId).emit('partnerDisconnected');
                activeRooms.delete(roomId);
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});