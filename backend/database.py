import sqlite3
import os
import json
from datetime import datetime

DB_FILE = "pathology.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            scan_date TEXT,
            patient_name TEXT,
            age INTEGER,
            gender TEXT,
            blood_pressure TEXT,
            temperature TEXT,
            symptoms TEXT,
            referring_doctor TEXT,
            image_name TEXT,
            report_json TEXT,
            requires_followup BOOLEAN,
            processing_time_ms INTEGER,
            department TEXT,
            triage_status TEXT, 
            human_override_note TEXT,
            phone TEXT,
            email TEXT
        )
    ''')
    conn.commit()
    conn.close()

def log_patient(patient_data: dict, image_name: str, report: dict, processing_time: int):
    clinical = report.get("clinical_assessment", {})
    severity = clinical.get("severity", "Low")
    requires_followup = True if severity in ["High", "Critical"] else False
    
    dept = report.get("referrals", "General")
    if "cardio" in dept.lower(): dept = "Cardiology"
    elif "pulmon" in dept.lower(): dept = "Pulmonology"
    elif "ortho" in dept.lower(): dept = "Orthopedics"
    elif "onc" in dept.lower(): dept = "Oncology"
    else: dept = "General/Primary"

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO patients (scan_date, patient_name, age, gender, blood_pressure, temperature, symptoms, referring_doctor, image_name, report_json, requires_followup, processing_time_ms, department, triage_status, human_override_note, phone, email)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        datetime.now().isoformat(),
        patient_data.get('name', 'Unknown'),
        int(patient_data.get('age', 0) or 0),
        patient_data.get('gender', '-'),
        patient_data.get('bloodPressure', '-'),
        patient_data.get('temperature', '-'),
        patient_data.get('symptoms', '-'),
        patient_data.get('doctor', 'Internal Node'),
        image_name,
        json.dumps(report),
        requires_followup,
        processing_time,
        dept,
        "Waiting Room",
        "",
        patient_data.get('phone', 'N/A'),
        patient_data.get('email', 'N/A')
    ))
    pid = cursor.lastrowid
    conn.commit()
    conn.close()
    return pid

def get_dashboard_stats():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM patients')
    total_scans = cursor.fetchone()[0]
    cursor.execute('SELECT scan_date, patient_name, image_name, report_json, requires_followup FROM patients ORDER BY id DESC LIMIT 5')
    recent_rows = cursor.fetchall()
    
    cursor.execute('SELECT scan_date, patient_name, report_json FROM patients WHERE requires_followup = 1 AND triage_status != "Discharged" ORDER BY id DESC LIMIT 5')
    alert_rows = cursor.fetchall()
    critical_alerts = []
    for a in alert_rows:
       try:
           disease = json.loads(a[2]).get("clinical_assessment", {}).get("diseases", ["Unknown"])[0]
           critical_alerts.append({"date": a[0], "patient": a[1], "issue": disease})
       except: pass

    cursor.execute('SELECT referring_doctor, COUNT(*) as c FROM patients GROUP BY referring_doctor ORDER BY c DESC LIMIT 3')
    doctors = [{"name": row[0], "count": row[1]} for row in cursor.fetchall()]

    cursor.execute('SELECT department, COUNT(*) as c FROM patients GROUP BY department ORDER BY c DESC LIMIT 4')
    departments = [{"dept": row[0], "count": row[1]} for row in cursor.fetchall()]

    cursor.execute('SELECT AVG(processing_time_ms) FROM patients')
    avg_proc = cursor.fetchone()[0]
    avg_time_ms = int(avg_proc) if avg_proc else 0

    recent_scans = []
    total_diseases = 0
    for r in recent_rows:
        try:
            report = json.loads(r[3])
            diseases = report.get("clinical_assessment", {}).get("diseases", [])
            total_diseases += len(diseases)
            recent_scans.append({
                "date": r[0], "patient": r[1], "image": r[2], "diseases": diseases, "requires_followup": r[4]
            })
        except: pass
            
    cursor.execute('SELECT COUNT(*) FROM patients WHERE requires_followup = 1')
    total_severe = cursor.fetchone()[0]
    conn.commit()
    conn.close()
    
    return {
        "total_scans": total_scans, "total_severe": total_severe, "total_healthy": total_scans - total_severe,
        "avg_processing_time_ms": avg_time_ms, "top_doctors": doctors, "departments": departments, "critical_alerts": critical_alerts,
        "recent_scans": recent_scans, "total_diseases_detected": total_diseases
    }

def get_all_patients():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('SELECT id, scan_date, patient_name, age, gender, symptoms, report_json, requires_followup, department, referring_doctor, triage_status, human_override_note, phone, email FROM patients ORDER BY id DESC')
    rows = cursor.fetchall()
    conn.close()
    result = []
    for r in rows:
        try:
            report = json.loads(r[6])
            diseases = report.get("clinical_assessment", {}).get("diseases", [])
            result.append({
                "id": r[0], "date": r[1], "name": r[2], "age": r[3], "gender": r[4], 
                "symptoms": r[5], "diseases": diseases, "requires_followup": r[7], "department": r[8], "doctor": r[9],
                "triage_status": r[10], "human_override_note": r[11],
                "phone": r[12], "email": r[13],
                "report": report
            })
        except: pass
    return result

def get_scanner_meta():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('SELECT DISTINCT referring_doctor FROM patients')
    docs = [r[0] for r in cursor.fetchall()]
    
    cursor.execute('SELECT MAX(id), patient_name, age, gender, blood_pressure, temperature, phone, email FROM patients GROUP BY patient_name')
    pts = [{"name": r[1], "age": r[2], "gender": r[3], "bloodPressure": r[4], "temperature": r[5], "phone": r[6], "email": r[7]} for r in cursor.fetchall()]
    conn.close()
    return {"doctors": docs, "patients": pts}

def update_triage(patient_id: int, status: str):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('UPDATE patients SET triage_status = ? WHERE id = ?', (status, patient_id))
    conn.commit()
    conn.close()

def update_human_override(patient_id: int, note: str):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('UPDATE patients SET human_override_note = ? WHERE id = ?', (note, patient_id))
    conn.commit()
    conn.close()

def get_past_history(patient_name: str):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('SELECT report_json FROM patients WHERE patient_name = ? ORDER BY id DESC LIMIT 1', (patient_name,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return row[0]
    return None
