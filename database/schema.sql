-- NutriMatch Database Schema
-- Based on NFHS-5 district-level data structure

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (NGO staff, donors, program managers)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('ngo', 'donor', 'program_manager')),
  organization VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Villages
CREATE TABLE IF NOT EXISTS villages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  district VARCHAR(255) NOT NULL,
  state VARCHAR(255) NOT NULL,
  lat DECIMAL(10, 7) NOT NULL,
  lng DECIMAL(10, 7) NOT NULL,
  population INTEGER NOT NULL,
  child_population INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Deficiency Records (one per deficiency type per village)
CREATE TABLE IF NOT EXISTS deficiency_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  village_id UUID REFERENCES villages(id) ON DELETE CASCADE,
  deficiency_type VARCHAR(50) NOT NULL CHECK (deficiency_type IN ('iron', 'vitamin_a', 'zinc', 'iodine', 'folate')),
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe')),
  prevalence_pct DECIMAL(5,2) NOT NULL,
  source VARCHAR(255) DEFAULT 'NFHS-5 (2019-21)',
  year INTEGER DEFAULT 2021,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Food Recommendations (deficiency-to-food mapping with scoring)
CREATE TABLE IF NOT EXISTS food_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deficiency_type VARCHAR(50) NOT NULL CHECK (deficiency_type IN ('iron', 'vitamin_a', 'zinc', 'iodine', 'folate')),
  food_name VARCHAR(255) NOT NULL,
  nutrient_match_score DECIMAL(4,2) NOT NULL CHECK (nutrient_match_score BETWEEN 0 AND 10),
  local_availability_score DECIMAL(4,2) NOT NULL CHECK (local_availability_score BETWEEN 0 AND 10),
  cost_score DECIMAL(4,2) NOT NULL CHECK (cost_score BETWEEN 0 AND 10),
  shelf_life_score DECIMAL(4,2) NOT NULL CHECK (shelf_life_score BETWEEN 0 AND 10),
  citation TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- NGO Activity Log
CREATE TABLE IF NOT EXISTS ngo_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ngo_id UUID REFERENCES users(id) ON DELETE CASCADE,
  village_id UUID REFERENCES villages(id) ON DELETE CASCADE,
  item_distributed VARCHAR(255) NOT NULL,
  deficiency_addressed VARCHAR(50) CHECK (deficiency_addressed IN ('iron', 'vitamin_a', 'zinc', 'iodine', 'folate')),
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Donor Pledges
CREATE TABLE IF NOT EXISTS donor_pledges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  village_id UUID REFERENCES villages(id) ON DELETE CASCADE,
  recommendation_id UUID REFERENCES food_recommendations(id),
  amount_inr DECIMAL(12,2),
  item_description TEXT,
  date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_deficiency_village ON deficiency_records(village_id);
CREATE INDEX IF NOT EXISTS idx_deficiency_type ON deficiency_records(deficiency_type);
CREATE INDEX IF NOT EXISTS idx_ngo_activity_village ON ngo_activities(village_id);
CREATE INDEX IF NOT EXISTS idx_ngo_activity_ngo ON ngo_activities(ngo_id);
CREATE INDEX IF NOT EXISTS idx_pledge_village ON donor_pledges(village_id);
CREATE INDEX IF NOT EXISTS idx_pledge_donor ON donor_pledges(donor_id);

-- Official NFHS-5 District Indicators Data
CREATE TABLE IF NOT EXISTS official_indicators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  district_name VARCHAR(255) NOT NULL,
  state_name VARCHAR(255) NOT NULL,
  indicator_code VARCHAR(100) NOT NULL,
  indicator_name TEXT NOT NULL,
  prevalence_pct DECIMAL(5,2) NOT NULL,
  survey_source VARCHAR(255) DEFAULT 'NFHS-5 (2019-21) via IIPS Factsheets',
  created_at TIMESTAMP DEFAULT NOW()
);

-- ICMR-NIN IFCT 2017 Food Composition Data
CREATE TABLE IF NOT EXISTS ifct_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  food_code VARCHAR(20) UNIQUE NOT NULL,
  food_name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  iron_mg DECIMAL(6,2),
  zinc_mg DECIMAL(6,2),
  folate_mcg DECIMAL(6,2),
  vitamin_a_mcg DECIMAL(6,2),
  citation TEXT DEFAULT 'ICMR-NIN Indian Food Composition Tables (IFCT 2017)',
  created_at TIMESTAMP DEFAULT NOW()
);

