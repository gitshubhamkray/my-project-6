-- Optional anonymous workspace persistence. No passwords, ID documents, mock KYC
-- name/email or private wallet keys are stored by this table.
CREATE TABLE IF NOT EXISTS demo_workspaces (
  id UUID PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS demo_workspaces_updated_at_idx ON demo_workspaces (updated_at);
