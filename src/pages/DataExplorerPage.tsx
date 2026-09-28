import React from 'react';
import { Database, FileSpreadsheet, ExternalLink, CheckCircle } from 'lucide-react';

export const DataExplorerPage: React.FC = () => {
  const datasets = [
    { name: 'Census 2011 / Projected 2026 Demographics', source: 'data.gov.in', records: '740 Districts', status: 'SYNCHRONIZED' },
    { name: 'PMGSY Rural Road Connectivity Master Index', source: 'Ministry of Rural Development', records: '178,000 Villages', status: 'SYNCHRONIZED' },
    { name: 'Jal Jeevan Mission Piped Water Coverage', source: 'Ministry of Jal Shakti', records: '19.4 Crore Homes', status: 'SYNCHRONIZED' },
    { name: 'National Health Mission PHC Directory', source: 'MoHFW', records: '31,000 Facilities', status: 'SYNCHRONIZED' },
    { name: 'NITI Aayog SDG India Index 2025-26', source: 'NITI Aayog', records: '28 States / 8 UTs', status: 'SYNCHRONIZED' },
  ];

  return (
    <div className="p-6 space-y-6 select-none font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#242c36]">
        <div>
          <h1 className="text-xl font-mono font-bold text-[#e6edf3] tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-400" />
            <span>National Infrastructure Data Explorer</span>
          </h1>
          <p className="text-xs text-[#8b949e] font-mono mt-1">
            Cross-referencing open government datasets with citizen demand streams for evidence synthesis
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {datasets.map((ds, idx) => (
          <div key={idx} className="p-4 rounded bg-[#11161d] border border-[#242c36] space-y-3 font-mono text-xs">
            <div className="flex items-start justify-between">
              <span className="font-bold text-[#e6edf3]">{ds.name}</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {ds.status}
              </span>
            </div>
            <div className="text-[11px] text-[#8b949e]">
              Source: <strong className="text-[#5b9bd5]">{ds.source}</strong> • Scope: {ds.records}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
