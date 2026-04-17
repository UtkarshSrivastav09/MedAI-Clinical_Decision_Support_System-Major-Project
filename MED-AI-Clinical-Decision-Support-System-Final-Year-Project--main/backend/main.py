import os
import time
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, log_patient, get_dashboard_stats, get_all_patients, get_scanner_meta, update_triage, update_human_override, get_past_history, register_user, verify_user
from ai_service import analyze_xray, chat_interrogate_xray
import shutil
from pydantic import BaseModel

app = FastAPI(title="Med-AI Clinical Decision Support System API V6 Ultimate")

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
def read_root(): return {"message": "Med-AI Clinical Decision Support System Backend API is running..."}

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    organization: str

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/api/auth/register")
def register(payload: RegisterRequest):
    success = register_user(payload.username, payload.email, payload.password, payload.organization)
    if not success:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    return {"status": "success", "organization": payload.organization}

@app.post("/api/auth/login")
def login(payload: LoginRequest):
    data = verify_user(payload.username, payload.password)
    if not data:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"status": "success", "organization": data["organization"], "user_id": data["id"]}

@app.get("/api/dashboard/stats")
def get_stats(org: str = "Med-AI Global"): 
    return get_dashboard_stats(org)

@app.get("/api/patients")
def get_patients_directory(org: str = "Med-AI Global"): 
    return get_all_patients(org)

@app.get("/api/scanner-meta")
def scanner_meta(org: str = "Med-AI Global"): 
    return get_scanner_meta(org)


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
    email: str = Form("N/A"),
    org: str = Form("Med-AI Global")
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
    
    history_json = get_past_history(name, org)
        
    start_time = time.time()
    report = analyze_xray(temp_path, patient_data, history_json)
    processing_ms = int((time.time() - start_time) * 1000)
    
    pid = log_patient(patient_data, file.filename, report, processing_ms, org)
        
    return {"status": "success", "report": report, "patient": patient_data, "image_name": file.filename, "patient_id": pid}
