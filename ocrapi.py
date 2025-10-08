import os
import json
from PIL import Image
import google.generativeai as genai

# 1. API Key
API_KEY = "AIzaSyD2VNe-rpqk7-k4JNWy12XSfpfaCrrVkmo"
genai.configure(api_key=API_KEY)

# 2. Model
MODEL_NAME = "models/gemini-2.5-flash"
model = genai.GenerativeModel(MODEL_NAME)

# 3. Load prescription image
IMAGE_PATH = r"C:\Users\Pawan_Mohit\Desktop\images.jpeg"
img = Image.open(IMAGE_PATH).convert("RGB")

# 4. Prompt
prompt = (
    "Extract prescription details and return as JSON:\n"
    '{ "patient_name": "", "doctor_name": "", '
    '"medications": [ { "name": "", "strength": "", "dose": "", "frequency": "", "duration": "" } ], '
    '"date": "", "instructions": "" }\n'
    "Respond with ONLY valid JSON."
)

# 5. Call API (no strict mime type)
response = model.generate_content([prompt, img])

# 6. Try to parse JSON
output_text = None
if response.candidates:
    if response.candidates[0].content.parts:
        output_text = response.candidates[0].content.parts[0].text
    elif hasattr(response, "text"):
        output_text = response.text

if output_text:
    try:
        data = json.loads(output_text)
        print("✅ Structured Prescription Data:\n")
        print(json.dumps(data, indent=2))
    except json.JSONDecodeError:
        print("⚠️ Could not parse JSON, raw output:\n")
        print(output_text)
else:
    print("❌ No usable output from model.")
