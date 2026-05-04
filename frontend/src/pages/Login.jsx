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
  const [success, setSuccess] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If already authenticated, redirect to home
    if (sessionStorage.getItem("isAuthenticated") === "true") {
      navigate("/");
    }
    
    // Check for registration success
    if (sessionStorage.getItem("registrationSuccess") === "true") {
      setSuccess(true);
      const timer = setTimeout(() => {
        setSuccess(false);
        sessionStorage.removeItem("registrationSuccess");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [navigate]);

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
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card auth-container"
      >
        <div className="auth-brand">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
            className="logo" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            <div className="stat-icon" style={{ background: 'rgba(0, 229, 255, 0.1)', width: '48px', height: '48px' }}>
              <Activity color="var(--accent-cyan)" />
            </div>
            <span className="shimmer-text">Med-AI</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}
            style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '16px' }}
          >
            Clinical Decision <br />Support System
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }}
            className="subtitle"
          >
            Access the neural-powered medical analysis engine.
          </motion.p>
        </div>

        <div className="auth-form-wrapper">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
            style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '28px' }}
          >
            Authenticate
          </motion.h2>

          <form onSubmit={handleSubmit}>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="auth-input-group">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="auth-input"
                required
              />
              <User size={18} />
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

            <motion.button 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" className="auth-btn" disabled={isLoading}
            >
              {isLoading ? <Loader2 size={18} className="spin-anim" /> : <><LogIn size={18} /> Access System</>}
            </motion.button>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.5 }} className="switch-text">
              Don't Have Access?
              <span onClick={() => navigate('/signup')}>Request Access</span>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginForm;