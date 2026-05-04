import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Key, LogIn, ShieldAlert, Building, Loader2, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../hooks/useAuth";
import './AuthStyles.css';

const RegisterForm = ({ setAuth }) => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { register, error: authError } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrorMsg(""); // Clear local error on change
  };

  const [isMobile, setIsMobile] = useState(false);
  const [useBiometrics, setUseBiometrics] = useState(false);

  useEffect(() => {
    // Detect mobile and biometric support
    const checkSupport = async () => {
      const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth <= 768;
      setIsMobile(mobile);
    };
    checkSupport();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return setErrorMsg("Passwords do not match");
    }

    setIsLoading(true);

    const success = await register(form.username, form.email, form.password, form.role);

    if (success) {
      // If biometrics enabled, "enroll" the device (Simulated WebAuthn for demo)
      if (useBiometrics) {
        localStorage.setItem(`bio_enrolled_${form.username}`, "true");
        // We store credentials safely (in a real app, use WebAuthn proper)
        localStorage.setItem(`bio_cred_${form.username}`, btoa(`${form.username}:${form.password}`));
        console.log("🔒 Biometrics Enrolled for", form.username);
      }

      sessionStorage.setItem("registrationSuccess", "true");
      sessionStorage.setItem("registeredEmail", form.email);
      sessionStorage.setItem("registeredUsername", form.username);
      navigate("/login");
    }

    setIsLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-blob blob-1" style={{ background: 'linear-gradient(135deg, var(--accent-cyan), var(--success))' }}></div>
      <div className="auth-blob blob-2" style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))' }}></div>
      <div className="auth-blob blob-3"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card auth-container"
      >

        {/* Left Side: Brand Info */}
        <div className="auth-brand" style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.8) 0%, rgba(30,58,138,0.4) 100%)' }}>
          <motion.div 
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
            className="logo" style={{ marginBottom: '20px', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            <div className="stat-icon" style={{ background: 'rgba(179, 136, 255, 0.1)', width: '48px', height: '48px' }}>
              <ShieldAlert color="var(--accent-purple)" />
            </div>
            <span className="shimmer-text">Welcome to Med-AI</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.7 }}
            style={{ fontSize: '2.5rem', marginBottom: '16px' }}
          >
            AI-Powered <br />Clinical Support
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.7 }}
            className="subtitle" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}
          >
            Join our AI-driven system to upload, analyze, and manage clinical data efficiently.
          </motion.p>
        </div>

        {/* Right Side: Form */}
        <div className="auth-form-wrapper">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
            style={{ fontSize: '1.85rem', fontWeight: 700, marginBottom: '24px' }}
          >
            Request Access
          </motion.h2>

          <form onSubmit={handleSubmit}>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35, duration: 0.5 }} className="auth-input-group">
              <input
                name="username"
                placeholder="Institutional ID (Username)"
                onChange={handleChange}
                className="auth-input"
                required
              />
              <User size={18} />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="auth-input-group">
              <input
                name="email"
                type="email"
                placeholder="Work Email"
                onChange={handleChange}
                className="auth-input"
                required
              />
              <Mail size={18} />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45, duration: 0.5 }} className="auth-input-group">
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="auth-input"
                style={{ appearance: 'none', cursor: 'pointer' }}
                required
              >
                <option value="" style={{ color: '#000' }}>Select Role</option>
                <option value="Doctor" style={{ color: '#000' }}>Doctor</option>
                <option value="Patient" style={{ color: '#000' }}>Patient</option>
                <option value="Admin" style={{ color: '#000' }}>Admin</option>
                <option value="Nurse" style={{ color: '#000' }}>Nurse</option>
              </select>
              <User size={18} />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.5 }} className="auth-input-group" style={{ marginBottom: '12px' }}>
              <input
                name="password"
                type="password"
                placeholder="Security Password"
                onChange={handleChange}
                className="auth-input"
                required
              />
              <Key size={18} />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55, duration: 0.5 }} className="auth-input-group">
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                onChange={handleChange}
                className="auth-input"
                required
              />
              <Key size={18} />
            </motion.div>

            {isMobile && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                className={`biometric-option bio-card-premium ${useBiometrics ? 'active' : ''}`}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  margin: '16px 0', 
                  padding: '16px', 
                  borderRadius: '16px',
                  cursor: 'pointer'
                }}
                onClick={() => setUseBiometrics(!useBiometrics)}
              >
                <div className="scan-line"></div>
                <div className="bio-pulse" style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '12px', 
                  background: useBiometrics ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s'
                }}>
                  <Activity size={22} color={useBiometrics ? '#000' : 'var(--text-secondary)'} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>Secure Fingerprint</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>One-touch login enabled</div>
                </div>
                <div className={`bio-toggle ${useBiometrics ? 'active' : ''}`} style={{ 
                  width: '44px', 
                  height: '24px', 
                  background: useBiometrics ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  position: 'relative',
                  transition: 'all 0.3s'
                }}>
                  <div style={{ 
                    width: '18px', 
                    height: '18px', 
                    background: '#fff', 
                    borderRadius: '50%', 
                    position: 'absolute',
                    top: '3px',
                    left: useBiometrics ? '23px' : '3px',
                    transition: 'all 0.3s'
                  }}></div>
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {(errorMsg || authError) && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                  style={{ color: 'var(--danger)', fontSize: '0.9rem', marginBottom: '16px', padding: '10px', background: 'rgba(255,82,82,0.1)', borderRadius: '8px' }}
                >
                  {errorMsg || authError}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.5 }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              type="submit" className="auth-btn" disabled={isLoading} style={{ background: 'var(--accent-cyan)', color: 'var(--bg-primary)' }}
            >
              {isLoading ? <Loader2 size={18} className="spin-anim" /> : <><LogIn size={18} /> Submit Credentials</>}
            </motion.button>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75, duration: 0.5 }} className="switch-text">
              Already Have an Account?
              <span onClick={() => navigate('/login')}>Sign In</span>
            </motion.div>
          </form>
        </div>

      </motion.div>
    </div>
  );
};

export default RegisterForm;