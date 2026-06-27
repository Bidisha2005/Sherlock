// src/lib/data/loadCSV.ts

import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

export function parseCSV<T>(filePath: string): T[] {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const result = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
    trimHeaders: true,
  });
  
  if (result.errors.length > 0) {
    console.error('CSV parsing errors:', result.errors);
  }
  
  return result.data as T[];
}

export function loadAllPBLData(): any[] {
  const months = ['July_2025', 'August_2025', 'September_2025'];
  const allData = [];
  
  for (const month of months) {
    const filePath = path.join(process.cwd(), 'data', 'csv', `PBL_School_Response_Data_${month}.csv`);
    if (fs.existsSync(filePath)) {
      const data = parseCSV(filePath);
      allData.push(...data.map((row: any) => ({ ...row, reportingMonth: month.replace('_', ' ') })));
    }
  }
  
  return allData;
}