import React, { useState } from 'react';
import { ProjectRecommendation } from '../types';
import { PriorityScoreBadge } from '../components/ui/StatusBadge';
import { Flame, ArrowRight } from 'lucide-react';
import { useAppData } from '../state/AppDataContext';

interface HotspotsPageProps {
  onSelectRecommendation: (rec: ProjectRecommendation) => void;
}

export const HotspotsPage: React.FC<HotspotsPageProps> = ({ onSelectRecommendation }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { hotspots, recommendations } = useAppData();
  const filtered = hotspots.filter(h =>
    selectedCategory === 'all' || h.category === selectedCategory
  );

  return (
    <div className="p-6 space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#242c36]">
        <div>
          <h1 className="text-xl font-mono font-bold text-[#e6edf3] tracking-tight flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <span>Demand Hotspots & Spatial Density Matrix</span>
          </h1>
          <p className="text-xs text-[#8b949e] font-mono mt-1">
            Sample clusters from the bundled dataset. Demographics and infrastructure scores are not externally verified.
          </p>
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-[#11161d] border border-[#242c36] text-[#e6edf3] text-xs font-mono rounded px-3 py-1.5 outline-none"
        >
          <option value="all">All Sectors</option>
          <option value="road">Roads & Bridges</option>
          <option value="water">Piped Water</option>
          <option value="health">Healthcare PHCs</option>
          <option value="electricity">Power Grid</option>
          <option value="education">School Education</option>
        </select>
      </div>

      {/* Grid of Ranked Hotspots */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((hotspot) => (
          <div
            key={hotspot.id}
            className="p-5 rounded bg-[#11161d] border border-[#242c36] hover:border-[#5b9bd5]/60 transition-all space-y-4 shadow-xs flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-[#181f28] border border-[#242c36] font-mono text-xs font-bold text-[#5b9bd5] flex items-center justify-center">
                    #{hotspot.rank}
                  </span>
                  <div>
                    <span className="text-[10px] font-mono text-[#5b9bd5] uppercase font-bold">{hotspot.category}</span>
                    <h3 className="text-sm font-bold text-[#e6edf3] group-hover:text-sky-400 transition-colors">
                      {hotspot.district}, {hotspot.state}
                    </h3>
                  </div>
                </div>
                <PriorityScoreBadge score={hotspot.priorityScore} />
              </div>

              <h4 className="text-xs font-semibold text-[#e6edf3] font-sans">
                {hotspot.title}
              </h4>

              <p className="text-xs text-[#8b949e] font-sans leading-relaxed">
                {hotspot.aiSummary}
              </p>

              {/* Top Issues List */}
              <div className="space-y-1 pt-2 border-t border-[#1b222c]">
                <span className="text-[10px] font-mono text-[#6e7681] uppercase">Key Grievance Drivers</span>
                <div className="flex flex-wrap gap-1">
                  {hotspot.topIssues.map((iss, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0b0e12] text-amber-300 border border-[#1b222c]">
                      • {iss}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Metrics Footer */}
            <div className="pt-3 border-t border-[#242c36] space-y-3">
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2 rounded bg-[#0b0e12]">
                  <div className="text-[#6e7681]">CITIZEN REQUESTS</div>
                  <div className="text-amber-400 font-bold">{hotspot.complaintCount.toLocaleString()}</div>
                </div>
                <div className="p-2 rounded bg-[#0b0e12]">
                  <div className="text-[#6e7681]">POP. AFFECTED</div>
                  <div className="text-[#4faf9a] font-bold">{hotspot.totalAffectedPopulation.toLocaleString()}</div>
                </div>
              </div>

              <button
                onClick={() => {
                  const recommendation = recommendations.find(item => item.clusterId === hotspot.id);
                  if (recommendation) onSelectRecommendation(recommendation);
                }}
                disabled={!recommendations.some(item => item.clusterId === hotspot.id)}
                className="w-full py-2 rounded bg-[#181f28] hover:bg-[#242c36] text-sky-400 border border-sky-500/30 text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>View planning recommendation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        {!filtered.length && <p className="col-span-full p-8 text-center text-xs text-[#8b949e]">No hotspots match this sector.</p>}
      </div>
    </div>
  );
};
