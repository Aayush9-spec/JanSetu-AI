import React, { useMemo, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { useAppData } from '../state/AppDataContext';

export const ImpactPage: React.FC = () => {
  const { impacts } = useAppData();
  const [state, setState] = useState('all');
  const [category, setCategory] = useState('all');
  const metrics = useMemo(() => impacts.filter(item =>
    (state === 'all' || item.state === state) &&
    (category === 'all' || item.category === category)
  ), [impacts, state, category]);
  return (
    <div className="p-6 space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#242c36]">
        <div>
          <h1 className="text-xl font-mono font-bold text-[#e6edf3] tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#4faf9a]" />
            <span>Infrastructure Impact Examples</span>
          </h1>
          <p className="text-xs text-[#8b949e] font-mono mt-1">
            Illustrative before/after metrics in the local sample dataset; no independent outcome verification is provided.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
          LOCAL METRICS · NOT INDEPENDENTLY VERIFIED
        </span>
      </div>
      <div className="flex flex-wrap gap-3">
        <label className="text-xs text-[#8b949e]">State<select aria-label="Filter impact state" value={state} onChange={event => setState(event.target.value)} className="ml-2 bg-[#11161d] border border-[#242c36] text-[#e6edf3] rounded px-2 py-1.5"><option value="all">All states</option>{[...new Set(impacts.map(item => item.state))].sort().map(item => <option key={item}>{item}</option>)}</select></label>
        <label className="text-xs text-[#8b949e]">Category<select aria-label="Filter impact category" value={category} onChange={event => setCategory(event.target.value)} className="ml-2 bg-[#11161d] border border-[#242c36] text-[#e6edf3] rounded px-2 py-1.5"><option value="all">All categories</option>{[...new Set(impacts.map(item => item.category))].sort().map(item => <option key={item}>{item}</option>)}</select></label>
        <span className="self-center text-xs text-[#8b949e]">{metrics.length} sample records</span>
      </div>

      {/* Impact Metric Cards Grid */}
      <div className="space-y-6">
        {metrics.map((imp) => (
          <div
            key={imp.id}
            className="p-5 rounded bg-[#11161d] border border-[#242c36] space-y-5 shadow-xs"
          >
            {/* Metric Title & Location */}
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#242c36] pb-3">
              <div>
                <div className="text-[10px] font-mono text-[#5b9bd5] uppercase font-bold">{imp.category} SECTOR • {imp.state}</div>
                <h3 className="text-base font-bold text-[#e6edf3]">
                  {imp.projectTitle} ({imp.district})
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {imp.complaintReductionPercent >= 0 ? '-' : '+'}{Math.abs(imp.complaintReductionPercent)}% {imp.complaintReductionPercent >= 0 ? 'Grievance Reduction' : 'Grievance Increase'}
              </span>
            </div>

            {/* Before vs Intervention vs After Flow */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              {/* BEFORE */}
              <div className="p-4 rounded bg-[#0b0e12] border border-rose-500/30 space-y-2">
                <div className="text-[10px] text-rose-400 uppercase font-bold flex items-center justify-between">
                  <span>BEFORE INTERVENTION</span>
                  <span>DEMO BEFORE</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[#8b949e]">
                    <span>Infrastructure Access:</span>
                    <strong className="text-rose-400">{imp.beforeAccessPercent}%</strong>
                  </div>
                  <div className="flex justify-between text-[#8b949e]">
                    <span>Annual Grievances:</span>
                    <strong className="text-[#e6edf3]">{imp.beforeRequestsCount.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {/* INTERVENTION */}
              <div className="p-4 rounded bg-[#0b0e12] border border-[#5b9bd5]/40 space-y-2 flex flex-col justify-center text-center">
                <div className="text-[10px] text-[#5b9bd5] uppercase font-bold">
                  ILLUSTRATIVE SCENARIO
                </div>
                <div className="text-xs text-[#e6edf3] font-sans font-medium">
                  Example planning intervention
                </div>
                <div className="text-[10px] text-[#6e7681]">
                  Beneficiaries: <strong className="text-[#4faf9a]">{imp.citizensBenefitedCount.toLocaleString()}</strong>
                </div>
              </div>

              {/* AFTER */}
              <div className="p-4 rounded bg-[#0b0e12] border border-emerald-500/30 space-y-2">
                <div className="text-[10px] text-emerald-400 uppercase font-bold flex items-center justify-between">
                  <span>EXAMPLE AFTER</span>
                  <span>DEMO AFTER</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[#8b949e]">
                    <span>Infrastructure Access:</span>
                    <strong className="text-emerald-400 font-bold">{imp.afterAccessPercent}% (+{imp.afterAccessPercent - imp.beforeAccessPercent}%)</strong>
                  </div>
                  <div className="flex justify-between text-[#8b949e]">
                    <span>Residual Grievances:</span>
                    <strong className="text-emerald-400 font-bold">{imp.afterRequestsCount.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* SDG Alignment Tags */}
            <div className="pt-2 border-t border-[#242c36] flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono text-[#6e7681] uppercase">UN SDG Alignment:</span>
              {imp.sdgGoals.map((sdg, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-900/30 text-sky-300 border border-sky-500/30">
                  {sdg}
                </span>
              ))}
              {!metrics.length && <p className="p-8 text-center text-sm text-[#8b949e]">No impact records match these filters.</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
