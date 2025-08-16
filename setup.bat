@echo off
echo 🚀 Starting URL Shortener
echo.

echo 📦 Installing dependencies...

REM Install server dependencies
cd Server
if not exist "node_modules" (
    echo Installing server dependencies...
    npm install
)

REM Install client dependencies
cd ..\Client
if not exist "node_modules" (
    echo Installing client dependencies...
    npm install
)

echo.
echo 🔧 Setup complete!
echo.
echo To start:
echo 1. Server: cd Server ^&^& npm run dev
echo 2. Client: cd Client ^&^& npm run dev
echo.
echo Make sure MongoDB is running locally, or update Server\.env with MongoDB Atlas connection string
pause
