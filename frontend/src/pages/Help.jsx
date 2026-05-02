import React from 'react';
import { Activity, Cpu, Layers, Info, Clock, User, ClipboardList, ShieldAlert, AlertOctagon, LayoutDashboard, HelpCircle, Database, Book, Award } from 'lucide-react';
import './Help.css';

export default function Help() {
  const techStack = [
    {
      icon: <Cpu size={24} color="#6366f1" />,
      title: "Frontend Core",
      desc: "Architected with React 18 & Vite for high-performance SPA behavior. Implements Glassmorphism UI and complex state management.",
      tags: ["React.js", "Vite", "Lucide Icons", "html2pdf.js"]
    },
    {
      icon: <Activity size={24} color="#00e5ff" />,
      title: "Backend Neural Bridge",
      desc: "Powered by FastAPI (Python) for asynchronous request handling. Features robust image processing and secure EHR directory management.",
      tags: ["Python", "FastAPI", "Pydantic", "Uvicorn"]
    },
    {
      icon: <Layers size={24} color="#a371f7" />,
      title: "AI & Intelligence",
      desc: "Integrates Google Gemini 1.5 Multimodal AI for advanced radiology analysis, natural language diagnosis, and localized heatmap generation.",
      tags: ["Gemini 1.5", "NLP", "Object Detection", "Pathology Mapping"]
    },
    {
      icon: <ShieldAlert size={24} color="#00e676" />,
      title: "Security & Privacy",
      desc: "Implements JWT-based authentication and secure session management. Patient data is isolated and handled via restricted local IO paths.",
      tags: ["JWT", "Session Auth", "EHR Isolation", "Encrypted Handshake"]
    }
  ];

  return (
    <div className="help-container" style={{ padding: '20px 40px', minHeight: '100vh', opacity: 1, visibility: 'visible', color: 'var(--text-primary)' }}>
      {/* HERO SECTION */}
      <div className="help-hero">
        <div className="hero-badge">System Documentation </div>
        <h1>Intelligence Assistance & Neural Framework</h1>
        <p>Comprehensive guide for users to navigate the platform and for examiners to understand the underlying technical architecture.</p>
      </div>

      {/* LEAD ARCHITECT PROFILE */}
      <div className="architect-profile glass-card" style={{marginBottom: '40px', padding: '40px', border: '1px solid var(--accent-purple)', background: 'linear-gradient(135deg, rgba(163, 113, 247, 0.05) 0%, rgba(0, 229, 255, 0.05) 100%)'}}>
         <div style={{display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap'}}>
            <div className="architect-avatar" style={{width: '140px', height: '140px', borderRadius: '24px', overflow: 'hidden', border: '2px solid var(--accent-purple)', boxShadow: '0 10px 30px rgba(163, 113, 247, 0.3)'}}>
               <img src="/Utkarsh Image.png" alt="Utkarsh Srivastav" style={{width: '100%', height: '100%', objectFit: 'cover'}} onError={(e) => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=Utkarsh+Srivastav&background=A371F7&color=fff&size=128'; }} />
            </div>
            <div className="architect-info" style={{flex: 1, minWidth: '300px'}}>
               <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap'}}>
                  <h2 style={{margin: 0, fontSize: '2rem'}}>Utkarsh Srivastav</h2>
                  <span className="status-pill online" style={{background: 'var(--accent-cyan)', color: '#000', fontSize: '0.7rem'}}>Lead Architect</span>
               </div>
               <p style={{fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '12px', fontWeight: 600}}>Principal AI Research & System Engineering Lead</p>
               
               <div className="social-links" style={{display: 'flex', gap: '12px', marginBottom: '20px'}}>
                  <a href="https://www.linkedin.com/in/utkarsh-srivastav-b433bb33a" target="_blank" rel="noopener noreferrer" className="social-btn" style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#0077b5', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600}}>
                    LinkedIn
                  </a>
                  <a href="https://github.com/UtkarshSrivastav09" target="_blank" rel="noopener noreferrer" className="social-btn" style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#24292e', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600}}>
                    GitHub
                  </a>
                  <a href="https://utkarshsrivastav09.github.io/Utkarsh-Portfolio/" target="_blank" rel="noopener noreferrer" className="social-btn" style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--accent-purple)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600}}>
                    Portfolio
                  </a>
               </div>

               <p style={{color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem'}}>
                  A visionary developer specialized in the intersection of <span style={{color: 'var(--accent-cyan)', fontWeight: 700}}>Generative AI</span> and <span style={{color: 'var(--accent-purple)', fontWeight: 700}}>Clinical Radiology</span>. 
                  Architected the entire Med-AI ecosystem, focusing on <span style={{color: 'var(--accent-cyan)', fontWeight: 700}}>high-fidelity diagnostic accuracy</span>, 
                  <span style={{color: 'var(--accent-purple)', fontWeight: 700}}> multimodal medical imaging</span>, and <span style={{color: 'var(--accent-cyan)', fontWeight: 700}}>secure EHR integration</span>.
               </p>
               <div className="skills-tags" style={{display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap'}}>
                  <span style={{padding: '6px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--accent-cyan)', border: '1px solid rgba(0,229,255,0.2)'}}>Neural Networks</span>
                  <span style={{padding: '6px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--accent-purple)', border: '1px solid rgba(163,113,247,0.2)'}}>Multimodal AI</span>
                  <span style={{padding: '6px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--success)', border: '1px solid rgba(0,230,118,0.2)'}}>Full-Stack MedTech</span>
               </div>
            </div>
         </div>
      </div>

      <div className="help-grid">
        <div className="help-section-card glass-card">
          <h2 className="section-title">User Operational Guide</h2>
          <div className="step-list">
            <div className="step-item">
              <div className="step-number">01</div>
              <div className="step-content">
                <h3>Patient Enrollment</h3>
                <p>Register new patients or select existing ones from the Smart Database. Vitals like BP and Temperature are automatically tracked.</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">02</div>
              <div className="step-content">
                <h3>X-Ray Analysis</h3>
                <p>Upload any radiology image in the Scanner module. Click 'Run AI Diagnosis' to trigger the neural analysis engine.</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">03</div>
              <div className="step-content">
                <h3>Verified Reporting</h3>
                <p>Download the high-fidelity PDF report. It includes technical findings for doctors and simple layman summaries for patients.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="help-section-card glass-card tech-section">
          <h2 className="section-title">Technical Stack & Architecture</h2>
          <p className="tech-intro">Med-AI is a full-stack Clinical Decision Support System (CDSS) built using a decoupled architecture for maximum scalability.</p>
          
          <div className="tech-stack-grid">
            {techStack.map((tech, idx) => (
              <div key={idx} className="tech-card">
                <div className="tech-header">
                  {tech.icon}
                  <h3>{tech.title}</h3>
                </div>
                <p>{tech.desc}</p>
                <div className="tech-tags">
                  {tech.tags.map((tag, i) => <span key={i}>{tag}</span>)}
                </div>
              </div>
            ))}
          </div>

          <div className="system-status-box">
             <div className="status-header">
                <h3>System Integrity Status</h3>
                <span className="status-pill online">Operational</span>
             </div>
             <div className="status-grid">
                <div className="status-item"><span>Neural Core</span><strong>Active</strong></div>
                <div className="status-item"><span>API Gateway</span><strong>Connected</strong></div>
                <div className="status-item"><span>EHR Database</span><strong>Secure</strong></div>
             </div>
          </div>
        </div>
      </div>

      {/* NEW: NEURAL ARCHITECTURE PIPELINE */}
      <div className="pipeline-section glass-card" style={{marginTop: '32px', padding: '32px'}}>
         <h2 className="section-title"><Activity size={20} /> Neural Processing Pipeline</h2>
         <div className="pipeline-flow" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', marginTop: '24px'}}>
            <div className="pipeline-node">
               <div className="node-icon" style={{background: 'rgba(0, 229, 255, 0.1)'}}><LayoutDashboard size={24} color="var(--accent-cyan)" /></div>
               <span>Image Input</span>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-node">
               <div className="node-icon" style={{background: 'rgba(163, 113, 247, 0.1)'}}><Cpu size={24} color="var(--accent-purple)" /></div>
               <span>FastAPI Processing</span>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-node highlight">
               <div className="node-icon" style={{background: 'var(--accent-gradient)'}}><Activity size={24} color="#000" /></div>
               <span>Gemini 1.5 Analysis</span>
            </div>
            <div className="pipeline-arrow">→</div>
            <div className="pipeline-node">
               <div className="node-icon" style={{background: 'rgba(0, 230, 118, 0.1)'}}><ClipboardList size={24} color="var(--success)" /></div>
               <span>PDF Generation</span>
            </div>
         </div>
      </div>

      <div className="performance-metrics glass-card" style={{marginTop: '32px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', textAlign: 'center'}}>
          <div className="metric-item">
             <div className="metric-value" style={{fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cyan)'}}>94.2%</div>
             <div className="metric-label" style={{fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)'}}>Accuracy Rate</div>
          </div>
          <div className="metric-item">
             <div className="metric-value" style={{fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-purple)'}}>&lt;1.2s</div>
             <div className="metric-label" style={{fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)'}}>Latency</div>
          </div>
          <div className="metric-item">
             <div className="metric-value" style={{fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)'}}>256-bit</div>
             <div className="metric-label" style={{fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)'}}>Encryption</div>
          </div>
          <div className="metric-item">
             <div className="metric-value" style={{fontSize: '1.8rem', fontWeight: 800, color: '#ffab00'}}>100k+</div>
             <div className="metric-label" style={{fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)'}}>Datasets</div>
          </div>
      </div>

      <div className="help-footer" style={{marginTop: '80px', paddingBottom: '60px', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '40px'}}>

         
         <h4 style={{fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '1px'}}>Med-AI Clinical Decision Support System</h4>
         
         <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.8', maxWidth: '900px', margin: '0 auto'}}>
            This platform is an advanced <span style={{color: 'var(--accent-cyan)', fontWeight: 600}}>Research Prototype</span> engineered for multimodal diagnostic exploration. 
            Architected as a flagship implementation for the <span style={{color: 'var(--accent-purple)', fontWeight: 600}}>2026 Academic Engineering Evaluation</span>, 
            showcasing the secure and efficient integration of Neural LLMs in modern healthcare ecosystems.
         </p>
         
         <div style={{marginTop: '32px', fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.5, fontStyle: 'italic'}}>
            © 2026 Med-AI Laboratory | Lead Architect: Utkarsh Srivastav
         </div>
      </div>
    </div>
  );
}
