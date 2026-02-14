-- VOXI Sprint 1 — Database Migrations
-- Tarih: 13 Şubat 2026
-- Supabase Dashboard → SQL Editor'den çalıştırın

-- ═══════════════════════════════════════════
-- 1. designs tablosu güncellemeleri
-- ═══════════════════════════════════════════

ALTER TABLE designs ADD COLUMN IF NOT EXISTS estimated_cost NUMERIC;
ALTER TABLE designs ADD COLUMN IF NOT EXISTS service_type TEXT;
ALTER TABLE designs ADD COLUMN IF NOT EXISTS model_used TEXT;
ALTER TABLE designs ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE designs ADD COLUMN IF NOT EXISTS video_status TEXT DEFAULT 'none';
ALTER TABLE designs ADD COLUMN IF NOT EXISTS video_type TEXT;
ALTER TABLE designs ADD COLUMN IF NOT EXISTS prompt_used TEXT;
ALTER TABLE designs ADD COLUMN IF NOT EXISTS negative_prompt TEXT;
ALTER TABLE designs ADD COLUMN IF NOT EXISTS creativity_level INTEGER DEFAULT 50;
ALTER TABLE designs ADD COLUMN IF NOT EXISTS quick_tags TEXT[];
ALTER TABLE designs ADD COLUMN IF NOT EXISTS timelapse_stages JSONB;

-- ═══════════════════════════════════════════
-- 2. B2B Firma tablosu
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS firms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  logo_url TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  plan TEXT DEFAULT 'baslangic',
  plan_expires_at TIMESTAMPTZ,
  monthly_render_limit INTEGER DEFAULT 50,
  monthly_video_limit INTEGER DEFAULT 10,
  monthly_timelapse_limit INTEGER DEFAULT 5,
  renders_used INTEGER DEFAULT 0,
  videos_used INTEGER DEFAULT 0,
  timelapses_used INTEGER DEFAULT 0,
  white_label_enabled BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- 3. Firma üyeleri
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS firm_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  firm_id UUID REFERENCES firms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(firm_id, user_id)
);

-- ═══════════════════════════════════════════
-- 4. Şartnameler
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS specifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  design_id UUID REFERENCES designs(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id),
  firm_id UUID REFERENCES firms(id) ON DELETE SET NULL,
  spec_type TEXT NOT NULL,
  spec_data JSONB NOT NULL,
  technical_summary TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- 5. Sohbetler
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  spec_id UUID REFERENCES specifications(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id),
  contractor_id UUID,
  firm_id UUID REFERENCES firms(id) ON DELETE SET NULL,
  messages JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- 6. Referans portföy (ISITMAX/IOX projeleri)
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS portfolio_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  project_type TEXT NOT NULL,
  width_m NUMERIC,
  length_m NUMERIC,
  height_m NUMERIC,
  total_area_m2 NUMERIC,
  steel_tonnage NUMERIC,
  location_city TEXT,
  location_country TEXT DEFAULT 'Türkiye',
  completion_date DATE,
  duration_days INTEGER,
  description TEXT,
  features JSONB,
  images TEXT[],
  cover_image TEXT,
  is_public BOOLEAN DEFAULT true,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- 7. Aylık kullanım sıfırlama fonksiyonu
-- ═══════════════════════════════════════════

CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
  UPDATE firms SET renders_used = 0, videos_used = 0, timelapses_used = 0
  WHERE plan_expires_at > NOW();
$$ LANGUAGE sql;

-- ═══════════════════════════════════════════
-- 8. RLS Policies
-- ═══════════════════════════════════════════

-- firms: owner can read/write, members can read
ALTER TABLE firms ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Firma owner full access"
  ON firms FOR ALL
  USING (owner_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Firma members read"
  ON firms FOR SELECT
  USING (id IN (SELECT firm_id FROM firm_members WHERE user_id = auth.uid()));

-- firm_members: owner can manage, members can read own
ALTER TABLE firm_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Firm member access"
  ON firm_members FOR ALL
  USING (
    firm_id IN (SELECT id FROM firms WHERE owner_id = auth.uid())
    OR user_id = auth.uid()
  );

-- specifications: user can manage own
ALTER TABLE specifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "User spec access"
  ON specifications FOR ALL
  USING (user_id = auth.uid());

-- conversations: participants can access
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Conversation participant access"
  ON conversations FOR ALL
  USING (user_id = auth.uid() OR contractor_id = auth.uid());

-- portfolio_projects: public read
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Portfolio public read"
  ON portfolio_projects FOR SELECT
  USING (is_public = true);
