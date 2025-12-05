@echo off
echo 🚀 Starting DataPhase AI Backend...
echo.

cd backend

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate

REM Install dependencies
echo 📚 Installing dependencies...
pip install -q -r requirements.txt

echo.
echo ✅ Starting server on http://localhost:8000
echo 📊 API documentation: http://localhost:8000/docs
echo 🔥 Health check: http://localhost:8000/health
echo.

REM Start server
python -m app.main
