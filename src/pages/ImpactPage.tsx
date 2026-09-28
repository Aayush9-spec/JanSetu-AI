import React from 'react';
import { MOCK_IMPACT_METRICS } from '../data/mockData';
import { TrendingUp, CheckCircle, ArrowDown, Award, Sparkles } from 'lucide-react';

export const ImpactPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#242c36]">
        <div>
          <h1 className="text-xl font-mono font-bold text-[#e6edf3] tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#4faf9a]" />
            <span>Digital Public Infrastructure (DPI) Impact Measurement</span>
          </h1>
          <p className="text-xs text-[#8b949e] font-mono mt-1">
            Empirical outcome evaluation: Measuring grievance reduction, accessibility gain & SDG alignment post-project execution
          </p>
        </div>

        <span className="px-3 py-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
          ✓ DPI OUTCOME VERIFIED
        </span>
      </div>

      {/* Impact Metric Cards Grid */}
      <div className="space-y-6">
        {MOCK_IMPACT_METRICS.map((imp) => (
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
                -{imp.complaintReductionPercent}% Grievance Reduction
              </span>
            </div>

            {/* Before vs Intervention vs After Flow */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              {/* BEFORE */}
              <div className="p-4 rounded bg-[#0b0e12] border border-rose-500/30 space-y-2">
                <div className="text-[10px] text-rose-400 uppercase font-bold flex items-center justify-between">
                  <span>BEFORE INTERVENTION</span>
                  <span>PRE-DPI</span>
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
                  JANSETU AI ALLOCATION
                </div>
                <div className="text-xs text-[#e6edf3] font-sans font-medium">
                  Evidence-Based Priority Execution
                </div>
                <div className="text-[10px] text-[#6e7681]">
                  Beneficiaries: <strong className="text-[#4faf9a]">{imp.citizensBenefitedCount.toLocaleString()}</strong>
                </div>
              </div>

              {/* AFTER */}
              <div className="p-4 rounded bg-[#0b0e12] border border-emerald-500/30 space-y-2">
                <div className="text-[10px] text-emerald-400 uppercase font-bold flex items-center justify-between">
                  <span>AFTER IMPACT MEASURED</span>
                  <span>POST-DPI</span>
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
