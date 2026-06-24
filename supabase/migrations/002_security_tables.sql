-- ══════════════════════════════════════════════════════════════
-- SECURITY TABLES — Enterprise Security Layer
-- Run this in Supabase SQL Editor BEFORE using security features.
-- ══════════════════════════════════════════════════════════════

-- ── USER ROLES TABLE ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_roles (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role        TEXT NOT NULL DEFAULT 'user'
                CHECK (role IN ('super_admin','admin','moderator','premium_user','user','guest')),
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  is_banned   BOOLEAN DEFAULT FALSE,
  banned_at   TIMESTAMPTZ,
  banned_reason TEXT
);

-- ── DEVICES TABLE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_devices (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  fingerprint       TEXT NOT NULL,
  device_type       TEXT DEFAULT 'unknown',
  os                TEXT DEFAULT 'unknown',
  browser           TEXT DEFAULT 'unknown',
  language          TEXT,
  timezone          TEXT,
  screen_resolution TEXT,
  ip_address        TEXT,
  user_agent        TEXT,
  first_seen_at     TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at      TIMESTAMPTZ DEFAULT NOW(),
  is_trusted        BOOLEAN DEFAULT FALSE,
  trust_label       TEXT,
  is_blocked        BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, fingerprint)
);

-- ── SESSIONS TABLE ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_sessions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  device_id       UUID REFERENCES user_devices(id) ON DELETE SET NULL,
  ip_address      TEXT,
  status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','expired','revoked')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  last_active_at  TIMESTAMPTZ DEFAULT NOW(),
  expires_at      TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  revoked_at      TIMESTAMPTZ,
  revoked_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  revoked_reason  TEXT
);

-- ── AUDIT LOGS TABLE ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email  TEXT,
  actor_role   TEXT,
  target_id    TEXT,
  target_type  TEXT,
  action       TEXT NOT NULL,
  severity     TEXT NOT NULL DEFAULT 'info'
                 CHECK (severity IN ('info','warning','critical')),
  description  TEXT NOT NULL,
  metadata     JSONB DEFAULT '{}',
  ip_address   TEXT,
  device_id    UUID REFERENCES user_devices(id) ON DELETE SET NULL,
  session_id   UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── ACTIVITY LOGS TABLE ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_logs (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id  UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
  event       TEXT NOT NULL,
  page        TEXT,
  metadata    JSONB DEFAULT '{}',
  duration_ms INTEGER,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── INDEXES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_roles_user     ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_user        ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_fingerprint ON user_devices(fingerprint);
CREATE INDEX IF NOT EXISTS idx_sessions_user       ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status     ON user_sessions(status);
CREATE INDEX IF NOT EXISTS idx_audit_actor         ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_action        ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_severity      ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_created       ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_user       ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_event      ON activity_logs(event);
CREATE INDEX IF NOT EXISTS idx_activity_created    ON activity_logs(created_at DESC);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
ALTER TABLE user_roles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices   ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs  ENABLE ROW LEVEL SECURITY;

-- Users see only their own rows
DROP POLICY IF EXISTS "own_role"     ON user_roles;
DROP POLICY IF EXISTS "own_devices"  ON user_devices;
DROP POLICY IF EXISTS "own_sessions" ON user_sessions;
DROP POLICY IF EXISTS "own_activity" ON activity_logs;
DROP POLICY IF EXISTS "own_audit"    ON audit_logs;

CREATE POLICY "own_role"     ON user_roles    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_devices"  ON user_devices  FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "own_sessions" ON user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_activity" ON activity_logs FOR ALL    USING (auth.uid() = user_id);

-- Audit logs: users see only their own; admins use service_role key via API routes
CREATE POLICY "own_audit"    ON audit_logs    FOR SELECT USING (auth.uid() = actor_id);

-- Admin full access happens ONLY via service_role key in API routes (never RLS bypass on client)

-- ── SEED FIRST SUPER ADMIN (run manually after first user signs up) ───
-- INSERT INTO user_roles (user_id, role)
-- VALUES ('<your-user-uuid-here>', 'super_admin')
-- ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
