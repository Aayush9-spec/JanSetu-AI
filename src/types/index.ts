export type LanguageCode = 'en' | 'hi' | 'bn' | 'mr' | 'ta' | 'te' | 'kn' | 'gu' | 'pa' | 'ml';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';
export type UrgencyLevel = 'immediate' | 'high' | 'moderate' | 'low';
export type CategoryType = 'road' | 'water' | 'electricity' | 'health' | 'education' | 'sanitation' | 'telecom' | 'agriculture';

export interface Complaint {
  id: string;
  rawText: string;
  rawLanguage: LanguageCode;
  translatedText: string;
  inputMode: 'voice' | 'text' | 'whatsapp';
  audioUrl?: string;
  photoUrls?: string[];

  category: CategoryType;
  subcategory: string;
  severity: SeverityLevel;
  urgency: UrgencyLevel;
  affectedGroup: string;
  estimatedAffected: number;

  state: string;
  district: string;
  block: string;
  village: string;
  latitude: number;
  longitude: number;

  citizenName?: string;
  citizenPhone?: string;
  status: 'new' | 'clustered' | 'analyzed' | 'recommended' | 'in_progress' | 'resolved';
  sentimentScore: number; // -1 to 1
  similarRequestsCount: number;
  aiClassificationConfidence: number;
  extractedEntities: string[];
  analysisProvider?: 'gemini' | 'demo';

  createdAt: string;
}

export interface DemandCluster {
  id: string;
  rank: number;
  title: string;
  category: CategoryType;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  complaintCount: number;
  totalAffectedPopulation: number;
  avgSeverity: number;
  priorityScore: number;
  infraGapLevel: 'Critical' | 'High' | 'Moderate' | 'Low';
  topIssues: string[];
  aiSummary: string;
}

export interface InfrastructureGap {
  id: string;
  state: string;
  district: string;
  category: CategoryType;
  citizenDemandCount: number;
  existingCoveragePercent: number;
  nationalAvgCoveragePercent: number;
  coverageGapPercent: number;
  impactedPopulation: number;
  investmentGapCr: number;
  activeProjectsCount: number;
  status: 'Critical Gap' | 'High Deficit' | 'Moderate Need' | 'Stable';
}

export interface ScoreBreakdown {
  score: number;
  weight: number;
  weighted: number;
}

export interface PriorityScoreDetails {
  totalScore: number;
  breakdown: {
    citizenDemand: ScoreBreakdown;
    populationImpact: ScoreBreakdown;
    infraGap: ScoreBreakdown;
    urgency: ScoreBreakdown;
    equity: ScoreBreakdown;
    feasibility: ScoreBreakdown;
  };
}

export interface ProjectRecommendation {
  id: string;
  clusterId: string;
  title: string;
  description: string;
  category: CategoryType;
  projectType: 'New Construction' | 'Repair & Rehabilitation' | 'Capacity Upgrade' | 'Emergency Intervention';
  state: string;
  district: string;
  targetArea: string;

  priorityScore: number;
  scoreDetails: PriorityScoreDetails;
  confidenceScore: number;

  estimatedBeneficiaries: number;
  estimatedBudgetCr: number;
  estimatedTimelineMonths: number;

  aiRationale: string;
  evidence: {
    citizenRequestsCount: number;
    affectedPopulation: number;
    existingCoveragePercent: number;
    noPlannedProject: boolean;
    seasonalDisruptionRisk: string;
  };
  suggestedIntervention: string;
  status: 'Recommended' | 'Under Review' | 'Approved' | 'In Progress' | 'Completed' | 'Rejected';
  createdAt: string;
}

export type ProjectStatus = 'Recommended' | 'Under Review' | 'Approved' | 'In Progress' | 'Completed' | 'Impact Measured';

export interface Project {
  id: string;
  title: string;
  category: CategoryType;
  state: string;
  district: string;
  budgetCr: number;
  beneficiariesCount: number;
  priorityScore: number;
  status: ProjectStatus;
  completionPercent: number;
  startDate: string;
  targetDate: string;
  executingAgency: string;
}

export interface ImpactMetric {
  id: string;
  projectId: string;
  projectTitle: string;
  district: string;
  state: string;
  category: CategoryType;

  beforeAccessPercent: number;
  afterAccessPercent: number;
  complaintReductionPercent: number;
  citizensBenefitedCount: number;
  beforeRequestsCount: number;
  afterRequestsCount: number;
  sdgGoals: string[];
}
