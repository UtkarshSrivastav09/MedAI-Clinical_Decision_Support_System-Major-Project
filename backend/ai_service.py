import os
import json
import google.generativeai as genai
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

# SIMPLE STABLE CONFIGURATION
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

def analyze_xray(image_path: str, context: dict = {}, past_history_json: str = None) -> dict:
    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        img = Image.open(image_path)
        img.thumbnail((1024, 1024))
        
        prompt = f"""
        Analyze this X-ray image in detail. 
        Context: Age {context.get('age')}, Gender {context.get('gender')}, Symptoms {context.get('symptoms')}.
        
        Return the results in the following STRICT JSON format:
        {{
            "clinical_assessment": {{
                "diseases": ["Technical Name 1", "Technical Name 2"],
                "severity": "Low/Medium/High/Critical",
                "confidence_score": 95,
                "key_findings": "Detailed medical findings here...",
                "differential_diagnosis": "Other possibilities...",
                "recommended_followup": "Next medical steps..."
            }},
            "patient_layman_assessment": {{
                "layman_diseases": ["Simple Name 1"],
                "layman_findings": "What you see in simple terms...",
                "layman_summary": "A warm 2-sentence summary for the patient.",
                "treatment_timeline": [
                    {{"phase": "Immediate", "action": "Step 1"}},
                    {{"phase": "Next Week", "action": "Step 2"}}
                ]
            }},
            "visual_annotations": [
                {{"box_2d": [100, 100, 200, 200], "label": "Detected Condition", "confidence": 95}}
            ],
            "referrals": "Specialist to visit"
        }}
        
        Note: box_2d should be [ymin, xmin, ymax, xmax] in normalized coordinates (0-1000).
        Ensure no conversational text is included, only the JSON object.
        """
        response = model.generate_content([prompt, img])
        cleaned_response = response.text.strip().replace("```json", "").replace("```", "")
        return json.loads(cleaned_response)

    except Exception as e:
        print(f"Analysis Error: {e}")
        return {
            "clinical_assessment": {
                "diseases": ["System Error"],
                "severity": "Critical",
                "confidence_score": 0,
                "key_findings": f"Error: {str(e)}",
                "differential_diagnosis": "N/A",
                "recommended_followup": "Retry analysis."
            },
            "patient_layman_assessment": {
                "layman_diseases": ["Technical Issue"],
                "layman_findings": "The system could not process the image.",
                "layman_summary": "Diagnostic engine error. Please check your API key.",
                "treatment_timeline": [{"phase": "Error", "action": "Contact Support"}]
            },
            "referrals": "IT Support"
        }

def chat_interrogate_xray(image_name: str, question: str) -> str:
    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        image_path = os.path.join("temp_uploads", image_name)
        if not os.path.exists(image_path):
            return f"Error: Image '{image_name}' not found."
            
        img = Image.open(image_path)
        prompt = f"You are a radiologist. Answer: {question}"
        response = model.generate_content([prompt, img])
        return response.text.strip()
    except Exception as e:
        return f"System error: {str(e)}"

def simulate_doctor_consult(history: list, latest_message: str) -> str:
    try:
        model = genai.GenerativeModel('gemini-flash-latest')
        
        # Professional System Prompt
        system_intro = """
        You are 'Med-AI', a senior virtual physician conducting a clinical interview.
        1. Ask 2 specific, clarifying questions to investigate symptoms.
        2. DO NOT use asterisks (*) or markdown bolding.
        3. Keep the tone professional.
        4. Always put the Emergency Disclaimer at the bottom.
        """

        formatted_history = []
        for msg in history:
            role = "user" if msg["role"] == "user" else "model"
            formatted_history.append({"role": role, "parts": [msg["content"]]})

        chat = model.start_chat(history=formatted_history)
        prompt = f"{system_intro}\n\nPatient: {latest_message}"
        response = chat.send_message(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Consult Error: {e}")
        # Simplest fallback
        try:
            model = genai.GenerativeModel('gemini-flash-latest')
            resp = model.generate_content(f"Doctor response to: {latest_message}")
            return resp.text.strip()
        except:
            return "Connection established, but the neural engine is warming up. Please try again in a moment."
