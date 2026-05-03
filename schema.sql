-- Smart Validator Database Schema
-- Cloudflare D1 (SQLite compatible)

CREATE TABLE IF NOT EXISTS applicants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  passport_no TEXT NOT NULL UNIQUE,
  nationality TEXT NOT NULL,
  dob TEXT NOT NULL,
  sponsor_name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  applicant_id TEXT NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  completion_percentage INTEGER NOT NULL DEFAULT 0,
  prev_completion_percentage INTEGER NOT NULL DEFAULT 0,
  submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(applicant_id, version)
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  applicant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  document_type TEXT,
  extracted_data TEXT,
  storage_path TEXT,
  status TEXT NOT NULL CHECK(status IN ('success','error','in_progress','neutral')),
  version INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS document_logs (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  timestamp TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('info','success','warning','error')),
  message TEXT NOT NULL,
  details TEXT
);
