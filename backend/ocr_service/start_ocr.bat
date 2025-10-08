@echo off
echo Starting OCR Service...
echo ========================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

REM Install requirements
echo Installing requirements...
pip install -r requirements.txt

REM Start the OCR service
echo Starting OCR service on port 5001...
python start_ocr_service.py

pause
