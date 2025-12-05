#!/bin/bash

echo "🚀 Starting DataPhase AI Backend..."
echo ""

cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing dependencies..."
pip install -q -r requirements.txt

echo ""
echo "✅ Starting server on http://localhost:8000"
echo "📊 API documentation: http://localhost:8000/docs"
echo "🔥 Health check: http://localhost:8000/health"
echo ""

# Start server
python -m app.main
