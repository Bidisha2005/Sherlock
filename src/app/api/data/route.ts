// src/app/api/data/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    
    let data = [];
    
    switch (type) {
      case 'grants':
        data = query('SELECT * FROM grant_profiles');
        break;
      case 'performance':
        data = query('SELECT * FROM grant_performance');
        break;
      case 'evidence':
        data = query('SELECT * FROM grant_evidence');
        break;
      case 'pbl':
      default:
        data = query('SELECT * FROM pbl_school_data');
        break;
    }
    
    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error) {
    console.error('Data API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}