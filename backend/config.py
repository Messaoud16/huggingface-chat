import os

# Model Configuration
MODEL_NAME = os.getenv("MODEL_NAME", "microsoft/DialoGPT-small")
MAX_INPUT_LENGTH = int(os.getenv("MAX_INPUT_LENGTH", "500"))
# Response tokens for small model
MAX_RESPONSE_TOKENS = int(os.getenv("MAX_RESPONSE_TOKENS", "30"))
TEMPERATURE = float(os.getenv("TEMPERATURE", "0.8"))

# API Configuration
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8000"))

# CORS Configuration
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]
