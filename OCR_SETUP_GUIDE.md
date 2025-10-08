# Prescription OCR Setup Guide

This guide will help you set up the Donut-based prescription OCR functionality in your Electronic Healthcare Management System.

## Overview

The OCR system consists of:
1. **Python Flask OCR Service** - Handles image processing with Donut model
2. **Node.js Backend Integration** - API endpoints for OCR processing
3. **React Frontend Components** - User interface for image upload and results

## Prerequisites

### System Requirements
- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **MongoDB** (already configured)
- **4GB+ RAM** (8GB recommended)
- **CUDA GPU** (optional, for faster processing)

### Software Dependencies
- Python packages: `torch`, `transformers`, `flask`, `pillow`, `rapidfuzz`
- Node.js packages: `multer`, `axios`, `form-data`

## Installation Steps

### Step 1: Install Python Dependencies

1. **Navigate to OCR service directory:**
   ```bash
   cd backend/ocr_service
   ```

2. **Install Python packages:**
   ```bash
   pip install -r requirements.txt
   ```

   **Note:** This will download the Donut model (~1.2GB) on first run.

### Step 2: Install Node.js Dependencies

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install new dependencies:**
   ```bash
   npm install
   ```

### Step 3: Start the OCR Service

**Option A: Using startup scripts**

**Windows:**
```bash
cd backend/ocr_service
start_ocr.bat
```

**Linux/Mac:**
```bash
cd backend/ocr_service
./start_ocr.sh
```

**Option B: Manual startup**
```bash
cd backend/ocr_service
python start_ocr_service.py
```

The OCR service will start on `http://localhost:5001`

### Step 4: Start the Main Backend

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Start the Node.js server:**
   ```bash
   npm run dev
   ```

The main backend will start on `http://localhost:5001` (or 5000 if 5001 is occupied)

### Step 5: Start the Frontend

1. **Navigate to project root:**
   ```bash
   cd ..
   ```

2. **Start the React development server:**
   ```bash
   npm run dev
   ```

The frontend will start on `http://localhost:5173`

## Usage

### For Doctors

1. **Login to the system** as a doctor
2. **Navigate to Prescriptions** section
3. **Click "New Prescription"**
4. **Select "OCR Scanner" tab**
5. **Upload prescription image** (JPEG, PNG, WebP)
6. **Click "Process OCR"**
7. **Review extracted data** and confidence scores
8. **Enter patient email** and click "Create Prescription"

### OCR Features

- **Automatic Text Extraction**: Extracts patient name, medication, dosage, frequency, duration, and instructions
- **Confidence Scoring**: Shows confidence levels for each extracted field
- **Manual Review Flagging**: Automatically flags prescriptions needing review
- **Medical Lexicon Validation**: Validates extracted terms against medical terminology
- **Editable Results**: Allows manual correction of extracted data

## API Endpoints

### OCR Processing
```
POST /api/prescriptions/ocr
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body: image file
```

### Create Prescription from OCR
```
POST /api/prescriptions/from-ocr
Content-Type: application/json
Authorization: Bearer <token>

Body: {
  "patientEmail": "patient@example.com",
  "extractedData": { ... },
  "confidenceScores": { ... },
  "overallConfidence": 0.85,
  "needsReview": false,
  "rawOutput": "..."
}
```

## Configuration

### OCR Service Configuration

Edit `backend/ocr_service/app.py` to modify:
- **Medical Lexicon**: Add new medications, dosages, frequencies
- **Confidence Thresholds**: Adjust review requirements
- **Model Parameters**: Fine-tune processing settings

### Backend Configuration

Edit `backend/controllers/prescription.js` to modify:
- **OCR Service URL**: Change if running on different port
- **File Upload Limits**: Adjust size and type restrictions
- **Error Handling**: Customize error responses

### Frontend Configuration

Edit `src/components/doctor/PrescriptionOCR.tsx` to modify:
- **UI Layout**: Change component appearance
- **Validation Rules**: Adjust form validation
- **Confidence Display**: Modify confidence indicators

## Troubleshooting

### Common Issues

1. **OCR Service Won't Start**
   - Check Python version: `python --version`
   - Verify dependencies: `pip list`
   - Check port availability: `netstat -an | grep 5001`

2. **Model Download Fails**
   - Check internet connection
   - Ensure 2GB+ free disk space
   - Try manual download: `python -c "from transformers import DonutProcessor; DonutProcessor.from_pretrained('naver-clova-ix/donut-base')"`

3. **Out of Memory Errors**
   - Reduce image size before upload
   - Close other applications
   - Use smaller images (< 5MB)

4. **Poor OCR Accuracy**
   - Ensure good image quality (high resolution, good contrast)
   - Use clear, readable prescription images
   - Consider fine-tuning the model for your specific format

5. **Frontend Integration Issues**
   - Check browser console for errors
   - Verify API endpoints are accessible
   - Ensure authentication tokens are valid

### Performance Optimization

1. **For Better Speed:**
   - Use CUDA-compatible GPU
   - Process images in smaller batches
   - Optimize image size before upload

2. **For Better Accuracy:**
   - Use high-quality, well-lit images
   - Ensure prescriptions are clearly readable
   - Add domain-specific terms to medical lexicon

## Security Considerations

1. **File Upload Security:**
   - Images are temporarily stored and cleaned up
   - File type and size validation implemented
   - No persistent storage of uploaded images

2. **API Security:**
   - Authentication required for all endpoints
   - Doctor role verification for OCR access
   - Input validation and sanitization

3. **Data Privacy:**
   - OCR processing happens locally
   - No external API calls for image processing
   - Prescription data encrypted in database

## Monitoring and Logs

### OCR Service Logs
- Console output shows processing status
- Error messages for debugging
- Performance metrics (processing time, confidence scores)

### Backend Logs
- API request/response logging
- Error handling and debugging
- Database operation logs

### Frontend Logs
- Browser console for client-side errors
- Network requests in DevTools
- Component state debugging

## Future Enhancements

1. **Model Improvements:**
   - Fine-tune Donut model on prescription dataset
   - Add TrOCR for handwritten text
   - Implement confidence-based ensemble methods

2. **Feature Additions:**
   - Batch processing for multiple prescriptions
   - Prescription template recognition
   - Integration with pharmacy systems

3. **Performance Optimizations:**
   - Model quantization for faster inference
   - Caching for repeated processing
   - Async processing for better UX

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review console logs for error messages
3. Verify all dependencies are correctly installed
4. Ensure all services are running on correct ports

## License

This OCR functionality is part of the Electronic Healthcare Management System project.
