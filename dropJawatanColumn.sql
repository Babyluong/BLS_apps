-- dropJawatanColumn.sql
-- SQL script to drop the jawatan column from profiles table
-- Run this in Supabase SQL Editor

-- Step 1: Verify the column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name IN ('job_position', 'jawatan')
ORDER BY column_name;

-- Step 2: Check sample data before dropping
SELECT 
  full_name,
  job_position,
  jawatan
FROM profiles 
LIMIT 5;

-- Step 3: Drop the jawatan column
ALTER TABLE profiles DROP COLUMN IF EXISTS jawatan;

-- Step 4: Verify the column is gone
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name IN ('job_position', 'jawatan')
ORDER BY column_name;

-- If the above query only shows 'job_position' and not 'jawatan', 
-- the column has been successfully dropped!
