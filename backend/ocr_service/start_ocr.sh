#!/bin/bash

echo "Starting OCR Service..."
echo "========================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed or not in PATH"
    echo "Please install Python 3.8+ and try again"
    exit 1
fi

# Install requirements
echo "Installing requirements..."
pip3 install -r requirements.txt

# Start the OCR service
echo "Starting OCR service on port 5001..."
python3 start_ocr_service.py
