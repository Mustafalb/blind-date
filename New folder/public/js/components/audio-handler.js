class AudioHandler {
    constructor(roomId) {
        this.roomId = roomId;
        this.stream = null;
        this.peerConnection = null;
    }

    async setupAudioCall() {
        try {
            // Get only audio stream
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            });
            
            // Setup WebRTC peer connection
            this.peerConnection = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' }
                ]
            });

            // Add audio track to peer connection
            this.stream.getAudioTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.stream);
            });

            return true;
        } catch (error) {
            console.error('Error setting up audio:', error);
            return false;
        }
    }

    async enableVideo() {
        if (!this.peerConnection) return false;
        
        try {
            const videoStream = await navigator.mediaDevices.getUserMedia({
                video: true
            });
            
            videoStream.getVideoTracks().forEach(track => {
                this.peerConnection.addTrack(track, videoStream);
            });
            
            return true;
        } catch (error) {
            console.error('Error enabling video:', error);
            return false;
        }
    }
} 