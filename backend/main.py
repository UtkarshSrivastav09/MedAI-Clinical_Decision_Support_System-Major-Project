import os
import time
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, log_patient, get_dashboard_stats, get_all_patients, get_scanner_meta, update_triage, update_human_override, get_past_history
from ai_service import analyze_xray, chat_interrogate_xray
import shutil
from pydantic import BaseModel

app = FastAPI(title="AI Pathology Lab API V6 Ultimate")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()
    os.makedirs("temp_uploads", exist_ok=True)

@app.get("/")
def read_root(): return {"message": "Server Running."}

@app.get("/api/dashboard/stats")
def get_stats(): return get_dashboard_stats()

@app.get("/api/patients")
def get_patients_directory(): return get_all_patients()

@app.get("/api/scanner-meta")
def scanner_meta(): return get_scanner_meta()

class TriageUpdate(BaseModel):
    id: int
    status: str

@app.post("/api/triage/update")
def triage_update(payload: TriageUpdate):
    update_triage(payload.id, payload.status)
    return {"status": "success"}

class OverrideUpdate(BaseModel):
    id: int
    note: str

@app.post("/api/override")
def override_update(payload: OverrideUpdate):
    update_human_override(payload.id, payload.note)
    return {"status": "success"}

@app.post("/api/chat")
async def ai_chat(image_name: str = Form(...), question: str = Form(...)):
    ans = chat_interrogate_xray(image_name, question)
    return {"answer": ans}

@app.post("/api/scan")
async def scan_xray(
    file: UploadFile = File(...),
    name: str = Form("Unknown"),
    age: str = Form("0"),
    gender: str = Form("Unknown"),
    bloodPressure: str = Form("N/A"),
    temperature: str = Form("N/A"),
    symptoms: str = Form("None"),
    doctor: str = Form("Internal Node"),
    phone: str = Form("N/A"),
    email: str = Form("N/A")
):
    temp_path = f"temp_uploads/{file.filename}"
    
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    patient_data = {
        "name": name, "age": age, "gender": gender,
        "bloodPressure": bloodPressure, "temperature": temperature,
        "symptoms": symptoms, "doctor": doctor,
        "phone": phone, "email": email
    }
    
    history_json = get_past_history(name)
        
    start_time = time.time()
    report = analyze_xray(temp_path, patient_data, history_json)
    processing_ms = int((time.time() - start_time) * 1000)
    
    pid = log_patient(patient_data, file.filename, report, processing_ms)
    
    # We DO NOT delete the temp file anymore so the interactive AI chat can query it later!
        
    return {"status": "success", "report": report, "patient": patient_data, "image_name": file.filename, "patient_id": pid}
