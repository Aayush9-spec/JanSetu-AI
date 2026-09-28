import React from 'react';
import { Complaint } from '../../types';
import { useAppData } from '../../state/AppDataContext';
import { SeverityBadge, CategoryBadge } from './StatusBadge';
import {
  X,
  Mic,
  Sparkles,
  MapPin,
  Users,
  FileText,
  Layers,
  CheckCircle,
  Volume2,
  Share2,
  ExternalLink
} from 'lucide-react';

interface RequestDrawerProps {
  complaint: Complaint | null;
  onClose: () => void;
}

export const RequestDrawer: React.FC<RequestDrawerProps> = ({ complaint, onClose }) => {
  const { updateComplaintStatus } = useAppData();
  if (!complaint) return null;

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
                Recording is not retained in demo mode; the submitted transcript is shown below.
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

          {/* Section 3: Geographic & Demographic Context */}
          <div className="p-4 rounded bg-[#11161d] border border-[#242c36] space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-[#e6edf3] font-semibold border-b border-[#242c36] pb-2">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>Location & Infrastructure Gap Cross-Check</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[#8b949e]">
              <div>State: <span className="text-[#e6edf3]">{complaint.state}</span></div>
              <div>District: <span className="text-[#e6edf3]">{complaint.district}</span></div>
              <div>Block: <span className="text-[#e6edf3]">{complaint.block}</span></div>
              <div>Village: <span className="text-[#e6edf3]">{complaint.village}</span></div>
            </div>

            <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Infrastructure gap context is indicative demo data; verify district conditions before allocation.</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#242c36] bg-[#0c1015] flex items-center justify-between">
          <div className="text-[10px] font-mono text-[#6e7681]">
            SUBMITTED: {new Date(complaint.createdAt).toLocaleDateString()} · STATUS: {complaint.status.replace('_', ' ').toUpperCase()}
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="request-status" className="sr-only">Update request status</label>
            <select id="request-status" value={complaint.status} onChange={event => updateComplaintStatus(complaint.id, event.target.value as Complaint['status'])} className="max-w-32 bg-[#11161d] border border-[#242c36] text-[#e6edf3] rounded px-2 py-1.5 text-[10px]">
              {['new', 'clustered', 'analyzed', 'recommended', 'in_progress', 'resolved'].map(status => <option key={status} value={status}>{status.replace('_', ' ')}</option>)}
            </select>
            <button onClick={onClose} className="px-4 py-1.5 rounded bg-[#5b9bd5] hover:bg-[#4a88c7] text-[#0b0e12] font-semibold text-xs">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};
