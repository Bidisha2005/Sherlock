// src/components/grant-report/NarrativeSection.tsx

import React, { useState } from 'react';
import { Copy, Check, FileText, ExternalLink } from 'lucide-react';

interface NarrativeSectionProps {
  narrative: {
    executiveSummary: string;
    progressHighlights: string;
    challenges: string;
    milestoneAchievements: string;
    evidenceSummary: string;
    financialStatus: string;
    recommendations: string[];
  };
  sources?: Array<{
    fact: string;
    sourceFile: string;
    sourceRow: string;
    metricUsed: string;
  }>;
  onCopy?: () => void;
  onExport?: () => void;
}

export function NarrativeSection({ 
  narrative, 
  sources = [], 
  onCopy, 
  onExport 
}: NarrativeSectionProps) {
  const [showSources, setShowSources] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'details' | 'sources'>('summary');

  if (!narrative) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No narrative generated yet</p>
        <p className="text-sm text-gray-400">Select a grant and month to generate a report</p>
      </div>
    );
  }

  const handleCopy = async () => {
    const text = `
GRANT REPORT NARRATIVE
=====================

EXECUTIVE SUMMARY
${narrative.executiveSummary}

PROGRESS HIGHLIGHTS
${narrative.progressHighlights}

MILESTONE ACHIEVEMENTS
${narrative.milestoneAchievements}

CHALLENGES & RISKS
${narrative.challenges}

EVIDENCE SUMMARY
${narrative.evidenceSummary}

FINANCIAL STATUS
${narrative.financialStatus}

RECOMMENDATIONS
${narrative.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}
    `.trim();

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (onCopy) onCopy();
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const renderSummaryTab = () => (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r">
        <h4 className="text-sm font-semibold text-blue-700 uppercase tracking-wider mb-2">
          Executive Summary
        </h4>
        <p className="text-gray-800 leading-relaxed">{narrative.executiveSummary}</p>
      </div>

      {/* Progress Highlights */}
      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r">
        <h4 className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-2">
          Progress Highlights
        </h4>
        <p className="text-gray-800 leading-relaxed">{narrative.progressHighlights}</p>
      </div>

      {/* Financial Status */}
      <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r">
        <h4 className="text-sm font-semibold text-purple-700 uppercase tracking-wider mb-2">
          Financial Status
        </h4>
        <pre className="text-gray-800 leading-relaxed whitespace-pre-wrap font-sans">
          {narrative.financialStatus}
        </pre>
      </div>
    </div>
  );

  const renderDetailsTab = () => (
    <div className="space-y-6">
      {/* Milestone Achievements */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
          Milestone Achievements
        </h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <pre className="text-gray-800 leading-relaxed whitespace-pre-wrap font-sans">
            {narrative.milestoneAchievements}
          </pre>
        </div>
      </div>

      {/* Challenges */}
      {narrative.challenges && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
            Challenges & Risks
          </h4>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <pre className="text-gray-800 leading-relaxed whitespace-pre-wrap font-sans">
              {narrative.challenges}
            </pre>
          </div>
        </div>
      )}

      {/* Evidence Summary */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
          Evidence Summary
        </h4>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-800 leading-relaxed">{narrative.evidenceSummary}</p>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
          Recommendations
        </h4>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <ul className="space-y-2">
            {narrative.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start space-x-3">
                <span className="font-bold text-yellow-700 mt-0.5">{index + 1}.</span>
                <span className="text-gray-800">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  const renderSourcesTab = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
          Source Facts ({sources.length})
        </h4>
        <span className="text-xs text-gray-500">All facts are traceable to source data</span>
      </div>

      {sources.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p>No source facts available</p>
          <p className="text-sm text-gray-400">Generate a report to see traceability</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {sources.map((source, index) => (
            <div 
              key={index} 
              className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium text-blue-600">
                  Fact #{index + 1}
                </span>
                <span className="text-xs text-gray-400">
                  {source.sourceFile}
                </span>
              </div>
              <p className="text-gray-800 text-sm font-medium mb-2">
                "{source.fact}"
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  Row: {source.sourceRow}
                </span>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                  Metric: {source.metricUsed}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Generated Narrative</h3>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {sources.length} sources
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
          
          {onExport && (
            <button
              onClick={onExport}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-1 px-6">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'summary'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Summary View
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Detailed View
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'sources'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Source Traceability
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'summary' && renderSummaryTab()}
        {activeTab === 'details' && renderDetailsTab()}
        {activeTab === 'sources' && renderSourcesTab()}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
        <span>Generated from computed facts • All data is synthetic and for assessment use only</span>
        <span>{new Date().toLocaleString()}</span>
      </div>
    </div>
  );
}