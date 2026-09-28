import React from 'react';
import { SeverityLevel, UrgencyLevel, CategoryType } from '../../types';

interface SeverityBadgeProps {
  level: SeverityLevel;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ level }) => {
  const styles = {
    critical: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    high: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    medium: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold border ${styles[level]}`}>
      ● {level}
    </span>
  );
};

interface CategoryBadgeProps {
  category: CategoryType;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  const colors: Record<CategoryType, string> = {
    road: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    water: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    electricity: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    health: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    education: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    sanitation: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    telecom: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    agriculture: 'bg-lime-500/10 text-lime-400 border-lime-500/30',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-medium border ${colors[category] || 'bg-slate-500/10 text-slate-400 border-slate-500/30'}`}>
      {category}
    </span>
  );
};

interface PriorityScoreBadgeProps {
  score: number;
}

export const PriorityScoreBadge: React.FC<PriorityScoreBadgeProps> = ({ score }) => {
  let colorClass = 'bg-rose-500/10 text-rose-400 border-rose-500/40';
  if (score < 75) colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/40';
  if (score < 50) colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40';

  return (
    <div className={`px-2.5 py-1 rounded border font-mono font-bold text-xs inline-flex items-center gap-1.5 ${colorClass}`}>
      <span className="text-[10px] opacity-75 font-normal">PRIORITY</span>
      <span>{score}/100</span>
    </div>
  );
};
