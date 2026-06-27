// src/lib/calculations/grantReport.ts

import { 
  GrantProfile, GrantPerformance, GrantEvidence, 
  GrantReport, PBLSchoolRecord, Filters 
} from '@/types';
import { applyFilters } from './metrics';
import { classifyRisk } from './risk';

export function assembleGrantReport(
  pblData: PBLSchoolRecord[],
  grantProfile: GrantProfile,
  grantPerformance: GrantPerformance[],
  grantEvidence: GrantEvidence[],
  month: string
): GrantReport {
  // Filter PBL data by grant's geography and month
  const grantFilters: Filters = {
    month: month as any,
    district: grantProfile.coveredDistricts.length === 1 ? grantProfile.coveredDistricts[0] : undefined,
  };
  
  const filteredPBL = applyFilters(pblData, grantFilters);
  
  // Calculate performance metrics from PBL data
  const schoolsReached = new Set(filteredPBL.map(d => d.schoolCode)).size;
  
  const participating = filteredPBL.filter(d => d.participationStatus);
  const participatingSchools = new Set(participating.map(d => d.schoolCode)).size;
  const participationRate = schoolsReached > 0 ? (participatingSchools / schoolsReached) * 100 : 0;
  
  const withEvidence = filteredPBL.filter(d => d.evidenceSubmitted);
  const evidenceSchools = new Set(withEvidence.map(d => d.schoolCode)).size;
  const evidenceRate = schoolsReached > 0 ? (evidenceSchools / schoolsReached) * 100 : 0;
  
  const attendanceRates = filteredPBL.map(d => d.attendancePercentage);
  const attendanceRate = attendanceRates.length > 0 
    ? attendanceRates.reduce((a, b) => a + b, 0) / attendanceRates.length 
    : 0;
  
  const totalEnrollment = filteredPBL.reduce((sum, d) => sum + d.totalEnrollment, 0);
  
  // Process milestones
  const milestones = grantPerformance.filter(p => p.reportingMonth === month);
  const completed = milestones.filter(m => m.status === 'Completed');
  const onTrack = milestones.filter(m => m.status === 'On Track');
  const delayed = milestones.filter(m => m.status === 'Delayed' || m.status === 'At Risk');
  
  const completionRate = milestones.length > 0 
    ? (completed.length / milestones.length) * 100 
    : 0;
  
  // Process evidence
  const evidenceItems = grantEvidence.filter(e => e.reportingMonth === month);
  const evidenceByType: Record<string, number> = {};
  for (const item of evidenceItems) {
    evidenceByType[item.assetType] = (evidenceByType[item.assetType] || 0) + 1;
  }
  
  const imageUrls = evidenceItems
    .filter(e => e.assetType === 'Photo' || e.relativePath.includes('.jpg') || e.relativePath.includes('.png'))
    .map(e => e.relativePath);
  
  // Identify risks
  const risks: Array<{ type: string; severity: 'Critical' | 'High' | 'Medium' | 'Low'; description: string; affectedAreas: string[] }> = [];
  
  if (participationRate < 60) {
    risks.push({
      type: 'Participation',
      severity: participationRate < 35 ? 'Critical' : 'High',
      description: `Participation rate is ${Math.round(participationRate)}%, below target of 60%`,
      affectedAreas: grantProfile.coveredDistricts,
    });
  }
  
  if (attendanceRate < 75) {
    risks.push({
      type: 'Attendance',
      severity: attendanceRate < 60 ? 'High' : 'Medium',
      description: `Average attendance rate is ${Math.round(attendanceRate)}%, below target of 75%`,
      affectedAreas: grantProfile.coveredBlocks,
    });
  }
  
  if (delayed.length > 0) {
    risks.push({
      type: 'Milestones',
      severity: delayed.length > 3 ? 'High' : 'Medium',
      description: `${delayed.length} milestone(s) are delayed or at risk`,
      affectedAreas: delayed.map(m => m.milestoneName),
    });
  }
  
  if (grantProfile.utilizationPercentage > 90 && completionRate < 70) {
    risks.push({
      type: 'Financial',
      severity: 'High',
      description: `High budget utilization (${Math.round(grantProfile.utilizationPercentage)}%) with low milestone completion (${Math.round(completionRate)}%)`,
      affectedAreas: ['Budget Management'],
    });
  }
  
  // Calculate financial metrics
  const remainingBudget = grantProfile.totalBudget - grantProfile.utilizedAmount;
  
  // Build the report
  return {
    grantLabel: grantProfile.grantLabel,
    reportingMonth: month,
    generatedAt: new Date().toISOString(),
    profile: grantProfile,
    performance: {
      schoolsReached,
      participationRate: Math.round(participationRate * 100) / 100,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      evidenceRate: Math.round(evidenceRate * 100) / 100,
      enrollmentTotal: totalEnrollment,
      monthOverMonth: {
        participation: 0, // Will be calculated if we have previous month data
        attendance: 0,
      },
    },
    milestones: {
      total: milestones.length,
      completed: completed.length,
      onTrack: onTrack.length,
      delayed: delayed.length,
      completionRate: Math.round(completionRate * 100) / 100,
      details: milestones,
    },
    financial: {
      totalBudget: grantProfile.totalBudget,
      utilized: grantProfile.utilizedAmount,
      utilizationRate: Math.round(grantProfile.utilizationPercentage * 100) / 100,
      remainingBudget: Math.round(remainingBudget * 100) / 100,
    },
    risks,
    evidence: {
      totalAssets: evidenceItems.length,
      byType: evidenceByType,
      assets: evidenceItems,
      imageUrls,
    },
    narrative: {
      executiveSummary: '',
      progressHighlights: '',
      challenges: '',
      milestoneAchievements: '',
      evidenceSummary: '',
      financialStatus: '',
      recommendations: [],
    },
    sources: [],
  };
}