// src/app/api/dashboard/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, query } from '@/lib/db';
import { normalizePBLSchoolRecord } from '@/lib/data/normalize';
import { calculateDashboardMetrics, getPerformanceRankings, getHighLowPerformers } from '@/lib/calculations/metrics';
import { getUniqueDistricts, getUniqueBlocks, getUniqueGrades, getUniqueSubjects } from '@/lib/calculations/metrics';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      month: searchParams.get('month') || undefined,
      district: searchParams.get('district') || undefined,
      block: searchParams.get('block') || undefined,
      grade: searchParams.get('grade') || undefined,
      subject: searchParams.get('subject') || undefined,
    };

    // Get all PBL data from database
    const db = getDatabase();
    const rows = query('SELECT * FROM pbl_school_data');
    
    // Normalize data
    const pblData = rows.map(row => normalizePBLSchoolRecord(row));
    
    // Calculate metrics
    const metrics = calculateDashboardMetrics(pblData, filters);
    
    // Get performance rankings
    const districtRankings = getPerformanceRankings(pblData, filters, 'district');
    const blockRankings = getPerformanceRankings(pblData, filters, 'block');
    
    const districtPerformance = getHighLowPerformers(districtRankings);
    const blockPerformance = getHighLowPerformers(blockRankings);
    
    // Get filter options
    const districts = getUniqueDistricts(pblData);
    const blocks = getUniqueBlocks(pblData);
    const grades = getUniqueGrades(pblData);
    const subjects = getUniqueSubjects(pblData);
    
    return NextResponse.json({
      success: true,
      data: {
        metrics,
        districtPerformance,
        blockPerformance,
        filters: {
          available: {
            months: ['July 2025', 'August 2025', 'September 2025'],
            districts,
            blocks,
            grades,
            subjects,
          },
          selected: filters,
        },
      },
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}