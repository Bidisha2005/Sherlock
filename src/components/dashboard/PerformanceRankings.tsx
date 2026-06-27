// src/components/dashboard/PerformanceRankings.tsx

import React from 'react';
import { PerformanceRanking } from '@/types';
import { getRiskColor, getRiskEmoji } from '@/lib/calculations/risk';

interface PerformanceRankingsProps {
  title: string;
  rankings: {
    high: PerformanceRanking[];
    low: PerformanceRanking[];
    needsAttention: PerformanceRanking[];
  };
  type: 'district' | 'block';
}

export function PerformanceRankings({ title, rankings, type }: PerformanceRankingsProps) {
  const renderRankingItem = (ranking: PerformanceRanking, index: number) => (
    <div
      key={ranking.name}
      className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50"
    >
      <div className="flex items-center space-x-3">
        <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
        <span className="font-medium text-gray-900">{ranking.name}</span>
        <span
          className="text-xs px-2 py-1 rounded-full"
          style={{
            backgroundColor: getRiskColor(ranking.riskStatus) + '20',
            color: getRiskColor(ranking.riskStatus),
          }}
        >
          {getRiskEmoji(ranking.riskStatus)} {ranking.riskStatus}
        </span>
        {ranking.needsAttention && (
          <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
            Needs Attention
          </span>
        )}
      </div>
      <div className="flex items-center space-x-4 text-sm">
        <span className="text-gray-600">
          Part: {ranking.participationRate}%
        </span>
        <span className="text-gray-600">
          Attend: {ranking.attendanceRate}%
        </span>
        <span className="text-gray-600">
          Evidence: {ranking.evidenceRate}%
        </span>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      
      <div className="p-4">
        {/* High Performers */}
        {rankings.high.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-green-600 mb-2">
              🟢 Top Performers
            </h4>
            <div className="bg-green-50 rounded-lg overflow-hidden">
              {rankings.high.map((r, i) => renderRankingItem(r, i))}
            </div>
          </div>
        )}
        
        {/* Needs Attention */}
        {rankings.needsAttention.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-red-600 mb-2">
              🔴 Needs Attention
            </h4>
            <div className="bg-red-50 rounded-lg overflow-hidden">
              {rankings.needsAttention.slice(0, 5).map((r, i) => renderRankingItem(r, i))}
              {rankings.needsAttention.length > 5 && (
                <div className="p-3 text-sm text-gray-500 text-center">
                  +{rankings.needsAttention.length - 5} more need attention
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Low Performers */}
        {rankings.low.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-orange-600 mb-2">
              🟠 Low Performers
            </h4>
            <div className="bg-orange-50 rounded-lg overflow-hidden">
              {rankings.low.map((r, i) => renderRankingItem(r, i))}
            </div>
          </div>
        )}
        
        {rankings.high.length === 0 && rankings.low.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No {type} data available for the selected filters
          </p>
        )}
      </div>
    </div>
  );
}