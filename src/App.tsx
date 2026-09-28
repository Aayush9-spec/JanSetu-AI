import React, { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { RequestDrawer } from './components/ui/RequestDrawer';
import { VoiceRecorderModal } from './components/ui/VoiceRecorderModal';
const OverviewPage = lazy(() => import('./pages/OverviewPage').then(module => ({ default: module.OverviewPage })));
const RequestsPage = lazy(() => import('./pages/RequestsPage').then(module => ({ default: module.RequestsPage })));
const HotspotsPage = lazy(() => import('./pages/HotspotsPage').then(module => ({ default: module.HotspotsPage })));
const GapsPage = lazy(() => import('./pages/GapsPage').then(module => ({ default: module.GapsPage })));
const RecommendationsPage = lazy(() => import('./pages/RecommendationsPage').then(module => ({ default: module.RecommendationsPage })));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage').then(module => ({ default: module.ProjectsPage })));
const ImpactPage = lazy(() => import('./pages/ImpactPage').then(module => ({ default: module.ImpactPage })));
const DataExplorerPage = lazy(() => import('./pages/DataExplorerPage').then(module => ({ default: module.DataExplorerPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(module => ({ default: module.ReportsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(module => ({ default: module.SettingsPage })));
import { Complaint, LanguageCode } from './types';
import { GeminiExtractionResult } from './services/geminiService';
import { AppDataProvider, useAppData } from './state/AppDataContext';

const AppShell: React.FC = () => {
  const { addComplaint, dataMode, demoFallback } = useAppData();
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => (localStorage.getItem('jansetu.language') as LanguageCode) || 'hi');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('jansetu.theme') || 'dark');

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      const resolved = theme === 'system' ? (prefersDark.matches ? 'dark' : 'light') : theme;
      document.documentElement.dataset.theme = resolved;
      document.documentElement.classList.toggle('dark', resolved === 'dark');
    };
    applyTheme();
    prefersDark.addEventListener('change', applyTheme);
    return () => prefersDark.removeEventListener('change', applyTheme);
  }, [theme]);

  const changeLanguage = (language: LanguageCode) => {
    localStorage.setItem('jansetu.language', language);
    setCurrentLanguage(language);
  };
  const submitAnalyzedRequest = (analysis: GeminiExtractionResult, text: string, inputMode: 'text' | 'voice') => {
    const complaint: Complaint = {
      id: `CMP-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
      rawText: text,
      rawLanguage: currentLanguage,
      translatedText: analysis.translatedText,
      inputMode,
      category: analysis.category,
      subcategory: analysis.subcategory,
      severity: analysis.severity,
      urgency: analysis.urgency,
      affectedGroup: analysis.affectedGroup,
      estimatedAffected: analysis.estimatedAffected,
      state: analysis.location.state || 'Unknown',
      district: analysis.location.district || 'Unknown',
      block: analysis.location.block || 'Unknown',
      village: analysis.location.village || 'Unknown',
      latitude: 0,
      longitude: 0,
      status: 'analyzed',
      sentimentScore: analysis.sentimentScore,
      similarRequestsCount: analysis.similarRequestsCount,
      aiClassificationConfidence: analysis.confidenceScore,
      extractedEntities: analysis.extractedEntities,
      analysisProvider: analysis.provider,
      createdAt: new Date().toISOString(),
    };
    addComplaint(complaint);
    setIsVoiceModalOpen(false);
    setSelectedComplaint(complaint);
  };

  return (
    <div className="min-h-screen bg-[#0b0e12] text-[#e6edf3] flex flex-col font-sans antialiased selection:bg-sky-900/50 selection:text-sky-200">
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={changeLanguage}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        dataMode={dataMode}
        demoFallback={demoFallback}
        theme={theme}
        onThemeChange={nextTheme => {
          localStorage.setItem('jansetu.theme', nextTheme);
          setTheme(nextTheme);
        }}
        onSelectComplaint={setSelectedComplaint}
      />
      <div className="flex flex-1 min-h-0 flex-col md:flex-row overflow-visible md:overflow-hidden">
        <Sidebar onOpenVoiceModal={() => setIsVoiceModalOpen(true)} />
        <main className="flex-1 min-h-0 overflow-y-auto bg-[#0b0e12] min-w-0">
          <Suspense fallback={<div role="status" className="p-6"><div className="h-6 w-48 animate-pulse rounded bg-[#181f28]" /><p className="mt-3 text-xs text-[#8b949e]">Loading workspace…</p></div>}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<OverviewPage onSelectComplaint={setSelectedComplaint} onOpenVoiceModal={() => setIsVoiceModalOpen(true)} onSelectRecommendation={() => navigate('/recommendations')} />} />
              <Route path="/requests" element={<RequestsPage onSelectComplaint={setSelectedComplaint} onOpenVoiceModal={() => setIsVoiceModalOpen(true)} />} />
              <Route path="/hotspots" element={<HotspotsPage onSelectRecommendation={() => navigate('/recommendations')} />} />
              <Route path="/gaps" element={<GapsPage />} />
              <Route path="/infrastructure" element={<Navigate to="/gaps" replace />} />
              <Route path="/recommendations" element={<RecommendationsPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/impact" element={<ImpactPage />} />
              <Route path="/explorer" element={<DataExplorerPage />} />
              <Route path="/data" element={<Navigate to="/explorer" replace />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage theme={theme} onThemeChange={nextTheme => { localStorage.setItem('jansetu.theme', nextTheme); setTheme(nextTheme); }} />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
      <RequestDrawer complaint={selectedComplaint} onClose={() => setSelectedComplaint(null)} />
      <VoiceRecorderModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        currentLanguage={currentLanguage}
        onSubmitRequest={submitAnalyzedRequest}
      />
    </div>
  );
};

export const App: React.FC = () => (
  <AppDataProvider>
    <Router><AppShell /></Router>
  </AppDataProvider>
);

export default App;
