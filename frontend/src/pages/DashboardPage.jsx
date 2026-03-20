import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import CurrencyConverter from '../components/CurrencyConverter';
import TransactionHistory from '../components/TransactionHistory';
import StatsCard from '../components/StatsCard';
import api from '../api/axiosConfig';

export default function DashboardPage() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({ total: 0, volume: 0, currencies: 0 });
  const [toast, setToast] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/transactions?limit=100');
      if (res.data.success) {
        const txns = res.data.transactions;
        const uniqueCurrencies = new Set();
        txns.forEach(t => { uniqueCurrencies.add(t.fromCurrency); uniqueCurrencies.add(t.toCurrency); });
        const totalVolume = txns.reduce((sum, t) => sum + t.amount, 0);
        setStats({
          total: res.data.pagination.total,
          volume: totalVolume,
          currencies: uniqueCurrencies.size,
        });
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats, refreshKey]);

  const handleTransactionComplete = (txn) => {
    setRefreshKey(k => k + 1);
    showToast('Transaction successful! Invoice PDF ready.', 'success');
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatVolume = (n) => {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
    return `$${n.toFixed(0)}`;
  };

  return (
    <div className="min-h-screen bg-void">
      {/* Background */}
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-50" />
      <div className="fixed top-0 left-1/4 w-[600px] h-[400px] bg-electric opacity-[0.03] rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan opacity-[0.03] rounded-full blur-[120px] pointer-events-none" />

      <Navbar />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-start justify-between flex-wrap gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-6 rounded-full bg-electric" />
              <p className="text-slate-400 text-sm">{greeting()},</p>
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-white">
              {user?.name?.split(' ')[0]} <span className="gradient-text">👋</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Here's your Nexus Global Bank overview
            </p>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-semibold">Markets Open</span>
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            icon={
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            label="Total Transactions"
            value={stats.total.toString()}
            sub="Lifetime conversions"
            color="electric"
            index={0}
          />
          <StatsCard
            icon={
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            label="Total Volume"
            value={formatVolume(stats.volume)}
            sub="In USD equivalent"
            color="emerald"
            index={1}
          />
          <StatsCard
            icon={
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              </svg>
            }
            label="Currencies Used"
            value={stats.currencies.toString()}
            sub="Unique currencies"
            color="amber"
            index={2}
          />
          <StatsCard
            icon={
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
            label="Account Status"
            value="Active"
            sub="Verified & secured"
            color="cyan"
            index={3}
          />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Converter - left */}
          <div className="lg:col-span-2">
            <CurrencyConverter onTransactionComplete={handleTransactionComplete} />
          </div>

          {/* Transaction history - right */}
          <div className="lg:col-span-3">
            <TransactionHistory refreshTrigger={refreshKey} />
          </div>
        </div>

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap items-center justify-between gap-4 pb-6"
        >
          <div className="flex items-center gap-6 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              256-bit SSL
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              GST Compliant
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Real-time Rates
            </span>
          </div>
          <p className="text-slate-700 text-xs">© {new Date().getFullYear()} Nexus Global Bank</p>
        </motion.div>
      </main>

      {/* Toast notification */}
      {toast && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-panel border max-w-sm
            ${toast.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
            }`}
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
            ${toast.type === 'success' ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}
          >
            {toast.type === 'success' ? (
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <p className="text-sm font-medium">{toast.message}</p>
        </motion.div>
      )}
    </div>
  );
}
