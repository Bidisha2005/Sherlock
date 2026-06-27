// src/components/dashboard/KPICards.tsx

import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface KPICardsProps {
  metrics: {
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
  };
}

export function KPICards({ metrics }: KPICardsProps) {
  const KPI_CARDS = [
    {
      title: 'Total Schools',
      value: metrics.totalSchools,
      change: null,
      changeLabel: '',
    },
    {
      title: 'Participation Rate',
      value: `${metrics.participationRate}%`,
      change: metrics.monthOverMonth.participation,
      changeLabel: 'vs last month',
    },
    {
      title: 'Evidence Rate',
      value: `${metrics.evidenceSubmissionRate}%`,
      change: metrics.monthOverMonth.evidence,
      changeLabel: 'vs last month',
    },
    {
      title: 'Attendance Rate',
      value: `${metrics.averageAttendanceRate}%`,
      change: metrics.monthOverMonth.attendance,
      changeLabel: 'vs last month',
    },
    {
      title: 'Total Enrollment',
      value: metrics.totalEnrollment.toLocaleString(),
      change: metrics.monthOverMonth.enrollment,
      changeLabel: 'vs last month',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {KPI_CARDS.map((card, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
            {card.change !== null && (
              <span className={`ml-2 text-sm ${card.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {card.change >= 0 ? (
                  <ArrowUp className="inline h-4 w-4" />
                ) : (
                  <ArrowDown className="inline h-4 w-4" />
                )}
                {Math.abs(card.change)}%
              </span>
            )}
          </div>
          {card.changeLabel && (
            <p className="mt-1 text-xs text-gray-500">{card.changeLabel}</p>
          )}
        </div>
      ))}
    </div>
  );
}