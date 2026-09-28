import React, { useMemo, useState } from 'react';
import { MetricCard } from '../components/ui/MetricCard';
import { IndiaMap } from '../components/ui/IndiaMap';
import { SeverityBadge, CategoryBadge, PriorityScoreBadge } from '../components/ui/StatusBadge';
import { useAppData } from '../state/AppDataContext';
import { Complaint, DemandCluster, ProjectRecommendation } from '../types';
import {
  Users,
  Layers,
  Flame,
  Sparkles,
  FolderKanban,
  ArrowUpRight,
  Filter,
  Mic,
  ChevronRight,
  TrendingUp,
  MapPin
} from 'lucide-react';

interface OverviewPageProps {
  onSelectComplaint: (complaint: Complaint) => void;
  onOpenVoiceModal: () => void;
  onSelectRecommendation: (rec: ProjectRecommendation) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  onSelectComplaint,
  onOpenVoiceModal,
  onSelectRecommendation
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const { complaints, hotspots, recommendations, projects, gaps } = useAppData();

  const filteredHotspots = hotspots.filter(h => {
    if (categoryFilter !== 'all' && h.category !== categoryFilter) return false;
    if (stateFilter !== 'all' && h.state !== stateFilter) return false;
    return true;
  });
  const filteredComplaints = useMemo(() => complaints.filter(item =>
    (categoryFilter === 'all' || item.category === categoryFilter) &&
    (stateFilter === 'all' || item.state === stateFilter)
  ), [complaints, categoryFilter, stateFilter]);
  const affected = filteredComplaints.reduce((total, item) => total + item.estimatedAffected, 0);
  const highPriority = filteredHotspots.filter(item => item.priorityScore >= 80).length;
  const filteredRecommendations = recommendations.filter(item =>
    (categoryFilter === 'all' || item.category === categoryFilter) &&
    (stateFilter === 'all' || item.state === stateFilter)
  );

