@echo off
echo Starting Electronic Healthcare Management System with OCR (FIXED)
echo =================================================================

echo.
echo Step 1: Installing fixed dependencies for OCR service...
cd backend\ocr_service
pip install -r requirements.txt
cd ..\..

echo.
echo Step 2: Starting OCR Service (Python/Flask) on port 5001...
start "OCR Service" cmd /k "cd backend\ocr_service && python app.py"

echo.
echo Waiting 20 seconds for OCR service to start...
timeout /t 20 /nobreak > nul

echo.
echo Step 3: Starting Node.js Backend on port 5000...
start "Backend API" cmd /k "cd backend && set PORT=5000 && npm run dev"

echo.
echo Waiting 10 seconds for backend to start...
timeout /t 10 /nobreak > nul

echo.
echo Step 4: Starting React Frontend on port 5173...
start "Frontend" cmd /k "npm run dev"

echo.
echo All services are starting...
echo.
echo OCR Service: http://localhost:5001/health
echo Backend API: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to test the services...
pause > nul

echo.
echo Testing services...
python test_ports_simple.py

echo.
echo Project startup complete!
echo Open http://localhost:5173 in your browser to use the application.
pause
