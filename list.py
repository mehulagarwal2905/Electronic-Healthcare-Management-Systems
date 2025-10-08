# list_gemini_models.py
import os, google.generativeai as genai
genai.configure(api_key="AIzaSyD2VNe-rpqk7-k4JNWy12XSfpfaCrrVkmo")
print([m.name for m in genai.list_models() if "generateContent" in m.supported_generation_methods])
