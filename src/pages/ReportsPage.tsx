import React, { useMemo, useState } from 'react';
import { Download, FileSpreadsheet, Printer, Sparkles } from 'lucide-react';
import { useAppData } from '../state/AppDataContext';
import { CategoryType } from '../types';

interface Briefing {
  title: string;
  executiveSummary: string;
  keyFindings: string[];
  recommendedActions: string[];
  dataLimitations: string[];
}

const categoryNames: Record<CategoryType, string> = {
  road: 'Roads', water: 'Water', electricity: 'Electricity', health: 'Health',
  education: 'Education', sanitation: 'Sanitation', telecom: 'Telecom', agriculture: 'Agriculture',
};

const getLocalBriefing = (data: ReturnType<typeof buildReportData>): Briefing => {
  const topCategory = Object.entries(data.categories).sort((a, b) => b[1] - a[1])[0];
  const openProjects = data.projects - data.completedProjects;
  return {
    title: `Infrastructure briefing — ${new Date().toLocaleDateString()}`,
    executiveSummary: `This briefing summarizes ${data.requestCount} requests, ${data.gapCount} infrastructure gap records, ${data.recommendationCount} recommendations, and ${data.projects} projects for ${data.regionLabel}. ${data.affected.toLocaleString()} people are recorded as potentially affected across those requests; ${data.measuredImpact.toLocaleString()} beneficiaries are listed in loaded impact records.`,
    keyFindings: [
      `${data.requestCount} requests are included${data.windowLabel ? ` for ${data.windowLabel}` : ''}.`,
      topCategory ? `${categoryNames[topCategory[0] as CategoryType]} is the most-reported category (${topCategory[1]} requests).` : 'No request categories are available in the selected data.',
      `${data.projects} projects are listed; ${openProjects} are not marked complete.`,
      `${data.gapCount} infrastructure gaps and ${data.recommendationCount} recommendations are present in the loaded dataset.`,
      `${data.measuredImpact.toLocaleString()} beneficiaries are listed in loaded impact records.`,
      `${data.criticalRequests} requests are marked critical or high severity.`,
    ],
    recommendedActions: data.requestCount
      ? ['Review high-severity requests with the relevant local administration.', 'Validate reported locations and beneficiary estimates before planning or funding decisions.']
      : ['Connect an authorized data provider or submit requests before drawing operational conclusions.'],
    dataLimitations: [
      'This report is calculated from records currently loaded in the application; it is not a national census or live government feed.',
      'Local demo records and estimated beneficiary counts are illustrative and require independent verification.',
      'The date filter applies to citizen requests only; gaps, recommendations, projects, and impact records have no common reporting timestamp.',
    ],
  };
};

function buildReportData(appData: ReturnType<typeof useAppData>, filters: { category: string; state: string; window: string }) {
  const { complaints, projects, gaps, recommendations, impacts } = appData;
  const cutoff = filters.window === 'all' ? 0 : Date.now() - Number(filters.window) * 24 * 60 * 60 * 1000;
  const selected = complaints.filter(item =>
    (filters.category === 'all' || item.category === filters.category) &&
    (filters.state === 'all' || item.state === filters.state) &&
    (!cutoff || new Date(item.createdAt).getTime() >= cutoff),
  );
  const selectedProjects = projects.filter(item =>
    (filters.category === 'all' || item.category === filters.category) &&
    (filters.state === 'all' || item.state === filters.state),
  );
  const selectedGaps = gaps.filter(item =>
    (filters.category === 'all' || item.category === filters.category) &&
    (filters.state === 'all' || item.state === filters.state),
  );
  const selectedRecommendations = recommendations.filter(item =>
    (filters.category === 'all' || item.category === filters.category) &&
    (filters.state === 'all' || item.state === filters.state),
  );
  const selectedImpact = impacts.filter(item =>
    (filters.category === 'all' || item.category === filters.category) &&
    (filters.state === 'all' || item.state === filters.state),
  );
  const categories = selected.reduce<Record<string, number>>((counts, item) => {
    counts[item.category] = (counts[item.category] || 0) + 1;
    return counts;
  }, {});
  const labels: Record<string, string> = { '30': 'the last 30 days', '90': 'the last 90 days', all: 'all available dates' };
  return {
    requestCount: selected.length,
    projects: selectedProjects.length,
    completedProjects: selectedProjects.filter(item => item.status === 'Completed' || item.status === 'Impact Measured').length,
    affected: selected.reduce((sum, item) => sum + item.estimatedAffected, 0),
    criticalRequests: selected.filter(item => item.severity === 'critical' || item.severity === 'high').length,
    gapCount: selectedGaps.length,
    recommendationCount: selectedRecommendations.length,
    measuredImpact: selectedImpact.reduce((sum, item) => sum + item.citizensBenefitedCount, 0),
    categories,
    regionLabel: filters.state === 'all' ? 'all loaded regions' : filters.state,
    windowLabel: labels[filters.window] || '',
  };
}

