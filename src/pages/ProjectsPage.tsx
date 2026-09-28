import React, { useMemo, useState } from 'react';
import { PriorityScoreBadge } from '../components/ui/StatusBadge';
import { FolderKanban, Download, Search, ArrowRight } from 'lucide-react';
import { ProjectStatus } from '../types';
import { useAppData } from '../state/AppDataContext';

export const ProjectsPage: React.FC = () => {
  const { projects, updateProjectStatus } = useAppData();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [detailId, setDetailId] = useState<string | null>(null);
  const visibleProjects = useMemo(() => projects.filter(project =>
    (status === 'all' || project.status === status) &&
    `${project.id} ${project.title} ${project.state} ${project.district} ${project.category}`.toLowerCase().includes(query.toLowerCase())
  ), [projects, status, query]);
  const advance = (projectId: string, current: ProjectStatus) => {
    const next: Partial<Record<ProjectStatus, ProjectStatus>> = {
      Recommended: 'Under Review', 'Under Review': 'Approved', Approved: 'In Progress',
      'In Progress': 'Completed', Completed: 'Impact Measured',
    };
    const target = next[current];
    if (target) updateProjectStatus(projectId, target);
  };
  const exportCsv = () => {
    const rows = [['ID', 'Title', 'Category', 'District', 'State', 'Budget Cr', 'Beneficiaries', 'Priority', 'Completion', 'Status'], ...visibleProjects.map(project => [project.id, project.title, project.category, project.district, project.state, project.budgetCr, project.beneficiariesCount, project.priorityScore, project.completionPercent, project.status])];
    const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); link.download = 'jansetu-projects.csv'; link.click(); URL.revokeObjectURL(link.href);
  };
  return (
    <div className="p-6 space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#242c36]">
        <div>
          <h1 className="text-xl font-mono font-bold text-[#e6edf3] tracking-tight flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-sky-400" />
            <span>Infrastructure Projects Execution Board</span>
          </h1>
          <p className="text-xs text-[#8b949e] font-mono mt-1">
            Tracking execution lifecycle from AI Recommendation → Approval → Ground Execution → Impact Measurement
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-[#8b949e]">
          <span className="px-2.5 py-1 rounded bg-[#11161d] border border-[#242c36]">
            Active Projects: <strong className="text-[#5b9bd5]">{projects.filter(project => !['Completed', 'Impact Measured'].includes(project.status)).length} Nationwide</strong>
          </span>
          <button onClick={exportCsv} className="px-3 py-1.5 border border-[#242c36] rounded text-sky-400 flex items-center gap-1"><Download className="w-3.5 h-3.5" />Export CSV</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 p-3 rounded bg-[#11161d] border border-[#242c36]">
        <div className="relative flex-1 min-w-48"><Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6e7681]" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search project or location" className="w-full bg-[#0b0e12] border border-[#242c36] rounded pl-9 pr-3 py-2 text-xs text-[#e6edf3]" /></div>
        <select value={status} onChange={event => setStatus(event.target.value)} aria-label="Filter project status" className="bg-[#0b0e12] border border-[#242c36] text-[#e6edf3] rounded px-3 text-xs"><option value="all">All statuses</option>{['Recommended','Under Review','Approved','In Progress','Completed','Impact Measured'].map(value => <option key={value}>{value}</option>)}</select>
      </div>

      {/* Projects Kanban Table */}
      <div className="bg-[#11161d] border border-[#242c36] rounded overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-[#0c1015] border-b border-[#242c36] text-[10px] text-[#8b949e] uppercase tracking-wider">
                <th className="p-3.5">Project ID & Title</th>
                <th className="p-3.5">Sector</th>
                <th className="p-3.5">District & State</th>
                <th className="p-3.5">Allocated Budget</th>
                <th className="p-3.5">Beneficiaries</th>
                <th className="p-3.5">Priority</th>
                <th className="p-3.5">Completion %</th>
                <th className="p-3.5 text-right">Execution Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b222c]">
              {visibleProjects.map((prj) => (
                <React.Fragment key={prj.id}><tr className="hover:bg-[#151b23] transition-colors">
                  <td className="p-3.5">
                    <div className="text-[#5b9bd5] font-bold">{prj.id}</div>
                    <div className="text-[#e6edf3] font-sans font-semibold mt-0.5">{prj.title}</div>
                    <div className="text-[10px] text-[#6e7681]">{prj.executingAgency}</div>
                  </td>
                  <td className="p-3.5 text-amber-400 font-bold uppercase">{prj.category}</td>
                  <td className="p-3.5 text-[#e6edf3]">{prj.district}, {prj.state}</td>
                  <td className="p-3.5 text-[#e6edf3] font-bold">₹{prj.budgetCr} Cr</td>
                  <td className="p-3.5 text-[#4faf9a] font-bold">{prj.beneficiariesCount.toLocaleString()}</td>
                  <td className="p-3.5">
                    <PriorityScoreBadge score={prj.priorityScore} />
                  </td>
                  <td className="p-3.5">
                    <div className="space-y-1">
                      <div className="text-[10px] text-[#e6edf3] font-bold">{prj.completionPercent}%</div>
                      <div className="w-24 h-1.5 bg-[#0b0e12] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-500 rounded-full"
                          style={{ width: `${prj.completionPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex flex-col items-end gap-2"><span className="px-2.5 py-1 rounded text-[10px] uppercase font-bold bg-sky-900/30 text-sky-400 border border-sky-500/30">● {prj.status}</span>
                      <div className="flex gap-1"><button onClick={() => setDetailId(detailId === prj.id ? null : prj.id)} className="px-2 py-1 rounded border border-[#242c36] text-[#8b949e] text-[10px]">Details</button>{prj.status !== 'Impact Measured' && <button onClick={() => advance(prj.id, prj.status)} className="px-2 py-1 rounded border border-sky-500/40 text-sky-400 text-[10px] flex items-center gap-1">{prj.status === 'In Progress' ? 'Complete' : prj.status === 'Completed' ? 'Measure impact' : 'Advance'}<ArrowRight className="w-3 h-3" /></button>}</div>
                    </div>
                  </td>
                </tr>{detailId === prj.id && <tr><td colSpan={8} className="p-4 text-xs text-[#8b949e] bg-[#0b0e12]">Executing agency: <strong className="text-[#e6edf3]">{prj.executingAgency}</strong> · Started {prj.startDate} · Target {prj.targetDate} · Budget ₹{prj.budgetCr} Cr · Estimated beneficiaries {prj.beneficiariesCount.toLocaleString()}.</td></tr>}</React.Fragment>
              ))}
              {!visibleProjects.length && <tr><td colSpan={8} className="p-8 text-center text-[#8b949e]">No projects match the current filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
