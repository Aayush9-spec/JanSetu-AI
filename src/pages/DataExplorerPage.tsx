import React from 'react';
import { Database, ExternalLink } from 'lucide-react';
import { useAppData } from '../state/AppDataContext';

const referenceSources = [
  { name: 'Census of India', source: 'Office of the Registrar General & Census Commissioner, India', url: 'https://censusindia.gov.in/' },
  { name: 'PMGSY rural roads', source: 'Ministry of Rural Development', url: 'https://pmgsy.nic.in/' },
  { name: 'Jal Jeevan Mission', source: 'Ministry of Jal Shakti', url: 'https://jaljeevanmission.gov.in/' },
  { name: 'National Health Mission', source: 'Ministry of Health and Family Welfare', url: 'https://nhm.gov.in/' },
  { name: 'SDG India Index', source: 'NITI Aayog', url: 'https://www.niti.gov.in/' },
];

export const DataExplorerPage: React.FC = () => {
  const { dataMode, demoFallback, complaints, projects } = useAppData();
  const connected = dataMode !== 'mock' && !demoFallback;
  return (
    <div className="p-6 space-y-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#242c36]">
        <div>
          <h1 className="text-xl font-mono font-bold text-[#e6edf3] tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-400" /><span>Data Explorer</span>
          </h1>
          <p className="text-xs text-[#8b949e] font-mono mt-1">Inspect the active application dataset and reference sources.</p>
        </div>
        <span className={`px-2 py-1 rounded border text-[10px] font-mono ${connected ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-amber-500/30 text-amber-300 bg-amber-500/10'}`}>
          {connected ? 'CONFIGURED DATA API RESPONDED' : 'LOCAL / DEMO DATA'}
        </span>
      </div>
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded bg-[#11161d] border border-[#242c36]">
          <p className="text-xs text-[#8b949e]">Requests loaded in this browser</p>
          <p className="mt-2 text-2xl font-mono font-bold text-[#e6edf3]">{complaints.length.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded bg-[#11161d] border border-[#242c36]">
          <p className="text-xs text-[#8b949e]">Projects loaded in this browser</p>
          <p className="mt-2 text-2xl font-mono font-bold text-[#e6edf3]">{projects.length.toLocaleString()}</p>
        </div>
      </section>
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-[#e6edf3]">Reference sources</h2>
          <p className="mt-1 text-xs text-[#8b949e]">These links are informational only. JanSetu does not currently synchronize or certify datasets from these organizations.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {referenceSources.map(item => (
            <article key={item.name} className="p-4 rounded bg-[#11161d] border border-[#242c36]">
              <h3 className="text-sm font-semibold text-[#e6edf3]">{item.name}</h3>
              <p className="mt-1 text-xs text-[#8b949e]">{item.source}</p>
              <a className="mt-3 inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300" href={item.url} target="_blank" rel="noreferrer">
                Visit source <ExternalLink className="w-3 h-3" />
              </a>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
