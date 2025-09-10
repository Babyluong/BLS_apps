-- addMissingColumns.sql
-- SQL script to add missing columns to profiles table
-- Run this in Supabase SQL Editor

-- Add missing columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bls_last_year TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS alergik BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS alergik_details TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS asma BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hamil BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hamil_weeks INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gred TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS alergik_terhadap TEXT;

-- Add comments to document the columns
COMMENT ON COLUMN profiles.bls_last_year IS 'Year when user last completed BLS training';
COMMENT ON COLUMN profiles.alergik IS 'Whether user has allergies';
COMMENT ON COLUMN profiles.alergik_details IS 'Details about user''s allergies';
COMMENT ON COLUMN profiles.asma IS 'Whether user has asthma';
COMMENT ON COLUMN profiles.hamil IS 'Whether user is pregnant';
COMMENT ON COLUMN profiles.hamil_weeks IS 'Pregnancy weeks if applicable';
COMMENT ON COLUMN profiles.gred IS 'User''s grade/position level';
COMMENT ON COLUMN profiles.alergik_terhadap IS 'What user is allergic to';

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
