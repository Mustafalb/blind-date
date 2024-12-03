@echo off
echo Checking and fixing project structure...

:: Create main directories if they don't exist
if not exist "src" mkdir src
if not exist "src\server" mkdir src\server
if not exist "public" mkdir public
if not exist "public\js" mkdir public\js
if not exist "public\css" mkdir public\css
if not exist "public\js\components" mkdir public\js\components

:: Create package.json properly
echo Creating package.json...
(
echo {
echo   "name": "speed-dating-app",
echo   "version": "1.0.0",
echo   "description": "Speed Dating Application",
echo   "main": "src/server/index.js",
echo   "scripts": {
echo     "start": "node src/server/index.js",
echo     "dev": "nodemon src/server/index.js"
echo   },
echo   "dependencies": {
echo     "express": "^4.17.1",
echo     "socket.io": "^4.0.0"
echo   }
echo }
) > package.json

:: Install dependencies
echo Installing dependencies...
call npm install express socket.io
call npm install nodemon --save-dev

:: Create server file if it doesn't exist
if not exist "src\server\index.js" (
    echo Creating server file...
    (
    echo const express = require^('express'^);
    echo const app = express^(^);
    echo const http = require^('http'^).createServer^(app^);
    echo const io = require^('socket.io'^)^(http^);
    echo const path = require^('path'^);
    echo.
    echo // Middleware
    echo app.use^(express.json^(^)^);
    echo app.use^(express.static^(path.join^(__dirname, '../../public'^)^)^);
    echo.
    echo // Routes
    echo app.get^('/', ^(req, res^) ^=^> {
    echo     res.sendFile^(path.join^(__dirname, '../../public/index.html'^)^);
    echo }^);
    echo.
    echo // Socket.IO connection handling
    echo io.on^('connection', ^(socket^) ^=^> {
    echo     console.log^('User connected:', socket.id^);
    echo }^);
    echo.
    echo // Start server
    echo const PORT = process.env.PORT ^|^| 3000;
    echo http.listen^(PORT, ^(^) ^=^> {
    echo     console.log^(`Server running on http://localhost:${PORT}`^);
    echo }^);
    ) > "src\server\index.js"
)

:: Create index.html if it doesn't exist
if not exist "public\index.html" (
    echo Creating index.html...
    (
    echo ^<!DOCTYPE html^>
    echo ^<html lang="en"^>
    echo ^<head^>
    echo     ^<meta charset="UTF-8"^>
    echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^>
    echo     ^<title^>Speed Dating App^</title^>
    echo     ^<script src="/socket.io/socket.io.js"^>^</script^>
    echo ^</head^>
    echo ^<body^>
    echo     ^<div id="app"^>^</div^>
    echo     ^<script src="/js/main.js"^>^</script^>
    echo ^</body^>
    echo ^</html^>
    ) > "public\index.html"
)

:: Create main.js if it doesn't exist
if not exist "public\js\main.js" (
    echo Creating main.js...
    (
    echo const socket = io^(^);
    echo.
    echo socket.on^('connect', ^(^) ^=^> {
    echo     console.log^('Connected to server'^);
    echo }^);
    ) > "public\js\main.js"
)

:: Create basic CSS file
if not exist "public\css\style.css" (
    echo Creating style.css...
    (
    echo body {
    echo     margin: 0;
    echo     padding: 20px;
    echo     font-family: Arial, sans-serif;
    echo }
    ) > "public\css\style.css"
)

:: Check if everything is set up correctly
echo.
echo Checking final structure...
echo.
dir /s /b

:: Create a start script
(
echo @echo off
echo echo Starting server...
echo npm start
echo pause
) > start.bat

echo.
echo Setup complete! Run 'start.bat' to start the server.
echo.
pause