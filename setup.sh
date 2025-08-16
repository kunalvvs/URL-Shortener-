#!/bin/bash

echo "🚀 Starting URL Shortener"
echo ""

# Check if MongoDB is running (for local setup)
if command -v mongo &> /dev/null || command -v mongosh &> /dev/null; then
    echo "✅ MongoDB client found"
else
    echo "⚠️  MongoDB client not found - make sure MongoDB is installed and running"
    echo "   Or use MongoDB Atlas (cloud) - see README for setup"
fi

echo ""
echo "📦 Installing dependencies..."

# Install server dependencies
cd Server
if [ ! -d "node_modules" ]; then
    echo "Installing server dependencies..."
    npm install
fi

# Install client dependencies  
cd ../Client
if [ ! -d "node_modules" ]; then
    echo "Installing client dependencies..."
    npm install
fi

echo ""
echo "🔧 Setup complete!"
echo ""
echo "To start:"
echo "1. Server: cd Server && npm run dev"
echo "2. Client: cd Client && npm run dev"
echo ""
echo "Or use MongoDB Atlas by updating Server/.env with your connection string"
