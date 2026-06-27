// src/lib/data/normalize.ts

import { PBLSchoolRecord, Month, RiskStatus, GrantProfile, GrantPerformance, GrantEvidence } from '@/types';

export function normalizePBLSchoolRecord(row: any): PBLSchoolRecord {
  const participationStatus = row['Participation Status']?.toLowerCase() === 'yes' || 
                             row['Participation Status']?.toLowerCase() === 'true' ||
                             row['Participation Status'] === '1';
  
  const evidenceSubmitted = row['Evidence Submitted']?.toLowerCase() === 'yes' || 
                           row['Evidence Submitted']?.toLowerCase() === 'true' ||
                           row['Evidence Submitted'] === '1';

  return {
    schoolCode: row['School Code']?.trim() || '',
    schoolName: row['School Name']?.trim() || '',
    district: row['District']?.trim() || '',
    block: row['Block']?.trim() || '',
    cluster: row['Cluster']?.trim() || '',
    reportingMonth: row['reportingMonth'] as Month,
    participationStatus,
    completionPercentage: parseFloat(row['Completion %'] || row['Completion_Percentage'] || '0'),
    evidenceSubmitted,
    evidenceType: parseListField(row['Evidence Type'] || row['Evidence_Type']),
    gradesImplemented: parseListField(row['Grades Implemented'] || row['Grades_Implemented']),
    subjectsImplemented: parseListField(row['Subjects Implemented'] || row['Subjects_Implemented']),
    totalEnrollment: parseInt(row['Total Enrollment'] || row['Total_Enrollment'] || '0'),
    totalAttendance: parseInt(row['Total Attendance'] || row['Total_Attendance'] || '0'),
    attendancePercentage: parseFloat(row['Attendance %'] || row['Attendance_Percentage'] || '0'),
    riskStatus: normalizeRiskStatus(row['Risk Status'] || row['Risk_Status']),
    responseData: {},
    createdAt: new Date().toISOString(),
  };
}

function parseListField(value: string): string[] {
  if (!value) return [];
  return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
}

function normalizeRiskStatus(value: string): RiskStatus {
  const normalized = value?.toLowerCase()?.trim() || '';
  if (normalized.includes('track')) return 'On Track';
  if (normalized.includes('behind')) return 'Behind';
  if (normalized.includes('risk')) return 'At Risk';
  if (normalized.includes('critical')) return 'Critical';
  if (normalized.includes('good') || normalized.includes('excellent')) return 'On Track';
  if (normalized.includes('warning') || normalized.includes('attention')) return 'At Risk';
  return 'On Track'; // Default fallback
}

export function normalizeGrantProfile(row: any): GrantProfile {
  return {
    grantLabel: row['Grant Label']?.trim() || '',
    donorOrganization: row['Donor Organization']?.trim() || '',
    coveredDistricts: parseListField(row['Covered Districts'] || row['Covered_Districts']),
    coveredBlocks: parseListField(row['Covered Blocks'] || row['Covered_Blocks']),
    startDate: row['Start Date']?.trim() || '',
    endDate: row['End Date']?.trim() || '',
    totalBudget: parseFloat(row['Total Budget'] || row['Total_Budget'] || '0'),
    utilizedAmount: parseFloat(row['Utilized Amount'] || row['Utilized_Amount'] || '0'),
    utilizationPercentage: parseFloat(row['Utilization %'] || row['Utilization_Percentage'] || '0'),
    strategicObjectives: parseListField(row['Strategic Objectives'] || row['Strategic_Objectives']),
    focusAreas: parseListField(row['Focus Areas'] || row['Focus_Areas']),
  };
}

export function normalizeGrantPerformance(row: any): GrantPerformance {
  return {
    grantLabel: row['Grant Label']?.trim() || '',
    reportingMonth: row['Reporting Month']?.trim() || '',
    milestoneId: row['Milestone ID']?.trim() || row['Milestone_Id']?.trim() || '',
    milestoneName: row['Milestone Name']?.trim() || row['Milestone_Name']?.trim() || '',
    target: parseInt(row['Target'] || '0'),
    achieved: parseInt(row['Achieved'] || '0'),
    status: normalizeMilestoneStatus(row['Status'] || ''),
    completionPercentage: parseFloat(row['Completion %'] || row['Completion_Percentage'] || '0'),
    comments: row['Comments']?.trim() || '',
    risks: parseListField(row['Risks'] || ''),
    nextSteps: parseListField(row['Next Steps'] || row['Next_Steps']),
  };
}

function normalizeMilestoneStatus(value: string): 'Completed' | 'On Track' | 'Delayed' | 'At Risk' {
  const normalized = value?.toLowerCase()?.trim() || '';
  if (normalized.includes('complete')) return 'Completed';
  if (normalized.includes('track')) return 'On Track';
  if (normalized.includes('delay')) return 'Delayed';
  if (normalized.includes('risk')) return 'At Risk';
  return 'On Track';
}

export function normalizeGrantEvidence(row: any): GrantEvidence {
  return {
    grantLabel: row['Grant Label']?.trim() || '',
    reportingMonth: row['Reporting Month']?.trim() || '',
    assetId: row['Asset ID']?.trim() || row['Asset_Id']?.trim() || '',
    assetName: row['Asset Name']?.trim() || row['Asset_Name']?.trim() || '',
    assetType: normalizeAssetType(row['Asset Type'] || row['Asset_Type'] || ''),
    description: row['Description']?.trim() || '',
    relativePath: row['Relative Path']?.trim() || row['Relative_Path']?.trim() || '',
    linkedMilestone: row['Linked Milestone']?.trim() || row['Linked_Milestone']?.trim() || '',
    dateCollected: row['Date Collected']?.trim() || row['Date_Collected']?.trim() || '',
    status: normalizeEvidenceStatus(row['Status'] || ''),
    tags: parseListField(row['Tags'] || ''),
  };
}

function normalizeAssetType(value: string): 'Photo' | 'Report' | 'News Clipping' | 'Video' | 'Certificate' | 'Other' {
  const normalized = value?.toLowerCase()?.trim() || '';
  if (normalized.includes('photo') || normalized.includes('image')) return 'Photo';
  if (normalized.includes('report')) return 'Report';
  if (normalized.includes('news') || normalized.includes('clipping')) return 'News Clipping';
  if (normalized.includes('video')) return 'Video';
  if (normalized.includes('certificate')) return 'Certificate';
  return 'Other';
}

function normalizeEvidenceStatus(value: string): 'Verified' | 'Pending Review' | 'Rejected' {
  const normalized = value?.toLowerCase()?.trim() || '';
  if (normalized.includes('verified')) return 'Verified';
  if (normalized.includes('pending') || normalized.includes('review')) return 'Pending Review';
  if (normalized.includes('reject')) return 'Rejected';
  return 'Pending Review';
}