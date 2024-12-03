class QueueManager {
    constructor() {
        this.waitingUsers = [];
        this.activeRooms = new Map();
    }

    addToQueue(user) {
        this.waitingUsers.push(user);
        this.tryMatch();
    }

    tryMatch() {
        if (this.waitingUsers.length >= 2) {
            const user1 = this.waitingUsers.shift();
            const user2 = this.waitingUsers.shift();
            this.createRoom(user1, user2);
        }
    }

    createRoom(user1, user2) {
        const roomId = `room_${Date.now()}`;
        const room = new DateRoom(roomId, user1, user2);
        this.activeRooms.set(roomId, room);
        return roomId;
    }
} 