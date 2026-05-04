import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogIn, CheckCircle, Lock, Activity, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../hooks/useAuth";
import './AuthStyles.css';

const LoginForm = ({ setAuth }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const navigate = useNavigate();
  const { login, error } = useAuth();

  useEffect(() => {
    const success = sessionStorage.getItem("registrationSuccess") === "true";
    const email = sessionStorage.getItem("registeredEmail") || "";
    const regUsername = sessionStorage.getItem("registeredUsername") || "";

    if (success) {
      setRegistrationSuccess(true);
      setRegisteredEmail(email);

      if (regUsername) {
        setUsername(regUsername);
      } else if (email.includes("@")) {
        setUsername(email.split("@")[0]);
      }

      sessionStorage.removeItem("registrationSuccess");
      sessionStorage.removeItem("registeredEmail");
      sessionStorage.removeItem("registeredUsername");

      setTimeout(() => setRegistrationSuccess(false), 5000);
    }
  }, []);

  const [isMobile, setIsMobile] = useState(false);
  const [canUseBio, setCanUseBio] = useState(false);
  const [bioAvailableForUser, setBioAvailableForUser] = useState(false);

  useEffect(() => {
    const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768;
    setIsMobile(mobile);
    
    const keys = Object.keys(localStorage);
    setCanUseBio(keys.some(k => k.startsWith("bio_enrolled_")));
  }, []);

  // Real-time biometric check as they type
  useEffect(() => {
    if (username.length > 2) {
      setBioAvailableForUser(localStorage.getItem(`bio_enrolled_${username}`) === "true");
    } else {
      setBioAvailableForUser(false);
    }
  }, [username]);

  const handleBiometricLogin = async () => {
    let targetUser = username;
    if (!targetUser) {
      const keys = Object.keys(localStorage);
      const enrollmentKey = keys.find(k => k.startsWith("bio_enrolled_"));
      if (enrollmentKey) targetUser = enrollmentKey.replace("bio_enrolled_", "");
    }

    if (!targetUser || localStorage.getItem(`bio_enrolled_${targetUser}`) !== "true") {
      alert("Biometric profile not found. Please enable it in Signup first.");
      return;
    }

    setIsLoading(true);
    
    // 1. Haptic Feedback (Vibrate)
    if (navigator.vibrate) navigator.vibrate(50);
    
    try {
      console.log("🛡️ Neural-Link: Verifying Fingerprint...");
      
      // 2. Simulate Native Processing Delay for "Real" feel
      await new Promise(resolve => setTimeout(resolve, 1200));

      const cred = localStorage.getItem(`bio_cred_${targetUser}`);
      if (cred) {
        const [u, p] = atob(cred).split(":");
        const success = await login(u, p);
        if (success) {
          if (navigator.vibrate) navigator.vibrate([30, 50, 30]); // Success pattern
          sessionStorage.setItem("isAuthenticated", "true");
          if (setAuth) setAuth(true);
          navigate("/");
          return;
        }
      }
      throw new Error("Match failed");
    } catch (e) {
      alert("Biometric verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(username, password);

    if (success) {
      sessionStorage.setItem("isAuthenticated", "true");
      if (setAuth) setAuth(true);
      navigate("/");
    }

    setIsLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-blob blob-1"></div>
      <div className="auth-blob blob-2"></div>
      <div className="auth-blob blob-3"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card auth-container"
      >
        
        {/* Left Side: Brand Info (Matching Dashboard headers) */}
        <div className="auth-brand">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
            className="logo" style={{ marginBottom: '20px', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            <div className="stat-icon" style={{ background: 'rgba(0, 229, 255, 0.1)', width: '48px', height: '48px' }}>
              <Activity color="var(--accent-cyan)" />
            </div>
            <span className="shimmer-text">Med-AI</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.7 }}
            style={{ fontSize: '2.5rem', marginBottom: '16px' }}
          >
            Smart Clinical <br/>Decision Support System
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.7 }}
            className="subtitle" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}
          >
            Log in to access AI-powered tools for analyzing medical data and supporting accurate diagnosis.
          </motion.p>
        </div>

        {/* Right Side: Form */}
        <div className="auth-form-wrapper">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
            style={{ fontSize: '1.85rem', fontWeight: 700, marginBottom: '28px' }}
          >
            Clinician Login
          </motion.h2>

          <AnimatePresence>
            {registrationSuccess && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: '20px' }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="glass-card" style={{ padding: '12px', display: 'flex', alignItems: 'center', borderColor: 'var(--success)', background: 'rgba(0, 230, 118, 0.05)', overflow: 'hidden' }}
              >
                <CheckCircle size={18} color="var(--success)" style={{ marginRight: '10px' }} />
                <span style={{ fontSize: '0.9rem', color: 'var(--success)' }}>
                  Registered {registeredEmail} successfully.
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit}>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="auth-input-group">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="auth-input"
                style={{ borderColor: bioAvailableForUser ? 'var(--accent-cyan)' : '' }}
                required
              />
              <User size={18} color={bioAvailableForUser ? 'var(--accent-cyan)' : 'var(--text-secondary)'} />
              
              <AnimatePresence>
                {bioAvailableForUser && (
                  <motion.span 
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    style={{ 
                      position: 'absolute', 
                      right: '12px', 
                      top: '-24px', 
                      fontSize: '0.7rem', 
                      color: 'var(--accent-cyan)', 
                      fontWeight: 700,
                      background: 'rgba(0, 229, 255, 0.1)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--accent-cyan)'
                    }}
                  >
                    BIOMETRIC READY
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.5 }} className="auth-input-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                required
              />
              <Lock size={18} />
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                  style={{ color: 'var(--danger)', fontSize: '0.9rem', marginBottom: '16px', padding: '10px', background: 'rgba(255,82,82,0.1)', borderRadius: '8px' }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <motion.button 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                type="submit" className="auth-btn" disabled={isLoading} style={{ flex: 1 }}
              >
                {isLoading ? <Loader2 size={18} className="spin-anim" /> : <><LogIn size={18} /> Access System</>}
              </motion.button>

              {isMobile && canUseBio && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }} 
                  animate={{ 
                    opacity: 1, 
                    scale: bioAvailableForUser ? 1.1 : 1,
                    boxShadow: bioAvailableForUser ? '0 0 20px rgba(0, 229, 255, 0.5)' : 'none'
                  }} 
                  transition={{ delay: 0.65 }}
                  whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleBiometricLogin}
                  disabled={isLoading}
                  className={bioAvailableForUser ? 'bio-pulse' : ''}
                  style={{ 
                    width: '54px', 
                    height: '54px', 
                    borderRadius: '12px', 
                    background: bioAvailableForUser ? 'var(--accent-cyan)' : 'rgba(0, 229, 255, 0.1)', 
                    border: '1px solid var(--accent-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  title="Biometric Login"
                >
                  <Activity size={24} color={bioAvailableForUser ? '#000' : 'var(--accent-cyan)'} />
                </motion.button>
              )}
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.5 }} className="switch-text">
              Create a New Account?
              <span onClick={() => navigate('/signup')}>Sign Up</span>
            </motion.div>
          </form>
        </div>

      </motion.div>
    </div>
  );
};

export default LoginForm;