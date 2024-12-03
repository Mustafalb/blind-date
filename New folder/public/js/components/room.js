class DateRoom {
    constructor(roomId, user1, user2) {
        this.roomId = roomId;
        this.users = [user1, user2];
        this.currentPhase = 0;
        this.topics = this.generateTopics();
        this.currentTopic = 0;
        this.timer = null;
        this.ratings = {
            [user1.id]: new Array(5).fill(0),
            [user2.id]: new Array(5).fill(0)
        };
        this.revealResponses = {
            [user1.id]: null,
            [user2.id]: null
        };
    }

    // ... previous methods ...

    submitTopicRating(userId, rating) {
        if (this.currentTopic < 5) {
            this.ratings[userId][this.currentTopic] = rating;
        }
    }

    submitRevealResponse(userId, willReveal) {
        this.revealResponses[userId] = willReveal;
        this.checkRevealStatus();
    }

    checkRevealStatus() {
        if (this.revealResponses[this.users[0].id] !== null && 
            this.revealResponses[this.users[1].id] !== null) {
            // Only enable video if both users agreed
            const bothAgreed = this.revealResponses[this.users[0].id] && 
                             this.revealResponses[this.users[1].id];
            this.showResults(bothAgreed);
        }
    }

    showResults(enableVideo) {
        return {
            enableVideo,
            ratings: this.ratings,
            topicDiscussion: this.topics.map((topic, index) => ({
                topic,
                ratings: {
                    user1: this.ratings[this.users[0].id][index],
                    user2: this.ratings[this.users[1].id][index]
                }
            }))
        };
    }
} 