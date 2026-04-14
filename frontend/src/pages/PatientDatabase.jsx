import React, { useEffect, useState } from 'react';
import { Users, Search, AlertTriangle, DownloadCloud } from 'lucide-react';
import './PatientDatabase.css';

export default function PatientDatabase() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/patients')
      .then(res => res.json())
      .then(data => {
        setPatients(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch patients", err);
        setLoading(false);
      });
  }, []);

  // Feature 4: CSV Export System
  const downloadCSV = () => {
    const headers = ["ID", "Scan Date", "Patient Name", "Age", "Gender", "Phone", "Email", "Symptoms", "Follow-up Required"];
    const rows = patients.map(p => [
      p.id, p.date, p.name, p.age, p.gender, p.phone, p.email, `"${p.symptoms.replace(/"/g, '""')}"`, p.requires_followup ? "YES" : "NO"
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "patient_ehr_export.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="animate-fade-in dashboard-container">
      <div className="page-header">
        <h1>Patient Directory</h1>
        <p className="subtitle">Historical archive of all patient Electronic Health Records (EHR) and AI Analyses.</p>
      </div>

      <div className="glass-card directory-panel">
        <div className="directory-tools" style={{display: 'flex', justifyContent: 'space-between'}}>
           <div className="search-bar">
              <Search size={18} color="var(--text-secondary)" />
              <input type="text" placeholder="Search patients by name..." />
           </div>
           <button onClick={downloadCSV} className="action-btn" style={{padding: '10px 20px', fontSize: '0.9rem'}}>
              <DownloadCloud size={18}/> Export CSV Log
           </button>
        </div>

        <table className="patient-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Patient Identity</th>
              <th>Vitals Logged</th>
              <th>AI Detected Anomalies</th>
              <th>Follow Up Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6">Fetching records...</td></tr>
            ) : patients.length === 0 ? (
              <tr><td colSpan="6">No historical records found.</td></tr>
            ) : (
              patients.map(p => (
                <tr key={p.id} style={{ background: p.requires_followup ? 'rgba(255, 82, 82, 0.03)' : 'transparent'}}>
                  <td>#{p.id}</td>
                  <td>{new Date(p.date).toLocaleString()}</td>
                  <td>
                    <strong>{p.name}</strong><br/>
                    <small>{p.age} yrs • {p.gender}</small><br/>
                    <small style={{color:'var(--accent-purple)'}}>{p.phone} • {p.email}</small>
                  </td>
                  <td>
                    <small>Symptoms: {p.symptoms}</small>
                  </td>
                  <td>
                    {p.diseases && p.diseases.length > 0 ? (
                      p.diseases.map((d, i) => <span key={i} className="disease-badge">{d}</span>)
                    ) : (
                      <span className="healthy-badge">Clean Bill of Health</span>
                    )}
                  </td>
                  <td>
                    {p.requires_followup ? (
                       <span style={{ color: 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                         <AlertTriangle size={16} /> Urgent Follow Up
                       </span>
                    ) : ( <span style={{ color: 'var(--text-secondary)'}}>Standard Routing</span>)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
