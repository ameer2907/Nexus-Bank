import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosConfig';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽' },
  { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷' },
  { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷' },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'HKD', name: 'Hong Kong Dollar', flag: '🇭🇰' },
  { code: 'NOK', name: 'Norwegian Krone', flag: '🇳🇴' },
  { code: 'SEK', name: 'Swedish Krona', flag: '🇸🇪' },
  { code: 'DKK', name: 'Danish Krone', flag: '🇩🇰' },
  { code: 'NZD', name: 'New Zealand Dollar', flag: '🇳🇿' },
  { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦' },
  { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦' },
  { code: 'TRY', name: 'Turkish Lira', flag: '🇹🇷' },
  { code: 'THB', name: 'Thai Baht', flag: '🇹🇭' },
  { code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾' },
  { code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺' },
];

const CurrencySelect = ({ value, onChange, label, exclude }) => (
  <div className="flex-1">
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input-nexus w-full h-12 rounded-xl px-4 pr-10 text-sm font-mono font-semibold appearance-none cursor-pointer"
      >
        {CURRENCIES.filter(c => c.code !== exclude).map(c => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.code} — {c.name}
          </option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
);

export default function CurrencyConverter({ onTransactionComplete }) {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
    setError('');
  };

  const handleConvert = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }
    if (fromCurrency === toCurrency) {
      setError('Please select different currencies');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.post('/transactions/convert', {
        fromCurrency,
        toCurrency,
        amount: parseFloat(amount),
      });

      if (res.data.success) {
        setResult(res.data.transaction);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        if (onTransactionComplete) onTransactionComplete(res.data.transaction);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Conversion failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!result) return;
    setDownloading(true);
    try {
      const res = await api.get(`/transactions/${result.id}/invoice`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${result.transactionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Failed to download invoice. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const fromCurrencyData = CURRENCIES.find(c => c.code === fromCurrency);
  const toCurrencyData = CURRENCIES.find(c => c.code === toCurrency);

  return (
    <div className="glass-bright rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-white text-lg">Currency Exchange</h2>
          <p className="text-slate-500 text-xs mt-0.5">Real-time conversion rates</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
          <span className="text-xs text-slate-500 font-mono">LIVE</span>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">
              {fromCurrencyData?.flag}
            </span>
            <input
              type="number"
              value={amount}
              onChange={e => { setAmount(e.target.value); setError(''); setResult(null); }}
              placeholder="0.00"
              min="0.01"
              step="any"
              className="input-nexus w-full h-14 rounded-xl pl-10 pr-24 text-xl font-mono font-semibold"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm font-bold">
              {fromCurrency}
            </span>
          </div>
        </div>

        {/* Currency selectors */}
        <div className="flex items-end gap-3">
          <CurrencySelect value={fromCurrency} onChange={v => { setFromCurrency(v); setResult(null); }} label="From" exclude={toCurrency} />

          {/* Swap button */}
          <motion.button
            onClick={handleSwap}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9, rotate: 180 }}
            className="mb-0.5 w-11 h-11 flex-shrink-0 rounded-xl bg-electric/10 border border-electric/30 text-electric hover:bg-electric/20 transition-colors flex items-center justify-center"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </motion.button>

          <CurrencySelect value={toCurrency} onChange={v => { setToCurrency(v); setResult(null); }} label="To" exclude={fromCurrency} />
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-rose-500/10 border border-rose-500/25 rounded-xl px-4 py-3 text-rose-400 text-sm flex items-center gap-2"
            >
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Convert button */}
        <button
          onClick={handleConvert}
          disabled={loading || !amount}
          className="btn-electric w-full h-12 rounded-xl font-display font-semibold text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Convert Now
            </>
          )}
        </button>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="rounded-2xl overflow-hidden border border-emerald-500/20"
            >
              {/* Result header */}
              <div className="bg-emerald-500/10 px-5 py-3 flex items-center gap-2 border-b border-emerald-500/20">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-emerald-400 text-sm font-semibold">Conversion Successful</span>
                <span className="ml-auto font-mono text-[10px] text-slate-500">{result.transactionId}</span>
              </div>

              <div className="bg-surface/50 p-5 space-y-4">
                {/* Main amounts */}
                <div className="flex items-center justify-between gap-4">
                  <div className="text-center flex-1">
                    <div className="text-slate-400 text-xs mb-1">{fromCurrencyData?.flag} You Send</div>
                    <div className="font-mono font-bold text-xl text-white">{parseFloat(result.amount).toLocaleString()}</div>
                    <div className="text-electric text-xs font-semibold mt-0.5">{result.fromCurrency}</div>
                  </div>
                  <div className="text-slate-600">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-slate-400 text-xs mb-1">{toCurrencyData?.flag} You Get</div>
                    <div className="font-mono font-bold text-xl text-emerald-400">{parseFloat(result.convertedAmount).toLocaleString()}</div>
                    <div className="text-emerald-500 text-xs font-semibold mt-0.5">{result.toCurrency}</div>
                  </div>
                </div>

                {/* Rate */}
                <div className="flex justify-center">
                  <div className="bg-electric/10 border border-electric/20 rounded-lg px-4 py-1.5 font-mono text-xs text-electric">
                    1 {result.fromCurrency} = {result.rate} {result.toCurrency}
                  </div>
                </div>

                {/* GST breakdown */}
                <div className="bg-void/60 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Converted Amount</span>
                    <span className="text-slate-300 font-mono">{result.convertedAmount} {result.toCurrency}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">GST (18%)</span>
                    <span className="text-amber-400 font-mono">+{result.gstAmount} {result.toCurrency}</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex justify-between text-sm font-semibold">
                    <span className="text-slate-300">Total Payable</span>
                    <span className="text-white font-mono">{result.totalAmount} {result.toCurrency}</span>
                  </div>
                </div>

                {/* Download invoice */}
                <button
                  onClick={handleDownloadInvoice}
                  disabled={downloading}
                  className="w-full h-10 rounded-xl border border-electric/30 text-electric hover:bg-electric/10 transition-colors text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {downloading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-electric/30 border-t-electric animate-spin" />
                  ) : (
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  Download GST Invoice PDF
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
