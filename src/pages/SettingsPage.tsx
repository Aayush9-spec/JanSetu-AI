import React, { useEffect, useState } from 'react';
import { Settings, ShieldCheck, RotateCcw, Sun, Moon, Monitor, Database, Sparkles } from 'lucide-react';
import { DataMode, useAppData } from '../state/AppDataContext';

interface SettingsPageProps { theme: string; onThemeChange: (theme: string) => void }

export const SettingsPage: React.FC<SettingsPageProps> = ({ theme, onThemeChange }) => {
  const { dataMode, demoFallback, dataLoading, setDataMode, refreshData, resetDemoData, complaints, projects } = useAppData();
  const [geminiConfigured, setGeminiConfigured] = useState<boolean | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    void fetch('/api/health', { signal: controller.signal })
      .then(response => response.ok ? response.json() : Promise.reject(new Error('Server unavailable')))
      .then((data: { geminiConfigured?: boolean }) => setGeminiConfigured(Boolean(data.geminiConfigured)))
      .catch(() => { if (!controller.signal.aborted) setGeminiConfigured(false); });
    return () => controller.abort();
  }, []);
  const reset = () => {
    if (window.confirm('Reset saved requests, project changes, and recommendations to the original demo dataset?')) resetDemoData();
  };

  return (
    <div className="p-6 space-y-6 font-sans">
      <div className="pb-4 border-b border-[#242c36]">
        <h1 className="text-xl font-mono font-bold text-[#e6edf3] flex items-center gap-2"><Settings className="w-5 h-5 text-[#5b9bd5]" />JanSetu AI Platform Settings</h1>
        <p className="text-xs text-[#8b949e] font-mono mt-1">Manage local demo data, provider mode, appearance, and server-side integrations.</p>
      </div>

      <section className="p-5 rounded bg-[#11161d] border border-[#242c36] space-y-4 max-w-3xl">
        <h2 className="text-sm font-semibold text-[#e6edf3] flex items-center gap-2"><Database className="w-4 h-4 text-sky-400" />Data provider</h2>
        <p className="text-xs text-[#8b949e]">Mock mode works offline. Real and Hybrid try the configured read-only data API, then fall back to local demo records if it is missing or unavailable.</p>
        <div className="flex flex-wrap gap-2">{(['mock', 'hybrid', 'real'] as DataMode[]).map(mode => <button key={mode} onClick={() => setDataMode(mode)} aria-pressed={dataMode === mode} className={`px-3 py-2 rounded border text-xs capitalize ${dataMode === mode ? 'border-sky-500 bg-sky-900/20 text-sky-300' : 'border-[#242c36] text-[#8b949e]'}`}>{mode}</button>)}</div>
        <p role="status" className={`text-xs ${demoFallback ? 'text-amber-300' : 'text-emerald-300'}`}>{dataLoading ? 'Loading from configured provider…' : demoFallback ? 'Demo data active — no configured provider responded.' : `Active provider mode: ${dataMode}.`}</p>
        {dataMode !== 'mock' && <button onClick={refreshData} disabled={dataLoading} className="px-3 py-2 rounded border border-[#242c36] text-sky-300 text-xs disabled:opacity-50">{dataLoading ? 'Retrying…' : 'Retry configured provider'}</button>}
      </section>

      <section className="p-5 rounded bg-[#11161d] border border-[#242c36] space-y-4 max-w-3xl">
        <h2 className="text-sm font-semibold text-[#e6edf3] flex items-center gap-2"><Sun className="w-4 h-4 text-amber-300" />Appearance</h2>
        <div className="flex flex-wrap gap-2">{[{ id: 'light', label: 'Light', Icon: Sun }, { id: 'dark', label: 'Dark', Icon: Moon }, { id: 'system', label: 'System', Icon: Monitor }].map(({ id, label, Icon }) => <button key={id} onClick={() => onThemeChange(id)} aria-pressed={theme === id} className={`px-3 py-2 rounded border text-xs flex items-center gap-2 ${theme === id ? 'border-sky-500 bg-sky-900/20 text-sky-300' : 'border-[#242c36] text-[#8b949e]'}`}><Icon className="w-4 h-4" />{label}</button>)}</div>
      </section>

      <section className="p-5 rounded bg-[#11161d] border border-[#242c36] space-y-4 max-w-3xl">
        <h2 className="text-sm font-semibold text-[#e6edf3] flex items-center gap-2"><Sparkles className="w-4 h-4 text-violet-400" />Gemini integration</h2>
        <div className="flex items-center gap-2 text-xs"><span className={`w-2 h-2 rounded-full ${geminiConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`} /><span className="text-[#e6edf3]">{geminiConfigured === null ? 'Checking application server…' : geminiConfigured ? 'Server-side Gemini key is configured.' : 'Gemini is not configured; local AI Demo Mode is active.'}</span></div>
        <p className="text-xs text-[#8b949e]">Set <code>GEMINI_API_KEY</code> in the server environment and restart the application. The key is never entered into or stored in browser storage. Photo analysis uses Gemini only when configured; otherwise the app identifies that live vision is unavailable.</p>
      </section>

      <section className="p-5 rounded bg-[#11161d] border border-[#242c36] space-y-4 max-w-3xl">
        <h2 className="text-sm font-semibold text-[#e6edf3] flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400" />Local demo dataset</h2>
        <p className="text-xs text-[#8b949e]">Saved locally in this browser: {complaints.length} citizen requests · {projects.length} projects. No personal request data is sent to third parties unless you submit it for configured Gemini analysis.</p>
        <button onClick={reset} className="px-3 py-2 rounded border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2"><RotateCcw className="w-3.5 h-3.5" />Reset Demo Data</button>
      </section>
    </div>
  );
};
