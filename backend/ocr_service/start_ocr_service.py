#!/usr/bin/env python3
"""
Startup script for the OCR service
This script handles model downloading and service startup
"""

import os
import sys
import subprocess
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def install_requirements():
    """Install required packages"""
    logger.info("Installing requirements...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        logger.info("Requirements installed successfully!")
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to install requirements: {e}")
        sys.exit(1)

def download_models():
    """Download Donut models if not already present"""
    logger.info("Checking for Donut models...")
    
    try:
        from transformers import DonutProcessor, VisionEncoderDecoderModel
        
        model_id = "naver-clova-ix/donut-base"
        
        # Check if models are already downloaded
        cache_dir = os.path.expanduser("~/.cache/huggingface/transformers")
        model_path = os.path.join(cache_dir, "models--naver-clova-ix--donut-base")
        
        if not os.path.exists(model_path):
            logger.info("Downloading Donut models (this may take a while)...")
            processor = DonutProcessor.from_pretrained(model_id)
            model = VisionEncoderDecoderModel.from_pretrained(model_id)
            logger.info("Models downloaded successfully!")
        else:
            logger.info("Models already downloaded!")
            
    except Exception as e:
        logger.error(f"Error downloading models: {e}")
        sys.exit(1)

def start_service():
    """Start the OCR service"""
    logger.info("Starting OCR service...")
    try:
        from app import app, load_model
        load_model()
        app.run(host='0.0.0.0', port=5001, debug=False)
    except Exception as e:
        logger.error(f"Error starting service: {e}")
        sys.exit(1)

if __name__ == "__main__":
    logger.info("OCR Service Startup Script")
    logger.info("=" * 50)
    
    # Install requirements
    install_requirements()
    
    # Download models
    download_models()
    
    # Start service
    start_service()
