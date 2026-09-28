import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquareText,
  Flame,
  Layers,
  Sparkles,
  FolderKanban,
  TrendingUp,
  Database,
  FileSpreadsheet,
  Settings,
  Mic,
  ChevronRight
} from 'lucide-react';
import { useAppData } from '../../state/AppDataContext';

interface SidebarProps {
  onOpenVoiceModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenVoiceModal }) => {
  const { complaints, gaps, recommendations, projects, dataMode, demoFallback } = useAppData();
  const formatCount = (value: number) => value.toLocaleString();
  const navItems = [
    { path: '/dashboard', label: 'Overview', icon: LayoutDashboard, badge: dataMode === 'mock' || demoFallback ? 'DEMO' : 'DATA' },
    { path: '/requests', label: 'Citizen Requests', icon: MessageSquareText, count: formatCount(complaints.length) },
    { path: '/hotspots', label: 'Demand Hotspots', icon: Flame, badge: 'SAMPLE' },
    { path: '/gaps', label: 'Infrastructure Gaps', icon: Layers, count: formatCount(gaps.length) },
    { path: '/recommendations', label: 'Recommendations', icon: Sparkles, count: formatCount(recommendations.length) },
    { path: '/projects', label: 'Projects Execution', icon: FolderKanban, count: formatCount(projects.length) },
    { path: '/impact', label: 'Impact Measurement', icon: TrendingUp, badge: 'EST.' },
    { path: '/explorer', label: 'Data Explorer', icon: Database },
    { path: '/reports', label: 'AI Intelligence Reports', icon: FileSpreadsheet },
    { path: '/settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <aside className="w-full md:w-64 bg-[#0d1117] border-b md:border-b-0 md:border-r border-[#242c36] flex md:flex-col md:justify-between md:h-[calc(100vh-3.5rem)] sticky top-14 z-30 md:z-auto select-none shrink-0">
      {/* Navigation Section */}
      <nav aria-label="Main navigation" className="py-2 md:py-3 px-2 flex md:block flex-1 overflow-x-auto md:overflow-y-auto space-x-1 md:space-x-0 md:space-y-1">
        <div className="hidden md:block px-3 py-1.5 text-[10px] font-mono text-[#6e7681] uppercase tracking-wider">
          Intelligence Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `min-w-max flex items-center justify-between px-3 py-2 rounded text-xs transition-colors group ${
                  isActive
                    ? 'bg-[#151b23] text-[#5b9bd5] font-semibold border-l-2 border-[#5b9bd5]'
                    : 'text-[#8b949e] hover:bg-[#11161d] hover:text-[#e6edf3]'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-sky-900/40 text-sky-400 border border-sky-500/30">
                  {item.badge}
                </span>
              )}
              {item.count && (
                <span className="text-[10px] font-mono text-[#6e7681]">
                  {item.count}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Voice Intake Quick CTA Card */}
      <div className="hidden md:block p-3 border-t border-[#242c36] bg-[#0b0e12]">
        <div className="p-3 rounded bg-[#11161d] border border-[#242c36] space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-[#e6edf3]">
            <Mic className="w-3.5 h-3.5 text-[#5b9bd5]" />
            <span>Citizen Intake Portal</span>
          </div>
          <p className="text-[11px] text-[#8b949e] leading-snug">
            Submit a voice or text report for local analysis; Gemini is optional.
          </p>
          <button
            onClick={onOpenVoiceModal}
            className="w-full py-1.5 px-2.5 rounded bg-[#181f28] hover:bg-[#242c36] text-sky-400 border border-sky-500/30 text-xs font-mono font-medium flex items-center justify-between transition-colors cursor-pointer"
          >
            <span>Launch Recorder</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Footer Meta */}
        <div className="mt-3 px-1 flex items-center justify-between text-[10px] font-mono text-[#6e7681]">
          <span>JANSETU AI</span>
          <span>{dataMode === 'mock' || demoFallback ? 'DEMO DATA' : 'DATA API'}</span>
        </div>
      </div>
    </aside>
  );
};
