// src/lib/calculations/metrics.ts

import { PBLSchoolRecord, DashboardMetrics, Filters, Month } from '@/types';

export function applyFilters(data: PBLSchoolRecord[], filters: Filters): PBLSchoolRecord[] {
  return data.filter(record => {
    if (filters.month && record.reportingMonth !== filters.month) return false;
    if (filters.district && record.district !== filters.district) return false;
    if (filters.block && record.block !== filters.block) return false;
    if (filters.grade && !record.gradesImplemented.includes(filters.grade)) return false;
    if (filters.subject && !record.subjectsImplemented.includes(filters.subject)) return false;
    return true;
  });
}

export function calculateDashboardMetrics(
  data: PBLSchoolRecord[], 
  filters: Filters
): DashboardMetrics {
  const filtered = applyFilters(data, filters);
  
  if (filtered.length === 0) {
    return {
      totalSchools: 0,
      participatingSchools: 0,
      participationRate: 0,
      evidenceSubmissionRate: 0,
      totalEnrollment: 0,
      totalAttendance: 0,
      averageAttendanceRate: 0,
      monthOverMonth: {
        participation: 0,
        attendance: 0,
        enrollment: 0,
        evidence: 0,
      },
    };
  }

  // Get unique schools
  const uniqueSchools = new Set(filtered.map(d => d.schoolCode));
  const totalSchools = uniqueSchools.size;

  // Participation
  const participating = filtered.filter(d => d.participationStatus);
  const participatingSchools = new Set(participating.map(d => d.schoolCode)).size;
  const participationRate = totalSchools > 0 ? (participatingSchools / totalSchools) * 100 : 0;

  // Evidence
  const withEvidence = filtered.filter(d => d.evidenceSubmitted);
  const evidenceSchools = new Set(withEvidence.map(d => d.schoolCode)).size;
  const evidenceRate = totalSchools > 0 ? (evidenceSchools / totalSchools) * 100 : 0;

  // Enrollment & Attendance
  const totalEnrollment = filtered.reduce((sum, d) => sum + d.totalEnrollment, 0);
  const totalAttendance = filtered.reduce((sum, d) => sum + d.totalAttendance, 0);
  const attendanceRates = filtered.map(d => d.attendancePercentage);
  const averageAttendance = attendanceRates.length > 0 
    ? attendanceRates.reduce((a, b) => a + b, 0) / attendanceRates.length 
    : 0;

  // Month-over-Month calculations
  const currentMonth = filters.month;
  const previousMonth = getPreviousMonth(currentMonth);
  
  const currentData = filtered.filter(d => d.reportingMonth === currentMonth);
  const prevData = data.filter(d => d.reportingMonth === previousMonth);
  
  // Get unique schools for current and previous months
  const currentSchools = new Set(currentData.map(d => d.schoolCode));
  const prevSchools = new Set(prevData.map(d => d.schoolCode));
  
  // Find common schools for MoM comparison
  const commonSchools = new Set([...currentSchools].filter(s => prevSchools.has(s)));
  
  let participationMoM = 0;
  let attendanceMoM = 0;
  let enrollmentMoM = 0;
  let evidenceMoM = 0;
  
  if (commonSchools.size > 0) {
    const currentParticipants = currentData.filter(d => commonSchools.has(d.schoolCode) && d.participationStatus);
    const prevParticipants = prevData.filter(d => commonSchools.has(d.schoolCode) && d.participationStatus);
    
    const currentPartRate = (currentParticipants.length / commonSchools.size) * 100;
    const prevPartRate = (prevParticipants.length / commonSchools.size) * 100;
    participationMoM = prevPartRate > 0 ? ((currentPartRate - prevPartRate) / prevPartRate) * 100 : 0;
    
    const currentAvgAtt = currentData.filter(d => commonSchools.has(d.schoolCode))
      .reduce((sum, d) => sum + d.attendancePercentage, 0) / commonSchools.size;
    const prevAvgAtt = prevData.filter(d => commonSchools.has(d.schoolCode))
      .reduce((sum, d) => sum + d.attendancePercentage, 0) / commonSchools.size;
    attendanceMoM = prevAvgAtt > 0 ? ((currentAvgAtt - prevAvgAtt) / prevAvgAtt) * 100 : 0;
    
    const currentEnroll = currentData.filter(d => commonSchools.has(d.schoolCode))
      .reduce((sum, d) => sum + d.totalEnrollment, 0);
    const prevEnroll = prevData.filter(d => commonSchools.has(d.schoolCode))
      .reduce((sum, d) => sum + d.totalEnrollment, 0);
    enrollmentMoM = prevEnroll > 0 ? ((currentEnroll - prevEnroll) / prevEnroll) * 100 : 0;
    
    const currentEvidence = currentData.filter(d => commonSchools.has(d.schoolCode) && d.evidenceSubmitted).length;
    const prevEvidence = prevData.filter(d => commonSchools.has(d.schoolCode) && d.evidenceSubmitted).length;
    evidenceMoM = prevEvidence > 0 ? ((currentEvidence - prevEvidence) / prevEvidence) * 100 : 0;
  }

  return {
    totalSchools,
    participatingSchools,
    participationRate: Math.round(participationRate * 100) / 100,
    evidenceSubmissionRate: Math.round(evidenceRate * 100) / 100,
    totalEnrollment,
    totalAttendance,
    averageAttendanceRate: Math.round(averageAttendance * 100) / 100,
    monthOverMonth: {
      participation: Math.round(participationMoM * 100) / 100,
      attendance: Math.round(attendanceMoM * 100) / 100,
      enrollment: Math.round(enrollmentMoM * 100) / 100,
      evidence: Math.round(evidenceMoM * 100) / 100,
    },
  };
}

function getPreviousMonth(currentMonth?: Month): Month | undefined {
  if (!currentMonth) return undefined;
  const months: Month[] = ['July 2025', 'August 2025', 'September 2025'];
  const index = months.indexOf(currentMonth);
  return index > 0 ? months[index - 1] : undefined;
}

export function getUniqueDistricts(data: PBLSchoolRecord[]): string[] {
  return [...new Set(data.map(d => d.district))].filter(d => d);
}

export function getUniqueBlocks(data: PBLSchoolRecord[]): string[] {
  return [...new Set(data.map(d => d.block))].filter(d => d);
}

export function getUniqueGrades(data: PBLSchoolRecord[]): string[] {
  const allGrades = data.flatMap(d => d.gradesImplemented);
  return [...new Set(allGrades)].filter(d => d);
}

export function getUniqueSubjects(data: PBLSchoolRecord[]): string[] {
  const allSubjects = data.flatMap(d => d.subjectsImplemented);
  return [...new Set(allSubjects)].filter(d => d);
}