document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const audioHandler = new AudioHandler();
    const topicManager = new TopicManager();
    let currentRoom = null;

    // UI Elements
    const screens = {
        welcome: document.getElementById('welcome-screen'),
        queue: document.getElementById('queue-screen'),
        date: document.getElementById('date-screen'),
        results: document.getElementById('results-screen')
    };

    // Button Handlers
    document.getElementById('joinQueue').addEventListener('click', () => {
        showScreen('queue');
        socket.emit('joinQueue');
    });

    // Socket Events
    socket.on('matched', async ({ roomId }) => {
        currentRoom = new DateRoom(roomId, socket.id);
        await audioHandler.setupAudioCall();
        showScreen('date');
        currentRoom.startPhase1();
    });

    // Helper Functions
    function showScreen(screenName) {
        Object.values(screens).forEach(screen => screen.classList.add('hidden'));
        screens[screenName].classList.remove('hidden');
    }
}); 