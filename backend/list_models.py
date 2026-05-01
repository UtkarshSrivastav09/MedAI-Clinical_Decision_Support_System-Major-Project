import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    print("No API Key found in .env")
else:
    client = genai.Client(api_key=API_KEY)
    print("Available Models:")
    try:
        for m in client.models.list():
            print(f"- {m.name}")
    except Exception as e:
        print(f"Error listing models: {e}")
