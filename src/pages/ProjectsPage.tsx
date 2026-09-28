import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PriorityScoreBadge } from '../components/ui/StatusBadge';
import { FolderKanban, Download, Search, ArrowRight } from 'lucide-react';
import { ImpactMetric, Project, ProjectStatus } from '../types';
import { useAppData } from '../state/AppDataContext';

export const ProjectsPage: React.FC = () => {
  const { projects, updateProjectStatus, recordProjectImpact } = useAppData();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('search') || '');
  const [status, setStatus] = useState('all');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [measurementProject, setMeasurementProject] = useState<Project | null>(null);
  const [measurementError, setMeasurementError] = useState('');
  const [measurement, setMeasurement] = useState({ beforeAccess: '', afterAccess: '', beforeRequests: '', afterRequests: '', citizens: '' });
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
  const measureImpact = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!measurementProject) return;
    const values = Object.values(measurement).map(Number);
    if (values.some(value => !Number.isFinite(value) || value < 0) || Number(measurement.beforeRequests) < 1 || Number(measurement.citizens) < 1) {
      setMeasurementError('Enter valid, non-negative measurements. Baseline requests and citizens benefited must be at least one.');
      return;
    }
    const [beforeAccessPercent, afterAccessPercent, beforeRequestsCount, afterRequestsCount, citizensBenefitedCount] = values;
    if (beforeAccessPercent > 100 || afterAccessPercent > 100 || !values.every(Number.isInteger)) {
      setMeasurementError('Access values must be 0–100 and all measurements must be whole numbers.');
      return;
    }
    const metric: ImpactMetric = {
      id: `IMP-${measurementProject.id}`,
      projectId: measurementProject.id,
      projectTitle: measurementProject.title,
      district: measurementProject.district,
      state: measurementProject.state,
      category: measurementProject.category,
      beforeAccessPercent,
      afterAccessPercent,
      complaintReductionPercent: Math.round((beforeRequestsCount - afterRequestsCount) / beforeRequestsCount * 100),
      citizensBenefitedCount,
      beforeRequestsCount,
      afterRequestsCount,
      sdgGoals: measurementProject.category === 'water' ? ['SDG 6'] : measurementProject.category === 'health' ? ['SDG 3'] : measurementProject.category === 'education' ? ['SDG 4'] : ['SDG 9', 'SDG 11'],
    };
    recordProjectImpact(measurementProject.id, metric);
    setMeasurementProject(null);
    setMeasurementError('');
    setMeasurement({ beforeAccess: '', afterAccess: '', beforeRequests: '', afterRequests: '', citizens: '' });
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
            Track the sample project lifecycle. Status changes are persisted in this browser only.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-[#8b949e]">
          <span className="px-2.5 py-1 rounded bg-[#11161d] border border-[#242c36]">
            Active sample projects: <strong className="text-[#5b9bd5]">{projects.filter(project => !['Completed', 'Impact Measured', 'Rejected'].includes(project.status)).length}</strong>
          </span>
          <button onClick={exportCsv} className="px-3 py-1.5 border border-[#242c36] rounded text-sky-400 flex items-center gap-1"><Download className="w-3.5 h-3.5" />Export CSV</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 p-3 rounded bg-[#11161d] border border-[#242c36]">
        <div className="relative flex-1 min-w-48"><Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6e7681]" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search project or location" className="w-full bg-[#0b0e12] border border-[#242c36] rounded pl-9 pr-3 py-2 text-xs text-[#e6edf3]" /></div>
        <select value={status} onChange={event => setStatus(event.target.value)} aria-label="Filter project status" className="bg-[#0b0e12] border border-[#242c36] text-[#e6edf3] rounded px-3 text-xs">        <option value="all">All statuses</option>{['Recommended','Under Review','Approved','In Progress','Completed','Impact Measured','Rejected'].map(value => <option key={value}>{value}</option>)}</select>
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
                      <div className="flex gap-1"><button onClick={() => setDetailId(detailId === prj.id ? null : prj.id)} className="px-2 py-1 rounded border border-[#242c36] text-[#8b949e] text-[10px]">Details</button>{prj.status !== 'Impact Measured' && prj.status !== 'Rejected' && <button onClick={() => prj.status === 'Completed' ? setMeasurementProject(prj) : advance(prj.id, prj.status)} className="px-2 py-1 rounded border border-sky-500/40 text-sky-400 text-[10px] flex items-center gap-1">{prj.status === 'Recommended' ? 'Review' : prj.status === 'Under Review' ? 'Approve' : prj.status === 'Approved' ? 'Start project' : prj.status === 'In Progress' ? 'Complete' : 'Measure impact'}<ArrowRight className="w-3 h-3" /></button>}{['Recommended', 'Under Review'].includes(prj.status) && <button onClick={() => updateProjectStatus(prj.id, 'Rejected')} className="px-2 py-1 rounded border border-rose-500/40 text-rose-300 text-[10px]">Reject</button>}</div>
                    </div>
                  </td>
                </tr>{detailId === prj.id && <tr><td colSpan={8} className="p-4 text-xs text-[#8b949e] bg-[#0b0e12]">Executing agency: <strong className="text-[#e6edf3]">{prj.executingAgency}</strong> · Started {prj.startDate} · Target {prj.targetDate} · Budget ₹{prj.budgetCr} Cr · Estimated beneficiaries {prj.beneficiariesCount.toLocaleString()}.</td></tr>}</React.Fragment>
              ))}
              {!visibleProjects.length && <tr><td colSpan={8} className="p-8 text-center text-[#8b949e]">No projects match the current filters.</td></tr>}
            </tbody>
          </table>
        </div>
        {measurementProject && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <form role="dialog" aria-modal="true" aria-labelledby="impact-measure-title" onSubmit={measureImpact} className="w-full max-w-lg space-y-4 rounded-lg border border-[#242c36] bg-[#11161d] p-5 shadow-2xl">
            <div><h2 id="impact-measure-title" className="text-sm font-bold text-[#e6edf3]">Record observed project impact</h2><p className="mt-1 text-xs text-[#8b949e]">{measurementProject.title} · Enter validated measurements; this does not estimate outcomes.</p></div>
            <div className="grid grid-cols-2 gap-3">
              {([
                ['beforeAccess', 'Baseline access (%)', 100],
                ['afterAccess', 'Current access (%)', 100],
                ['beforeRequests', 'Baseline requests', undefined],
                ['afterRequests', 'Current requests', undefined],
                ['citizens', 'Citizens benefited', undefined],
              ] as const).map(([key, label, max]) => <label key={key} className="text-xs text-[#8b949e]">{label}<input required type="number" min={key === 'beforeRequests' || key === 'citizens' ? 1 : 0} max={max} step="1" value={measurement[key]} onChange={event => setMeasurement(current => ({ ...current, [key]: event.target.value }))} className="mt-1 w-full rounded border border-[#242c36] bg-[#0b0e12] px-3 py-2 text-[#e6edf3]" /></label>)}
            </div>
            {measurementError && <p role="alert" className="text-xs text-rose-300">{measurementError}</p>}
            <div className="flex justify-end gap-2"><button type="button" onClick={() => { setMeasurementProject(null); setMeasurementError(''); }} className="rounded border border-[#242c36] px-3 py-2 text-xs text-[#8b949e]">Cancel</button><button type="submit" className="rounded bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">Save measured impact</button></div>
          </form>
        </div>}
      </div>
    </div>
  );
};
