# Prescription OCR Service

This service provides OCR (Optical Character Recognition) functionality for prescription images using the Donut model from Hugging Face.

## Features

- **Donut Model Integration**: Uses the `naver-clova-ix/donut-base` model for prescription text extraction
- **Medical Lexicon Validation**: Validates extracted data against medical terminology
- **Confidence Scoring**: Provides confidence scores for each extracted field
- **Manual Review Flagging**: Automatically flags prescriptions that need manual review
- **RESTful API**: Simple HTTP endpoints for image processing

## Prerequisites

- Python 3.8 or higher
- pip package manager
- At least 4GB RAM (8GB recommended for better performance)
- CUDA-compatible GPU (optional, for faster processing)

## Installation

1. **Navigate to the OCR service directory:**
   ```bash
   cd backend/ocr_service
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the service:**
   
   **On Windows:**
   ```bash
   start_ocr.bat
   ```
   
   **On Linux/Mac:**
   ```bash
   ./start_ocr.sh
   ```
   
   **Or manually:**
   ```bash
   python start_ocr_service.py
   ```

## API Endpoints

### Health Check
```
GET /health
```
Returns the service status and model loading information.

### Process Prescription Image
```
POST /extract-prescription
Content-Type: multipart/form-data

Body:
- image: Image file (JPEG, PNG, WebP)
```

**Response:**
```json
{
  "success": true,
  "extracted_data": {
    "patient": "John Doe",
    "medication": "Amoxicillin",
    "dosage": "500mg",
    "frequency": "twice daily",
    "duration": "7 days",
    "instructions": "Take with food"
  },
  "confidence_scores": {
    "patient": 0.95,
    "medication": 0.88,
    "dosage": 0.92,
    "frequency": 0.85,
    "duration": 0.90,
    "instructions": 0.75
  },
  "overall_confidence": 0.88,
  "needs_review": false,
  "raw_output": "<s_rx>...</s_rx>"
}
```

### Process Base64 Image
```
POST /extract-prescription-base64
Content-Type: application/json

Body:
{
  "image": "base64_encoded_image_data"
}
```

## Configuration

### Medical Lexicon
The service includes a built-in medical lexicon for validation:
- **Medications**: Common drug names and brands
- **Dosages**: Standard dosage units and amounts
- **Frequencies**: Common prescription frequencies
- **Durations**: Standard treatment durations

### Confidence Thresholds
- **High Confidence**: ≥ 80% (green)
- **Medium Confidence**: 60-79% (yellow)
- **Low Confidence**: < 60% (red)
- **Review Required**: Overall confidence < 70% or any field < 50%

## Model Information

- **Model**: `naver-clova-ix/donut-base`
- **Type**: Vision-Encoder-Decoder Transformer
- **Input**: RGB images
- **Output**: Structured JSON data
- **Size**: ~1.2GB (downloads automatically on first run)

## Performance

- **CPU Processing**: ~10-30 seconds per image
- **GPU Processing**: ~2-5 seconds per image (with CUDA)
- **Memory Usage**: ~2-4GB RAM
- **Supported Formats**: JPEG, PNG, WebP
- **Max File Size**: 10MB

## Error Handling

The service handles various error scenarios:
- Invalid image formats
- Corrupted image files
- Model loading failures
- Processing timeouts
- Memory limitations

## Integration with Main Application

The OCR service integrates with the main Electronic Healthcare Management System through:

1. **Backend Integration**: Node.js/Express endpoints that proxy requests to the OCR service
2. **Frontend Integration**: React components for image upload and result display
3. **Database Storage**: OCR metadata stored in MongoDB with prescription records

## Troubleshooting

### Common Issues

1. **Model Download Fails**
   - Check internet connection
   - Ensure sufficient disk space (2GB+)
   - Try running with `--no-cache` flag

2. **Out of Memory Errors**
   - Reduce image size before processing
   - Close other applications
   - Consider using a machine with more RAM

3. **CUDA Errors**
   - Install CUDA toolkit if using GPU
   - Fall back to CPU processing if GPU unavailable

4. **Service Won't Start**
   - Check Python version (3.8+ required)
   - Verify all dependencies installed
   - Check port 5001 availability

### Logs
Service logs are output to the console. For production deployment, consider redirecting to log files:

```bash
python start_ocr_service.py > ocr_service.log 2>&1
```

## Development

### Adding New Medical Terms
Edit the `MEDICAL_LEXICON` dictionary in `app.py` to add new terms:

```python
MEDICAL_LEXICON = {
    'medications': [
        # Add new medications here
        'new_drug_name',
    ],
    # ... other categories
}
```

### Customizing Confidence Thresholds
Modify the confidence calculation logic in the `extract_prescription_data` function.

### Fine-tuning the Model
For better accuracy on specific prescription formats, consider fine-tuning the Donut model with your own dataset.

## Security Considerations

- The service runs on localhost by default
- No authentication is implemented (handled by main application)
- File uploads are temporarily stored and cleaned up
- Consider implementing rate limiting for production use

## License

This OCR service is part of the Electronic Healthcare Management System project.
