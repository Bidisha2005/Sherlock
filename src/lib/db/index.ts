// src/lib/db/index.ts

import Database from 'better-sqlite3';
import path from 'path';
import { createTablesSQL } from './schema';

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'data', 'pbl.db');
    db = new Database(dbPath);
    db.exec(createTablesSQL);
  }
  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

export function query<T = any>(sql: string, params: any[] = []): T[] {
  const db = getDatabase();
  const stmt = db.prepare(sql);
  return stmt.all(...params) as T[];
}

export function queryOne<T = any>(sql: string, params: any[] = []): T | null {
  const db = getDatabase();
  const stmt = db.prepare(sql);
  return stmt.get(...params) as T | null;
}

export function execute(sql: string, params: any[] = []): { changes: number; lastInsertRowid: number } {
  const db = getDatabase();
  const stmt = db.prepare(sql);
  const result = stmt.run(...params);
  return result;
}