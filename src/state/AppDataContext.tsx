import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MOCK_COMPLAINTS, MOCK_HOTSPOTS, MOCK_INFRASTRUCTURE_GAPS, MOCK_IMPACT_METRICS, MOCK_PROJECTS, MOCK_RECOMMENDATIONS } from '../data/mockData';
import { Complaint, DemandCluster, ImpactMetric, InfrastructureGap, NotificationItem, Project, ProjectStatus, ProjectRecommendation } from '../types';

export type DataMode = 'mock' | 'real' | 'hybrid';
type AppDataContextValue = {
  complaints: Complaint[];
  projects: Project[];
  recommendations: ProjectRecommendation[];
  hotspots: DemandCluster[];
  gaps: InfrastructureGap[];
  impacts: ImpactMetric[];
  notifications: NotificationItem[];
  dataMode: DataMode;
  demoFallback: boolean;
  dataLoading: boolean;
  addComplaint: (complaint: Complaint) => void;
  updateComplaintStatus: (complaintId: string, status: Complaint['status']) => void;
  deleteComplaint: (complaintId: string) => void;
  addProject: (project: Project) => void;
  addRecommendation: (recommendation: ProjectRecommendation) => void;
  updateProjectStatus: (projectId: string, status: ProjectStatus) => void;
  recordProjectImpact: (projectId: string, metric: ImpactMetric) => void;
  updateRecommendationStatus: (recommendationId: string, status: ProjectRecommendation['status']) => void;
  markNotificationsRead: (notificationId?: string) => void;
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

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOTIF-01',
    title: 'High Priority Hotspot Alert',
    message: 'Critical road gap detected in Mohanlalganj, Lucknow (Priority score: 92/100).',
    type: 'alert',
    link: '/hotspots',
    isRead: false,
    createdAt: '2026-09-28T10:20:00Z',
  },
  {
    id: 'NOTIF-02',
    title: 'Project Impact Milestone',
    message: 'Balesar 11KV power grid replacement reached 88% complaint reduction.',
    type: 'milestone',
    link: '/impact',
    isRead: false,
    createdAt: '2026-09-28T11:00:00Z',
  }
];

