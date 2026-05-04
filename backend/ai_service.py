import os
import json
import google.generativeai as genai
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

def get_keys():
    # Reload .env every time to catch manual changes
    from dotenv import load_dotenv
    load_dotenv(override=True)
    keys = [
        os.getenv("GEMINI_API_KEY"),
        os.getenv("GEMINI_API_KEY_2"),
        os.getenv("GEMINI_API_KEY_3")
    ]
    return [k for k in keys if k]

current_key_index = 0

def get_rotated_model(model_name="gemini-flash-latest"):
    global current_key_index
    keys = get_keys()
    if not keys:
        raise Exception("No API keys found in .env file")
    
    if current_key_index >= len(keys):
        current_key_index = 0
        
    active_key = keys[current_key_index]
    # Log masked key for debugging without exposing it
    masked_key = active_key[:8] + "..." + active_key[-4:]
    print(f"System: Using API Key {current_key_index + 1}/{len(keys)} ({masked_key})")
    
    genai.configure(api_key=active_key)
    return genai.GenerativeModel(model_name)

def switch_to_next_key():
    global current_key_index
    keys = get_keys()
    if len(keys) > 1:
        current_key_index = (current_key_index + 1) % len(keys)
        print(f"System: Rotating to next key. New active index: {current_key_index}")
    else:
        print("System: No more keys to rotate.")

def analyze_xray(image_path: str, context: dict = {}, past_history_json: str = None) -> dict:
    # Try each available API key if quota is hit
    keys = get_keys()
    for attempt in range(len(keys)):
        try:
            model = get_rotated_model("gemini-flash-latest")
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
            
            # Robust JSON cleaning: Remove trailing commas before closing braces/brackets
            import re
            cleaned_response = re.sub(r',\s*([\]}])', r'\1', cleaned_response)
            
            return json.loads(cleaned_response)

        except Exception as e:
            error_msg = str(e)
            print(f"DEBUG: Key {current_key_index + 1} Error -> {error_msg[:100]}")
            
            if "429" in error_msg or "quota" in error_msg.lower():
                print(f"System: Key {current_key_index + 1} is exhausted. Trying next...")
                switch_to_next_key()
                continue
            
            if "finish_reason: SAFETY" in error_msg or "HARM" in error_msg:
                return {
                    "clinical_assessment": { "diseases": ["Safety Filter Blocked"] },
                    "patient_layman_assessment": { "layman_summary": "The AI declined to analyze this image due to safety filters. This usually happens if the image is detected as non-medical or sensitive." }
                }
            
            print(f"Analysis Error: {e}")
            return {
                "clinical_assessment": { "diseases": ["System Error"] },
                "patient_layman_assessment": { "layman_summary": f"Neural engine error: {str(e)}" }
            }
    
    # If all keys fail
    return { 
        "clinical_assessment": { "diseases": ["Quota Exhausted"] }, 
        "patient_layman_assessment": { "layman_summary": "All API keys have exceeded their quota. Please wait for 20 minutes for Google to reset your limit." } 
    }

def chat_interrogate_xray(image_name: str, question: str) -> str:
    keys = get_keys()
    for attempt in range(len(keys)):
        try:
            model = get_rotated_model("gemini-flash-latest")
            image_path = os.path.join("temp_uploads", image_name)
            if not os.path.exists(image_path):
                return f"Error: Image '{image_name}' not found."
                
            img = Image.open(image_path)
            prompt = f"You are a radiologist. Answer: {question}"
            response = model.generate_content([prompt, img])
            return response.text.strip()
        except Exception as e:
            if "429" in str(e) or "quota" in str(e).lower():
                switch_to_next_key()
                continue
            return f"System error: {str(e)}"
    return "All API keys quota exceeded. Please wait or update keys."

def translate_clinical_text(text: str, target_lang: str) -> str:
    keys = get_keys()
    for attempt in range(len(keys)):
        try:
            model = get_rotated_model("gemini-flash-latest")
            prompt = f"""
            Translate the following clinical text strictly into {target_lang}. 
            REQUIREMENTS:
            1. The ENTIRE response must be in {target_lang} only. 
            2. Use a professional, empathetic, and clear clinical tone (suitable for a patient).
            3. Do not include any English words or explanations in the response.
            4. DO NOT use markdown bolding, asterisks, or special characters.
            
            TEXT TO TRANSLATE:
            {text}
            """
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            if "429" in str(e) or "quota" in str(e).lower():
                switch_to_next_key()
                continue
            return f"Translation Error: {str(e)}"
            
    # Final Fallback if all keys exhausted
    return "The translation service is currently unavailable due to API quota limits. Please try again in 20 minutes."

def simulate_doctor_consult(history: list, latest_message: str) -> str:
    keys = get_keys()
    for attempt in range(len(keys)):
        try:
            model = get_rotated_model("gemini-flash-latest")
            
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
            if "429" in str(e) or "quota" in str(e).lower():
                switch_to_next_key()
                continue
            return "Connection established, but the neural engine is warming up. Please try again in a moment."
    return "All system nodes busy. Please retry later."
