import os
import json
import google.generativeai as genai
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY", "LOCAL_TEST_MODE")
if API_KEY != "LOCAL_TEST_MODE":
    genai.configure(api_key=API_KEY)

def analyze_xray(image_path: str, context: dict = {}, past_history_json: str = None) -> dict:
    if API_KEY == "LOCAL_TEST_MODE" or not API_KEY:
        return {
            "clinical_assessment": {
                "diseases": ["Multifocal Pneumonia"],
                "severity": "High",
                "confidence_score": 94,
                "key_findings": "Bilateral ground-glass opacities consistent with viral pneumonitis.",
                "differential_diagnosis": "Consider ARDS."
            },
            "patient_layman_assessment": {
                "layman_diseases": ["Lung Infection"],
                "layman_findings": "There are cloudy white spots across both lungs.",
                "layman_summary": "Your symptoms suggest a lung infection.",
                "treatment_timeline": [{"phase": "Immediate Steps", "action": "Rest immediately."}]
            },
            "referrals": "Consult a Pulmonologist."
        }

    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        img = Image.open(image_path)
        img.thumbnail((1024, 1024))
        
        prompt = f"""
        Analyze this X-ray. 
        Context: Age {context.get('age')}, Gender {context.get('gender')}, Symptoms {context.get('symptoms')}.
        Output STRICT JSON:
        {{
            "clinical_assessment": {{ "diseases": [], "severity": "Low", "confidence_score": 0, "key_findings": "", "differential_diagnosis": "" }},
            "patient_layman_assessment": {{ "layman_diseases": [], "layman_findings": "", "layman_summary": "", "treatment_timeline": [] }},
            "referrals": ""
        }}
        """
        response = model.generate_content([prompt, img])
        return json.loads(response.text.strip().replace("```json", "").replace("```", ""))
    except Exception as e:
        print(f"Error: {e}")
        return { "clinical_assessment": {"diseases": ["Error"], "severity": "Critical", "confidence_score": 0, "key_findings": str(e), "differential_diagnosis": ""}, "patient_layman_assessment": {"layman_diseases": [], "layman_findings": "", "layman_summary": "", "treatment_timeline": []}, "referrals": "" }

def chat_interrogate_xray(image_name: str, question: str) -> str:
    if API_KEY == "LOCAL_TEST_MODE" or not API_KEY:
        return "Mock Answer: " + question

    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        image_path = os.path.join("temp_uploads", image_name)
        
        if not os.path.exists(image_path):
            return f"Error: Image '{image_name}' not found in temporal storage."
            
        img = Image.open(image_path)
        
        prompt = f"""
        You are a senior radiologist assistant. 
        A doctor is asking a specific question about this X-ray: "{question}"
        Provide a concise, clinically accurate answer based strictly on the visual evidence in the image.
        """
        
        response = model.generate_content([prompt, img])
        return response.text.strip()
    except Exception as e:
        print(f"Chat Interrogate Error: {e}")
        return f"System was unable to analyze the image frame. Error: {str(e)}"

def simulate_doctor_consult(history: list, latest_message: str) -> str:
    if API_KEY == "LOCAL_TEST_MODE" or not API_KEY:
        return "Mock Doctor: " + latest_message

    try:
        # System instruction to set the persona
        system_instruction = """
        You are 'Med-AI', a professional and empathetic virtual physician. 
        Your goal is to conduct a clinical interview with a patient to understand their symptoms.
        - Be professional, concise, and empathetic.
        - Ask clarifying questions about their symptoms (duration, severity, triggers).
        - Provide preliminary medical insights but always include a disclaimer that you are an AI.
        - Do not give definitive prescriptions, but suggest over-the-counter care or specialist visits if appropriate.
        - Keep responses relatively short for voice synthesis compatibility.
        """
        
        model = genai.GenerativeModel(
            model_name='gemini-flash-latest',
            system_instruction=system_instruction
        )
        
        # Convert history to Gemini format
        chat = model.start_chat(history=[
            {"role": msg["role"], "parts": [msg["content"]]} for msg in history
        ])
        
        response = chat.send_message(latest_message)
        return response.text.strip()
    except Exception as e:
        print(f"Consult Chat Error: {e}")
        return "I apologize, but I am having trouble connecting to my clinical knowledge base. Please try again in a moment."
