// scripts/seed.ts

import fs from 'fs';
import path from 'path';
import { getDatabase, execute, query } from '../src/lib/db';
import { parseCSV } from '../src/lib/data/loadCSV';
import {
  normalizePBLSchoolRecord,
  normalizeGrantProfile,
  normalizeGrantPerformance,
  normalizeGrantEvidence,
} from '../src/lib/data/normalize';

async function seedDatabase() {
  console.log('🌱 Starting database seed...');
  console.log('📂 Current directory:', process.cwd());
  
  const db = getDatabase();
  
  // Clear existing data
  console.log('🧹 Clearing existing data...');
  try {
    execute('DELETE FROM pbl_school_data');
    execute('DELETE FROM grant_evidence');
    execute('DELETE FROM grant_performance');
    execute('DELETE FROM grant_profiles');
    console.log('✅ Existing data cleared');
  } catch (error) {
    console.log('⚠️ No existing data to clear (or tables don\'t exist yet)');
  }
  
  // Load and insert PBL data
  console.log('📊 Loading PBL data...');
  const pblFiles = [
    'PBL_School_Response_Data_July_2025.csv',
    'PBL_School_Response_Data_August_2025.csv',
    'PBL_School_Response_Data_September_2025.csv',
  ];
  
  let totalPBLRecords = 0;
  
  for (const file of pblFiles) {
    const filePath = path.join(process.cwd(), 'data', 'csv', file);
    if (fs.existsSync(filePath)) {
      console.log(`  📄 Reading ${file}...`);
      const rows = parseCSV(filePath);
      const month = file.replace('PBL_School_Response_Data_', '').replace('.csv', '').replace('_', ' ');
      
      for (const row of rows) {
        try {
          const normalized = normalizePBLSchoolRecord({
            ...row,
            reportingMonth: month,
          });
          
          if (!normalized.schoolCode) {
            console.warn('  ⚠️ Skipping row without school code');
            continue;
          }
          
          execute(
            `INSERT INTO pbl_school_data (
              schoolCode, schoolName, district, block, cluster, reportingMonth,
              participationStatus, completionPercentage, evidenceSubmitted,
              evidenceType, gradesImplemented, subjectsImplemented,
              totalEnrollment, totalAttendance, attendancePercentage,
              riskStatus, responseData, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              normalized.schoolCode,
              normalized.schoolName || '',
              normalized.district || '',
              normalized.block || '',
              normalized.cluster || '',
              normalized.reportingMonth,
              normalized.participationStatus ? 1 : 0,
              normalized.completionPercentage || 0,
              normalized.evidenceSubmitted ? 1 : 0,
              JSON.stringify(normalized.evidenceType || []),
              JSON.stringify(normalized.gradesImplemented || []),
              JSON.stringify(normalized.subjectsImplemented || []),
              normalized.totalEnrollment || 0,
              normalized.totalAttendance || 0,
              normalized.attendancePercentage || 0,
              normalized.riskStatus || 'On Track',
              JSON.stringify(normalized.responseData || {}),
              normalized.createdAt || new Date().toISOString(),
            ]
          );
          totalPBLRecords++;
        } catch (error) {
          console.error(`  ❌ Error inserting row:`, error);
        }
      }
      console.log(`  ✅ Loaded ${rows.length} records from ${file}`);
    } else {
      console.warn(`  ⚠️ File not found: ${filePath}`);
    }
  }
  console.log(`✅ Total PBL records inserted: ${totalPBLRecords}`);
  
  // Load grant profiles
  console.log('📋 Loading grant profiles...');
  const profilePath = path.join(process.cwd(), 'data', 'csv', '01_Grant_Profile_and_Finance.csv');
  if (fs.existsSync(profilePath)) {
    const rows = parseCSV(profilePath);
    for (const row of rows) {
      try {
        const normalized = normalizeGrantProfile(row);
        if (!normalized.grantLabel) {
          console.warn('  ⚠️ Skipping grant without label');
          continue;
        }
        
        execute(
          `INSERT OR REPLACE INTO grant_profiles (
            grantLabel, donorOrganization, coveredDistricts, coveredBlocks,
            startDate, endDate, totalBudget, utilizedAmount,
            utilizationPercentage, strategicObjectives, focusAreas
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            normalized.grantLabel,
            normalized.donorOrganization || '',
            JSON.stringify(normalized.coveredDistricts || []),
            JSON.stringify(normalized.coveredBlocks || []),
            normalized.startDate || '',
            normalized.endDate || '',
            normalized.totalBudget || 0,
            normalized.utilizedAmount || 0,
            normalized.utilizationPercentage || 0,
            JSON.stringify(normalized.strategicObjectives || []),
            JSON.stringify(normalized.focusAreas || []),
          ]
        );
      } catch (error) {
        console.error('  ❌ Error inserting grant profile:', error);
      }
    }
    console.log(`✅ Loaded ${rows.length} grant profiles`);
  } else {
    console.warn(`⚠️ File not found: ${profilePath}`);
  }
  
  // Load grant performance
  console.log('📈 Loading grant performance...');
  const perfPath = path.join(process.cwd(), 'data', 'csv', '02_Grant_Performance_and_Report_Material.csv');
  if (fs.existsSync(perfPath)) {
    const rows = parseCSV(perfPath);
    for (const row of rows) {
      try {
        const normalized = normalizeGrantPerformance(row);
        if (!normalized.grantLabel || !normalized.milestoneId) {
          console.warn('  ⚠️ Skipping performance row without grant or milestone');
          continue;
        }
        
        execute(
          `INSERT INTO grant_performance (
            grantLabel, reportingMonth, milestoneId, milestoneName,
            target, achieved, status, completionPercentage,
            comments, risks, nextSteps
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            normalized.grantLabel,
            normalized.reportingMonth || '',
            normalized.milestoneId,
            normalized.milestoneName || '',
            normalized.target || 0,
            normalized.achieved || 0,
            normalized.status || 'On Track',
            normalized.completionPercentage || 0,
            normalized.comments || '',
            JSON.stringify(normalized.risks || []),
            JSON.stringify(normalized.nextSteps || []),
          ]
        );
      } catch (error) {
        console.error('  ❌ Error inserting performance record:', error);
      }
    }
    console.log(`✅ Loaded ${rows.length} performance records`);
  } else {
    console.warn(`⚠️ File not found: ${perfPath}`);
  }
  
  // Load grant evidence
  console.log('🖼️ Loading grant evidence...');
  const evidencePath = path.join(process.cwd(), 'data', 'csv', '03_Evidence_and_Media_Index.csv');
  if (fs.existsSync(evidencePath)) {
    const rows = parseCSV(evidencePath);
    for (const row of rows) {
      try {
        const normalized = normalizeGrantEvidence(row);
        if (!normalized.grantLabel || !normalized.assetId) {
          console.warn('  ⚠️ Skipping evidence row without grant or asset');
          continue;
        }
        
        execute(
          `INSERT INTO grant_evidence (
            grantLabel, reportingMonth, assetId, assetName, assetType,
            description, relativePath, linkedMilestone, dateCollected, status, tags
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            normalized.grantLabel,
            normalized.reportingMonth || '',
            normalized.assetId,
            normalized.assetName || '',
            normalized.assetType || 'Other',
            normalized.description || '',
            normalized.relativePath || '',
            normalized.linkedMilestone || '',
            normalized.dateCollected || '',
            normalized.status || 'Pending Review',
            JSON.stringify(normalized.tags || []),
          ]
        );
      } catch (error) {
        console.error('  ❌ Error inserting evidence record:', error);
      }
    }
    console.log(`✅ Loaded ${rows.length} evidence records`);
  } else {
    console.warn(`⚠️ File not found: ${evidencePath}`);
  }
  
  // Verify data
  console.log('🔍 Verifying data...');
  const pblCount = query('SELECT COUNT(*) as count FROM pbl_school_data')[0]?.count || 0;
  const grantCount = query('SELECT COUNT(*) as count FROM grant_profiles')[0]?.count || 0;
  const perfCount = query('SELECT COUNT(*) as count FROM grant_performance')[0]?.count || 0;
  const evidenceCount = query('SELECT COUNT(*) as count FROM grant_evidence')[0]?.count || 0;
  
  console.log('📊 Data summary:');
  console.log(`  - PBL School Records: ${pblCount}`);
  console.log(`  - Grant Profiles: ${grantCount}`);
  console.log(`  - Grant Performance: ${perfCount}`);
  console.log(`  - Grant Evidence: ${evidenceCount}`);
  
  if (pblCount === 0) {
    console.warn('⚠️ No PBL data loaded! Please check CSV files.');
  }
  if (grantCount === 0) {
    console.warn('⚠️ No grant data loaded! Please check CSV files.');
  }
  
  console.log('✅ Database seed completed successfully!');
}

// Handle errors and run
seedDatabase().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});