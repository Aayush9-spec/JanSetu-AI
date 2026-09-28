import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, Layers, Search } from 'lucide-react';
import { useAppData } from '../state/AppDataContext';

export const GapsPage: React.FC = () => {
  const { gaps } = useAppData();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('search') || '');
  const [category, setCategory] = useState('all');
  const [state, setState] = useState('all');
  const visible = useMemo(() => gaps.filter(gap =>
    (category === 'all' || gap.category === category) &&
    (state === 'all' || gap.state === state) &&
    `${gap.district} ${gap.state} ${gap.category} ${gap.status}`.toLowerCase().includes(query.toLowerCase())
  ), [gaps, category, state, query]);
  const states = [...new Set(gaps.map(gap => gap.state))].sort();
  const exportCsv = () => {
    const rows = [['District', 'State', 'Category', 'Demand', 'Existing coverage %', 'Reference coverage %', 'Coverage gap %', 'Estimated impacted population', 'Illustrative investment gap Cr', 'Status'],
      ...visible.map(gap => [gap.district, gap.state, gap.category, gap.citizenDemandCount, gap.existingCoveragePercent, gap.nationalAvgCoveragePercent, gap.coverageGapPercent, gap.impactedPopulation, gap.investmentGapCr, gap.status])];
    const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'jansetu-infrastructure-gaps.csv';
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="p-6 space-y-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#242c36]">
        <div>
          <h1 className="text-xl font-mono font-bold text-[#e6edf3] tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-rose-400" /><span>Infrastructure Gap Matrix</span>
          </h1>
          <p className="text-xs text-[#8b949e] font-mono mt-1">Illustrative gap records from the bundled dataset; independently validate benchmarks and cost estimates.</p>
        </div>
        <button onClick={exportCsv} disabled={!visible.length} className="px-3 py-1.5 border border-[#242c36] rounded text-sky-400 disabled:opacity-50 flex items-center gap-1 text-xs"><Download className="w-3.5 h-3.5" />Export CSV</button>
      </div>
      <section className="flex flex-wrap gap-2" aria-label="Infrastructure gap filters">
        <label className="relative text-xs text-[#8b949e]"><Search className="absolute left-2 top-2 w-3.5 h-3.5" /><input aria-label="Search infrastructure gaps" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search district or sector" className="bg-[#11161d] border border-[#242c36] text-[#e6edf3] rounded pl-7 pr-2 py-1.5" /></label>
        <label className="text-xs text-[#8b949e]">Sector
          <select value={category} onChange={event => setCategory(event.target.value)} className="ml-2 bg-[#11161d] border border-[#242c36] text-[#e6edf3] rounded px-2 py-1.5">
            <option value="all">All sectors</option>{[...new Set(gaps.map(gap => gap.category))].map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="text-xs text-[#8b949e]">State
          <select value={state} onChange={event => setState(event.target.value)} className="ml-2 bg-[#11161d] border border-[#242c36] text-[#e6edf3] rounded px-2 py-1.5">
            <option value="all">All states</option>{states.map(item => <option key={item}>{item}</option>)}
          </select>
        </label>
        <span className="self-center text-xs text-[#8b949e]">{visible.length} illustrative records</span>
      </section>
      <div className="bg-[#11161d] border border-[#242c36] rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead><tr className="bg-[#0c1015] border-b border-[#242c36] text-[10px] text-[#8b949e] uppercase tracking-wider">
              <th className="p-3.5">District & State</th><th className="p-3.5">Sector</th><th className="p-3.5">Demand</th><th className="p-3.5">Coverage</th><th className="p-3.5">Reference</th><th className="p-3.5">Gap %</th><th className="p-3.5">Estimated impacted</th><th className="p-3.5">Illustrative gap (Cr)</th><th className="p-3.5 text-right">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-[#1b222c]">
              {visible.map(gap => <tr key={gap.id} className="hover:bg-[#151b23]">
                <td className="p-3.5 font-bold text-[#e6edf3]">{gap.district}, {gap.state}</td>
                <td className="p-3.5 text-sky-400 uppercase font-semibold">{gap.category}</td>
                <td className="p-3.5 text-amber-400 font-bold">{gap.citizenDemandCount.toLocaleString()}</td>
                <td className="p-3.5 text-[#e6edf3]">{gap.existingCoveragePercent}%</td>
                <td className="p-3.5 text-[#8b949e]">{gap.nationalAvgCoveragePercent}%*</td>
                <td className="p-3.5 text-rose-400 font-bold">-{gap.coverageGapPercent}%</td>
                <td className="p-3.5 text-[#4faf9a]">{gap.impactedPopulation.toLocaleString()}</td>
                <td className="p-3.5 text-[#e6edf3]">₹{gap.investmentGapCr} Cr</td>
                <td className="p-3.5 text-right">{gap.status}</td>
              </tr>)}
              {!visible.length && <tr><td colSpan={9} className="p-8 text-center text-[#8b949e]">No infrastructure gaps match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[11px] text-[#8b949e]">* Reference coverage, affected population, demand, and investment gap are sample data in this demo, not validated government statistics.</p>
    </div>
  );
};