  return (
    <div className="p-6 space-y-6 select-none font-sans">
      {/* Top Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#242c36]">
        <div>
          <h1 className="text-xl font-mono font-bold text-[#e6edf3] tracking-tight flex items-center gap-2">
            <span>National Infrastructure Intelligence Dashboard</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-sky-900/30 text-sky-400 border border-sky-500/30">
              CABINET SECRETARIAT
            </span>
          </h1>
          <p className="text-xs text-[#8b949e] font-mono mt-1">
            Aggregating Multilingual Citizen Voice → Gemini AI Intelligence → Evidence-Based Infrastructure Allocations
          </p>
        </div>

        {/* Global Filter Controls */}
        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#11161d] border border-[#242c36] text-[#e6edf3] text-xs font-mono rounded px-3 py-1.5 outline-none"
          >
            <option value="all">All Infrastructure Sectors</option>
            <option value="road">Roads & Bridges</option>
            <option value="water">Piped Water</option>
            <option value="health">Healthcare PHCs</option>
            <option value="electricity">Power Grid</option>
            <option value="education">School Education</option>
          </select>

          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="bg-[#11161d] border border-[#242c36] text-[#e6edf3] text-xs font-mono rounded px-3 py-1.5 outline-none"
          >
            <option value="all">All States (India)</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Bihar">Bihar</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            {['Gujarat', 'Karnataka', 'Tamil Nadu', 'West Bengal'].filter(state => !['Uttar Pradesh', 'Bihar', 'Maharashtra', 'Rajasthan', 'Madhya Pradesh'].includes(state)).map(state => <option key={state} value={state}>{state}</option>)}
          </select>

          <button
            onClick={onOpenVoiceModal}
            className="px-3 py-1.5 rounded bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/40 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5 animate-pulse" />
            <span>Test Voice Intake</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Section (Reference Site Matching Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="CITIZEN REQUESTS"
          value={filteredComplaints.length.toLocaleString()}
          change="Filtered"
          changeType="neutral"
          subtext="Citizen reports in the selected region"
          icon={Users}
          accentColor="#5b9bd5"
        />
        <MetricCard
          title="ACTIVE INFRA GAPS"
          value={gaps.filter(gap => (categoryFilter === 'all' || gap.category === categoryFilter) && (stateFilter === 'all' || gap.state === stateFilter)).length.toLocaleString()}
          change="Records"
          changeType="negative"
          subtext="Compared against NITI Aayog index"
          icon={Layers}
          accentColor="#e05252"
        />
        <MetricCard
          title="HIGH PRIORITY ZONES"
          value={highPriority.toLocaleString()}
          change="Score ≥ 80"
          changeType="negative"
          subtext="Concentrated demand clusters"
          icon={Flame}
          accentColor="#e2982b"
        />
        <MetricCard
          title="CITIZENS IMPACTED"
          value={affected.toLocaleString()}
          change="Estimated"
          changeType="positive"
          subtext="Potential development beneficiaries"
          icon={TrendingUp}
          accentColor="#4faf9a"
        />
        <MetricCard
          title="PROJECTS RECOMMENDED"
          value={filteredRecommendations.length.toLocaleString()}
          change={`₹${filteredRecommendations.reduce((sum, item) => sum + item.estimatedBudgetCr, 0).toFixed(1)} Cr`}
          changeType="positive"
          subtext="Gemini evidence-based allocations"
          icon={Sparkles}
          accentColor="#818cf8"
        />
      </div>

      {/* Main Centerpiece: Interactive GIS India Map & Demand Hotspots Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: GIS India Map */}
        <div className="lg:col-span-2">
          <IndiaMap
            selectedCategory={categoryFilter}
            selectedState={stateFilter}
            onStateChange={setStateFilter}
            onSelectCluster={(cluster) => {
              const rec = recommendations.find(r => r.clusterId === cluster.id);
              if (rec) onSelectRecommendation(rec);
            }}
          />
        </div>

        {/* Right 1 Col: Top Ranked Demand Hotspots List */}
        <div className="bg-[#11161d] border border-[#242c36] rounded p-4 flex flex-col justify-between h-[520px] shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#242c36]">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#e6edf3]">
                Top Priority Demand Hotspots
              </span>
              <span className="text-[10px] font-mono text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                RANKED BY AI
              </span>
            </div>

            <div className="mt-3 space-y-2.5 overflow-y-auto max-h-[420px] pr-1">
              {filteredHotspots.map((hotspot) => (
                <div
                  key={hotspot.id}
                  className="p-3 rounded bg-[#0b0e12] border border-[#1b222c] hover:border-[#5b9bd5]/50 transition-all cursor-pointer group"
                  onClick={() => {
                    const rec = recommendations.find(item => item.clusterId === hotspot.id);
                    if (rec) onSelectRecommendation(rec);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-[#181f28] border border-[#242c36] font-mono text-[10px] font-bold text-[#5b9bd5] flex items-center justify-center">
                        #{hotspot.rank}
                      </span>
                      <h4 className="text-xs font-semibold text-[#e6edf3] group-hover:text-[#5b9bd5] transition-colors">
                        {hotspot.district}, {hotspot.state}
                      </h4>
                    </div>
                    <PriorityScoreBadge score={hotspot.priorityScore} />
                  </div>

                  <p className="text-[11px] text-[#8b949e] font-sans mt-1.5 line-clamp-2 leading-tight">
                    {hotspot.title}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-[#151b23] flex items-center justify-between text-[10px] font-mono text-[#6e7681]">
                    <span>{hotspot.complaintCount.toLocaleString()} Requests</span>
                    <span className="text-[#4faf9a] font-semibold">{hotspot.totalAffectedPopulation.toLocaleString()} Citizens</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: AI Project Recommendations & Live Citizen Grievance Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: AI Development Recommendations */}
        <div className="bg-[#11161d] border border-[#242c36] rounded p-4 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#242c36]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#e6edf3]">
                Featured AI Project Recommendations
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#8b949e]">GEMINI EVIDENCE ENGINE</span>
          </div>

          <div className="space-y-3">
            {filteredRecommendations.map((rec) => (
              <div
                key={rec.id}
                onClick={() => onSelectRecommendation(rec)}
                className="p-3.5 rounded bg-[#0b0e12] border border-[#1b222c] hover:border-sky-500/50 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-[#5b9bd5] uppercase font-semibold">{rec.category} • {rec.state}</span>
                    <h4 className="text-xs font-bold text-[#e6edf3] group-hover:text-sky-400 transition-colors">
                      {rec.title}
                    </h4>
                  </div>
                  <PriorityScoreBadge score={rec.priorityScore} />
                </div>

                <p className="text-[11px] text-[#8b949e] font-sans leading-relaxed line-clamp-2">
                  {rec.aiRationale}
                </p>

                <div className="pt-2 border-t border-[#151b23] flex items-center justify-between text-[10px] font-mono text-[#6e7681]">
                  <span>Budget: <strong className="text-[#e6edf3]">₹{rec.estimatedBudgetCr} Cr</strong></span>
                  <span>Impact: <strong className="text-[#4faf9a]">{rec.estimatedBeneficiaries.toLocaleString()} citizens</strong></span>
                  <span className="text-sky-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    View Evidence →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Live Citizen Voice Grievance Stream */}
        <div className="bg-[#11161d] border border-[#242c36] rounded p-4 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#242c36]">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#e6edf3]">
                Live Multilingual Grievance Stream
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#48bb78] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#48bb78] animate-pulse" />
              REAL-TIME INTAKE
            </span>
          </div>

          <div className="space-y-3">
            {filteredComplaints.slice(0, 5).map((cmp) => (
              <div
                key={cmp.id}
                onClick={() => onSelectComplaint(cmp)}
                className="p-3.5 rounded bg-[#0b0e12] border border-[#1b222c] hover:border-amber-500/50 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-[#5b9bd5] font-semibold">{cmp.id}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#151b23] text-[#8b949e]">
                      {cmp.rawLanguage.toUpperCase()}
                    </span>
                    <CategoryBadge category={cmp.category} />
                  </div>
                  <SeverityBadge level={cmp.severity} />
                </div>

                <p className="text-[11px] text-[#e6edf3] font-sans italic line-clamp-2">
                  "{cmp.rawText}"
                </p>

                <div className="pt-2 border-t border-[#151b23] flex items-center justify-between text-[10px] font-mono text-[#6e7681]">
                  <span>{cmp.village}, {cmp.district}</span>
                  <span className="text-amber-400">{cmp.similarRequestsCount.toLocaleString()} similar requests</span>
                </div>
                {!filteredComplaints.length && <p className="text-xs text-[#8b949e] py-4">No requests match these dashboard filters.</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
