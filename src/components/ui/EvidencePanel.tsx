import React from 'react';
import { PriorityScoreDetails } from '../../types';
import { ShieldCheck, Info } from 'lucide-react';

interface EvidencePanelProps {
  scoreDetails: PriorityScoreDetails;
  rationale: string;
  evidence: {
    citizenRequestsCount: number;
    affectedPopulation: number;
    existingCoveragePercent: number;
    noPlannedProject: boolean;
    seasonalDisruptionRisk: string;
  };
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({ scoreDetails, rationale, evidence }) => {
  const breakdownItems = [
    { label: 'Citizen Demand Volume', data: scoreDetails.breakdown.citizenDemand, color: '#e2982b' },
    { label: 'Population Impact', data: scoreDetails.breakdown.populationImpact, color: '#5b9bd5' },
    { label: 'Infrastructure Coverage Gap', data: scoreDetails.breakdown.infraGap, color: '#e05252' },
    { label: 'Urgency & Health Risk', data: scoreDetails.breakdown.urgency, color: '#f59e0b' },
    { label: 'Equity & Underserved Score', data: scoreDetails.breakdown.equity, color: '#4faf9a' },
    { label: 'Implementation Feasibility', data: scoreDetails.breakdown.feasibility, color: '#818cf8' },
  ];

  return (
    <div className="p-4 rounded bg-[#11161d] border border-[#242c36] space-y-4 text-xs select-none">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#242c36] pb-2">
        <div className="flex items-center gap-2 font-mono font-bold text-[#e6edf3]">
          <ShieldCheck className="w-4 h-4 text-[#4faf9a]" />
          <span>Transparent AI Priority Scoring Evidence</span>
        </div>
        <span className="font-mono text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
          TOTAL SCORE: {scoreDetails.totalScore}/100
        </span>
      </div>

      {/* Rationale Text */}
      <p className="text-[#8b949e] leading-relaxed font-sans bg-[#0b0e12] p-3 rounded border border-[#1b222c]">
        <strong className="text-[#e6edf3]">AI Intelligence Rationale:</strong> {rationale}
      </p>

      {/* Score Breakdown Weights Table */}
      <div className="space-y-2">
        <div className="text-[10px] font-mono text-[#6e7681] uppercase tracking-wider flex justify-between">
          <span>Priority Dimension</span>
          <span>Raw / Weight / Weighted Contribution</span>
        </div>

        {breakdownItems.map((item, idx) => (
          <div key={idx} className="p-2 rounded bg-[#0b0e12] border border-[#1b222c] space-y-1">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-[#e6edf3] font-medium">{item.label}</span>
              <span className="text-[#8b949e]">
                {item.data.score}/100 × {item.data.weight}% = <strong className="text-[#e6edf3]">{item.data.weighted} pts</strong>
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-[#151b23] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${item.data.score}%`, backgroundColor: item.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Ground Truth Evidence Cross-Check */}
      <div className="pt-2 border-t border-[#242c36] grid grid-cols-2 gap-2 text-xs font-mono text-[#8b949e]">
        <div className="p-2 rounded bg-[#151b23]">
          Grievance Requests: <strong className="text-[#e6edf3]">{evidence.citizenRequestsCount.toLocaleString()}</strong>
        </div>
        <div className="p-2 rounded bg-[#151b23]">
          Affected Citizens: <strong className="text-[#e6edf3]">{evidence.affectedPopulation.toLocaleString()}</strong>
        </div>
        <div className="p-2 rounded bg-[#151b23]">
          Current Coverage: <strong className="text-amber-400">{evidence.existingCoveragePercent}%</strong>
        </div>
        <div className="p-2 rounded bg-[#151b23]">
          Current Plan Status: <strong className="text-[#4faf9a]">{evidence.noPlannedProject ? 'No Allocation' : 'Active Plan'}</strong>
        </div>
      </div>
    </div>
  );
};
