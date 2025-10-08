@echo off
echo Killing all project services...
echo ===============================

echo.
echo Stopping Node.js processes...
taskkill /f /im node.exe 2>nul

echo.
echo Stopping Python processes...
taskkill /f /im python.exe 2>nul

echo.
echo Checking for processes on ports 5000, 5001, 5173...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000"') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5001"') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173"') do taskkill /f /pid %%a 2>nul

echo.
echo All services killed!
echo You can now run start_project.bat to start fresh.
pause
