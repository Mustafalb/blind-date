class SpeedDating {
    constructor() {
        this.socket = io();
        this.localStream = null;
        this.remoteStream = null;
        this.pc = null;
        this.currentRoom = null;

        // DOM elements
        this.joinBtn = document.getElementById('joinBtn');
        this.status = document.getElementById('status');
        this.localVideo = document.getElementById('localVideo');
        this.remoteVideo = document.getElementById('remoteVideo');
        this.phase = document.getElementById('phase');
        this.timer = document.getElementById('timer');
        this.topic = document.getElementById('topic');
        this.decisionButtons = document.getElementById('decisionButtons');
        this.matchResult = document.getElementById('matchResult');

        this.settings = {
            warmupTime: 30,
            topicTime: 120,
            numberOfTopics: 3
        };

        // Hide remote video initially but keep audio
        this.remoteVideo.style.display = 'none';
        this.remoteVideo.muted = false; // Ensure remote audio is not muted

        this.joinBtn.onclick = () => this.join();
        this.setupSocketEvents();
        this.setupInitialMedia();
    }

    async setupInitialMedia() {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            this.localVideo.srcObject = this.localStream;
            this.localVideo.muted = true; // Mute local video to prevent echo
            this.joinBtn.disabled = false;
            this.status.textContent = 'Ready to start';
        } catch (err) {
            console.error('Media setup error:', err);
            this.status.textContent = 'Error accessing camera/microphone';
        }
    }

    setupSocketEvents() {
        this.socket.on('matched', ({ roomId }) => {
            this.currentRoom = roomId;
            this.status.textContent = 'Matched! Starting warmup...';
            this.phase.textContent = 'Warmup Phase';
            this.topic.textContent = `${this.settings.warmupTime} seconds to introduce yourself!`;
            this.setupWebRTC();
            
            this.startTimer(this.settings.warmupTime, () => {
                this.startTopicsPhase();
            });
        });

        this.socket.on('newTopic', ({ topic, topicNumber }) => {
            this.topic.textContent = `Topic ${topicNumber}: ${topic}`;
            
            this.startTimer(this.settings.topicTime, () => {
                if (topicNumber < this.settings.numberOfTopics) {
                    this.socket.emit('readyForTopics', { roomId: this.currentRoom });
                } else {
                    this.showDecisionPhase();
                }
            });
        });

        this.socket.on('offer', async (offer) => {
            await this.handleOffer(offer);
        });

        this.socket.on('answer', async (answer) => {
            await this.handleAnswer(answer);
        });

        this.socket.on('ice', async (ice) => {
            await this.handleIce(ice);
        });

        this.socket.on('waitingForChoice', () => {
            this.matchResult.textContent = 'Waiting for other person\'s choice...';
            this.matchResult.className = 'waiting';
        });

        this.socket.on('matchResult', ({ matched, message }) => {
            this.decisionButtons.style.display = 'none';
            this.matchResult.textContent = message;
            this.matchResult.className = matched ? 'match-success' : 'match-failure';

            // Only show remote video if both parties matched
            if (matched && this.remoteStream) {
                this.remoteVideo.srcObject = this.remoteStream;
                this.remoteVideo.style.display = 'block';
            }
        });

        this.socket.on('partnerDisconnected', () => {
            this.matchResult.textContent = 'Partner disconnected';
            this.matchResult.className = 'match-failure';
            this.remoteVideo.style.display = 'none';
            this.cleanup();
        });
    }

    async setupWebRTC() {
        this.pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        this.localStream.getTracks().forEach(track => 
            this.pc.addTrack(track, this.localStream));

        this.pc.ontrack = (event) => {
            // Set up remote stream immediately for audio
            if (!this.remoteVideo.srcObject) {
                this.remoteVideo.srcObject = event.streams[0];
                this.remoteStream = event.streams[0];
                this.remoteVideo.style.display = 'none'; // Keep video hidden
            }
        };

        this.pc.onicecandidate = ({ candidate }) => {
            if (candidate) {
                this.socket.emit('ice', { ice: candidate, roomId: this.currentRoom });
            }
        };

        if (this.socket.id === this.currentRoom.split('_')[1]) {
            const offer = await this.pc.createOffer();
            await this.pc.setLocalDescription(offer);
            this.socket.emit('offer', { offer, roomId: this.currentRoom });
        }
    }

    async handleOffer(offer) {
        await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);
        this.socket.emit('answer', { answer, roomId: this.currentRoom });
    }

    async handleAnswer(answer) {
        await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
    }

    async handleIce(ice) {
        if (this.pc) {
            await this.pc.addIceCandidate(new RTCIceCandidate(ice));
        }
    }

    startTopicsPhase() {
        this.phase.textContent = 'Topics Phase';
        this.socket.emit('readyForTopics', { roomId: this.currentRoom });
    }

    startTimer(seconds, onComplete) {
        let timeLeft = seconds;
        this.timer.textContent = timeLeft;

        const timerInterval = setInterval(() => {
            timeLeft--;
            this.timer.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                if (onComplete) onComplete();
            }
        }, 1000);
    }

    showDecisionPhase() {
        this.phase.textContent = 'Decision Phase';
        this.timer.textContent = '';
        this.topic.textContent = 'Would you like to continue chatting with this person?';
        this.decisionButtons.style.display = 'block';
    }

    handleChoice(interested) {
        const buttons = this.decisionButtons.getElementsByTagName('button');
        Array.from(buttons).forEach(btn => btn.disabled = true);
        
        this.socket.emit('dateChoice', {
            roomId: this.currentRoom,
            interested
        });
    }

    join() {
        this.socket.emit('joinQueue');
        this.status.textContent = 'Finding a partner...';
        this.joinBtn.disabled = true;
    }

    cleanup() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }
        if (this.pc) {
            this.pc.close();
        }
        this.pc = null;
        this.currentRoom = null;
        this.joinBtn.disabled = false;
        this.remoteVideo.style.display = 'none';
        this.remoteStream = null;
    }
}

const app = new SpeedDating();