export const AppDataProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [saved] = useState(readSavedData);
  const [complaints, setComplaints] = useState<Complaint[]>(() => asArray(saved.complaints, MOCK_COMPLAINTS));
  const [projects, setProjects] = useState<Project[]>(() => asArray(saved.projects, MOCK_PROJECTS));
  const [recommendations, setRecommendations] = useState<ProjectRecommendation[]>(() => asArray(saved.recommendations, MOCK_RECOMMENDATIONS));
  const [hotspots, setHotspots] = useState<DemandCluster[]>(MOCK_HOTSPOTS);
  const [gaps, setGaps] = useState<InfrastructureGap[]>(MOCK_INFRASTRUCTURE_GAPS);
  const [impacts, setImpacts] = useState<ImpactMetric[]>(() => asArray(saved.impacts, MOCK_IMPACT_METRICS));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => asArray(saved.notifications, INITIAL_NOTIFICATIONS));
  const [dataMode, setDataModeState] = useState<DataMode>(initialMode);
  const [demoFallback, setDemoFallback] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ complaints, projects, recommendations, impacts, notifications }));
  }, [complaints, projects, recommendations, impacts, notifications]);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      const endpoint = dataMode !== 'mock' && import.meta.env.VITE_DATA_API_URL
        ? `${import.meta.env.VITE_DATA_API_URL.replace(/\/$/, '')}/jansetu/data`
        : '/api/data';

      setDataLoading(true);
      try {
        const response = await fetch(endpoint, { signal: controller.signal });
        if (!response.ok) throw new Error('Data API responded with error status');
        const result: unknown = await response.json();
        if (!result || typeof result !== 'object') throw new Error('Data API returned an invalid response');
        const dataset = result as Record<string, unknown>;
        if (Array.isArray(dataset.complaints)) setComplaints(dataset.complaints as Complaint[]);
        if (Array.isArray(dataset.projects)) setProjects(dataset.projects as Project[]);
        if (Array.isArray(dataset.recommendations)) setRecommendations(dataset.recommendations as ProjectRecommendation[]);
        if (Array.isArray(dataset.gaps)) setGaps(dataset.gaps as InfrastructureGap[]);
        if (Array.isArray(dataset.hotspots)) setHotspots(dataset.hotspots as DemandCluster[]);
        if (Array.isArray(dataset.impacts)) setImpacts(dataset.impacts as ImpactMetric[]);
        if (Array.isArray(dataset.notifications)) setNotifications(dataset.notifications as NotificationItem[]);
        setDemoFallback(false);
      } catch (error) {
        if (!controller.signal.aborted) {
          setDemoFallback(dataMode !== 'mock');
          console.info('JanSetu data provider is using local dataset fallback.', error);
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
    setNotifications(current => [
      {
        id: `NOTIF-${Date.now().toString().slice(-6)}`,
        title: `New ${complaint.severity.toUpperCase()} Request`,
        message: `${complaint.category} issue reported in ${complaint.district}, ${complaint.state}.`,
        type: 'alert',
        link: '/requests',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);

    // Send to API
    void fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(complaint),
    }).catch(err => console.warn('Failed to sync new request to server DB', err));
  }, []);

  const updateComplaintStatus = useCallback((complaintId: string, status: Complaint['status']) => {
    setComplaints(current => current.map(complaint => complaint.id === complaintId ? { ...complaint, status } : complaint));
    void fetch('/api/requests', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: complaintId, status }),
    }).catch(err => console.warn('Failed to sync complaint status update', err));
  }, []);

  const deleteComplaint = useCallback((complaintId: string) => {
    setComplaints(current => current.filter(complaint => complaint.id !== complaintId));
    void fetch(`/api/requests?id=${encodeURIComponent(complaintId)}`, {
      method: 'DELETE',
    }).catch(err => console.warn('Failed to sync complaint deletion', err));
  }, []);

  const addProject = useCallback((project: Project) => {
    setProjects(current => current.some(item => item.id === project.id) ? current : [project, ...current]);
    setNotifications(current => [
      {
        id: `NOTIF-${Date.now().toString().slice(-6)}`,
        title: 'Project Registered',
        message: `${project.title} (${project.district}) registered in system.`,
        type: 'milestone',
        link: '/projects',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    void fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    }).catch(err => console.warn('Failed to sync project creation', err));
  }, []);

  const addRecommendation = useCallback((recommendation: ProjectRecommendation) => {
    setRecommendations(current => [recommendation, ...current.filter(item => item.id !== recommendation.id)]);
    void fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recommendation),
    }).catch(err => console.warn('Failed to sync recommendation', err));
  }, []);

  const updateProjectStatus = useCallback((projectId: string, status: ProjectStatus) => {
    setProjects(current => current.map(project => project.id === projectId
      ? { ...project, status, completionPercent: status === 'Completed' || status === 'Impact Measured' ? 100 : status === 'In Progress' ? Math.max(10, project.completionPercent) : project.completionPercent }
      : project));
    void fetch('/api/projects', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: projectId, status }),
    }).catch(err => console.warn('Failed to sync project status update', err));
  }, []);

  const recordProjectImpact = useCallback((projectId: string, metric: ImpactMetric) => {
    setImpacts(current => [metric, ...current.filter(item => item.projectId !== projectId)]);
    setProjects(current => current.map(project => project.id === projectId
      ? { ...project, status: 'Impact Measured', completionPercent: 100 }
      : project));
    setNotifications(current => [
      {
        id: `NOTIF-${Date.now().toString().slice(-6)}`,
        title: 'Impact Metric Recorded',
        message: `${metric.complaintReductionPercent}% complaint reduction measured for ${metric.projectTitle}.`,
        type: 'milestone',
        link: '/impact',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    void fetch('/api/impact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric),
    }).catch(err => console.warn('Failed to sync impact metric', err));
  }, []);

  const updateRecommendationStatus = useCallback((recommendationId: string, status: ProjectRecommendation['status']) => {
    setRecommendations(current => current.map(recommendation => recommendation.id === recommendationId ? { ...recommendation, status } : recommendation));
    void fetch('/api/recommendations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: recommendationId, status }),
    }).catch(err => console.warn('Failed to sync recommendation status', err));
  }, []);

  const markNotificationsRead = useCallback((notificationId?: string) => {
    if (notificationId) {
      setNotifications(current => current.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
    } else {
      setNotifications(current => current.map(n => ({ ...n, isRead: true })));
    }
    void fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notificationId ? { id: notificationId } : { markAllRead: true }),
    }).catch(err => console.warn('Failed to sync notification read status', err));
  }, []);

  const resetDemoData = useCallback(() => {
    setComplaints(MOCK_COMPLAINTS);
    setProjects(MOCK_PROJECTS);
    setRecommendations(MOCK_RECOMMENDATIONS);
    setGaps(MOCK_INFRASTRUCTURE_GAPS);
    setHotspots(MOCK_HOTSPOTS);
    setImpacts(MOCK_IMPACT_METRICS);
    setNotifications(INITIAL_NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEY);
    setDataMode('mock');
    void fetch('/api/data/reset', { method: 'POST' }).catch(err => console.warn('Failed to sync reset to server DB', err));
  }, [setDataMode]);

  const value = useMemo(() => ({
    complaints, projects, recommendations, hotspots, gaps,
    impacts, notifications, dataMode, demoFallback, dataLoading,
    addComplaint, updateComplaintStatus, deleteComplaint, addProject, addRecommendation,
    updateProjectStatus, recordProjectImpact, updateRecommendationStatus, markNotificationsRead,
    setDataMode, refreshData, resetDemoData
  }), [complaints, projects, recommendations, hotspots, gaps, impacts, notifications, dataMode, demoFallback, dataLoading, addComplaint, updateComplaintStatus, deleteComplaint, addProject, addRecommendation, updateProjectStatus, recordProjectImpact, updateRecommendationStatus, markNotificationsRead, setDataMode, refreshData, resetDemoData]);

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = (): AppDataContextValue => {
  const value = useContext(AppDataContext);
  if (!value) throw new Error('useAppData must be used inside AppDataProvider');
  return value;
};

