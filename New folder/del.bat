#!/bin/bash

# Create backup
timestamp=$(date +%Y%m%d_%H%M%S)
backup_dir="../project_backup_$timestamp"
mkdir -p "$backup_dir"
cp -r . "$backup_dir"

# Create new directory structure
mkdir -p src/server
mkdir -p public/js/components
mkdir -p public/css

# Move server file to correct location
mv public/server.js src/server/index.js

# Move client-side JavaScript files to components
mv public/js/audio-handler.js public/js/components/
mv public/js/queue.js public/js/components/
mv public/js/room.js public/js/components/
mv public/js/topic-manager.js public/js/components/

# Create index.html if it doesn't exist
cat > public/index.html << 'EOL'
<!DOCTYPE html>
<html>
<head>
    <title>Speed Dating App</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <div id="welcome-screen">
        <button id="joinQueue">Join Queue</button>
    </div>
    <div id="queue-screen" class="hidden">
        <p>Finding your match...</p>
    </div>
    <div id="date-screen" class="hidden">
        <!-- Date screen content -->
    </div>
    <div id="results-screen" class="hidden">
        <!-- Results screen content -->
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script src="/js/components/audio-handler.js"></script>
    <script src="/js/components/queue.js"></script>
    <script src="/js/components/room.js"></script>
    <script src="/js/components/topic-manager.js"></script>
    <script src="/js/main.js"></script>
</body>
</html>
EOL

# Create basic CSS file
cat > public/css/style.css << 'EOL'
.hidden {
    display: none;
}
EOL

# Create package.json if it doesn't exist
cat > package.json << 'EOL'
{
  "name": "speed-dating-app",
  "version": "1.0.0",
  "main": "src/server/index.js",
  "scripts": {
    "start": "node src/server/index.js",
    "dev": "nodemon src/server/index.js"
  },
  "dependencies": {
    "express": "^4.17.1",
    "socket.io": "^4.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.7"
  }
}
EOL

# Remove old files and empty directories
rm -rf public/server
find . -type d -empty -delete

echo "Project restructured! Backup created at: $backup_dir"
echo "Run 'npm install' to install dependencies"