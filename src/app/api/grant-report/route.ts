// src/app/api/grant-report/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, query, queryOne } from '@/lib/db';
import { normalizeGrantProfile, normalizeGrantPerformance, normalizeGrantEvidence } from '@/lib/data/normalize';
import { assembleGrantReport } from '@/lib/calculations/grantReport';
import { generateNarrative } from '@/lib/ai/narrative';
import { PBLSchoolRecord } from '@/types';
import { normalizePBLSchoolRecord } from '@/lib/data/normalize';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const grantLabel = searchParams.get('grantLabel');
    const month = searchParams.get('month');

    if (!grantLabel || !month) {
      return NextResponse.json(
        { success: false, error: 'Grant label and month are required' },
        { status: 400 }
      );
    }

    // Get grant profile
    const profileRow = queryOne(
      'SELECT * FROM grant_profiles WHERE grantLabel = ?',
      [grantLabel]
    );
    
    if (!profileRow) {
      return NextResponse.json(
        { success: false, error: 'Grant not found' },
        { status: 404 }
      );
    }
    
    const grantProfile = normalizeGrantProfile(profileRow);

    // Get grant performance
    const performanceRows = query(
      'SELECT * FROM grant_performance WHERE grantLabel = ? AND reportingMonth = ?',
      [grantLabel, month]
    );
    const grantPerformance = performanceRows.map(normalizeGrantPerformance);

    // Get grant evidence
    const evidenceRows = query(
      'SELECT * FROM grant_evidence WHERE grantLabel = ? AND reportingMonth = ?',
      [grantLabel, month]
    );
    const grantEvidence = evidenceRows.map(normalizeGrantEvidence);

    // Get PBL data for the grant's geography
    const pblRows = query('SELECT * FROM pbl_school_data');
    const pblData = pblRows.map(normalizePBLSchoolRecord);

    // Assemble report
    let report = assembleGrantReport(
      pblData,
      grantProfile,
      grantPerformance,
      grantEvidence,
      month
    );

    // Generate narrative
    report = generateNarrative(report);

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Grant report API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate grant report' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { grantLabel, month, includeAI } = body;

    if (!grantLabel || !month) {
      return NextResponse.json(
        { success: false, error: 'Grant label and month are required' },
        { status: 400 }
      );
    }

    // Same logic as GET but with optional AI enhancement
    const profileRow = queryOne(
      'SELECT * FROM grant_profiles WHERE grantLabel = ?',
      [grantLabel]
    );
    
    if (!profileRow) {
      return NextResponse.json(
        { success: false, error: 'Grant not found' },
        { status: 404 }
      );
    }
    
    const grantProfile = normalizeGrantProfile(profileRow);

    const performanceRows = query(
      'SELECT * FROM grant_performance WHERE grantLabel = ? AND reportingMonth = ?',
      [grantLabel, month]
    );
    const grantPerformance = performanceRows.map(normalizeGrantPerformance);

    const evidenceRows = query(
      'SELECT * FROM grant_evidence WHERE grantLabel = ? AND reportingMonth = ?',
      [grantLabel, month]
    );
    const grantEvidence = evidenceRows.map(normalizeGrantEvidence);

    const pblRows = query('SELECT * FROM pbl_school_data');
    const pblData = pblRows.map(normalizePBLSchoolRecord);

    let report = assembleGrantReport(
      pblData,
      grantProfile,
      grantPerformance,
      grantEvidence,
      month
    );

    report = generateNarrative(report);

    // If AI enhancement is requested, you would call an AI service here
    // For now, we'll just add a note
    if (includeAI) {
      // This is where you'd integrate with OpenAI or another AI service
      // For the demo, we'll just add a note
      report.narrative.executiveSummary += ' (AI-enhanced)';
    }

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Grant report generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate grant report' },
      { status: 500 }
    );
  }
}