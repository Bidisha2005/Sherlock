// src/components/grant-report/GrantSelector.tsx

import React from 'react';

interface GrantSelectorProps {
  grants: Array<{ label: string; donor: string }>;
  selectedGrant: string;
  selectedMonth: string;
  availableMonths: string[];
  onGrantChange: (grant: string) => void;
  onMonthChange: (month: string) => void;
  onGenerate: () => void;
  loading: boolean;
}

export function GrantSelector({
  grants,
  selectedGrant,
  selectedMonth,
  availableMonths,
  onGrantChange,
  onMonthChange,
  onGenerate,
  loading,
}: GrantSelectorProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Generate Grant Report</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Grant
          </label>
          <select
            value={selectedGrant}
            onChange={(e) => onGrantChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a grant...</option>
            {grants.map((grant) => (
              <option key={grant.label} value={grant.label}>
                {grant.label} ({grant.donor})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reporting Month
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!selectedGrant}
          >
            <option value="">Select month...</option>
            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-end">
          <button
            onClick={onGenerate}
            disabled={!selectedGrant || !selectedMonth || loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>
    </div>
  );
}