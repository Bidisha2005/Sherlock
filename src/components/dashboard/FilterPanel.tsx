// src/components/dashboard/FilterPanel.tsx

import React from 'react';

interface FilterPanelProps {
  filters: {
    month: string;
    district: string;
    block: string;
    grade: string;
    subject: string;
  };
  availableFilters: {
    months: string[];
    districts: string[];
    blocks: string[];
    grades: string[];
    subjects: string[];
  };
  onFilterChange: (filters: any) => void;
}

export function FilterPanel({ filters, availableFilters, onFilterChange }: FilterPanelProps) {
  const handleChange = (key: string, value: string) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  const FilterSelect = ({ 
    label, 
    value, 
    options, 
    onChange 
  }: { 
    label: string; 
    value: string; 
    options: string[]; 
    onChange: (value: string) => void;
  }) => (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">All {label}s</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <FilterSelect
          label="Month"
          value={filters.month}
          options={availableFilters.months}
          onChange={(value) => handleChange('month', value)}
        />
        <FilterSelect
          label="District"
          value={filters.district}
          options={availableFilters.districts}
          onChange={(value) => handleChange('district', value)}
        />
        <FilterSelect
          label="Block"
          value={filters.block}
          options={availableFilters.blocks}
          onChange={(value) => handleChange('block', value)}
        />
        <FilterSelect
          label="Grade"
          value={filters.grade}
          options={availableFilters.grades}
          onChange={(value) => handleChange('grade', value)}
        />
        <FilterSelect
          label="Subject"
          value={filters.subject}
          options={availableFilters.subjects}
          onChange={(value) => handleChange('subject', value)}
        />
      </div>
    </div>
  );
}