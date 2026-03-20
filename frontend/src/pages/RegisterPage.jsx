import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const CheckIcon = ({ valid }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: valid ? 1 : 0 }}
    className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center"
  >
    <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#10B981" strokeWidth="3">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  </motion.div>
);

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordChecks = {
    length: form.password.length >= 6,
    letter: /[a-zA-Z]/.test(form.password),
    number: /[0-9]/.test(form.password),
  };
  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError('All fields are required');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await register(form.name, form.email, form.password);
    setLoading(false);
    if (result?.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result?.message || 'Registration failed');
    }
  };

  const strengthColors = ['', '#F43F5E', '#F59E0B', '#10B981'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];

  return (
    <div className="min-h-screen bg-void bg-grid flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-electric opacity-5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan opacity-5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-electric flex items-center justify-center shadow-electric">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </div>
            <div>
              <div className="font-display font-800 text-xl text-white tracking-widest">NEXUS</div>
              <div className="font-body text-[9px] text-electric tracking-[4px] -mt-0.5">GLOBAL BANK</div>
            </div>
          </Link>
        </div>

        <div className="glass-bright rounded-2xl p-8 glow-electric">
          <div className="mb-7">
            <h1 className="font-display text-2xl font-bold text-white mb-1">Create account</h1>
            <p className="text-slate-400 text-sm">Join thousands of global traders</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                autoComplete="name"
                className="input-nexus w-full h-12 rounded-xl px-4 text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className="input-nexus w-full h-12 rounded-xl px-4 text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  className="input-nexus w-full h-12 rounded-xl px-4 pr-12 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>

              {/* Strength meter */}
              {form.password && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 space-y-2">
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full overflow-hidden bg-slate-800">
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: i <= passwordStrength ? 1 : 0 }}
                          style={{ backgroundColor: passwordStrength >= i ? strengthColors[passwordStrength] : 'transparent', transformOrigin: 'left' }}
                          className="h-full rounded-full"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      {[
                        { label: '6+ chars', valid: passwordChecks.length },
                        { label: 'Letter', valid: passwordChecks.letter },
                        { label: 'Number', valid: passwordChecks.number },
                      ].map(c => (
                        <div key={c.label} className="flex items-center gap-1">
                          <CheckIcon valid={c.valid} />
                          <span className="text-[10px] text-slate-500">{c.label}</span>
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color: strengthColors[passwordStrength] }}>
                      {strengthLabels[passwordStrength]}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  className="input-nexus w-full h-12 rounded-xl px-4 pr-12 text-sm"
                />
                {form.confirmPassword && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {form.password === form.confirmPassword ? (
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#10B981" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#F43F5E" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-rose-500/10 border border-rose-500/25 rounded-xl px-4 py-3 text-rose-400 text-sm flex items-center gap-2"
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="btn-electric w-full h-12 rounded-xl font-display font-semibold text-sm tracking-wide disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account →'
              )}
            </button>
          </form>

          <div className="mt-5 p-3 bg-electric/5 border border-electric/15 rounded-xl">
            <p className="text-xs text-slate-500 text-center">
              Already have an account?{' '}
              <Link to="/login" className="text-electric hover:text-electric-light font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          By registering you agree to our Terms of Service
        </p>
      </motion.div>
    </div>
  );
}
