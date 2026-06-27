// src/app/dashboard/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { FilterPanel } from '@/components/dashboard/FilterPanel';
import { KPICards } from '@/components/dashboard/KPICards';
import { PerformanceRankings } from '@/components/dashboard/PerformanceRankings';
import { RiskSummary } from '@/components/dashboard/RiskSummary';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface DashboardData {
  metrics: any;
  districtPerformance: any;
  blockPerformance: any;
  filters: any;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [filters, setFilters] = useState({
    month: '',
    district: '',
    block: '',
    grade: '',
    subject: '',
  });

  const fetchDashboardData = async (currentFilters: typeof filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await fetch(`/api/dashboard?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        console.error('Failed to fetch dashboard data:', result.error);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(filters);
  }, []);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    fetchDashboardData(newFilters);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Program Intelligence Dashboard</h1>
      
      <FilterPanel
        filters={filters}
        availableFilters={data.filters.available}
        onFilterChange={handleFilterChange}
      />
      
      <div className="mt-6">
        <KPICards metrics={data.metrics} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <PerformanceRankings
          title="District Performance"
          rankings={data.districtPerformance}
          type="district"
        />
        <PerformanceRankings
          title="Block Performance"
          rankings={data.blockPerformance}
          type="block"
        />
      </div>
      
      <div className="mt-6">
        <RiskSummary metrics={data.metrics} />
      </div>
    </div>
  );
}