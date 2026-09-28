import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, ChevronDown, Globe, Mic, Moon, Search, Sun } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../data/mockData';
import { LanguageCode } from '../../types';
import { DataMode, useAppData } from '../../state/AppDataContext';

interface HeaderProps {
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onOpenVoiceModal: () => void;
  dataMode: DataMode;
  demoFallback: boolean;
  theme: string;
  onThemeChange: (theme: string) => void;
  onSelectComplaint: (complaint: import('../../types').Complaint) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentLanguage, onLanguageChange, onOpenVoiceModal, dataMode, demoFallback, theme, onThemeChange, onSelectComplaint }) => {
  const { complaints, projects, recommendations } = useAppData();
  const navigate = useNavigate();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const activeLang = SUPPORTED_LANGUAGES.find(language => language.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
  const normalizedTerm = searchTerm.trim().toLowerCase();
  const results = useMemo(() => {
    if (!normalizedTerm) return { requests: [], projects: [], recommendations: [], districts: [] };
    const requests = complaints.filter(item => `${item.id} ${item.rawText} ${item.translatedText} ${item.district} ${item.state} ${item.category}`.toLowerCase().includes(normalizedTerm)).slice(0, 4);
    const projectMatches = projects.filter(item => `${item.id} ${item.title} ${item.state} ${item.district} ${item.category}`.toLowerCase().includes(normalizedTerm)).slice(0, 3);
    const recommendationMatches = recommendations.filter(item => `${item.title} ${item.state} ${item.district} ${item.category}`.toLowerCase().includes(normalizedTerm)).slice(0, 3);
    const districts = [...new Set(complaints.filter(item => `${item.district} ${item.state}`.toLowerCase().includes(normalizedTerm)).map(item => `${item.district}, ${item.state}`))].slice(0, 3);
    return { requests, projects: projectMatches, recommendations: recommendationMatches, districts };
  }, [complaints, projects, recommendations, normalizedTerm]);
  const notificationCount = complaints.filter(item => item.status === 'new' || item.severity === 'critical').length;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
        setSearchOpen(true);
      }
      if (event.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const selectRequest = (item: typeof complaints[number]) => {
    onSelectComplaint(item);
    navigate('/requests');
    setSearchOpen(false);
    setSearchTerm('');
  };
  const nextTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark';

  return (
    <header className="h-14 bg-[#0c1015] border-b border-[#242c36] px-4 flex items-center justify-between sticky top-0 z-40 select-none gap-3">
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded bg-sky-900/30 border border-sky-500/40 flex items-center justify-center text-sky-400 font-bold text-sm">JS</div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-base tracking-tight text-[#e6edf3]">JanSetu <span className="text-[#5b9bd5]">AI</span></span>
            <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#151b23] text-[#8b949e] border border-[#242c36]">DPI-v2.4</span>
          </div>
          <p className="text-[10px] text-[#6e7681] hidden sm:block">National Infrastructure Intelligence Platform</p>
        </div>
      </div>

      <div className="relative hidden md:flex flex-1 max-w-lg mx-3">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6e7681]" />
        <input
          ref={searchRef}
          type="search"
          value={searchTerm}
          onFocus={() => setSearchOpen(true)}
          onChange={event => { setSearchTerm(event.target.value); setSearchOpen(true); }}
          onKeyDown={event => { if (event.key === 'Enter' && normalizedTerm) navigate('/requests'); }}
          placeholder="Search requests, districts, projects..."
          aria-label="Search requests, districts, projects and recommendations"
          className="w-full bg-[#0b0e12] border border-[#242c36] focus:border-[#5b9bd5] rounded pl-9 pr-14 py-1.5 text-xs text-[#e6edf3] placeholder-[#6e7681] outline-none font-mono"
        />
        <span className="absolute right-2.5 top-2 px-1.5 py-0.5 rounded text-[9px] font-mono text-[#6e7681] bg-[#151b23] border border-[#242c36]">⌘K</span>
        {searchOpen && normalizedTerm && (
          <div className="absolute top-full mt-2 left-0 right-0 max-h-[70vh] overflow-y-auto rounded border border-[#303a46] bg-[#11161d] shadow-2xl z-50 p-2">
            {!results.requests.length && !results.projects.length && !results.recommendations.length && !results.districts.length && <p className="p-3 text-xs text-[#8b949e]">No matching records.</p>}
            {results.requests.map(item => <button key={item.id} onClick={() => selectRequest(item)} className="w-full text-left p-2 rounded hover:bg-[#181f28] text-xs"><span className="text-sky-400 font-mono">{item.id}</span><span className="ml-2 text-[#e6edf3]">{item.district}, {item.state}</span><p className="truncate text-[#8b949e] mt-1">{item.translatedText}</p></button>)}
            {results.projects.map(item => <button key={item.id} onClick={() => { navigate('/projects'); setSearchOpen(false); }} className="w-full text-left p-2 rounded hover:bg-[#181f28] text-xs"><span className="text-emerald-400 font-mono">{item.id}</span><span className="ml-2 text-[#e6edf3]">{item.title}</span></button>)}
            {results.recommendations.map(item => <button key={item.id} onClick={() => { navigate('/recommendations'); setSearchOpen(false); }} className="w-full text-left p-2 rounded hover:bg-[#181f28] text-xs"><span className="text-amber-400">Recommendation</span><span className="ml-2 text-[#e6edf3]">{item.title}</span></button>)}
            {results.districts.map(item => <button key={item} onClick={() => { setSearchTerm(item.split(',')[0]); navigate('/requests'); setSearchOpen(false); }} className="w-full text-left p-2 rounded hover:bg-[#181f28] text-xs text-[#e6edf3]">District: {item}</button>)}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden xl:inline text-[10px] px-2 py-1 rounded border border-[#242c36] text-[#8b949e]" title={demoFallback ? 'Configured data API unavailable; local data is active' : `Data provider: ${dataMode}`}>
          {demoFallback ? 'DEMO DATA ACTIVE' : `${dataMode.toUpperCase()} DATA`}
        </span>
        <button onClick={onOpenVoiceModal} aria-label="Open citizen request form" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-sky-600/20 hover:bg-sky-600/30 text-sky-400 border border-sky-500/40 text-xs"><Mic className="w-3.5 h-3.5" /><span className="hidden sm:inline">Submit Issue</span></button>
        <button onClick={() => onThemeChange(nextTheme)} aria-label={`Theme: ${theme}. Activate ${nextTheme} theme`} title={`Theme: ${theme} (click for ${nextTheme})`} className="p-1.5 rounded hover:bg-[#181f28] text-[#8b949e] hover:text-[#e6edf3]">
          {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <div className="relative">
          <button onClick={() => setLangDropdownOpen(!langDropdownOpen)} aria-expanded={langDropdownOpen} className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-[#11161d] hover:bg-[#181f28] border border-[#242c36] text-xs text-[#e6edf3]">
            <Globe className="w-3.5 h-3.5 text-[#5b9bd5]" /><span className="font-mono">{activeLang.flag} {activeLang.nativeName}</span><ChevronDown className="w-3 h-3 text-[#6e7681]" />
          </button>
          {langDropdownOpen && <div className="absolute right-0 mt-1 w-52 max-h-72 overflow-y-auto bg-[#11161d] border border-[#242c36] rounded shadow-xl py-1 z-50">
            {SUPPORTED_LANGUAGES.map(language => <button key={language.code} onClick={() => { onLanguageChange(language.code); setLangDropdownOpen(false); }} className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#181f28] ${currentLanguage === language.code ? 'text-[#5b9bd5] bg-[#151b23]' : 'text-[#e6edf3]'}`}>
              <span>{language.flag} {language.nativeName} <span className="text-[#6e7681]">({language.name})</span></span>{currentLanguage === language.code && <Check className="w-3.5 h-3.5" />}
            </button>)}
          </div>}
        </div>
        <div className="relative">
          <button onClick={() => setNotificationsOpen(!notificationsOpen)} aria-label={`${notificationCount} notifications`} aria-expanded={notificationsOpen} className="relative p-1.5 rounded hover:bg-[#181f28] text-[#8b949e] hover:text-[#e6edf3]">
            <Bell className="w-4 h-4" />{notificationCount > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-[9px] text-white flex items-center justify-center">{Math.min(notificationCount, 99)}</span>}
          </button>
          {notificationsOpen && <div className="absolute right-0 mt-2 w-72 bg-[#11161d] border border-[#242c36] rounded shadow-xl z-50 p-3">
            <div className="text-xs font-semibold text-[#e6edf3] mb-2">Current alerts</div>
            {complaints.filter(item => item.status === 'new' || item.severity === 'critical').slice(0, 4).map(item => <button key={item.id} onClick={() => { selectRequest(item); setNotificationsOpen(false); }} className="block w-full text-left border-t border-[#242c36] py-2 text-xs"><span className="text-rose-400">{item.severity.toUpperCase()}</span><span className="ml-2 text-[#e6edf3]">{item.category} request in {item.district}</span></button>)}
            {projects.filter(item => item.status === 'Completed' || item.status === 'In Progress').slice(0, 2).map(item => <div key={item.id} className="border-t border-[#242c36] py-2 text-xs text-[#8b949e]">Project {item.status.toLowerCase()}: {item.title}</div>)}
            {!notificationCount && !projects.length && <p className="text-xs text-[#8b949e]">No current alerts.</p>}
          </div>}
        </div>
      </div>
      {searchOpen && <button aria-label="Close search results" className="fixed inset-0 z-30 cursor-default" onClick={() => setSearchOpen(false)} />}
    </header>
  );
};
