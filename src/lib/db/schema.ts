// src/lib/db/schema.ts

export const createTablesSQL = `
  CREATE TABLE IF NOT EXISTS pbl_school_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    schoolCode TEXT NOT NULL,
    schoolName TEXT NOT NULL,
    district TEXT NOT NULL,
    block TEXT NOT NULL,
    cluster TEXT NOT NULL,
    reportingMonth TEXT NOT NULL,
    participationStatus INTEGER NOT NULL,
    completionPercentage REAL NOT NULL,
    evidenceSubmitted INTEGER NOT NULL,
    evidenceType TEXT,
    gradesImplemented TEXT,
    subjectsImplemented TEXT,
    totalEnrollment INTEGER NOT NULL,
    totalAttendance INTEGER NOT NULL,
    attendancePercentage REAL NOT NULL,
    riskStatus TEXT NOT NULL,
    responseData TEXT,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS grant_profiles (
    grantLabel TEXT PRIMARY KEY,
    donorOrganization TEXT NOT NULL,
    coveredDistricts TEXT NOT NULL,
    coveredBlocks TEXT NOT NULL,
    startDate TEXT NOT NULL,
    endDate TEXT NOT NULL,
    totalBudget REAL NOT NULL,
    utilizedAmount REAL NOT NULL,
    utilizationPercentage REAL NOT NULL,
    strategicObjectives TEXT,
    focusAreas TEXT
  );

  CREATE TABLE IF NOT EXISTS grant_performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grantLabel TEXT NOT NULL,
    reportingMonth TEXT NOT NULL,
    milestoneId TEXT NOT NULL,
    milestoneName TEXT NOT NULL,
    target INTEGER NOT NULL,
    achieved INTEGER NOT NULL,
    status TEXT NOT NULL,
    completionPercentage REAL NOT NULL,
    comments TEXT,
    risks TEXT,
    nextSteps TEXT,
    FOREIGN KEY (grantLabel) REFERENCES grant_profiles(grantLabel)
  );

  CREATE TABLE IF NOT EXISTS grant_evidence (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grantLabel TEXT NOT NULL,
    reportingMonth TEXT NOT NULL,
    assetId TEXT NOT NULL,
    assetName TEXT NOT NULL,
    assetType TEXT NOT NULL,
    description TEXT,
    relativePath TEXT NOT NULL,
    linkedMilestone TEXT,
    dateCollected TEXT NOT NULL,
    status TEXT NOT NULL,
    tags TEXT,
    FOREIGN KEY (grantLabel) REFERENCES grant_profiles(grantLabel)
  );

  CREATE INDEX IF NOT EXISTS idx_pbl_month ON pbl_school_data(reportingMonth);
  CREATE INDEX IF NOT EXISTS idx_pbl_district ON pbl_school_data(district);
  CREATE INDEX IF NOT EXISTS idx_pbl_block ON pbl_school_data(block);
  CREATE INDEX IF NOT EXISTS idx_pbl_school ON pbl_school_data(schoolCode);
  CREATE INDEX IF NOT EXISTS idx_grant_performance_label ON grant_performance(grantLabel);
  CREATE INDEX IF NOT EXISTS idx_grant_evidence_label ON grant_evidence(grantLabel);
`;