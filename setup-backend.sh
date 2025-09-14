#!/bin/bash

echo "🚀 Setting up Storywell Backend..."

# Navigate to backend directory
cd backend

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "✅ Backend setup complete!"
echo ""
echo "🎯 To start the backend server:"
echo "   cd backend"
echo "   npm start"
echo ""
echo "🌐 Backend will run on: http://localhost:3001"
echo "📖 Frontend will connect automatically when using localhost"