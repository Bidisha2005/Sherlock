// src/lib/calculations/risk.ts

import { PBLSchoolRecord, RiskStatus, RiskAssessment, PerformanceRanking, Filters } from '@/types';
import { applyFilters } from './metrics';

export function classifyRisk(value: number): RiskStatus {
  if (value >= 75) return 'On Track';
  if (value >= 60) return 'Behind';
  if (value >= 35) return 'At Risk';
  return 'Critical';
}

export function getRiskColor(status: RiskStatus): string {
  const colors = {
    'On Track': '#22c55e', // green-500
    'Behind': '#eab308',   // yellow-500
    'At Risk': '#f97316',  // orange-500
    'Critical': '#ef4444', // red-500
  };
  return colors[status];
}

export function getRiskEmoji(status: RiskStatus): string {
  const emojis = {
    'On Track': '✅',
    'Behind': '⚠️',
    'At Risk': '🔴',
    'Critical': '🚨',
  };
  return emojis[status];
}

export function generateRiskExplanation(
  metricName: string,
  value: number,
  status: RiskStatus
): string {
  const explanations = {
    'On Track': `${metricName} at ${value}% is meeting expectations. Continue current approach.`,
    'Behind': `${metricName} at ${value}% is below target. Consider targeted interventions.`,
    'At Risk': `${metricName} at ${value}% requires immediate attention. Investigate root causes.`,
    'Critical': `${metricName} at ${value}% is critically low. Urgent action required.`,
  };
  return explanations[status];
}

export function assessRisk(metricName: string, value: number): RiskAssessment {
  const status = classifyRisk(value);
  return {
    metricName,
    value: Math.round(value * 100) / 100,
    status,
    explanation: generateRiskExplanation(metricName, value, status),
  };
}

export function getPerformanceRankings(
  data: PBLSchoolRecord[],
  filters: Filters,
  level: 'district' | 'block'
): PerformanceRanking[] {
  const filtered = applyFilters(data, filters);
  
  // Group by geography
  const groups = new Map<string, PBLSchoolRecord[]>();
  
  for (const record of filtered) {
    const key = level === 'district' ? record.district : record.block;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(record);
  }
  
  const rankings: PerformanceRanking[] = [];
  
  for (const [name, records] of groups) {
    if (!name) continue;
    
    const uniqueSchools = new Set(records.map(r => r.schoolCode));
    const totalSchools = uniqueSchools.size;
    
    const participating = records.filter(r => r.participationStatus);
    const participatingSchools = new Set(participating.map(r => r.schoolCode)).size;
    const participationRate = totalSchools > 0 ? (participatingSchools / totalSchools) * 100 : 0;
    
    const withEvidence = records.filter(r => r.evidenceSubmitted);
    const evidenceSchools = new Set(withEvidence.map(r => r.schoolCode)).size;
    const evidenceRate = totalSchools > 0 ? (evidenceSchools / totalSchools) * 100 : 0;
    
    const attendanceRates = records.map(r => r.attendancePercentage);
    const attendanceRate = attendanceRates.length > 0 
      ? attendanceRates.reduce((a, b) => a + b, 0) / attendanceRates.length 
      : 0;
    
    const riskStatus = classifyRisk(participationRate);
    
    rankings.push({
      name,
      type: level,
      participationRate: Math.round(participationRate * 100) / 100,
      evidenceRate: Math.round(evidenceRate * 100) / 100,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      riskStatus,
      needsAttention: participationRate < 60 || attendanceRate < 60,
    });
  }
  
  // Sort by participation rate descending
  return rankings.sort((a, b) => b.participationRate - a.participationRate);
}

export function getHighLowPerformers(
  rankings: PerformanceRanking[]
): { high: PerformanceRanking[]; low: PerformanceRanking[]; needsAttention: PerformanceRanking[] } {
  const sorted = [...rankings].sort((a, b) => b.participationRate - a.participationRate);
  const quartile = Math.max(1, Math.ceil(sorted.length * 0.25));
  
  return {
    high: sorted.slice(0, quartile),
    low: sorted.slice(-quartile),
    needsAttention: sorted.filter(r => r.needsAttention),
  };
}