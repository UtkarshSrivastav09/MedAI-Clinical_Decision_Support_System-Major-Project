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
    
    progression_prompt = ""
    if past_history_json:
        progression_prompt = f"""
        LONGITUDINAL TRACKING DETECTED: This patient has a previous AI report in our database. 
        Past Report: {past_history_json}
        You MUST explicitly compare the current scan to their past report. In your assessment, mention if the condition has improved, worsened, or remained stable.
        """

    SYSTEM_PROMPT = f"""
    You are a dual-role AI Medical System. You must simultaneously act as an expert Clinical Radiologist AND a primary care physician.
    Your task is to analyze the X-ray AND the provided Patient Vitals. 
    
    CRITICAL RULE: You must output two separate distinct objects in your JSON. 
    The 'clinical_assessment' MUST use perfectly accurate, complex, high-level medical terminology.
    The 'patient_layman_assessment' MUST translate every single finding into extremely simple terminology.

    VITALS SANITY RULE: If a user enters medically impossible or extreme vitals (like a Body Temperature of 0 or a Blood Pressure of 0/0), you MUST flag the patient as 'Critical' severity with 'Severe Patient Shock/Hypothermia' or note it as a critical monitoring error. Do not simply declare them healthy just because the X-Ray is clean!
    
    PATIENT VITALS:
    - Age: {context.get('age')}
    - Gender: {context.get('gender')}
    - Vitals: Temp {context.get('temperature')}, BP {context.get('bloodPressure')}
    - Symptoms: {context.get('symptoms')}
    
    {progression_prompt}
    
    Output in STRICT JSON exactly like this structure:
    {{
        "clinical_assessment": {{
            "diseases": ["Clinical Disease Name 1"],
            "severity": "High", /* "Low", "Medium", "High", or "Critical" */
            "confidence_score": 95, /* Number 1 to 100 */
            "key_findings": "Rigorous radiological jargon findings. MENTION PROGRESSION HERE IF APPLICABLE.",
            "differential_diagnosis": "Secondary clinical possibilities."
        }},
        "patient_layman_assessment": {{
            "layman_diseases": ["Simplified Disease Name 1"],
            "layman_findings": "Simplified explanation of exactly what is seen on the image. MENTION PROGRESSION HERE IF APPLICABLE (e.g. You have improved since last time).",
            "layman_summary": "1-2 short simple sentences summarizing the overall situation.",
            "treatment_timeline": [
                {{"phase": "Immediate Steps", "action": "Simple first actions"}},
                {{"phase": "Recovery Phase", "action": "Simple longer term steps"}}
            ]
        }},
        "referrals": "Doctor to see next."
    }}
    If healthy, return empty diseases arrays and mark "Low" severity.
    NEVER output markdown backticks like ```json, just output pure raw JSON string.
    """

    if API_KEY == "LOCAL_TEST_MODE" or not API_KEY:
        hc = " (Progression: Infection appears slightly improved since last scan.)" if past_history_json else ""
        return {
            "clinical_assessment": {
                "diseases": ["Multifocal Pneumonia", "Cardiomegaly"],
                "severity": "High",
                "confidence_score": 94,
                "key_findings": f"Observed bilateral ground-glass opacities consistent with viral pneumonitis.{hc}",
                "differential_diagnosis": "Consider acute respiratory distress syndrome (ARDS)."
            },
            "patient_layman_assessment": {
                "layman_diseases": ["Lung Infection"],
                "layman_findings": f"There are cloudy white spots across both lungs.{hc}",
                "layman_summary": f"Your symptoms ({context.get('symptoms')}) are likely caused by a widespread infection.",
                "treatment_timeline": [{"phase": "Immediate Steps", "action": "Rest immediately."}]
            },
            "referrals": "Consult a Pulmonologist."
        }

    try:
        img = Image.open(image_path)
        img.thumbnail((1024, 1024))
        
        model = genai.GenerativeModel('gemini-flash-latest')
        response = model.generate_content([SYSTEM_PROMPT, img])
        response_text = response.text.strip()
        
        if response_text.startswith("```json"): response_text = response_text[7:]
        if response_text.endswith("```"): response_text = response_text[:-3]

        return json.loads(response_text)
    except Exception as e:
        print(f"Error: {e}")
        return {
            "clinical_assessment": { "diseases": ["AI Processing Error"], "severity": "Critical", "confidence_score": 0, "key_findings": "Error", "differential_diagnosis": "Error"},
            "patient_layman_assessment": {"layman_diseases": ["Computer Error"], "layman_findings": "Error", "layman_summary": "The AI failed.", "treatment_timeline": []},
            "referrals": "N/A"
        }

def chat_interrogate_xray(image_name: str, question: str) -> str:
    path = f"temp_uploads/{image_name}"
    if API_KEY == "LOCAL_TEST_MODE" or not API_KEY or not os.path.exists(path):
        return f"Mock AI Answer to '{question}': There is significant structural damage on the left side."
        
    try:
        img = Image.open(path)
        img.thumbnail((1024, 1024))
        model = genai.GenerativeModel('gemini-flash-latest')
        prompt = f"You are a clinical radiologist looking at this X-ray. Answer the doctor's specific question precisely and concisely: {question}"
        response = model.generate_content([prompt, img])
        return response.text
    except Exception as e:
        return f"Error connecting to AI for chat: {str(e)}"
