import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Complaint } from '../types';
import { SeverityBadge, CategoryBadge } from '../components/ui/StatusBadge';
import { Search, Download, Mic, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppData } from '../state/AppDataContext';

interface RequestsPageProps {
  onSelectComplaint: (complaint: Complaint) => void;
  onOpenVoiceModal: () => void;
}

export const RequestsPage: React.FC<RequestsPageProps> = ({
  onSelectComplaint,
  onOpenVoiceModal
}) => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const { complaints } = useAppData();
  const districts = useMemo(() => [...new Set(complaints.map(item => item.district).filter(Boolean))].sort(), [complaints]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, categoryFilter, severityFilter, stateFilter, districtFilter, statusFilter, languageFilter, dateFilter, sort]);

  const filteredComplaints = useMemo(() => complaints.filter(c => {
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    if (severityFilter !== 'all' && c.severity !== severityFilter) return false;
    if (stateFilter !== 'all' && c.state !== stateFilter) return false;
    if (districtFilter !== 'all' && c.district !== districtFilter) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (languageFilter !== 'all' && c.rawLanguage !== languageFilter) return false;
    if (dateFilter !== 'all') {
      const ageDays = (Date.now() - Date.parse(c.createdAt)) / 86400000;
      if (!Number.isFinite(ageDays) || ageDays > Number(dateFilter)) return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        c.id.toLowerCase().includes(term) ||
        c.rawText.toLowerCase().includes(term) ||
        c.translatedText.toLowerCase().includes(term) ||
        c.district.toLowerCase().includes(term) ||
        c.state.toLowerCase().includes(term) ||
        c.extractedEntities.join(' ').toLowerCase().includes(term)
      );
    }
    return true;
  }).sort((a, b) => {
    if (sort === 'oldest') return Date.parse(a.createdAt) - Date.parse(b.createdAt);
    if (sort === 'priority') return ({ critical: 4, high: 3, medium: 2, low: 1 }[b.severity] - { critical: 4, high: 3, medium: 2, low: 1 }[a.severity]);
    if (sort === 'affected') return b.estimatedAffected - a.estimatedAffected;
    return Date.parse(b.createdAt) - Date.parse(a.createdAt);
  }), [complaints, categoryFilter, severityFilter, stateFilter, districtFilter, statusFilter, languageFilter, dateFilter, searchTerm, sort]);
  const pageCount = Math.max(1, Math.ceil(filteredComplaints.length / pageSize));
  const visibleComplaints = filteredComplaints.slice((page - 1) * pageSize, page * pageSize);
  const exportCsv = () => {
    const columns: (keyof Complaint)[] = ['id', 'rawText', 'translatedText', 'category', 'severity', 'urgency', 'state', 'district', 'status', 'estimatedAffected', 'createdAt'];
    const quote = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = [columns.join(','), ...filteredComplaints.map(item => columns.map(column => quote(item[column])).join(','))].join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    link.download = 'jansetu-citizen-requests.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="p-6 space-y-6 select-none font-sans">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#242c36]">
        <div>
          <h1 className="text-xl font-mono font-bold text-[#e6edf3] tracking-tight flex items-center gap-2">
            <span>Multilingual Citizen Grievances Explorer</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-sky-900/30 text-sky-400 border border-sky-500/30">
              {complaints.length.toLocaleString()} REQUESTS
            </span>
          </h1>
          <p className="text-xs text-[#8b949e] font-mono mt-1">
            Aggregated from Voice Calls, Text Portals, WhatsApp & Regional CSC Centers across India
          </p>
        </div>

        <button
          onClick={onOpenVoiceModal}
          className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white font-mono font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-md"
        >
          <Mic className="w-4 h-4 animate-pulse" />
          <span>Simulate New Voice Intake</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded bg-[#11161d] border border-[#242c36] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3 min-w-[280px]">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6e7681]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search grievance ID, text, district, entity..."
              className="w-full bg-[#0b0e12] border border-[#242c36] focus:border-[#5b9bd5] rounded pl-9 pr-4 py-1.5 text-xs text-[#e6edf3] outline-none font-mono"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#0b0e12] border border-[#242c36] text-[#e6edf3] text-xs font-mono rounded px-3 py-1.5 outline-none"
          >
            <option value="all">All Categories</option>
            <option value="road">Roads</option>
            <option value="water">Water</option>
            <option value="health">Health</option>
            <option value="electricity">Electricity</option>
            <option value="education">Education</option>
            <option value="sanitation">Sanitation</option>
            <option value="telecom">Telecom</option>
            <option value="agriculture">Agriculture</option>
          </select>
          <select aria-label="Filter request status" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="bg-[#0b0e12] border border-[#242c36] text-[#e6edf3] text-xs font-mono rounded px-2 py-1.5">
            <option value="all">All statuses</option><option value="new">New</option><option value="clustered">Clustered</option><option value="analyzed">Analyzed</option><option value="recommended">Recommended</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option>
          </select>
          <select aria-label="Filter request language" value={languageFilter} onChange={e => { setLanguageFilter(e.target.value); setPage(1); }} className="bg-[#0b0e12] border border-[#242c36] text-[#e6edf3] text-xs font-mono rounded px-2 py-1.5">
            <option value="all">All languages</option>{['hi','en','bn','mr','ta','te','kn','gu','pa','ml'].map(language => <option key={language} value={language}>{language.toUpperCase()}</option>)}
          </select>
          <select aria-label="Sort requests" value={sort} onChange={e => setSort(e.target.value)} className="bg-[#0b0e12] border border-[#242c36] text-[#e6edf3] text-xs font-mono rounded px-2 py-1.5">
            <option value="newest">Newest</option><option value="oldest">Oldest</option><option value="priority">Highest priority</option><option value="affected">Most affected</option>
          </select>
          <button onClick={exportCsv} className="px-3 py-1.5 rounded border border-[#242c36] text-sky-400 hover:bg-[#181f28] text-xs flex items-center gap-1"><Download className="w-3 h-3" />CSV</button>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#0b0e12] border border-[#242c36] text-[#e6edf3] text-xs font-mono rounded px-3 py-1.5 outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
          </select>

          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="bg-[#0b0e12] border border-[#242c36] text-[#e6edf3] text-xs font-mono rounded px-3 py-1.5 outline-none"
          >
            <option value="all">All States</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Bihar">Bihar</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Rajasthan">Rajasthan</option>
          </select>
          <select aria-label="Filter request district" value={districtFilter} onChange={e => setDistrictFilter(e.target.value)} className="bg-[#0b0e12] border border-[#242c36] text-[#e6edf3] text-xs font-mono rounded px-2 py-1.5">
            <option value="all">All districts</option>{districts.map(district => <option key={district}>{district}</option>)}
          </select>
          <select aria-label="Filter request date range" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="bg-[#0b0e12] border border-[#242c36] text-[#e6edf3] text-xs font-mono rounded px-2 py-1.5">
            <option value="all">Any date</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Main Datatable */}
      <div className="bg-[#11161d] border border-[#242c36] rounded overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0c1015] border-b border-[#242c36] text-[10px] font-mono text-[#8b949e] uppercase tracking-wider">
                <th className="p-3">Grievance ID</th>
                <th className="p-3">Mode & Lang</th>
                <th className="p-3">Category</th>
                <th className="p-3">Citizen Request (Raw & Translated)</th>
                <th className="p-3">Location</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Similar Requests</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b222c] text-xs font-mono">
              {visibleComplaints.map((cmp) => (
                <tr
                  key={cmp.id}
                  className="hover:bg-[#151b23] transition-colors cursor-pointer group"
                  onClick={() => onSelectComplaint(cmp)}
                >
                  <td className="p-3 text-[#5b9bd5] font-bold">{cmp.id}</td>
                  <td className="p-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#0b0e12] border border-[#242c36] text-[#e6edf3]">
                      {cmp.inputMode.toUpperCase()} ({cmp.rawLanguage.toUpperCase()})
                    </span>
                  </td>
                  <td className="p-3">
                    <CategoryBadge category={cmp.category} />
                  </td>
                  <td className="p-3 max-w-xs font-sans">
                    <div className="text-[#e6edf3] font-medium line-clamp-1 italic">
                      "{cmp.rawText}"
                    </div>
                    <div className="text-[11px] text-[#8b949e] line-clamp-1 mt-0.5">
                      {cmp.translatedText}
                    </div>
                  </td>
                  <td className="p-3 text-[#e6edf3]">
                    {cmp.district}, {cmp.state}
                  </td>
                  <td className="p-3">
                    <SeverityBadge level={cmp.severity} />
                  </td>
                  <td className="p-3 text-amber-400 font-bold">
                    {cmp.similarRequestsCount.toLocaleString()}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectComplaint(cmp);
                      }}
                      className="px-2.5 py-1 rounded bg-[#181f28] hover:bg-[#242c36] text-sky-400 border border-sky-500/30 text-[11px] font-mono transition-colors"
                    >
                      View AI Detail →
                    </button>
                  </td>
                </tr>
              ))}
              {!visibleComplaints.length && <tr><td colSpan={8} className="p-8 text-center text-[#8b949e]">No requests match these filters. <button onClick={() => { setSearchTerm(''); setCategoryFilter('all'); setSeverityFilter('all'); setStateFilter('all'); setDistrictFilter('all'); setStatusFilter('all'); setLanguageFilter('all'); setDateFilter('all'); }} className="text-sky-400 underline">Clear filters</button> or submit a new request.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center text-xs text-[#8b949e]">
          <span>{filteredComplaints.length ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filteredComplaints.length)} of ${filteredComplaints.length}` : '0 results'}</span>
          <div className="flex items-center gap-2"><button aria-label="Previous page" disabled={page <= 1} onClick={() => setPage(current => Math.max(1, current - 1))} className="p-1 border rounded border-[#242c36] disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button><span>Page {page} / {pageCount}</span><button aria-label="Next page" disabled={page >= pageCount} onClick={() => setPage(current => Math.min(pageCount, current + 1))} className="p-1 border rounded border-[#242c36] disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button></div>
        </div>
      </div>
    </div>
  );
};
