@echo off
echo Fixing NumPy compatibility issue...
echo ====================================

echo.
echo Uninstalling current NumPy...
pip uninstall numpy -y

echo.
echo Installing compatible NumPy version...
pip install "numpy<2.0.0"

echo.
echo Installing other OCR dependencies...
cd backend\ocr_service
pip install -r requirements.txt

echo.
echo NumPy fix complete!
echo You can now start the OCR service.
pause
