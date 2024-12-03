class TopicManager {
    constructor() {
        this.topics = [
            // Life & Personal
            "Money",
            "Family",
            "Career",
            "Dreams",
            "Education",
            
            // Interests & Hobbies
            "Travel",
            "Sports",
            "Music",
            "Food",
            "Movies",
            
            // Values & Beliefs
            "Religion",
            "Politics",
            "Culture",
            "Success",
            "Future",
            
            // Lifestyle
            "Fitness",
            "Fashion",
            "Pets",
            "Technology",
            "Social Media",
            
            // Personal Growth
            "Goals",
            "Fears",
            "Happiness",
            "Friendship",
            "Adventure"
        ];
    }

    getRandomTopics(count = 5) {
        return this.topics
            .sort(() => 0.5 - Math.random())
            .slice(0, count);
    }

    // Optional: Get topics by category
    getTopicsByCategory() {
        return {
            personal: ["Money", "Family", "Career", "Dreams", "Education"],
            interests: ["Travel", "Sports", "Music", "Food", "Movies"],
            values: ["Religion", "Politics", "Culture", "Success", "Future"],
            lifestyle: ["Fitness", "Fashion", "Pets", "Technology", "Social Media"],
            growth: ["Goals", "Fears", "Happiness", "Friendship", "Adventure"]
        };
    }
} 