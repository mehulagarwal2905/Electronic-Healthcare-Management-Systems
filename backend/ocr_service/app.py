from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import io
import json
from PIL import Image
import google.generativeai as genai
import logging
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

# logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# load .env if present
load_dotenv()

GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "models/gemini-2.5-flash")

def _get_gemini():
    api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GOOGLE_API_KEY not set")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(GEMINI_MODEL)

def _call_gemini_extract(image_bytes: bytes) -> tuple[dict, str]:
    prompt = (
        "Extract prescription details and return as JSON:\n"
        '{ "patient_name": "", "doctor_name": "", '
        '"medications": [ { "name": "", "strength": "", "dose": "", "frequency": "", "duration": "" } ], '
        '"date": "", "instructions": "" }\n'
        "Respond with ONLY valid JSON."
    )

    model = _get_gemini()
    parts = [
        prompt,
        {"mime_type": "image/jpeg", "data": image_bytes},
    ]
    resp = model.generate_content(parts)

    text = None
    if getattr(resp, "candidates", None):
        cand = resp.candidates[0]
        if getattr(cand, "content", None) and getattr(cand.content, "parts", None):
            text = cand.content.parts[0].text
    if text is None and hasattr(resp, "text"):
        text = resp.text

    if not text:
        return {}, ""

    try:
        data = json.loads(text)
        return data, text
    except json.JSONDecodeError:
        return {}, text

@app.route('/health', methods=['GET'])
def health_check():
    ok = True
    msg = "ok"
    try:
        _ = _get_gemini()
    except Exception as e:
        ok = False
        msg = str(e)
    return jsonify({"status": "healthy" if ok else "error", "model": GEMINI_MODEL, "detail": msg})

@app.route('/extract-prescription', methods=['POST'])
def extract_prescription():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400

        f = request.files['image']
        if f.filename == '':
            return jsonify({'error': 'No image file selected'}), 400

        # Ensure JPEG bytes for Gemini
        img = Image.open(f.stream).convert("RGB")
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=85)
        image_bytes = buf.getvalue()

        data, raw = _call_gemini_extract(image_bytes)

        needs_review = False if data else True

        return jsonify({
            'success': True,
            'extracted_data': data or {},
            'confidence_scores': {},
            'overall_confidence': 0.0,
            'needs_review': needs_review,
            'raw_output': raw or ''
        })
    except Exception as e:
        logger.error(f"Error in extract_prescription: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/extract-prescription-base64', methods=['POST'])
def extract_prescription_base64():
    try:
        body = request.get_json() or {}
        b64 = body.get('image')
        if not b64:
            return jsonify({'error': 'No image data provided'}), 400
        import base64
        try:
            image_bytes = base64.b64decode(b64)
        except Exception:
            return jsonify({'error': 'Invalid image data'}), 400

        # Normalize to JPEG (optional for Gemini, but good for consistency)
        try:
            img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
            buf = io.BytesIO()
            img.save(buf, format='JPEG', quality=85)
            image_bytes = buf.getvalue()
        except Exception:
            pass

        data, raw = _call_gemini_extract(image_bytes)
        needs_review = False if data else True
        return jsonify({
            'success': True,
            'extracted_data': data or {},
            'confidence_scores': {},
            'overall_confidence': 0.0,
            'needs_review': needs_review,
            'raw_output': raw or ''
        })
    except Exception as e:
        logger.error(f"Error in extract_prescription_base64: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    logger.info("Starting OCR service (Gemini)...")
    app.run(host='0.0.0.0', port=5001, debug=False)
