import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosConfig';

const SkeletonRow = () => (
  <tr>
    {[...Array(5)].map((_, i) => (
      <td key={i} className="px-5 py-4">
        <div className="shimmer h-4 rounded-lg" style={{ width: `${60 + Math.random() * 40}%` }} />
      </td>
    ))}
  </tr>
);

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export default function TransactionHistory({ refreshTrigger }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [downloading, setDownloading] = useState(null);

  const fetchTransactions = useCallback(async (pageNum = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/transactions?page=${pageNum}&limit=10`);
      if (res.data.success) {
        setTransactions(res.data.transactions);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions(page);
  }, [fetchTransactions, page, refreshTrigger]);

  const handleDownloadInvoice = async (txn) => {
    setDownloading(txn._id);
    try {
      const res = await api.get(`/transactions/${txn._id}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${txn.transactionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      // silently fail
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="glass-bright rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-white text-lg">Transaction History</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            {pagination ? `${pagination.total} total transactions` : 'Your exchange records'}
          </p>
        </div>
        <button
          onClick={() => fetchTransactions(page)}
          className="w-9 h-9 rounded-xl border border-border hover:border-electric/30 text-slate-500 hover:text-electric transition-all flex items-center justify-center"
        >
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="px-6 py-4 bg-rose-500/10 border-b border-rose-500/20">
          <p className="text-rose-400 text-sm">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Pair</th>
              <th className="px-5 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
              <th className="px-5 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Converted</th>
              <th className="px-5 py-3 text-right text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Rate</th>
              <th className="px-5 py-3 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {loading ? (
              [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center">
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#475569" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium">No transactions yet</p>
                      <p className="text-slate-600 text-xs mt-1">Your currency exchanges will appear here</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((txn, i) => (
                <motion.tr
                  key={txn._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="table-row-hover"
                >
                  {/* Date */}
                  <td className="px-5 py-4">
                    <div className="text-slate-300 font-medium">{formatDate(txn.createdAt)}</div>
                    <div className="text-slate-600 text-[11px] font-mono mt-0.5">{formatTime(txn.createdAt)}</div>
                  </td>

                  {/* Currency pair */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">{txn.fromCurrency}</span>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#0066FF" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      <span className="font-mono font-bold text-electric">{txn.toCurrency}</span>
                    </div>
                    <div className="font-mono text-[10px] text-slate-600 mt-0.5">{txn.transactionId}</div>
                  </td>

                  {/* Amount */}
                  <td className="px-5 py-4 text-right">
                    <span className="font-mono font-semibold text-slate-200">
                      {parseFloat(txn.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-slate-500 text-xs ml-1">{txn.fromCurrency}</span>
                  </td>

                  {/* Converted */}
                  <td className="px-5 py-4 text-right">
                    <span className="font-mono font-semibold text-emerald-400">
                      {parseFloat(txn.convertedAmount).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </span>
                    <span className="text-slate-500 text-xs ml-1">{txn.toCurrency}</span>
                  </td>

                  {/* Rate */}
                  <td className="px-5 py-4 text-right">
                    <span className="font-mono text-slate-400 text-xs">{parseFloat(txn.rate).toFixed(4)}</span>
                  </td>

                  {/* Invoice */}
                  <td className="px-5 py-4 text-center">
                    <button
                      onClick={() => handleDownloadInvoice(txn)}
                      disabled={downloading === txn._id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-electric/25 text-electric hover:bg-electric/10 transition-colors text-xs font-semibold disabled:opacity-50"
                    >
                      {downloading === txn._id ? (
                        <div className="w-3 h-3 rounded-full border border-electric/30 border-t-electric animate-spin" />
                      ) : (
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                      PDF
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Page {pagination.page} of {pagination.pages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-border text-slate-400 hover:border-electric/30 hover:text-electric text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="px-3 py-1.5 rounded-lg border border-border text-slate-400 hover:border-electric/30 hover:text-electric text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
