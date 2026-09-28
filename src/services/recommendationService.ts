import { Complaint, InfrastructureGap, Project, ProjectRecommendation, PriorityScoreDetails } from '../types';

const WEIGHTS = { citizenDemand: 25, populationImpact: 20, infraGap: 20, urgency: 15, equity: 10, feasibility: 10 };
const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const isActiveProject = (project: Project) => !['Completed', 'Impact Measured', 'Rejected'].includes(project.status);

export function generateRecommendations(
  gaps: InfrastructureGap[],
  complaints: Complaint[],
  projects: Project[],
): ProjectRecommendation[] {
  const candidates = gaps.map(gap => {
    const matching = complaints.filter(item =>
      item.state === gap.state && item.district === gap.district && item.category === gap.category
    );
    const activeProjects = projects.filter(project =>
      project.state === gap.state && project.district === gap.district && project.category === gap.category && isActiveProject(project)
    );
    return {
      gap,
      matching,
      demand: matching.length ? matching.length : gap.citizenDemandCount,
      population: matching.length
        ? matching.reduce((sum, item) => sum + item.estimatedAffected, 0)
        : gap.impactedPopulation,
      activeProjects: Math.max(gap.activeProjectsCount, activeProjects.length),
    };
  });
  const maxDemand = Math.max(1, ...candidates.map(item => item.demand));
  const maxPopulation = Math.max(1, ...candidates.map(item => item.population));
  const maxInvestment = Math.max(1, ...candidates.map(item => item.gap.investmentGapCr));

  return candidates.map(({ gap, matching, demand, population, activeProjects }) => {
    const vulnerable = matching.filter(item => /child|women|elderly|disab|vulnerable|student/i.test(item.affectedGroup)).length;
    const scores = {
      citizenDemand: clamp(demand / maxDemand * 100),
      populationImpact: clamp(population / maxPopulation * 100),
      infraGap: clamp(gap.coverageGapPercent),
      urgency: matching.length
        ? clamp(matching.filter(item => item.urgency === 'immediate' || item.urgency === 'high').length / matching.length * 100)
        : gap.status === 'Critical Gap' ? 100 : gap.status === 'High Deficit' ? 80 : gap.status === 'Moderate Need' ? 55 : 25,
      equity: matching.length ? clamp(vulnerable / matching.length * 100) : 50,
      feasibility: clamp((activeProjects ? 60 : 100) - gap.investmentGapCr / maxInvestment * 20),
    };
    const breakdown: PriorityScoreDetails['breakdown'] = {
      citizenDemand: { score: scores.citizenDemand, weight: WEIGHTS.citizenDemand, weighted: scores.citizenDemand * WEIGHTS.citizenDemand / 100 },
      populationImpact: { score: scores.populationImpact, weight: WEIGHTS.populationImpact, weighted: scores.populationImpact * WEIGHTS.populationImpact / 100 },
      infraGap: { score: scores.infraGap, weight: WEIGHTS.infraGap, weighted: scores.infraGap * WEIGHTS.infraGap / 100 },
      urgency: { score: scores.urgency, weight: WEIGHTS.urgency, weighted: scores.urgency * WEIGHTS.urgency / 100 },
      equity: { score: scores.equity, weight: WEIGHTS.equity, weighted: scores.equity * WEIGHTS.equity / 100 },
      feasibility: { score: scores.feasibility, weight: WEIGHTS.feasibility, weighted: scores.feasibility * WEIGHTS.feasibility / 100 },
    };
    const priorityScore = Math.round(Object.values(breakdown).reduce((sum, item) => sum + item.weighted, 0));
    const projectType = gap.status === 'Critical Gap' ? 'Emergency Intervention' as const : 'Repair & Rehabilitation' as const;
    const populationLabel = matching.length ? 'loaded request estimates' : 'illustrative gap records';

    return {
      id: `AUTO-${gap.id}`,
      clusterId: gap.id,
      title: `Improve ${gap.category} access in ${gap.district}`,
      description: `${matching.length} matching loaded requests and a ${gap.coverageGapPercent}% illustrative coverage gap inform this planning proposal.`,
      category: gap.category,
      projectType,
      state: gap.state,
      district: gap.district,
      targetArea: gap.district,
      priorityScore,
      scoreDetails: { totalScore: priorityScore, breakdown },
      confidenceScore: matching.length ? 0.7 : 0.5,
      estimatedBeneficiaries: population,
      estimatedBudgetCr: gap.investmentGapCr,
      estimatedTimelineMonths: gap.status === 'Critical Gap' ? 6 : 12,
      aiRationale: `Transparent local score ${priorityScore}/100 using demand (${scores.citizenDemand}), population impact (${scores.populationImpact}), coverage gap (${scores.infraGap}), urgency (${scores.urgency}), equity (${scores.equity}), and feasibility (${scores.feasibility}). Population comes from ${populationLabel}.`,
      evidence: {
        citizenRequestsCount: demand,
        affectedPopulation: population,
        existingCoveragePercent: gap.existingCoveragePercent,
        noPlannedProject: activeProjects === 0,
        seasonalDisruptionRisk: gap.status === 'Critical Gap' ? 'High — validate locally' : 'Not assessed in demo data',
      },
      suggestedIntervention: projectType === 'Emergency Intervention'
        ? `Verify and prioritize ${gap.category} service restoration with local authorities.`
        : `Survey ${gap.district} and assess targeted ${gap.category} rehabilitation.`,
      status: 'Recommended',
      createdAt: new Date().toISOString(),
    };
  });
}
