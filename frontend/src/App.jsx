import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Stethoscope, Activity, Database, LayoutDashboard, Layers, LogOut, Video, Menu, X, Sun, Moon, HelpCircle, Loader2 } from 'lucide-react';
import Preloader from './components/Preloader';
import API_BASE_URL from './api';
import "./index.css";
import "./App.css";

// Lazy load pages for code splitting (Faster initial load)
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Scanner = lazy(() => import('./pages/Scanner'));
const PatientDatabase = lazy(() => import('./pages/PatientDatabase'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Triage = lazy(() => import('./pages/Triage'));
const Consult = lazy(() => import('./pages/Consult'));
const Help = lazy(() => import('./pages/Help'));

function NavLinks({ setAuth, isOpen, setIsOpen }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';
  const username = sessionStorage.getItem("username");

  const handleLogout = () => {
    sessionStorage.clear();
    setAuth(false);
  };

  const handleNavClick = () => {
    if (window.innerWidth <= 900) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="logo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Stethoscope color="var(--accent-cyan)" />
            <h2>Med-AI</h2>
          </div>
          <button className="mobile-close-btn" onClick={() => setIsOpen(false)}>
            <X size={24} color="var(--text-primary)" />
          </button>
        </div>
        <div className="nav-links">
          <Link to="/" onClick={handleNavClick} className={`nav-item ${isActive('/')}`}><LayoutDashboard size={18} /> Admin Dashboard</Link>
          <Link to="/consult" onClick={handleNavClick} className={`nav-item ${isActive('/consult')}`}><Video size={18} /> AI TeleConsult</Link>
          <Link to="/scanner" onClick={handleNavClick} className={`nav-item ${isActive('/scanner')}`}><Activity size={18} /> Clinical Imaging</Link>
          {username === 'admin' && (
            <Link to="/triage" onClick={handleNavClick} className={`nav-item ${isActive('/triage')}`}><Layers size={18} /> Clinical Workflow</Link>
          )}
          <Link to="/database" onClick={handleNavClick} className={`nav-item ${isActive('/database')}`}><Database size={18} /> Patient Records</Link>
          <Link to="/help" onClick={handleNavClick} className={`nav-item ${isActive('/help')}`} style={{ color: 'var(--accent-cyan)' }}><HelpCircle size={18} /> About & Help</Link>
        </div>
        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
          <button onClick={handleLogout} className="nav-item" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', color: 'var(--danger)', background: 'rgba(255,82,82,0.05)' }}>
            <LogOut size={18} /> Secure Logout
          </button>
        </div>
      </aside>
    </>
  );
}

function BottomNav({ isActive }) {
  return (
    <nav className="mobile-bottom-nav">
      <Link to="/" className={`nav-item ${isActive('/')}`}><LayoutDashboard size={20} /></Link>
      <Link to="/consult" className={`nav-item ${isActive('/consult')}`}><Video size={20} /></Link>
      <div className="nav-scan-btn">
        <Link to="/scanner" className={`scan-inner ${isActive('/scanner')}`}><Activity size={24} /></Link>
      </div>
      <Link to="/database" className={`nav-item ${isActive('/database')}`}><Database size={20} /></Link>
      <Link to="/help" className={`nav-item ${isActive('/help')}`}><HelpCircle size={20} /></Link>
    </nav>
  );
}

function MobileHeader({ username, isLightMode, toggleTheme, setIsSidebarOpen }) {
  const [greeting, setGreeting] = useState('');
  
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  return (
    <header className="premium-mobile-header">
      <div className="header-left">
        <span className="greeting-text">{greeting},</span>
        <h2 className="user-name">{username || 'Clinician'}</h2>
      </div>
      <div className="header-right">
        <button className="icon-btn theme-toggle" onClick={toggleTheme}>
          {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <button className="icon-btn menu-toggle" onClick={() => setIsSidebarOpen(true)}>
          <Menu size={20} />
        </button>
      </div>
    </header>
  );
}

function AppContent() {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("isAuthenticated") === "true";
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(
    document.documentElement.getAttribute('data-theme') === 'light'
  );
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    
    const startTime = Date.now();
    console.log("🚀 Warming up neural core...");
    
    const wakeUp = async () => {
      try {
        await fetch(`${API_BASE_URL}/api/ping`);
      } catch (e) {} finally {
        const elapsed = Date.now() - startTime;
        setTimeout(() => setIsAppLoading(false), Math.max(1500 - elapsed, 0));
      }
    };
    wakeUp();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleTheme = () => {
    const newMode = !isLightMode;
    setIsLightMode(newMode);
    document.documentElement.setAttribute('data-theme', newMode ? 'light' : 'dark');
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <>
      {isAppLoading && <Preloader />}
      <div className={`app-container ${isMobile ? 'mobile-mode' : ''}`} style={{ display: isAppLoading ? 'none' : 'flex' }}>
        
      {!isAuthPage && isAuthenticated && !isMobile && (
        <NavLinks setAuth={setIsAuthenticated} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      )}

      {/* Mobile Sidebar (Drawer) */}
      {!isAuthPage && isAuthenticated && isMobile && (
        <NavLinks setAuth={setIsAuthenticated} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      )}

      <main className={isAuthPage ? "auth-main" : "main-content"}>
        {!isAuthPage && isAuthenticated && isMobile && (
          <MobileHeader 
            username={sessionStorage.getItem("username")} 
            isLightMode={isLightMode} 
            toggleTheme={toggleTheme} 
            setIsSidebarOpen={setIsSidebarOpen} 
          />
        )}

        {!isAuthPage && isAuthenticated && !isMobile && (
          <div className="top-bar">
            <button className="theme-toggle-btn" onClick={toggleTheme}>
              {isLightMode ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        )}
        
        <Suspense fallback={
          <div className="loader-overlay">
            <div className="loader-content">
              <Loader2 className="spin-anim" size={40} color="var(--accent-cyan)" />
              <p>Synchronizing Neural Pathways...</p>
            </div>
          </div>
        }>
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login setAuth={setIsAuthenticated} /> : <Navigate to="/" />} />
            <Route path="/signup" element={!isAuthenticated ? <Signup setAuth={setIsAuthenticated} /> : <Navigate to="/" />} />
            <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/consult" element={isAuthenticated ? <Consult /> : <Navigate to="/login" />} />
            <Route path="/scanner" element={isAuthenticated ? <Scanner /> : <Navigate to="/login" />} />
            <Route 
              path="/triage" 
              element={isAuthenticated && sessionStorage.getItem("username") === 'admin' ? <Triage /> : <Navigate to="/" />} 
            />
            <Route path="/database" element={isAuthenticated ? <PatientDatabase /> : <Navigate to="/login" />} />
            <Route path="/help" element={isAuthenticated ? <Help /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
          </Routes>
        </Suspense>

        {!isAuthPage && location.pathname !== '/help' && (
          <footer className="global-footer">
            © 2026 Med-AI Laboratory | Lead Architect: Utkarsh Srivastav
          </footer>
        )}
      </main>

      {/* Unique Mobile Bottom Nav */}
      {!isAuthPage && isAuthenticated && isMobile && <BottomNav isActive={isActive} />}
    </div>
    </>
  );
}


export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}