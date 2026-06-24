-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- SUPABASE SCHEMA — Run this in Supabase SQL Editor
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Carbon Twin (one row per user, upserted on profile update)
CREATE TABLE IF NOT EXISTS carbon_twin (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  diet         JSONB NOT NULL DEFAULT '{}',
  travel       JSONB NOT NULL DEFAULT '{}',
  energy       JSONB NOT NULL DEFAULT '{}',
  shopping     JSONB NOT NULL DEFAULT '{}',
  waste        JSONB NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Monthly emission snapshots (one row per user per month)
CREATE TABLE IF NOT EXISTS emission_snapshots (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  year_month      CHAR(7) NOT NULL,
  total_kg        NUMERIC(8,2) NOT NULL,
  diet_kg         NUMERIC(8,2) DEFAULT 0,
  travel_kg       NUMERIC(8,2) DEFAULT 0,
  energy_kg       NUMERIC(8,2) DEFAULT 0,
  shopping_kg     NUMERIC(8,2) DEFAULT 0,
  waste_kg        NUMERIC(8,2) DEFAULT 0,
  health_score    SMALLINT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, year_month)
);

-- AI Roadmap (one active roadmap per user)
CREATE TABLE IF NOT EXISTS ai_roadmaps (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  roadmap_json    JSONB NOT NULL,
  generated_at    TIMESTAMPTZ DEFAULT NOW(),
  total_weeks     SMALLINT,
  projected_saving_kg NUMERIC(8,2)
);

-- Roadmap week completions
CREATE TABLE IF NOT EXISTS roadmap_completions (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_number SMALLINT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_number)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_carbon_twin_user ON carbon_twin(user_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_user ON emission_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_user_month ON emission_snapshots(user_id, year_month DESC);
CREATE INDEX IF NOT EXISTS idx_roadmaps_user ON ai_roadmaps(user_id);

-- Row Level Security
ALTER TABLE carbon_twin ENABLE ROW LEVEL SECURITY;
ALTER TABLE emission_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own data" ON carbon_twin
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own data" ON emission_snapshots
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own data" ON ai_roadmaps
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users access own data" ON roadmap_completions
  FOR ALL USING (auth.uid() = user_id);
