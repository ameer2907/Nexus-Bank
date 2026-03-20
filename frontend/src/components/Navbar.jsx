import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <nav className="h-16 border-b border-border glass-bright sticky top-0 z-50">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-electric flex items-center justify-center shadow-electric-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </div>
          <div>
            <div className="font-display font-bold text-white text-base tracking-widest leading-none">NEXUS</div>
            <div className="text-[8px] text-electric tracking-[3px] leading-none mt-0.5">GLOBAL BANK</div>
          </div>
        </div>

        {/* Center - account number */}
        {user?.accountNumber && (
          <div className="hidden md:flex items-center gap-2 bg-surface border border-border rounded-xl px-4 py-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono text-xs text-slate-400">
              Acc: <span className="text-slate-200">{user.accountNumber}</span>
            </span>
          </div>
        )}

        {/* Right - user menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(p => !p)}
            className="flex items-center gap-3 h-10 pl-2 pr-3 rounded-xl border border-border hover:border-electric/30 transition-colors"
          >
            {/* Avatar */}
            <div className="w-7 h-7 rounded-lg bg-electric/20 border border-electric/30 flex items-center justify-center">
              <span className="font-display font-bold text-electric text-xs">{initials}</span>
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-white text-xs font-semibold leading-tight">{user?.name}</div>
              <div className="text-slate-500 text-[10px] leading-tight">{user?.email}</div>
            </div>
            <svg
              width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"
              className={`text-slate-500 transition-transform ${showMenu ? 'rotate-180' : ''}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0" onClick={() => setShowMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-52 glass-bright rounded-2xl border border-border shadow-panel overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-border">
                    <div className="text-white text-sm font-semibold">{user?.name}</div>
                    <div className="text-slate-500 text-xs mt-0.5 truncate">{user?.email}</div>
                  </div>

                  <div className="p-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-colors text-sm">
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile Settings
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors text-sm"
                    >
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
