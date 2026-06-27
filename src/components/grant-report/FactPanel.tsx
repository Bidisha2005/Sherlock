// src/components/grant-report/FactPanel.tsx

import React from 'react';

interface FactPanelProps {
  report: any;
}

export function FactPanel({ report }: FactPanelProps) {
  if (!report) return null;

  const { performance, milestones, financial, risks, evidence } = report;

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Schools Reached</p>
            <p className="text-2xl font-bold">{performance.schoolsReached}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Participation Rate</p>
            <p className="text-2xl font-bold">{performance.participationRate}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Attendance Rate</p>
            <p className="text-2xl font-bold">{performance.attendanceRate}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Evidence Rate</p>
            <p className="text-2xl font-bold">{performance.evidenceRate}%</p>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Milestone Progress</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold">{milestones.total}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-600">{milestones.completed}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">On Track</p>
            <p className="text-2xl font-bold text-blue-600">{milestones.onTrack}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Delayed/At Risk</p>
            <p className="text-2xl font-bold text-red-600">{milestones.delayed}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Completion Rate</p>
            <p className="text-2xl font-bold">{milestones.completionRate}%</p>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-green-500 transition-all duration-500"
            style={{ width: `${Math.min(milestones.completionRate, 100)}%` }}
          />
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Budget</p>
            <p className="text-2xl font-bold">₹{financial.totalBudget.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Utilized</p>
            <p className="text-2xl font-bold">₹{financial.utilized.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Utilization Rate</p>
            <p className="text-2xl font-bold">{financial.utilizationRate}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Remaining</p>
            <p className="text-2xl font-bold">₹{financial.remainingBudget.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: `${Math.min(financial.utilizationRate, 100)}%` }}
          />
        </div>
      </div>

      {/* Risks */}
      {risks.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <h3 className="text-lg font-semibold mb-4 text-red-700">⚠️ Risks & Challenges</h3>
          <ul className="space-y-2">
            {risks.map((risk: any, index: number) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-red-500 mt-1">•</span>
                <div>
                  <span className="font-medium">{risk.type}:</span>
                  <span className="text-gray-700 ml-2">{risk.description}</span>
                  <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                    risk.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                    risk.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {risk.severity}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Evidence Summary */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Evidence Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Assets</p>
            <p className="text-2xl font-bold">{evidence.totalAssets}</p>
          </div>
          {Object.entries(evidence.byType).map(([type, count]) => (
            <div key={type}>
              <p className="text-sm text-gray-500">{type}s</p>
              <p className="text-2xl font-bold">{count as number}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}