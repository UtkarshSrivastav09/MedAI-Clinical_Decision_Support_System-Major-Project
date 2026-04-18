import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Stethoscope, Activity, Database, LayoutDashboard, Layers, LogOut } from 'lucide-react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Scanner from './pages/Scanner';
import PatientDatabase from './pages/PatientDatabase';
import Dashboard from './pages/Dashboard';
import Triage from './pages/Triage';
import "./index.css";
import './App.css';

function NavLinks({ setAuth }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleLogout = () => {
    sessionStorage.clear();
    setAuth(false);
  };

  return (
    <aside className="sidebar">
      <div className="logo">
        <Stethoscope color="var(--accent-cyan)" />
        <h2>Med-AI Clinical</h2>
      </div>
      <div className="nav-links">
        <Link to="/" className={`nav-item ${isActive('/')}`}><LayoutDashboard size={18} /> Admin Dashboard</Link>
        <Link to="/scanner" className={`nav-item ${isActive('/scanner')}`}><Activity size={18} /> Analyze X-Ray</Link>
        <Link to="/triage" className={`nav-item ${isActive('/triage')}`}><Layers size={18} /> Clinical Workflow</Link>
        <Link to="/database" className={`nav-item ${isActive('/database')}`}><Database size={18} /> Patient Records</Link>
      </div>
      <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
        <button onClick={handleLogout} className="nav-item" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', color: 'var(--danger)', background: 'rgba(255,82,82,0.05)' }}>
          <LogOut size={18} /> Secure Logout
        </button>
      </div>
    </aside>
  );
}

// Wrapper component to handle location-based logic
function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("isAuthenticated") === "true";
  });
  const location = useLocation();

  // Determine if the current page is an authentication page
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="app-container">
      {/* Sidebar only shows if authenticated AND not on login/signup pages */}
      {!isAuthPage && isAuthenticated && <NavLinks setAuth={setIsAuthenticated} />}

      <main className={isAuthPage ? "auth-main" : "main-content"}>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={!isAuthenticated ? <Login setAuth={setIsAuthenticated} /> : <Navigate to="/" />} />
          <Route path="/signup" element={!isAuthenticated ? <Signup setAuth={setIsAuthenticated} /> : <Navigate to="/" />} />

          {/* Protected Routes - Redirect to Login if not authenticated */}
          <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/scanner" element={isAuthenticated ? <Scanner /> : <Navigate to="/login" />} />
          <Route path="/triage" element={isAuthenticated ? <Triage /> : <Navigate to="/login" />} />
          <Route path="/database" element={isAuthenticated ? <PatientDatabase /> : <Navigate to="/login" />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}