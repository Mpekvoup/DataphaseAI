#!/bin/bash

echo "🚀 Starting DataPhase AI - Complete System"
echo "=========================================="
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup EXIT INT TERM

# Start Backend
echo "1️⃣ Starting Backend..."
cd backend
python3 -m venv venv 2>/dev/null
source venv/bin/activate
pip install -q -r requirements.txt
python -m app.main &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 5

# Start Frontend
echo ""
echo "2️⃣ Starting Frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=========================================="
echo "✅ All services started!"
echo ""
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:8000"
echo "📖 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo "=========================================="

# Wait for processes
wait
