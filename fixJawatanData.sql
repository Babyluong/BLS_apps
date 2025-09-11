-- Fix Jawatan Data in BLS Results Table
-- This SQL script updates existing BLS results with jawatan data from profiles
-- Run this in Supabase SQL Editor

-- ===============================================
-- 1. CHECK CURRENT STATE
-- ===============================================
-- See how many BLS results are missing jawatan data
SELECT 
  'CURRENT_STATE' as check_type,
  COUNT(*) as total_bls_results,
  COUNT(CASE WHEN jawatan IS NULL THEN 1 END) as null_jawatan,
  COUNT(CASE WHEN jawatan = 'Unknown Position' THEN 1 END) as unknown_jawatan,
  COUNT(CASE WHEN jawatan IS NOT NULL AND jawatan != 'Unknown Position' THEN 1 END) as valid_jawatan
FROM bls_results;

-- ===============================================
-- 2. UPDATE JAWATAN FROM PROFILES
-- ===============================================
-- Update BLS results with jawatan from profiles table
-- Priority: jawatan > 'Unknown Position'
UPDATE bls_results 
SET jawatan = COALESCE(
  profiles.jawatan, 
  'Unknown Position'
)
FROM profiles 
WHERE bls_results.user_id = profiles.id 
AND (bls_results.jawatan IS NULL OR bls_results.jawatan = 'Unknown Position')
AND profiles.role NOT IN ('admin', 'staff');

-- ===============================================
-- 3. UPDATE REMAINING RECORDS
-- ===============================================
-- For any remaining records, set to 'Unknown Position'
UPDATE bls_results 
SET jawatan = 'Unknown Position'
WHERE jawatan IS NULL;

-- ===============================================
-- 4. VERIFY THE FIX
-- ===============================================
-- Check the results after update
SELECT 
  'AFTER_UPDATE' as check_type,
  COUNT(*) as total_bls_results,
  COUNT(CASE WHEN jawatan IS NULL THEN 1 END) as null_jawatan,
  COUNT(CASE WHEN jawatan = 'Unknown Position' THEN 1 END) as unknown_jawatan,
  COUNT(CASE WHEN jawatan IS NOT NULL AND jawatan != 'Unknown Position' THEN 1 END) as valid_jawatan
FROM bls_results;

-- ===============================================
-- 5. SHOW SAMPLE OF UPDATED DATA
-- ===============================================
-- Show some examples of the updated data
SELECT 
  'SAMPLE_DATA' as check_type,
  participant_name,
  jawatan,
  created_at
FROM bls_results 
WHERE jawatan IS NOT NULL AND jawatan != 'Unknown Position'
ORDER BY created_at DESC
LIMIT 10;

-- ===============================================
-- 6. CHECK FOR ANY REMAINING ISSUES
-- ===============================================
-- Find any BLS results that still don't have proper jawatan
SELECT 
  'REMAINING_ISSUES' as check_type,
  COUNT(*) as count,
  ARRAY_AGG(DISTINCT user_id) as affected_user_ids
FROM bls_results 
WHERE jawatan IS NULL OR jawatan = 'Unknown Position';

-- ===============================================
-- 7. SUMMARY REPORT
-- ===============================================
-- Final summary of the jawatan data fix
SELECT 
  'FINAL_SUMMARY' as report_type,
  (SELECT COUNT(*) FROM bls_results) as total_bls_results,
  (SELECT COUNT(*) FROM bls_results WHERE jawatan IS NOT NULL AND jawatan != 'Unknown Position') as with_valid_jawatan,
  (SELECT COUNT(*) FROM bls_results WHERE jawatan = 'Unknown Position') as with_unknown_jawatan,
  (SELECT COUNT(*) FROM bls_results WHERE jawatan IS NULL) as still_null,
  NOW() as fix_completed_at;
