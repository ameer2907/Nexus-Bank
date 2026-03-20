import { motion } from 'framer-motion';

export default function StatsCard({ icon, label, value, sub, color = 'electric', index = 0 }) {
  const colorMap = {
    electric: { bg: 'bg-electric/10', border: 'border-electric/20', text: 'text-electric', iconBg: 'bg-electric/20' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', iconBg: 'bg-emerald-500/20' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400', iconBg: 'bg-amber-500/20' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400', iconBg: 'bg-cyan-500/20' },
  };

  const c = colorMap[color] || colorMap.electric;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className={`glass-bright rounded-2xl p-5 border ${c.border} ${c.bg}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center`}>
          <span className={c.text}>{icon}</span>
        </div>
        <div className={`w-2 h-2 rounded-full ${c.text.replace('text-', 'bg-')} opacity-60`} />
      </div>
      <div className="font-display font-bold text-2xl text-white mb-1 font-mono">{value}</div>
      <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</div>
      {sub && <div className="text-slate-600 text-xs mt-1">{sub}</div>}
    </motion.div>
  );
}
