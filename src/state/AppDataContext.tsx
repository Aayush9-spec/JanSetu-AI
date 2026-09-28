import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MOCK_COMPLAINTS, MOCK_HOTSPOTS, MOCK_INFRASTRUCTURE_GAPS, MOCK_IMPACT_METRICS, MOCK_PROJECTS, MOCK_RECOMMENDATIONS } from '../data/mockData';
import { Complaint, DemandCluster, ImpactMetric, InfrastructureGap, Project, ProjectStatus, ProjectRecommendation } from '../types';

export type DataMode = 'mock' | 'real' | 'hybrid';
type AppDataContextValue = {
  complaints: Complaint[];
  projects: Project[];
  recommendations: ProjectRecommendation[];
  hotspots: DemandCluster[];
  gaps: InfrastructureGap[];
  impacts: ImpactMetric[];
  dataMode: DataMode;
  demoFallback: boolean;
  dataLoading: boolean;
  addComplaint: (complaint: Complaint) => void;
  updateComplaintStatus: (complaintId: string, status: Complaint['status']) => void;
  addProject: (project: Project) => void;
  addRecommendation: (recommendation: ProjectRecommendation) => void;
  updateProjectStatus: (projectId: string, status: ProjectStatus) => void;
  recordProjectImpact: (projectId: string, metric: ImpactMetric) => void;
  updateRecommendationStatus: (recommendationId: string, status: ProjectRecommendation['status']) => void;
  setDataMode: (mode: DataMode) => void;
  refreshData: () => void;
  resetDemoData: () => void;
};

const STORAGE_KEY = 'jansetu.app-data.v1';
const AppDataContext = createContext<AppDataContextValue | null>(null);
const asArray = <T,>(value: unknown, fallback: T[]): T[] => Array.isArray(value) ? value as T[] : fallback;
const readSavedData = () => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as Record<string, unknown>;
  } catch {
    return {};
  }
};
const initialMode = (): DataMode => {
  const saved = localStorage.getItem('jansetu.data-mode');
  const configured = import.meta.env.VITE_DATA_MODE;
  const candidate = saved || configured;
  return candidate === 'real' || candidate === 'hybrid' ? candidate : 'mock';
};

export const AppDataProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [saved] = useState(readSavedData);
  const [complaints, setComplaints] = useState<Complaint[]>(() => asArray(saved.complaints, MOCK_COMPLAINTS));
  const [projects, setProjects] = useState<Project[]>(() => asArray(saved.projects, MOCK_PROJECTS));
  const [recommendations, setRecommendations] = useState<ProjectRecommendation[]>(() => asArray(saved.recommendations, MOCK_RECOMMENDATIONS));
  const [impacts, setImpacts] = useState<ImpactMetric[]>(() => asArray(saved.impacts, MOCK_IMPACT_METRICS));
  const [dataMode, setDataModeState] = useState<DataMode>(initialMode);
  const [demoFallback, setDemoFallback] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ complaints, projects, recommendations, impacts }));
  }, [complaints, projects, recommendations, impacts]);

  useEffect(() => {
    if (dataMode === 'mock') {
      setDemoFallback(false);
      setDataLoading(false);
      return;
    }
    const baseUrl = import.meta.env.VITE_DATA_API_URL;
    if (!baseUrl) {
      setDemoFallback(true);
      setDataLoading(false);
      return;
    }
    const controller = new AbortController();
    const load = async () => {
      setDataLoading(true);
      try {
        const response = await fetch(`${baseUrl.replace(/\/$/, '')}/jansetu/data`, { signal: controller.signal });
        if (!response.ok) throw new Error('Configured data source is unavailable');
        const result: unknown = await response.json();
        if (!result || typeof result !== 'object') throw new Error('Data source returned an invalid response');
        const dataset = result as Record<string, unknown>;
        if (Array.isArray(dataset.complaints)) setComplaints(dataset.complaints as Complaint[]);
        if (Array.isArray(dataset.projects)) setProjects(dataset.projects as Project[]);
        if (Array.isArray(dataset.recommendations)) setRecommendations(dataset.recommendations as ProjectRecommendation[]);
        setDemoFallback(false);
      } catch (error) {
        if (!controller.signal.aborted) {
          setDemoFallback(true);
          console.info('JanSetu data provider is using its local dataset because the configured API is unavailable.', error);
        }
      } finally {
        if (!controller.signal.aborted) setDataLoading(false);
      }
    };
    void load();
    return () => controller.abort();
  }, [dataMode, refreshKey]);

  const setDataMode = useCallback((mode: DataMode) => {
    localStorage.setItem('jansetu.data-mode', mode);
    setDataModeState(mode);
  }, []);
  const refreshData = useCallback(() => setRefreshKey(value => value + 1), []);
  const addComplaint = useCallback((complaint: Complaint) => {
    setComplaints(current => [complaint, ...current]);
  }, []);
  const updateComplaintStatus = useCallback((complaintId: string, status: Complaint['status']) => {
    setComplaints(current => current.map(complaint => complaint.id === complaintId ? { ...complaint, status } : complaint));
  }, []);
  const addProject = useCallback((project: Project) => {
    setProjects(current => current.some(item => item.id === project.id) ? current : [project, ...current]);
  }, []);
  const addRecommendation = useCallback((recommendation: ProjectRecommendation) => {
    setRecommendations(current => [recommendation, ...current.filter(item => item.id !== recommendation.id)]);
  }, []);
  const updateProjectStatus = useCallback((projectId: string, status: ProjectStatus) => {
    setProjects(current => current.map(project => project.id === projectId
      ? { ...project, status, completionPercent: status === 'Completed' || status === 'Impact Measured' ? 100 : status === 'In Progress' ? Math.max(10, project.completionPercent) : project.completionPercent }
      : project));
  }, []);
  const recordProjectImpact = useCallback((projectId: string, metric: ImpactMetric) => {
    setImpacts(current => [metric, ...current.filter(item => item.projectId !== projectId)]);
    setProjects(current => current.map(project => project.id === projectId
      ? { ...project, status: 'Impact Measured', completionPercent: 100 }
      : project));
  }, []);
  const updateRecommendationStatus = useCallback((recommendationId: string, status: ProjectRecommendation['status']) => {
    setRecommendations(current => current.map(recommendation => recommendation.id === recommendationId ? { ...recommendation, status } : recommendation));
  }, []);
  const resetDemoData = useCallback(() => {
    setComplaints(MOCK_COMPLAINTS);
    setProjects(MOCK_PROJECTS);
    setRecommendations(MOCK_RECOMMENDATIONS);
    setImpacts(MOCK_IMPACT_METRICS);
    localStorage.removeItem(STORAGE_KEY);
    setDataMode('mock');
  }, [setDataMode]);

  const value = useMemo(() => ({
    complaints, projects, recommendations, hotspots: MOCK_HOTSPOTS, gaps: MOCK_INFRASTRUCTURE_GAPS,
    impacts, dataMode, demoFallback, dataLoading, addComplaint, updateComplaintStatus, addProject, addRecommendation, updateProjectStatus, recordProjectImpact,
    updateRecommendationStatus, setDataMode, refreshData, resetDemoData
  }), [complaints, projects, recommendations, impacts, dataMode, demoFallback, dataLoading, addComplaint, updateComplaintStatus, addProject, addRecommendation, updateProjectStatus, recordProjectImpact, updateRecommendationStatus, setDataMode, refreshData, resetDemoData]);
  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = (): AppDataContextValue => {
  const value = useContext(AppDataContext);
  if (!value) throw new Error('useAppData must be used inside AppDataProvider');
  return value;
};
