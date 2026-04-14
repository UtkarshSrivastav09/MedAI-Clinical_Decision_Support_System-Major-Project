import React, { useEffect, useState } from 'react';
import { Activity, Stethoscope, AlertOctagon, HeartPulse, ShieldAlert, Cpu } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/dashboard/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

  if (!stats) return <div className="loading" style={{padding: '40px', color: 'var(--text-secondary)'}}>Loading Telemetry...</div>;

  const healthyRatio = stats.total_scans > 0 ? Math.round((stats.total_healthy / stats.total_scans) * 100) : 0;
  const severeRatio = stats.total_scans > 0 ? Math.round((stats.total_severe / stats.total_scans) * 100) : 0;

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="page-header">
        <h1>Administrative Command Center</h1>
        <p className="subtitle">Real-time heuristics and hospital-wide routing visualizations.</p>
      </div>

      {/* TOP ROW: Core Metrics */}
      <div className="stats-row" style={{marginBottom: '24px'}}>
        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ background: 'rgba(0, 229, 255, 0.1)' }}>
            <Activity color="var(--accent-cyan)" />
          </div>
          <div className="stat-content">
            <h3>Total Lifetime Scans</h3>
            <div className="stat-value">{stats.total_scans}</div>
          </div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ background: 'rgba(255, 82, 82, 0.1)' }}>
            <HeartPulse color="var(--danger)" />
          </div>
          <div className="stat-content">
            <h3>Diseases Identified</h3>
            <div className="stat-value">{stats.total_diseases_detected}</div>
          </div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ background: 'rgba(163, 113, 247, 0.1)' }}>
            <Cpu color="var(--accent-purple)" />
          </div>
          <div className="stat-content">
            <h3>Avg Token Processing</h3>
            <div className="stat-value">{stats.avg_processing_time_ms} ms</div>
            <span style={{fontSize: '0.8rem', color: 'var(--success)'}}>Human equivalent: 48 hrs</span>
          </div>
        </div>
      </div>

      {/* MIDDLE ROW: The 3 Massive Features */}
      <div className="dashboard-grid">
         
         {/* Feature 1: Top Doctors */}
         <div className="glass-card">
            <h3><Stethoscope size={18} style={{marginRight:'8px', verticalAlign:'middle'}}/> Top Referring Network</h3>
            <ul className="admin-list" style={{marginTop: '16px'}}>
               {stats.top_doctors?.length > 0 ? stats.top_doctors.map((doc, i) => (
                  <li key={i}>
                     <div className="doc-name">{doc.name}</div>
                     <div className="doc-count">{doc.count} Referrals</div>
                  </li>
               )) : <li style={{color:'var(--text-secondary)'}}>Awaiting data...</li>}
            </ul>
         </div>

         {/* Feature 2: Department Burden */}
         <div className="glass-card">
            <h3><Activity size={18} style={{marginRight:'8px', verticalAlign:'middle'}}/> Department Routing Burden</h3>
            <div style={{marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px'}}>
               {stats.departments?.map((dept, i) => {
                  const width = (dept.count / stats.total_scans) * 100;
                  return (
                    <div key={i}>
                       <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.85rem', marginBottom:'4px'}}>
                          <span>{dept.dept}</span>
                          <span>{dept.count} Routed</span>
                       </div>
                       <div style={{width: '100%', height:'8px', background: 'rgba(255,255,255,0.1)', borderRadius:'4px', overflow:'hidden'}}>
                          <div style={{width: `${width}%`, height:'100%', background: 'var(--accent-gradient)'}}></div>
                       </div>
                    </div>
                  )
               })}
            </div>
         </div>

         {/* Feature 3: Live Alerts Array */}
         <div className="glass-card" style={{border: '1px solid rgba(255, 82, 82, 0.3)'}}>
            <h3 style={{color: 'var(--danger)'}}><AlertOctagon size={18} style={{marginRight:'8px', verticalAlign:'middle'}}/> Critical Priority Inbox</h3>
            <ul className="admin-list alerts-list" style={{marginTop: '16px'}}>
               {stats.critical_alerts?.length > 0 ? stats.critical_alerts.map((al, i) => (
                  <li key={i} style={{background: 'rgba(255,82,82,0.1)'}}>
                     <div className="doc-name" style={{color: '#fff'}}>{al.patient}</div>
                     <div className="doc-count" style={{color: 'var(--danger)'}}>{al.issue}</div>
                  </li>
               )) : <li style={{color:'var(--success)'}}>No critical cases pending.</li>}
            </ul>
         </div>
      </div>

      {/* BOTTOM ROW: Recent Timeline */}
      <div className="glass-card">
         <h3 style={{marginBottom: '16px'}}>Recent Live Scans (Global System Feed)</h3>
         <table className="recent-scans-table">
          <thead>
            <tr>
              <th>Date/Time</th>
              <th>Patient Name</th>
              <th>Primary Condition</th>
              <th>Flags</th>
            </tr>
          </thead>
          <tbody>
            {stats.recent_scans.length > 0 ? stats.recent_scans.map((scan, idx) => (
              <tr key={idx} style={{ background: scan.requires_followup ? 'rgba(255,0,0,0.05)' : 'transparent'}}>
                <td style={{color: 'var(--text-secondary)'}}>{new Date(scan.date).toLocaleString()}</td>
                <td style={{fontWeight: 600}}>{scan.patient}</td>
                <td>
                  <div className="disease-tags">
                     {scan.diseases.length === 0 ? <span className="tag healthy">Healthy</span> : scan.diseases.map((d, i) => <span key={i} className="tag">{d}</span>)}
                  </div>
                </td>
                <td>
                   {scan.requires_followup && <ShieldAlert size={16} color="var(--danger)" />}
                </td>
              </tr>
            )) : <tr><td colSpan="4">No scans found in database.</td></tr>}
          </tbody>
        </table>
      </div>

    </div>
  );
}
