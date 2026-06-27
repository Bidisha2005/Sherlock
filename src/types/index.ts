// src/types/index.ts

export type RiskStatus = 'On Track' | 'Behind' | 'At Risk' | 'Critical';
export type Month = 'July 2025' | 'August 2025' | 'September 2025';

export interface PBLSchoolRecord {
  id?: number;
  schoolCode: string;
  schoolName: string;
  district: string;
  block: string;
  cluster: string;
  reportingMonth: Month;
  participationStatus: boolean;
  completionPercentage: number;
  evidenceSubmitted: boolean;
  evidenceType: string[];
  gradesImplemented: string[];
  subjectsImplemented: string[];
  totalEnrollment: number;
  totalAttendance: number;
  attendancePercentage: number;
  riskStatus: RiskStatus;
  responseData: Record<string, any>;
  createdAt?: string;
}

export interface GrantProfile {
  grantLabel: string;
  donorOrganization: string;
  coveredDistricts: string[];
  coveredBlocks: string[];
  startDate: string;
  endDate: string;
  totalBudget: number;
  utilizedAmount: number;
  utilizationPercentage: number;
  strategicObjectives: string[];
  focusAreas: string[];
}

export interface GrantPerformance {
  grantLabel: string;
  reportingMonth: string;
  milestoneId: string;
  milestoneName: string;
  target: number;
  achieved: number;
  status: 'Completed' | 'On Track' | 'Delayed' | 'At Risk';
  completionPercentage: number;
  comments: string;
  risks: string[];
  nextSteps: string[];
}

export interface GrantEvidence {
  grantLabel: string;
  reportingMonth: string;
  assetId: string;
  assetName: string;
  assetType: 'Photo' | 'Report' | 'News Clipping' | 'Video' | 'Certificate' | 'Other';
  description: string;
  relativePath: string;
  linkedMilestone: string;
  dateCollected: string;
  status: 'Verified' | 'Pending Review' | 'Rejected';
  tags: string[];
}

export interface DashboardMetrics {
  totalSchools: number;
  participatingSchools: number;
  participationRate: number;
  evidenceSubmissionRate: number;
  totalEnrollment: number;
  totalAttendance: number;
  averageAttendanceRate: number;
  monthOverMonth: {
    participation: number;
    attendance: number;
    enrollment: number;
    evidence: number;
  };
}

export interface PerformanceRanking {
  name: string;
  type: 'district' | 'block';
  participationRate: number;
  evidenceRate: number;
  attendanceRate: number;
  riskStatus: RiskStatus;
  needsAttention: boolean;
}

export interface RiskAssessment {
  metricName: string;
  value: number;
  status: RiskStatus;
  explanation: string;
}

export interface Filters {
  month?: Month;
  district?: string;
  block?: string;
  grade?: string;
  subject?: string;
}

export interface GrantReport {
  grantLabel: string;
  reportingMonth: string;
  generatedAt: string;
  profile: GrantProfile;
  performance: {
    schoolsReached: number;
    participationRate: number;
    attendanceRate: number;
    evidenceRate: number;
    enrollmentTotal: number;
    monthOverMonth: {
      participation: number;
      attendance: number;
    };
  };
  milestones: {
    total: number;
    completed: number;
    onTrack: number;
    delayed: number;
    completionRate: number;
    details: GrantPerformance[];
  };
  financial: {
    totalBudget: number;
    utilized: number;
    utilizationRate: number;
    remainingBudget: number;
  };
  risks: Array<{
    type: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    description: string;
    affectedAreas: string[];
  }>;
  evidence: {
    totalAssets: number;
    byType: Record<string, number>;
    assets: GrantEvidence[];
    imageUrls: string[];
  };
  narrative: {
    executiveSummary: string;
    progressHighlights: string;
    challenges: string;
    milestoneAchievements: string;
    evidenceSummary: string;
    financialStatus: string;
    recommendations: string[];
  };
  sources: Array<{
    fact: string;
    sourceFile: string;
    sourceRow: string;
    metricUsed: string;
  }>;
}