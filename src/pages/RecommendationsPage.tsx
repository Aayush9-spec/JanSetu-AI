import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PriorityScoreBadge } from '../components/ui/StatusBadge';
import { EvidencePanel } from '../components/ui/EvidencePanel';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { useAppData } from '../state/AppDataContext';
import { Project } from '../types';
import { generateRecommendations } from '../services/recommendationService';

export const RecommendationsPage: React.FC = () => {
  const { recommendations, updateRecommendationStatus, addProject, addRecommendation, projects, gaps, complaints } = useAppData();
  const [searchParams] = useSearchParams();
  const [expandedId, setExpandedId] = useState<string | null>(() => searchParams.get('search') || recommendations[0]?.id || null);
  const [query, setQuery] = useState(() => searchParams.get('search') || '');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [generationMessage, setGenerationMessage] = useState('');
  const filtered = useMemo(() => recommendations.filter(item =>
    (category === 'all' || item.category === category) && (status === 'all' || item.status === status) &&
    `${item.id} ${item.title} ${item.district} ${item.state} ${item.category}`.toLowerCase().includes(query.toLowerCase())
  ), [recommendations, category, status, query]);
  const approve = (recommendation: typeof recommendations[number]) => {
    updateRecommendationStatus(recommendation.id, 'Approved');
    const project: Project = {
      id: `PRJ-${recommendation.id}`, title: recommendation.title, category: recommendation.category,
      state: recommendation.state, district: recommendation.district, budgetCr: recommendation.estimatedBudgetCr,
      beneficiariesCount: recommendation.estimatedBeneficiaries, priorityScore: recommendation.priorityScore,
      status: 'Approved', completionPercent: 0, startDate: new Date().toISOString().slice(0, 10),
      targetDate: new Date(Date.now() + recommendation.estimatedTimelineMonths * 30 * 86400000).toISOString().slice(0, 10),
      executingAgency: recommendation.suggestedIntervention,
    };
    addProject(project);
  };
  const generateFromLoadedData = () => {
    const generated = generateRecommendations(gaps, complaints, projects);
    generated.forEach(addRecommendation);
    setCategory('all');
    setStatus('all');
    setQuery('');
    setExpandedId(generated[0]?.id ?? null);
    setGenerationMessage(`Updated ${generated.length} proposals with transparent local scoring. Gap reference data is illustrative; validate it before acting.`);
  };

  return (
    <div className="p-6 space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#242c36]">
        <div>
          <h1 className="text-xl font-mono font-bold text-[#e6edf3] tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-400 animate-pulse" />
            <span>Infrastructure Planning Recommendations</span>
          </h1>
          <p className="text-xs text-[#8b949e] font-mono mt-1">
            Sample proposals scored from illustrative records; validate source data before acting.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1.5 rounded bg-sky-900/30 text-sky-400 border border-sky-500/30 text-xs font-mono font-semibold">{recommendations.length} LOADED PROPOSALS</span>
          <button onClick={generateFromLoadedData} className="px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white border border-sky-500 text-xs font-medium flex items-center gap-2"><RefreshCw className="w-3.5 h-3.5" />Generate from loaded data</button>
        </div>
      </div>
      {generationMessage && <p role="status" className="text-xs text-amber-300">{generationMessage}</p>}

      <div className="flex gap-2 flex-wrap">
        <input aria-label="Search recommendations" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search recommendation or location" className="bg-[#11161d] border border-[#242c36] rounded px-3 py-2 text-xs text-[#e6edf3]" />
        <select value={category} onChange={event => setCategory(event.target.value)} aria-label="Filter recommendation category" className="bg-[#11161d] border border-[#242c36] rounded px-3 py-2 text-xs text-[#e6edf3]">
          <option value="all">All sectors</option>{['road', 'water', 'health', 'electricity', 'education'].map(item => <option key={item}>{item}</option>)}
        </select>
        <select value={status} onChange={event => setStatus(event.target.value)} aria-label="Filter recommendation status" className="bg-[#11161d] border border-[#242c36] rounded px-3 py-2 text-xs text-[#e6edf3]">
          <option value="all">All statuses</option>{['Recommended', 'Under Review', 'Approved', 'In Progress', 'Completed', 'Rejected'].map(item => <option key={item}>{item}</option>)}
        </select>
      </div>

      {/* List of Recommendations */}
      <div className="space-y-4">
        {filtered.map((rec) => {
          const isExpanded = expandedId === rec.id;

          return (
            <div
              key={rec.id}
              className="p-5 rounded bg-[#11161d] border border-[#242c36] hover:border-sky-500/40 transition-all space-y-4 shadow-xs"
            >
              {/* Main Card Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#242c36] pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#5b9bd5] uppercase font-bold">{rec.category} • {rec.projectType}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#151b23] text-[#8b949e]">
                      CONFIDENCE: {(rec.confidenceScore * 100).toFixed(0)}%
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#e6edf3] font-sans">
                    {rec.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs font-mono text-[#8b949e]">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      {rec.targetArea}, {rec.district}, {rec.state}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <PriorityScoreBadge score={rec.priorityScore} />
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                    className="p-1.5 rounded bg-[#181f28] hover:bg-[#242c36] text-sky-400 border border-sky-500/30 text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>{isExpanded ? 'Hide Evidence' : 'View Evidence'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Description & Impact Quick Grid */}
              <p className="text-xs text-[#8b949e] font-sans leading-relaxed">
                {rec.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-2.5 rounded bg-[#0b0e12] border border-[#1b222c]">
                  <div className="text-[10px] text-[#6e7681]">ESTIMATED BUDGET</div>
                  <div className="text-sm font-bold text-[#e6edf3]">₹{rec.estimatedBudgetCr} Cr</div>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="px-2 py-1 rounded border border-[#242c36] text-[10px] text-[#8b949e]">Status: {rec.status}</span>
                  {!['Approved', 'In Progress', 'Completed', 'Rejected'].includes(rec.status) && <button onClick={() => updateRecommendationStatus(rec.id, 'Under Review')} className="px-3 py-1.5 rounded border border-amber-500/40 text-amber-300 text-xs">Move to review</button>}
                  {!['Approved', 'In Progress', 'Completed', 'Rejected'].includes(rec.status) && <button onClick={() => approve(rec)} className="px-3 py-1.5 rounded bg-sky-600 text-white text-xs">Approve & create project</button>}
                  {!['Approved', 'In Progress', 'Completed', 'Rejected'].includes(rec.status) && <button onClick={() => updateRecommendationStatus(rec.id, 'Rejected')} className="px-3 py-1.5 rounded border border-rose-500/40 text-rose-300 text-xs">Reject</button>}
                  {projects.some(project => project.id === `PRJ-${rec.id}`) && <a href="/projects" className="text-xs text-sky-400">Open created project →</a>}
                </div>

                <div className="p-2.5 rounded bg-[#0b0e12] border border-[#1b222c]">
                  <div className="text-[10px] text-[#6e7681]">BENEFICIARIES</div>
                  <div className="text-sm font-bold text-[#4faf9a]">{rec.estimatedBeneficiaries.toLocaleString()} citizens</div>
                </div>
                <div className="p-2.5 rounded bg-[#0b0e12] border border-[#1b222c]">
                  <div className="text-[10px] text-[#6e7681]">PROPOSED TIMELINE</div>
                  <div className="text-sm font-bold text-amber-400">{rec.estimatedTimelineMonths} Months</div>
                </div>
              </div>

              {/* Expandable Evidence & AI Reasoning Panel */}
              {isExpanded && (
                <div className="pt-2 animate-in fade-in duration-200">
                  <EvidencePanel
                    scoreDetails={rec.scoreDetails}
                    rationale={rec.aiRationale}
                    evidence={rec.evidence}
                  />
                </div>
              )}
            </div>
          );
        })}
        {!filtered.length && <div className="p-8 text-center text-sm text-[#8b949e]">No recommendations match these filters. Clear the search or status filters to see more.</div>}
      </div>
    </div>
  );
};
