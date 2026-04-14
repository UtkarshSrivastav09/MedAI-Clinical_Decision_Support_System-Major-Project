import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Stethoscope, Activity, Database, LayoutDashboard, Layers } from 'lucide-react';
import Scanner from './pages/Scanner';
import PatientDatabase from './pages/PatientDatabase';
import Dashboard from './pages/Dashboard';
import Triage from './pages/Triage';
import './App.css';

function NavLinks() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <aside className="sidebar">
      <div className="logo">
        <Stethoscope color="var(--accent-cyan)" />
        <h2>AutoPath AI</h2>
      </div>
      <div className="nav-links">
        <Link to="/" className={`nav-item ${isActive('/')}`}><LayoutDashboard size={18} /> Admin Dashboard</Link>
        <Link to="/scanner" className={`nav-item ${isActive('/scanner')}`}><Activity size={18} /> Analyze X-Ray</Link>
        <Link to="/triage" className={`nav-item ${isActive('/triage')}`}><Layers size={18} /> Kanban Triage Flow</Link>
        <Link to="/database" className={`nav-item ${isActive('/database')}`}><Database size={18} /> EHR Directory</Link>
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <NavLinks />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/triage" element={<Triage />} />
            <Route path="/database" element={<PatientDatabase />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
