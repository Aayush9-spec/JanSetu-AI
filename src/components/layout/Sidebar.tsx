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

interface SidebarProps {
  onOpenVoiceModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenVoiceModal }) => {
  const navItems = [
    { path: '/dashboard', label: 'Overview', icon: LayoutDashboard, badge: 'LIVE' },
    { path: '/requests', label: 'Citizen Requests', icon: MessageSquareText, count: '2.8M' },
    { path: '/hotspots', label: 'Demand Hotspots', icon: Flame, badge: 'HOT' },
    { path: '/gaps', label: 'Infrastructure Gaps', icon: Layers, count: '18.4K' },
    { path: '/recommendations', label: 'AI Recommendations', icon: Sparkles, count: '3,842' },
    { path: '/projects', label: 'Projects Execution', icon: FolderKanban, count: '1.2K' },
    { path: '/impact', label: 'Impact Measurement', icon: TrendingUp, badge: 'DPI' },
    { path: '/explorer', label: 'Data Explorer', icon: Database },
    { path: '/reports', label: 'AI Intelligence Reports', icon: FileSpreadsheet },
    { path: '/settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0d1117] border-r border-[#242c36] flex flex-col justify-between h-[calc(100vh-3.5rem)] sticky top-14 select-none shrink-0">
      {/* Navigation Section */}
      <div className="py-3 px-2 flex-1 overflow-y-auto space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-mono text-[#6e7681] uppercase tracking-wider">
          Intelligence Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded text-xs transition-colors group ${
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
      </div>

      {/* Voice Intake Quick CTA Card */}
      <div className="p-3 border-t border-[#242c36] bg-[#0b0e12]">
        <div className="p-3 rounded bg-[#11161d] border border-[#242c36] space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-[#e6edf3]">
            <Mic className="w-3.5 h-3.5 text-[#5b9bd5]" />
            <span>Citizen Intake Portal</span>
          </div>
          <p className="text-[11px] text-[#8b949e] leading-snug">
            Simulate Hindi voice grievance submission & Gemini AI extraction.
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
          <span>INDIA DPI ENGINE</span>
          <span>GEMINI 2.0 FLASH</span>
        </div>
      </div>
    </aside>
  );
};
