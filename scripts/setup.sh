#!/bin/bash

set -e

echo "🔧 Scriptinel Setup Script"
echo ""

# Check if nvm is available
if command -v nvm &> /dev/null || [ -s "$HOME/.nvm/nvm.sh" ]; then
    echo "✓ nvm detected"
    
    # Source nvm if not already loaded
    if ! command -v nvm &> /dev/null; then
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    fi
    
    echo "Installing/using Node.js 18..."
    nvm install 18 --latest-npm
    nvm use 18
    
    echo ""
    echo "✓ Node.js version: $(node --version)"
    echo "✓ npm version: $(npm --version)"
else
    echo "⚠ nvm not found. Please ensure Node.js 18+ is installed."
    echo "Current Node.js version: $(node --version)"
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo "❌ Node.js 18+ required. Current: $(node --version)"
        echo "Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
fi

echo ""
echo "Cleaning and reinstalling dependencies..."
rm -rf node_modules package-lock.json
npm install

echo ""
echo "✓ Setup complete!"
echo ""
echo "You can now run:"
echo "  npm run build"
echo "  npm test"

