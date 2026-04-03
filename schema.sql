-- Design X Factor Lead Generation Database Schema
-- For Cloudflare D1

CREATE TABLE IF NOT EXISTS lead_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Contact Info
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  role TEXT,

  -- Question Responses
  content_type TEXT NOT NULL,
  challenge TEXT NOT NULL,
  challenge_comment TEXT,
  location TEXT NOT NULL,
  org_type TEXT NOT NULL,
  org_type_comment TEXT,
  readiness TEXT NOT NULL,

  -- Computed Results
  outcome TEXT NOT NULL,
  recommended_services TEXT, -- JSON array stored as text

  -- Follow-up tracking
  contact_requested INTEGER DEFAULT 0,
  contact_requested_at DATETIME,
  pdf_downloaded INTEGER DEFAULT 0,
  pdf_downloaded_at DATETIME,

  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_lead_created ON lead_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_lead_outcome ON lead_submissions(outcome);
CREATE INDEX IF NOT EXISTS idx_lead_email ON lead_submissions(email);
CREATE INDEX IF NOT EXISTS idx_lead_readiness ON lead_submissions(readiness);
CREATE INDEX IF NOT EXISTS idx_lead_org_type ON lead_submissions(org_type);

-- ─────────────────────────────────────────────────────────────────────────────
-- Course Audit Jobs
-- Files are permanently deleted within 24 hours of report delivery.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_jobs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  role TEXT,
  course_type TEXT,          -- higher-education | corporate-training | healthcare | government | k12
  file_name TEXT NOT NULL,   -- original uploaded filename
  file_r2_key TEXT NOT NULL, -- R2 key: uploads/{id}/{file_name}
  file_size INTEGER,         -- bytes
  status TEXT NOT NULL DEFAULT 'pending', -- pending | processing | completed | failed
  report_r2_key TEXT,        -- R2 key: reports/{id}/report.html
  report_url TEXT,           -- public URL for report delivery
  error TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  processing_started_at INTEGER,
  completed_at INTEGER,
  files_purged_at INTEGER     -- timestamp when upload + report were deleted from R2
);

CREATE INDEX IF NOT EXISTS idx_audit_status ON audit_jobs(status);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_email ON audit_jobs(email);
