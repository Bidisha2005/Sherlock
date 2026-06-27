// src/lib/ai/narrative.ts

import { GrantReport } from '@/types';

export function generateNarrative(report: GrantReport): GrantReport {
  const { performance, milestones, financial, risks, evidence } = report;
  
  // Executive Summary
  const executiveSummary = `
    During ${report.reportingMonth}, the ${report.grantLabel} grant reached ${performance.schoolsReached} schools 
    across ${report.profile.coveredDistricts.length} districts, achieving a ${performance.participationRate}% 
    participation rate. ${milestones.completed} out of ${milestones.total} milestones were completed, 
    representing ${milestones.completionRate}% of targets. Financial utilization stands at 
    ${financial.utilizationRate}% of the total budget.
  `.trim();

  // Progress Highlights
  let highlights = [];
  if (performance.participationRate >= 75) {
    highlights.push(`Strong participation rate of ${performance.participationRate}%`);
  }
  if (milestones.completionRate >= 80) {
    highlights.push(`${milestones.completionRate}% milestone completion rate`);
  }
  if (performance.attendanceRate >= 75) {
    highlights.push(`Attendance rate of ${performance.attendanceRate}%`);
  }
  const progressHighlights = highlights.length > 0 
    ? `Key achievements include: ${highlights.join(', ')}.`
    : 'Progress is below expectations in key areas.';

  // Challenges
  let challengesList = risks.map(r => `- ${r.description}`).join('\n');
  const challenges = risks.length > 0 
    ? `The following challenges need attention:\n${challengesList}`
    : 'No major challenges identified.';

  // Milestone Achievements
  const completedMilestones = milestones.details
    .filter(m => m.status === 'Completed')
    .map(m => `- ${m.milestoneName}: ${m.achieved}/${m.target} achieved`)
    .join('\n');
  
  const milestoneAchievements = completedMilestones 
    ? `Completed milestones:\n${completedMilestones}`
    : 'No milestones completed this period.';

  // Evidence Summary
  const evidenceSummary = `
    ${evidence.totalAssets} evidence assets were collected, including ${Object.entries(evidence.byType)
      .map(([type, count]) => `${count} ${type}(s)`)
      .join(', ')}. 
    ${evidence.totalAssets > 0 ? 'These assets provide documentation of program activities and outcomes.' : 'Additional evidence collection is needed.'}
  `.trim();

  // Financial Status
  const financialStatus = `
    Total budget: ₹${financial.totalBudget.toLocaleString()}
    Utilized: ₹${financial.utilized.toLocaleString()} (${financial.utilizationRate}%)
    Remaining: ₹${financial.remainingBudget.toLocaleString()}
    ${financial.utilizationRate > 75 ? 'Budget utilization is on track.' : 'Budget utilization is slower than expected.'}
  `.trim();

  // Recommendations
  const recommendations: string[] = [];
  
  if (performance.participationRate < 60) {
    recommendations.push('Develop targeted outreach strategy for low-participation schools');
  }
  if (risks.some(r => r.type === 'Milestones')) {
    recommendations.push('Review delayed milestones and create action plans for completion');
  }
  if (performance.attendanceRate < 75) {
    recommendations.push('Investigate attendance barriers and implement improvement measures');
  }
  if (evidence.totalAssets < 10) {
    recommendations.push('Increase evidence collection across all program activities');
  }
  if (recommendations.length === 0) {
    recommendations.push('Continue current implementation approach');
    recommendations.push('Plan for scale-up in next reporting period');
  }

  return {
    ...report,
    narrative: {
      executiveSummary,
      progressHighlights,
      challenges,
      milestoneAchievements,
      evidenceSummary,
      financialStatus,
      recommendations,
    },
  };
}

// Optional AI-enhanced narrative (if you have an API key)
export async function enhanceNarrativeWithAI(report: GrantReport): Promise<GrantReport> {
  // This is a placeholder - implement with actual AI if desired
  // For now, use the rule-based version
  return generateNarrative(report);
}