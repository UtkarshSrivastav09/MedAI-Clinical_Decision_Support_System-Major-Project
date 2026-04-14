import React, { useEffect, useState } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import './Triage.css';

export default function Triage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = () => {
    fetch('http://127.0.0.1:8000/api/patients')
      .then(res => res.json())
      .then(data => {
        setPatients(data);
        setLoading(false);
      });
  };

  useEffect(() => { fetchPatients(); }, []);

  const moveStatus = (id, status) => {
    fetch('http://127.0.0.1:8000/api/triage/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    }).then(() => fetchPatients());
  };

  const getCol = (status) => patients.filter(p => p.triage_status === status);

  const renderCard = (p) => (
    <div className="triage-card" key={p.id} style={{borderLeft: p.requires_followup ? '3px solid var(--danger)' : '3px solid var(--success)'}}>
       <h4>{p.name}</h4>
       <p className="subtext">{p.age} yr | Dr. {p.doctor}</p>
       <div className="triage-tags">
         {p.diseases.slice(0, 2).map((d, i) => <span key={i} className="mini-tag">{d}</span>)}
       </div>
       {p.human_override_note && ( <div className="override-badge">Human Oversight Logged</div> )}
       <div className="card-actions">
         {p.triage_status === "Waiting Room" && <button onClick={() => moveStatus(p.id, "Doctor Review")}>Send to Review <ArrowRight size={14}/></button>}
         {p.triage_status === "Doctor Review" && <button onClick={() => moveStatus(p.id, "Discharged")}>Discharge Patient <ArrowRight size={14}/></button>}
         {p.triage_status === "Discharged" && <button onClick={() => moveStatus(p.id, "Waiting Room")}>Re-admit</button>}
       </div>
    </div>
  );

  return (
    <div className="triage-container animate-fade-in">
       <div className="page-header">
        <h1>Physical Triage Kanban Board</h1>
        <p className="subtitle">Manage real-time hospital flow by transitioning patients out of the waiting room.</p>
      </div>
      
      {loading ? <Loader2 className="spinning" /> : (
        <div className="kanban-board">
          <div className="kanban-column">
             <h3 className="kb-header waiting">Waiting Room ({getCol("Waiting Room").length})</h3>
             <div className="kb-body">{getCol("Waiting Room").map(renderCard)}</div>
          </div>
          <div className="kanban-column">
             <h3 className="kb-header review">Doctor Review ({getCol("Doctor Review").length})</h3>
             <div className="kb-body">{getCol("Doctor Review").map(renderCard)}</div>
          </div>
          <div className="kanban-column">
             <h3 className="kb-header discharged">Discharged ({getCol("Discharged").length})</h3>
             <div className="kb-body">{getCol("Discharged").map(renderCard)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
