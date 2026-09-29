import React, { useState } from 'react';
import { Complaint } from '../../types';
import { useAppData } from '../../state/AppDataContext';
import { SeverityBadge, CategoryBadge } from './StatusBadge';
import {
  X,
  Mic,
  Sparkles,
  MapPin,
  Layers,
  Trash2,
  FolderKanban,
} from 'lucide-react';

interface RequestDrawerProps {
  complaint: Complaint | null;
  onClose: () => void;
}

export const RequestDrawer: React.FC<RequestDrawerProps> = ({ complaint, onClose }) => {
  const { updateComplaintStatus, deleteComplaint, projects, gaps } = useAppData();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!complaint) return null;

  const matchingProjects = projects.filter(p => p.district === complaint.district && p.category === complaint.category);
  const matchingGaps = gaps.filter(g => g.district === complaint.district && g.category === complaint.category);

  const handleDelete = () => {
    deleteComplaint(complaint.id);
    setShowConfirmDelete(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex justify-end animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-xl bg-[#0d1117] border-l border-[#242c36] h-full flex flex-col justify-between overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-[#242c36] bg-[#0c1015] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs text-[#5b9bd5] font-bold">{complaint.id}</span>
            <CategoryBadge category={complaint.category} />
            <SeverityBadge level={complaint.severity} />
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#181f28] text-[#8b949e] hover:text-[#e6edf3] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-6 flex-1">
          {/* Section 1: Raw Citizen Voice / Input */}
          <div className="p-4 rounded bg-[#11161d] border border-[#242c36] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-[#8b949e]">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-sky-400" />
                <span className="text-[#e6edf3] font-semibold">Citizen {complaint.inputMode === 'voice' ? 'Voice' : 'Text'} Submission ({complaint.rawLanguage.toUpperCase()})</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#151b23] text-[#6e7681]">
                {complaint.inputMode.toUpperCase()} MODE
              </span>
            </div>

            {complaint.inputMode === 'voice' && (
              <div className="p-2.5 rounded bg-[#0b0e12] border border-[#1b222c] text-[11px] text-[#8b949e]">
                Recording processed and transcribed via speech recognition.
              </div>
            )}

            <div className="p-3 rounded bg-[#0b0e12] border border-[#1b222c] text-xs font-sans text-[#e6edf3] leading-relaxed italic">
              "{complaint.rawText}"
            </div>
          </div>

          {/* Section 2: Gemini AI Multilingual Processing */}
          <div className="p-4 rounded bg-[#11161d] border border-[#242c36] space-y-4">
            <div className="flex items-center justify-between border-b border-[#242c36] pb-2">
              <div className="flex items-center gap-2 text-xs font-mono text-sky-400 font-semibold">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>Structured Request Analysis</span>
              </div>
              <span className={`text-[10px] font-mono ${complaint.analysisProvider === 'gemini' ? 'text-[#48bb78]' : 'text-amber-400'}`}>{complaint.analysisProvider === 'gemini' ? 'GEMINI' : 'AI DEMO MODE'} · {(complaint.aiClassificationConfidence * 100).toFixed(0)}%</span>
            </div>

            {/* English Translation */}
            <div>
              <label className="text-[10px] font-mono text-[#8b949e] uppercase">English Translation</label>
              <p className="text-xs text-[#e6edf3] font-sans mt-1 bg-[#0b0e12] p-2.5 rounded border border-[#1b222c] leading-relaxed">
                {complaint.translatedText}
              </p>
            </div>

            {/* Extracted Entity Tags */}
            <div>
              <label className="text-[10px] font-mono text-[#8b949e] uppercase">Extracted Key Entities</label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {complaint.extractedEntities.map((ent, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-mono bg-sky-900/30 text-sky-300 border border-sky-500/30">
                    {ent}
                  </span>
                ))}
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-2.5 rounded bg-[#0b0e12] border border-[#1b222c]">
                <div className="text-[10px] font-mono text-[#8b949e]">ESTIMATED AFFECTED</div>
                <div className="text-sm font-mono font-bold text-[#e6edf3] mt-0.5">
                  {complaint.estimatedAffected.toLocaleString()} citizens
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#0b0e12] border border-[#1b222c]">
                <div className="text-[10px] font-mono text-[#8b949e]">SIMILAR REQUESTS</div>
                <div className="text-sm font-mono font-bold text-amber-400 mt-0.5">
                  {complaint.similarRequestsCount.toLocaleString()} complaints
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Geographic & Related Infrastructure */}
          <div className="p-4 rounded bg-[#11161d] border border-[#242c36] space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-[#e6edf3] font-semibold border-b border-[#242c36] pb-2">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>Location & District Context</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[#8b949e]">
              <div>State: <span className="text-[#e6edf3]">{complaint.state}</span></div>
              <div>District: <span className="text-[#e6edf3]">{complaint.district}</span></div>
              <div>Block: <span className="text-[#e6edf3]">{complaint.block}</span></div>
              <div>Village: <span className="text-[#e6edf3]">{complaint.village}</span></div>
            </div>

            {/* Related Infrastructure Gaps */}
            {matchingGaps.length > 0 && (
              <div className="pt-2 border-t border-[#1b222c] space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-400 font-semibold">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Matching Infrastructure Gap</span>
                </div>
                {matchingGaps.map(gap => (
                  <div key={gap.id} className="p-2 rounded bg-[#0b0e12] text-xs font-mono flex items-center justify-between text-[#e6edf3]">
                    <span>{gap.district}, {gap.state} ({gap.category})</span>
                    <span className="text-rose-400 font-bold">-{gap.coverageGapPercent}% Gap</span>
                  </div>
                ))}
              </div>
            )}

            {/* Related Projects */}
            {matchingProjects.length > 0 && (
              <div className="pt-2 border-t border-[#1b222c] space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-sky-400 font-semibold">
                  <FolderKanban className="w-3.5 h-3.5" />
                  <span>Matching Registered Projects</span>
                </div>
                {matchingProjects.map(proj => (
                  <div key={proj.id} className="p-2 rounded bg-[#0b0e12] text-xs font-mono flex items-center justify-between text-[#e6edf3]">
                    <span className="truncate max-w-[240px]">{proj.title}</span>
                    <span className="text-emerald-400 font-semibold">{proj.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#242c36] bg-[#0c1015] flex flex-wrap items-center justify-between gap-3">
          <div className="text-[10px] font-mono text-[#6e7681]">
            SUBMITTED: {new Date(complaint.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="px-2.5 py-1.5 rounded border border-rose-500/40 text-rose-300 hover:bg-rose-500/10 text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
            <label htmlFor="request-status" className="sr-only">Update request status</label>
            <select id="request-status" value={complaint.status} onChange={event => updateComplaintStatus(complaint.id, event.target.value as Complaint['status'])} className="bg-[#11161d] border border-[#242c36] text-[#e6edf3] rounded px-2 py-1.5 text-xs font-mono">
              {['new', 'clustered', 'analyzed', 'recommended', 'in_progress', 'resolved'].map(status => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}
            </select>
            <button onClick={onClose} className="px-4 py-1.5 rounded bg-[#5b9bd5] hover:bg-[#4a88c7] text-[#0b0e12] font-semibold text-xs font-mono cursor-pointer">Close</button>
          </div>
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md bg-[#11161d] border border-rose-500/40 rounded-lg p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-[#e6edf3] font-mono flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Confirm Grievance Deletion</span>
            </h3>
            <p className="text-xs text-[#8b949e] leading-relaxed font-sans">
              Are you sure you want to delete request <strong className="text-[#e6edf3] font-mono">{complaint.id}</strong> ({complaint.district}, {complaint.state})? This action will remove the record permanently from the database.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-3 py-1.5 rounded border border-[#242c36] text-[#8b949e] text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

