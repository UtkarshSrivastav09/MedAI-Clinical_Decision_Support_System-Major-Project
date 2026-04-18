import React, { useState } from 'react';
import { FileText, HeartPulse, ActivitySquare, TestTube, Stethoscope, Download, ShieldAlert, Zap, Info, ArrowLeft, Clock, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import './ReportViewer.css';

export default function ReportViewer({ report, patient, imageName, preview, patient_id, onReset }) {
  const [chatQ, setChatQ] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [heatmapActive, setHeatmapActive] = useState(false);

  const suggestionPills = [
    "Typical recovery timeline?",
    "Next diagnostic steps?",
    "Potential complications?",
    "Explain Technical Findings"
  ];

  const [overrideText, setOverrideText] = useState("");
  const [overrideSaved, setOverrideSaved] = useState(false);

  if (!report || !report.clinical_assessment) return null;

  const clinical = report.clinical_assessment;
  const layman = report.patient_layman_assessment;
  const isHealthy = clinical.diseases && clinical.diseases.length === 0;

  const handleChat = async () => {
    if (!chatQ) return;
    setChatLog(prev => [...prev, {role: 'user', text: chatQ}]);
    setChatLoading(true);
    
    const fd = new FormData();
    fd.append("image_name", imageName);
    fd.append("question", chatQ);
    
    const q = chatQ;
    setChatQ("");

    try {
      const res = await fetch("http://127.0.0.1:8000/api/chat", { method: "POST", body: fd });
      const data = await res.json();
      setChatLog(prev => [...prev, {role: 'ai', text: data.answer}]);
    } catch {
      setChatLog(prev => [...prev, {role: 'ai', text: "Chat connection error."}]);
    }
    setChatLoading(false);
  };

  const handleOverride = async () => {
    if (!overrideText || !patient_id) return;
    try {
      await fetch("http://127.0.0.1:8000/api/override", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({id: patient_id, note: overrideText})
      });
      setOverrideSaved(true);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="report-wrapper animate-fade-in">
      <div className="print-controls hide-on-print" style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
        <button onClick={onReset} className="back-btn"><ArrowLeft size={18} /> Process Next Patient</button>
        <button onClick={() => window.print()} className="download-btn" style={{marginLeft: 'auto'}}><Download size={18} /> Download Layman Extracted PDF</button>
      </div>

      <div className="report-viewer printable-report">
        
        {/* Admin Review & Chat Features (Hidden on Patient Print) */}
        <div className="hide-on-print" style={{display: 'flex', gap: '24px', marginBottom: '32px'}}>
           
           {/* Left: Chat Widget */}
           <div style={{flex: 1, background: 'rgba(0, 229, 255, 0.05)', border: '1px solid var(--accent-cyan)', padding: '16px', borderRadius: '12px'}}>
              <h4 style={{color: 'var(--accent-cyan)', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px'}}><MessageSquare size={16} /> Interactive Radiologist Co-Pilot Chat</h4>
              
              <div style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '12px', paddingRight: '8px', fontSize: '0.9rem' }} className="custom-scroll">
                 {chatLog.length === 0 ? <p style={{color:'var(--text-secondary)'}}>Ask Gemini specific contextual questions about this specific image.</p> : null}
                 {chatLog.map((c, i) => (
                    <div key={i} style={{marginBottom: '8px', color: c.role === 'user' ? '#fff' : 'var(--text-secondary)'}}>
                      <strong>{c.role === 'user' ? 'Doctor: ' : 'AI: '}</strong>{c.text}
                    </div>
                 ))}
                 {chatLoading && <div style={{color:'var(--accent-cyan)'}}>Analyzing Image Frame...</div>}
              </div>
              
              <div style={{display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap'}}>
                 {suggestionPills.map((pill, i) => (
                    <button key={i} onClick={() => { setChatQ(pill); }} style={{background: 'rgba(0, 229, 255, 0.1)', border: '1px solid rgba(0, 229, 255, 0.3)', color: 'var(--accent-cyan)', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s'}} onMouseOver={e => e.target.style.background='rgba(0, 229, 255, 0.2)'} onMouseOut={e => e.target.style.background='rgba(0, 229, 255, 0.1)'}>
                       {pill}
                    </button>
                 ))}
              </div>

              <div style={{display: 'flex', gap: '8px'}}>
                 <input type="text" value={chatQ} onChange={e => setChatQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChat()} placeholder="Ask 'Is the fracture spiral via right axis?'" style={{flex:1, padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '6px'}} />
                 <button onClick={handleChat} disabled={chatLoading} style={{background: 'var(--accent-cyan)', color: '#000', border: 'none', padding: '0 12px', borderRadius: '6px', cursor: 'pointer'}}><Send size={16}/></button>
              </div>
           </div>

           {/* Right: Peer Review Override */}
           <div style={{flex: 1, background: 'rgba(255, 171, 0, 0.05)', border: '1px solid #ffab00', padding: '16px', borderRadius: '12px'}}>
              <h4 style={{color: '#ffab00', marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px'}}><ShieldAlert size={16} /> Human Oversight Peer Review</h4>
              <p style={{color:'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px'}}>Legally flag this AI assessment with a manual override safety note if you disagree with the confidence score.</p>
              
              {overrideSaved ? (
                 <div style={{color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0'}}><CheckCircle2 /> Override Logged Securely.</div>
              ) : (
                 <div style={{display: 'flex', gap: '8px'}}>
                    <textarea value={overrideText} onChange={e => setOverrideText(e.target.value)} placeholder="Type manual diagnostic override. This will be securely logged in the patient's EHR directory." style={{flex:1, padding: '8px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '6px', minHeight: '60px', resize: 'vertical'}} />
                    <button onClick={handleOverride} style={{background: '#ffab00', color: '#000', border: 'none', padding: '0 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600}}>Log</button>
                 </div>
              )}
           </div>
        </div>

        <div className="hospital-letterhead">
           <div>
              <h2>AUTO-PATH AI IMAGING LABORATORY</h2>
              <p>123 Medical Innovation Drive • Secure AI Node Cluster</p>
           </div>
           <div style={{ textAlign: 'right' }}>
              <p><strong>REPORT DATE:</strong> {new Date().toLocaleString()}</p>
              <p><strong>REPORT ID:</strong> AP-{Math.floor(Math.random() * 900000)}</p>
           </div>
        </div>

        <div className="patient-banner">
           <div className="pi-block"><span>Patient Name</span><strong>{patient?.name}</strong></div>
           <div className="pi-block"><span>Age / Gender</span><strong>{patient?.age} yr • {patient?.gender}</strong></div>
           <div className="pi-block"><span>Blood Press.</span><strong>{patient?.bloodPressure}</strong></div>
           <div className="pi-block"><span>Body Temp</span><strong>{patient?.temperature}</strong></div>
        </div>

        {/* CLINICAL VIEW ONLY (Hidden on print) */}
        <div className="report-body hide-on-print" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px'}}>
            <div className="report-image-section">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                  <h3 className="section-title" style={{margin: 0}}><ActivitySquare size={18} /> Radiography Analysis</h3>
                  <button 
                    onClick={() => setHeatmapActive(!heatmapActive)}
                    className={`heatmap-toggle ${heatmapActive ? 'active' : ''}`}
                  >
                    <Zap size={14} /> {heatmapActive ? 'Disable AI Heatmap' : 'Enable AI Heatmap'}
                  </button>
                </div>
                <div className="radiology-frame">
                  <img src={preview} alt="Patient X-ray" className="analyzed-image" />
                  {heatmapActive && (
                    <div className="heatmap-overlay">
                      {/* Simulating hotpots based on findings */}
                      <div className="pulse-ring ring-1"></div>
                      <div className="pulse-ring ring-2"></div>
                      <div className="scan-line"></div>
                    </div>
                  )}
                </div>
            </div>

            <div className="report-text-section">
              <div className="meta-stats" style={{marginBottom: '20px'}}>
                <div className={`meta-badge severity-${clinical.severity || 'Low'}`}><ShieldAlert size={16} /> Severity: {clinical.severity || 'Low'}</div>
                <div className="meta-badge confidence-badge"><Zap size={16} /> Confidence: {clinical.confidence_score}%</div>
              </div>
              <div className="report-section">
                <h3 className="section-title"><HeartPulse size={18} /> Technical Diagnoses</h3>
                <ul className="disease-list">{clinical.diseases?.map((d, i) => <li key={i} className="disease-item danger-badge">{d}</li>)}</ul>
                <p className="report-text" style={{marginTop:'12px'}}>{clinical.key_findings}</p>
                {clinical.differential_diagnosis && <p className="report-text" style={{marginTop:'8px', color:'var(--accent-cyan)'}}>Differential: {clinical.differential_diagnosis}</p>}
                <div style={{marginTop: '20px', padding: '12px', background: 'rgba(163, 113, 247, 0.05)', borderRadius: '8px', border: '1px solid rgba(163, 113, 247, 0.2)'}}>
                   <strong style={{fontSize: '0.85rem', color: 'var(--accent-purple)', display: 'block', marginBottom: '4px'}}>Recommended Physical Exam:</strong>
                   <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>{clinical.recommended_followup || 'Standard radiological follow-up as per institutional protocol.'}</span>
                </div>
              </div>
            </div>
        </div>

        {/* LAYMAN PRINT ONLY */}
        <div className="report-body show-on-print-only">
             <div className="report-section layman-box">
                <h3 className="section-title"><HeartPulse size={18} /> Diagnosed Conditions</h3>
                <ul className="test-list">{layman.layman_diseases?.map((d, id) => <li key={id} className="test-item">{d}</li>)}</ul>
             </div>
             {layman.layman_summary && (
                <div className="report-section layman-box">
                   <h3 className="section-title"><Info size={18} /> Simplified Patient Summary</h3>
                   <p className="report-text">{layman.layman_summary}</p>
                </div>
             )}
             {layman.treatment_timeline && (
               <div className="report-section layman-box">
                  <h3 className="section-title"><Clock size={18} /> Recommended Treatment Plan</h3>
                  <div style={{display:'flex', flexDirection:'column', gap:'12px', marginTop:'16px'}}>
                     {layman.treatment_timeline.map((item, idx) => (
                        <div key={idx} style={{borderLeft: '3px solid var(--accent-purple)', paddingLeft: '16px'}}>
                           <strong style={{color:'var(--text-primary)', display:'block', marginBottom:'4px'}}>{item.phase}</strong>
                           <span style={{color:'var(--text-secondary)', fontSize:'0.9rem'}}>{item.action}</span>
                        </div>
                     ))}
                  </div>
               </div>
            )}
        </div>
      </div>
    </div>
  );
}
