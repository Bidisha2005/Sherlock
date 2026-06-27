// src/app/grant-report/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { GrantSelector } from '@/components/grant-report/GrantSelector';
import { FactPanel } from '@/components/grant-report/FactPanel';
import { EvidenceGallery } from '@/components/grant-report/EvidenceGallery';
import { NarrativeSection } from '@/components/grant-report/NarrativeSection';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function GrantReportPage() {
  const [grants, setGrants] = useState<Array<{ label: string; donor: string }>>([]);
  const [selectedGrant, setSelectedGrant] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [availableMonths] = useState(['July 2025', 'August 2025', 'September 2025']);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load grants
    fetch('/api/data?type=grants')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setGrants(data.data.map((g: any) => ({
            label: g.grantLabel,
            donor: g.donorOrganization,
          })));
        }
      })
      .catch(err => console.error('Failed to load grants:', err));
  }, []);

  const generateReport = async () => {
    if (!selectedGrant || !selectedMonth) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/grant-report?grantLabel=${encodeURIComponent(selectedGrant)}&month=${encodeURIComponent(selectedMonth)}`
      );
      const data = await response.json();
      
      if (data.success) {
        setReport(data.data);
      } else {
        setError(data.error || 'Failed to generate report');
      }
    } catch (err) {
      setError('An error occurred while generating the report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Grant Reporting Assistant</h1>
      
      <GrantSelector
        grants={grants}
        selectedGrant={selectedGrant}
        selectedMonth={selectedMonth}
        availableMonths={availableMonths}
        onGrantChange={setSelectedGrant}
        onMonthChange={setSelectedMonth}
        onGenerate={generateReport}
        loading={loading}
      />
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      
      {loading && (
        <div className="mt-8">
          <LoadingSpinner message="Generating report..." />
        </div>
      )}
      
      {report && !loading && (
        <div className="mt-8 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              Report for <strong>{report.grantLabel}</strong> - {report.reportingMonth}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Generated at: {new Date(report.generatedAt).toLocaleString()}
            </p>
          </div>
          
          <FactPanel report={report} />
          
          <EvidenceGallery evidence={report.evidence} />
          
          <NarrativeSection
            narrative={report.narrative}
            sources={report.sources}
          />
        </div>
      )}
    </div>
  );
}