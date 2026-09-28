import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtext?: string;
  icon?: LucideIcon;
  accentColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'positive',
  subtext,
  icon: Icon,
  accentColor = '#5b9bd5'
}) => {
  return (
    <div className="p-4 rounded bg-[#11161d] border border-[#242c36] hover:border-[#303a46] transition-all relative overflow-hidden group shadow-xs">
      {/* Top Accent Line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 opacity-80"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex items-start justify-between mb-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#8b949e] font-medium">
          {title}
        </span>
        {Icon && (
          <div className="p-1.5 rounded bg-[#151b23] border border-[#242c36] text-[#8b949e] group-hover:text-[#e6edf3] transition-colors">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-mono font-bold text-[#e6edf3] tracking-tight">
          {value}
        </div>
        {change && (
          <span
            className={`text-xs font-mono font-medium px-1.5 py-0.5 rounded ${
              changeType === 'positive'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : changeType === 'negative'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
            }`}
          >
            {change}
          </span>
        )}
      </div>

      {subtext && (
        <div className="mt-2 pt-2 border-t border-[#1b222c] text-[11px] text-[#6e7681] flex items-center justify-between font-mono">
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
};