export const ReportsPage: React.FC = () => {
  const appData = useAppData();
  const { complaints, dataMode, demoFallback } = appData;
  const [category, setCategory] = useState('all');
  const [state, setState] = useState('all');
  const [window, setWindow] = useState('90');
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [provider, setProvider] = useState<'local' | 'gemini' | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const reportData = useMemo(
    () => buildReportData(appData, { category, state, window }),
    [appData, category, state, window],
  );
  const states = useMemo(() => [...new Set(complaints.map(item => item.state).filter(item => item !== 'Unknown'))].sort(), [complaints]);

  const generateBriefing = async () => {
    setIsGenerating(true);
    setMessage('');
    const fallback = getLocalBriefing(reportData);
    try {
      const response = await fetch('/api/ai/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report: JSON.stringify(reportData) }),
        signal: AbortSignal.timeout(28000),
      });
      if (!response.ok) throw new Error('Live report generation is unavailable.');
      const result: unknown = await response.json();
      if (!result || typeof result !== 'object') throw new Error('The report response was invalid.');
      const data = result as Partial<Briefing>;
      if (typeof data.executiveSummary !== 'string' || !Array.isArray(data.keyFindings) || !Array.isArray(data.recommendedActions)) {
        throw new Error('The report response was incomplete.');
      }
      setBriefing({
        title: typeof data.title === 'string' ? data.title : fallback.title,
        executiveSummary: data.executiveSummary,
        keyFindings: data.keyFindings.filter((item): item is string => typeof item === 'string'),
        recommendedActions: data.recommendedActions.filter((item): item is string => typeof item === 'string'),
        dataLimitations: Array.isArray(data.dataLimitations)
          ? data.dataLimitations.filter((item): item is string => typeof item === 'string')
          : fallback.dataLimitations,
      });
      setProvider('gemini');
    } catch {
      setBriefing(fallback);
      setProvider('local');
      setMessage('Live AI is unavailable. This briefing was generated from the records shown here using local rules.');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportText = () => {
    if (!briefing) return;
    const sections = [
      briefing.title,
      `Region: ${reportData.regionLabel}. Generated from ${reportData.requestCount} requests, ${reportData.gapCount} gaps, ${reportData.recommendationCount} recommendations, ${reportData.projects} projects, and ${reportData.measuredImpact.toLocaleString()} listed beneficiaries.`,
      '',
      'Executive summary',
      briefing.executiveSummary,
      '',
      'Key findings',
      ...briefing.keyFindings.map(item => `- ${item}`),
      '',
      'Recommended actions',
      ...briefing.recommendedActions.map(item => `- ${item}`),
      '',
      'Data limitations',
      ...briefing.dataLimitations.map(item => `- ${item}`),
      '',
      `Source: ${provider === 'gemini' ? 'Gemini-generated from aggregate application data' : 'Local demo rules'}.`,
    ];
    const url = URL.createObjectURL(new Blob([sections.join('\n')], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'jansetu-infrastructure-briefing.txt';
    link.click();
    globalThis.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#242c36]">
        <div>
          <h1 className="text-xl font-mono font-bold text-[#e6edf3] tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#818cf8]" />
            <span>Infrastructure Intelligence Reports</span>
          </h1>
          <p className="text-xs text-[#8b949e] font-mono mt-1">Briefings use the currently loaded application records; verify evidence before operational use.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => void generateBriefing()} disabled={isGenerating} className="px-3.5 py-2 rounded bg-[#5b9bd5] hover:bg-[#4a88c7] disabled:opacity-60 text-[#0b0e12] font-mono font-bold text-xs flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />{isGenerating ? 'Generating…' : 'Generate briefing'}
          </button>
          {briefing && <>
            <button onClick={exportText} className="px-3 py-2 rounded bg-[#181f28] text-sky-400 border border-sky-500/30 text-xs flex items-center gap-1.5"><Download className="w-3.5 h-3.5" />Download TXT</button>
            <button onClick={() => globalThis.window.print()} className="px-3 py-2 rounded bg-[#181f28] text-sky-400 border border-sky-500/30 text-xs flex items-center gap-1.5"><Printer className="w-3.5 h-3.5" />Print / Save PDF</button>
          </>}
        </div>
      </div>

      <section className="flex flex-wrap gap-3 p-4 rounded bg-[#11161d] border border-[#242c36]" aria-label="Report filters">
        <label className="text-xs text-[#8b949e]">Date range
          <select value={window} onChange={event => { setWindow(event.target.value); setBriefing(null); setProvider(null); }} className="block mt-1 bg-[#0b0e12] border border-[#242c36] rounded px-2 py-1.5 text-[#e6edf3]">
            <option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="all">All available dates</option>
          </select>
        </label>
        <label className="text-xs text-[#8b949e]">Category
          <select value={category} onChange={event => { setCategory(event.target.value); setBriefing(null); setProvider(null); }} className="block mt-1 bg-[#0b0e12] border border-[#242c36] rounded px-2 py-1.5 text-[#e6edf3]">
            <option value="all">All categories</option>{Object.entries(categoryNames).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </label>
        <label className="text-xs text-[#8b949e]">State
          <select value={state} onChange={event => { setState(event.target.value); setBriefing(null); setProvider(null); }} className="block mt-1 bg-[#0b0e12] border border-[#242c36] rounded px-2 py-1.5 text-[#e6edf3]">
            <option value="all">All states</option>{states.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {[['Requests', reportData.requestCount], ['Potentially affected', reportData.affected.toLocaleString()], ['Infrastructure gaps', reportData.gapCount], ['Recommendations', reportData.recommendationCount], ['Projects', reportData.projects], ['Listed beneficiaries', reportData.measuredImpact.toLocaleString()]].map(([label, value]) =>
          <div key={label} className="p-4 rounded bg-[#11161d] border border-[#242c36]"><p className="text-xs text-[#8b949e]">{label}</p><p className="mt-2 text-xl font-mono font-bold text-[#e6edf3]">{value}</p></div>,
        )}
      </div>

      {!briefing && <div className="p-6 rounded bg-[#11161d] border border-dashed border-[#303a46] text-sm text-[#8b949e]">Select the evidence window and generate a briefing. Reports summarize only the records currently loaded by this app.</div>}
      {message && <p role="status" className="text-xs text-amber-300">{message}</p>}
      {briefing && <article className="report-content p-5 rounded bg-[#11161d] border border-[#242c36] space-y-5">
        <header className="border-b border-[#242c36] pb-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-sky-400">{provider === 'gemini' ? 'Gemini · aggregate data only' : 'Local rules · demo mode'}</p>
          <h2 className="mt-1 text-lg font-semibold text-[#e6edf3]">{briefing.title}</h2>
          <p className="text-xs text-[#8b949e] mt-1">Region: {reportData.regionLabel}. Based on {reportData.requestCount} requests, {reportData.gapCount} gaps, {reportData.recommendationCount} recommendations, and {reportData.projects} projects in the selected dataset.</p>
        </header>
        <section><h3 className="font-semibold text-sm text-[#e6edf3]">Executive summary</h3><p className="mt-2 text-sm leading-relaxed text-[#8b949e]">{briefing.executiveSummary}</p></section>
        {[
          ['Key findings', briefing.keyFindings],
          ['Recommended actions', briefing.recommendedActions],
          ['Data limitations', briefing.dataLimitations],
        ].map(([title, items]) => <section key={title as string}>
          <h3 className="font-semibold text-sm text-[#e6edf3]">{title as string}</h3>
          <ul className="mt-2 list-disc pl-5 space-y-1 text-sm leading-relaxed text-[#8b949e]">{(items as string[]).map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul>
        </section>)}
        <p className="text-[11px] text-[#8b949e]">Provider: {dataMode === 'mock' || demoFallback ? 'local dataset / demo fallback' : `${dataMode} data mode`}. This report is not a verified government publication.</p>
      </article>}
    </div>
  );
};
