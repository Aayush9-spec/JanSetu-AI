import React, { useMemo, useState } from 'react';
import { lazy, Suspense } from 'react';
import { MetricCard } from '../components/ui/MetricCard';
import { SeverityBadge, CategoryBadge, PriorityScoreBadge } from '../components/ui/StatusBadge';
import { useAppData } from '../state/AppDataContext';
import { Complaint, ProjectRecommendation } from '../types';
import {
  Users,
  Layers,
  Flame,
  Sparkles,
  Mic,
  TrendingUp
} from 'lucide-react';

const IndiaMap = lazy(() => import('../components/ui/IndiaMap').then(module => ({ default: module.IndiaMap })));

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
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState('all');
  const { complaints, hotspots, recommendations, gaps, dataMode, demoFallback } = useAppData();

  const districts = useMemo(() => [...new Set([
    ...complaints.map(item => item.district),
    ...hotspots.map(item => item.district),
    ...gaps.map(item => item.district),
    ...recommendations.map(item => item.district),
  ].filter(Boolean))].sort(), [complaints, hotspots, gaps, recommendations]);
  const filteredHotspots = useMemo(() => hotspots.filter(h =>
    (categoryFilter === 'all' || h.category === categoryFilter) &&
    (stateFilter === 'all' || h.state === stateFilter) &&
    (districtFilter === 'all' || h.district === districtFilter)
  ), [hotspots, categoryFilter, stateFilter, districtFilter]);
  const filteredGaps = useMemo(() => gaps.filter(gap =>
    (categoryFilter === 'all' || gap.category === categoryFilter) &&
    (stateFilter === 'all' || gap.state === stateFilter) &&
    (districtFilter === 'all' || gap.district === districtFilter)
  ), [gaps, categoryFilter, stateFilter, districtFilter]);
  const filteredComplaints = useMemo(() => complaints.filter(item =>
    (categoryFilter === 'all' || item.category === categoryFilter) &&
    (stateFilter === 'all' || item.state === stateFilter) &&
    (districtFilter === 'all' || item.district === districtFilter) &&
    (dateRange === 'all' || (Date.now() - Date.parse(item.createdAt)) / 86400000 <= Number(dateRange))
  ), [complaints, categoryFilter, stateFilter, districtFilter, dateRange]);
  const affected = filteredComplaints.reduce((total, item) => total + item.estimatedAffected, 0);
  const highPriority = filteredHotspots.filter(item => item.priorityScore >= 80).length;
  const filteredRecommendations = useMemo(() => recommendations.filter(item =>
    (categoryFilter === 'all' || item.category === categoryFilter) &&
    (stateFilter === 'all' || item.state === stateFilter) &&
    (districtFilter === 'all' || item.district === districtFilter)
  ), [recommendations, categoryFilter, stateFilter, districtFilter]);
  const requestCategories = useMemo(() => filteredComplaints.reduce<Record<string, number>>((counts, item) => {
    counts[item.category] = (counts[item.category] || 0) + 1;
    return counts;
  }, {}), [filteredComplaints]);
  const categoryRows = Object.entries(requestCategories).sort((left, right) => right[1] - left[1]);
  const largestCategory = Math.max(1, ...categoryRows.map(([, count]) => count));

  return (
    <div className="p-6 space-y-6 select-none font-sans">
      {/* Top Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#242c36]">
        <div>
          <h1 className="text-xl font-mono font-bold text-[#e6edf3] tracking-tight flex items-center gap-2">
            <span>National Infrastructure Intelligence Dashboard</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-sky-900/30 text-sky-400 border border-sky-500/30">
              {dataMode === 'mock' || demoFallback ? 'DEMO DATASET' : 'CONNECTED DATA'}
            </span>
          </h1>
          <p className="text-xs text-[#8b949e] font-mono mt-1">
            Multilingual request intake and infrastructure planning from records currently loaded in this workspace
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
            onChange={(e) => { setStateFilter(e.target.value); setDistrictFilter('all'); }}
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
          <select aria-label="Filter dashboard district" value={districtFilter} onChange={event => setDistrictFilter(event.target.value)} className="bg-[#11161d] border border-[#242c36] text-[#e6edf3] text-xs font-mono rounded px-3 py-1.5 outline-none">
            <option value="all">All districts</option>{districts.map(district => <option key={district}>{district}</option>)}
          </select>
          <select aria-label="Filter dashboard request date" value={dateRange} onChange={event => setDateRange(event.target.value)} className="bg-[#11161d] border border-[#242c36] text-[#e6edf3] text-xs font-mono rounded px-3 py-1.5 outline-none">
            <option value="all">Any request date</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option>
          </select>

          <button
            onClick={onOpenVoiceModal}
            className="px-3 py-1.5 rounded bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/40 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5 animate-pulse" />
            <span>Submit a request</span>
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
          value={filteredGaps.length.toLocaleString()}
          change="Records"
          changeType="negative"
          subtext="Infrastructure gap records currently loaded"
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
          subtext="Estimated from loaded request records"
          icon={TrendingUp}
          accentColor="#4faf9a"
        />
        <MetricCard
          title="PROJECTS RECOMMENDED"
          value={filteredRecommendations.length.toLocaleString()}
          change={`₹${filteredRecommendations.reduce((sum, item) => sum + item.estimatedBudgetCr, 0).toFixed(1)} Cr`}
          changeType="positive"
          subtext="Loaded recommendations; verify before use"
          icon={Sparkles}
          accentColor="#818cf8"
        />
      </div>

      <section className="p-4 rounded bg-[#11161d] border border-[#242c36]" aria-labelledby="request-distribution-title">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#242c36] pb-2">
          <h2 id="request-distribution-title" className="text-xs font-mono font-bold uppercase tracking-wider text-[#e6edf3]">Request distribution by sector</h2>
          <p className="text-[10px] text-[#8b949e]">Click a sector to filter the dashboard · {filteredComplaints.length} loaded requests</p>
        </div>
        {categoryRows.length ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pt-3">
          {categoryRows.map(([name, count]) => (
            <button key={name} aria-pressed={categoryFilter === name} onClick={() => setCategoryFilter(categoryFilter === name ? 'all' : name)} className="grid grid-cols-[7rem_1fr_3rem] items-center gap-2 text-left text-xs">
              <span className="capitalize text-[#8b949e]">{name}</span>
              <span className="h-2 rounded-full bg-[#0b0e12] overflow-hidden"><span className="block h-full rounded-full bg-sky-500" style={{ width: `${(count / largestCategory) * 100}%` }} /></span>
              <span className="text-right font-mono text-[#e6edf3]">{count}</span>
            </button>
          ))}
        </div> : <p className="pt-3 text-xs text-[#8b949e]">No request records match the selected filters.</p>}
      </section>

      {/* Main Centerpiece: Interactive GIS India Map & Demand Hotspots Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: GIS India Map */}
        <div className="lg:col-span-2">
          <Suspense fallback={<div role="status" className="h-[520px] animate-pulse rounded border border-[#242c36] bg-[#11161d] p-4 text-xs text-[#8b949e]">Loading illustrative map…</div>}>
            <IndiaMap
              selectedCategory={categoryFilter}
              selectedState={stateFilter}
              selectedDistrict={districtFilter}
              onStateChange={setStateFilter}
              onSelectCluster={(cluster) => {
                const rec = recommendations.find(r => r.clusterId === cluster.id);
                if (rec) onSelectRecommendation(rec);
              }}
            />
          </Suspense>
        </div>

        {/* Right 1 Col: Top Ranked Demand Hotspots List */}
        <div className="bg-[#11161d] border border-[#242c36] rounded p-4 flex flex-col justify-between h-[520px] shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#242c36]">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#e6edf3]">
                Top Priority Demand Hotspots
              </span>
              <span className="text-[10px] font-mono text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                SAMPLE PRIORITY
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
              {!filteredHotspots.length && <p className="text-xs text-[#8b949e] py-4">No hotspots match these dashboard filters.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: planning recommendations and recently loaded reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left:         Planning Recommendations */}
        <div className="bg-[#11161d] border border-[#242c36] rounded p-4 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#242c36]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#e6edf3]">
                Featured AI Project Recommendations
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#8b949e]">LOADED RECOMMENDATIONS</span>
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
            {!filteredRecommendations.length && <p className="text-xs text-[#8b949e] py-4">No recommendations match these dashboard filters.</p>}
          </div>
        </div>

        {/* Right: recently loaded citizen reports */}
        <div className="bg-[#11161d] border border-[#242c36] rounded p-4 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#242c36]">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#e6edf3]">
                Recent Multilingual Reports
              </span>
            </div>
            <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
              {dataMode === 'mock' || demoFallback ? 'LOCAL RECORDS' : 'LOADED RECORDS'}
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
              </div>
            ))}
            {!filteredComplaints.length && <p className="text-xs text-[#8b949e] py-4">No requests match these dashboard filters.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
