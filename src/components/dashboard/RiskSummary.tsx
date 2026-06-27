// src/components/dashboard/RiskSummary.tsx

import React from 'react';
import { RiskStatus } from '@/types';
import { getRiskColor, getRiskEmoji } from '@/lib/calculations/risk';

interface RiskSummaryProps {
  metrics: {
    participationRate: number;
    averageAttendanceRate: number;
    evidenceSubmissionRate: number;
    monthOverMonth: {
      participation: number;
      attendance: number;
      evidence: number;
    };
  };
}

export function RiskSummary({ metrics }: RiskSummaryProps) {
  const riskItems = [
    {
      label: 'Participation Rate',
      value: metrics.participationRate,
      trend: metrics.monthOverMonth.participation,
    },
    {
      label: 'Attendance Rate',
      value: metrics.averageAttendanceRate,
      trend: metrics.monthOverMonth.attendance,
    },
    {
      label: 'Evidence Rate',
      value: metrics.evidenceSubmissionRate,
      trend: metrics.monthOverMonth.evidence,
    },
  ];

  const getRiskStatus = (value: number): RiskStatus => {
    if (value >= 75) return 'On Track';
    if (value >= 60) return 'Behind';
    if (value >= 35) return 'At Risk';
    return 'Critical';
  };

  const getStatusMessage = (status: RiskStatus) => {
    const messages = {
      'On Track': 'Meeting expectations. Continue current approach.',
      'Behind': 'Below target. Consider targeted interventions.',
      'At Risk': 'Requires immediate attention. Investigate root causes.',
      'Critical': 'Critically low. Urgent action required.',
    };
    return messages[status];
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Risk Summary</h3>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {riskItems.map((item) => {
            const status = getRiskStatus(item.value);
            const color = getRiskColor(status);
            const emoji = getRiskEmoji(status);
            
            return (
              <div
                key={item.label}
                className="p-4 rounded-lg border-2"
                style={{ borderColor: color + '40' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">{item.label}</span>
                  <span className="text-2xl">{emoji}</span>
                </div>
                
                <div className="flex items-baseline space-x-2 mb-2">
                  <span className="text-3xl font-bold" style={{ color }}>
                    {item.value}%
                  </span>
                  <span
                    className={`text-sm ${
                      item.trend >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {item.trend >= 0 ? '↑' : '↓'} {Math.abs(item.trend)}%
                  </span>
                </div>
                
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(item.value, 100)}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span
                    className="text-sm font-medium px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: color + '20',
                      color: color,
                    }}
                  >
                    {status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {getStatusMessage(status)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Overall Risk Score */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">Overall Assessment</h4>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      (metrics.participationRate +
                        metrics.averageAttendanceRate +
                        metrics.evidenceSubmissionRate) /
                        3,
                      100
                    )}%`,
                    backgroundColor: getRiskColor(
                      getRiskStatus(
                        (metrics.participationRate +
                          metrics.averageAttendanceRate +
                          metrics.evidenceSubmissionRate) /
                          3
                      )
                    ),
                  }}
                />
              </div>
            </div>
            <span className="font-bold">
              {Math.round(
                (metrics.participationRate +
                  metrics.averageAttendanceRate +
                  metrics.evidenceSubmissionRate) /
                  3
              )}
              %
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {getStatusMessage(
              getRiskStatus(
                (metrics.participationRate +
                  metrics.averageAttendanceRate +
                  metrics.evidenceSubmissionRate) /
                  3
              )
            )}
          </p>
        </div>
      </div>
    </div>
  );
}