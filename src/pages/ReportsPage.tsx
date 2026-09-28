import React from 'react';
import { FileSpreadsheet, Download, Sparkles, CheckCircle } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6 select-none font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#242c36]">
        <div>
          <h1 className="text-xl font-mono font-bold text-[#e6edf3] tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#818cf8]" />
            <span>AI Executive Intelligence Reports</span>
          </h1>
          <p className="text-xs text-[#8b949e] font-mono mt-1">
            Synthesized cabinet briefings for Ministry Officials & District Magistrates
          </p>
        </div>

        <button className="px-3.5 py-1.5 rounded bg-[#5b9bd5] hover:bg-[#4a88c7] text-[#0b0e12] font-mono font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer">
          <Sparkles className="w-4 h-4" />
          <span>Generate New Cabinet Briefing</span>
        </button>
      </div>

      <div className="p-5 rounded bg-[#11161d] border border-[#242c36] space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[#242c36] pb-3">
          <span className="font-bold text-[#e6edf3]">National Infrastructure Demand & Deficit Executive Briefing (Q3 2026)</span>
          <button className="px-3 py-1 rounded bg-[#181f28] hover:bg-[#242c36] text-sky-400 border border-sky-500/30 text-xs flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>

        <p className="text-[#8b949e] font-sans leading-relaxed text-xs">
          Executive Summary: Analysis of 2.84 million citizen grievances across 28 states reveals critical demand clustering in rural transportation (42% share) and piped water supply (28% share). Top priority interventions identified in Lucknow (UP), Gaya (Bihar), Nashik (Maharashtra), and Jodhpur (Rajasthan). Total recommended allocation: ₹4,280 Crore.
        </p>
      </div>
    </div>
  );
};
