import React from 'react';
import { MOCK_INFRASTRUCTURE_GAPS } from '../data/mockData';
import { Layers, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

export const GapsPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#242c36]">
        <div>
          <h1 className="text-xl font-mono font-bold text-[#e6edf3] tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-rose-400" />
            <span>Infrastructure Gap Analytical Matrix</span>
          </h1>
          <p className="text-xs text-[#8b949e] font-mono mt-1">
            Citizen Demand ↓ Existing Infrastructure ↓ Coverage Deficit % ↓ Population Impact ↓ Investment Deficit (Cr)
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-[#8b949e]">
          <span className="px-2.5 py-1 rounded bg-[#11161d] border border-[#242c36]">
            Total Deficit Analyzed: <strong className="text-rose-400">18,492 Districts</strong>
          </span>
        </div>
      </div>

      {/* Main Analytical Table */}
      <div className="bg-[#11161d] border border-[#242c36] rounded overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-[#0c1015] border-b border-[#242c36] text-[10px] text-[#8b949e] uppercase tracking-wider">
                <th className="p-3.5">District & State</th>
                <th className="p-3.5">Sector</th>
                <th className="p-3.5">Citizen Demand</th>
                <th className="p-3.5">Existing Coverage</th>
                <th className="p-3.5">National Benchmark</th>
                <th className="p-3.5">Coverage Gap %</th>
                <th className="p-3.5">Impacted Citizens</th>
                <th className="p-3.5">Est. Budget Gap (Cr)</th>
                <th className="p-3.5 text-right">Deficit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b222c]">
              {MOCK_INFRASTRUCTURE_GAPS.map((gap) => (
                <tr key={gap.id} className="hover:bg-[#151b23] transition-colors">
                  <td className="p-3.5 font-bold text-[#e6edf3]">
                    {gap.district}, {gap.state}
                  </td>
                  <td className="p-3.5 text-[#5b9bd5] uppercase font-semibold">
                    {gap.category}
                  </td>
                  <td className="p-3.5 text-amber-400 font-bold">
                    {gap.citizenDemandCount.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-[#e6edf3]">
                    {gap.existingCoveragePercent}%
                  </td>
                  <td className="p-3.5 text-[#8b949e]">
                    {gap.nationalAvgCoveragePercent}%
                  </td>
                  <td className="p-3.5 text-rose-400 font-bold">
                    -{gap.coverageGapPercent}%
                  </td>
                  <td className="p-3.5 text-[#4faf9a] font-bold">
                    {gap.impactedPopulation.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-[#e6edf3] font-bold">
                    ₹{gap.investmentGapCr} Cr
                  </td>
                  <td className="p-3.5 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                      ● {gap.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
