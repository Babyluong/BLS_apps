-- SUPABASE TABLE SYNC VERIFICATION
-- Run this in Supabase SQL Editor to check all table synchronization
-- Excludes admin and staff from profile table checks

-- ===============================================
-- 1. GET ACTIVE PROFILES (excluding admin/staff)
-- ===============================================
SELECT 
  'ACTIVE_PROFILES' as check_type,
  COUNT(*) as total_count,
  COUNT(CASE WHEN jawatan IS NOT NULL THEN 1 END) as with_jawatan,
  COUNT(CASE WHEN job_position IS NOT NULL THEN 1 END) as with_job_position,
  COUNT(CASE WHEN gred IS NOT NULL THEN 1 END) as with_gred
FROM profiles 
WHERE role NOT IN ('admin', 'staff') OR role IS NULL;

-- ===============================================
-- 2. CHECK BLS RESULTS SYNC
-- ===============================================
-- Total BLS results
SELECT 
  'BLS_RESULTS_TOTAL' as check_type,
  COUNT(*) as total_count,
  COUNT(CASE WHEN jawatan IS NOT NULL THEN 1 END) as with_jawatan,
  COUNT(CASE WHEN jawatan IS NULL OR jawatan = 'Unknown Position' THEN 1 END) as missing_jawatan
FROM bls_results;

-- Orphaned BLS results (user_id not in active profiles)
SELECT 
  'BLS_ORPHANED' as check_type,
  COUNT(*) as orphaned_count
FROM bls_results br
LEFT JOIN profiles p ON br.user_id = p.id
WHERE p.id IS NULL OR p.role IN ('admin', 'staff');

-- ===============================================
-- 3. CHECK CHECKLIST RESULTS SYNC  
-- ===============================================
-- Total checklist results
SELECT 
  'CHECKLIST_RESULTS_TOTAL' as check_type,
  COUNT(*) as total_count
FROM checklist_results;

-- Orphaned checklist results
SELECT 
  'CHECKLIST_ORPHANED' as check_type,
  COUNT(*) as orphaned_count
FROM checklist_results cr
LEFT JOIN profiles p ON cr.user_id = p.id
WHERE p.id IS NULL OR p.role IN ('admin', 'staff');

-- ===============================================
-- 4. CHECK QUIZ SESSIONS SYNC
-- ===============================================
-- Total quiz sessions
SELECT 
  'QUIZ_SESSIONS_TOTAL' as check_type,
  COUNT(*) as total_count
FROM quiz_sessions;

-- Orphaned quiz sessions
SELECT 
  'QUIZ_ORPHANED' as check_type,
  COUNT(*) as orphaned_count
FROM quiz_sessions qs
LEFT JOIN profiles p ON qs.user_id = p.id
WHERE p.id IS NULL OR p.role IN ('admin', 'staff');

-- ===============================================
-- 5. CHECK QUESTIONS TABLE
-- ===============================================
SELECT 
  'QUESTIONS_TOTAL' as check_type,
  COUNT(*) as total_count,
  COUNT(CASE WHEN type = 'pre-test' THEN 1 END) as pre_test_questions,
  COUNT(CASE WHEN type = 'post-test' THEN 1 END) as post_test_questions
FROM questions;

-- ===============================================
-- 6. CROSS-TABLE INTEGRITY CHECKS
-- ===============================================
-- Users with BLS results but no checklist results
SELECT 
  'MISSING_CHECKLIST' as check_type,
  COUNT(DISTINCT br.user_id) as users_missing_checklist
FROM bls_results br
LEFT JOIN checklist_results cr ON br.user_id = cr.user_id
WHERE cr.user_id IS NULL;

-- Users with checklist but no BLS results  
SELECT 
  'MISSING_BLS' as check_type,
  COUNT(DISTINCT cr.user_id) as users_missing_bls
FROM checklist_results cr
LEFT JOIN bls_results br ON cr.user_id = br.user_id
WHERE br.user_id IS NULL;

-- ===============================================
-- 7. DUPLICATE DETECTION
-- ===============================================
-- Duplicate BLS results (same user, same date)
SELECT 
  'BLS_DUPLICATES' as check_type,
  COUNT(*) as duplicate_groups,
  SUM(duplicate_count - 1) as excess_records
FROM (
  SELECT 
    user_id,
    DATE(created_at) as test_date,
    COUNT(*) as duplicate_count
  FROM bls_results
  GROUP BY user_id, DATE(created_at)
  HAVING COUNT(*) > 1
) duplicates;

-- Duplicate checklist results
SELECT 
  'CHECKLIST_DUPLICATES' as check_type,
  COUNT(*) as duplicate_groups,
  SUM(duplicate_count - 1) as excess_records  
FROM (
  SELECT 
    user_id,
    checklist_type,
    DATE(created_at) as test_date,
    COUNT(*) as duplicate_count
  FROM checklist_results
  GROUP BY user_id, checklist_type, DATE(created_at)
  HAVING COUNT(*) > 1
) duplicates;

-- ===============================================
-- 8. DATA QUALITY CHECKS
-- ===============================================
-- Profiles with missing essential data
SELECT 
  'PROFILES_INCOMPLETE' as check_type,
  COUNT(*) as incomplete_profiles
FROM profiles 
WHERE (role NOT IN ('admin', 'staff') OR role IS NULL)
AND (
  full_name IS NULL OR full_name = '' OR
  id_number IS NULL OR id_number = '' OR
  (jawatan IS NULL AND job_position IS NULL AND gred IS NULL)
);

-- BLS results with invalid scores
SELECT 
  'BLS_INVALID_SCORES' as check_type,
  COUNT(*) as invalid_score_records
FROM bls_results
WHERE pre_test_score < 0 OR pre_test_score > 30 OR
      post_test_score < 0 OR post_test_score > 30;

-- ===============================================
-- 9. RECENT ACTIVITY SUMMARY
-- ===============================================
-- Recent BLS results (last 30 days)
SELECT 
  'RECENT_BLS_ACTIVITY' as check_type,
  COUNT(*) as records_last_30_days,
  COUNT(DISTINCT user_id) as unique_users_last_30_days
FROM bls_results 
WHERE created_at >= NOW() - INTERVAL '30 days';

-- ===============================================
-- 10. CLEANUP RECOMMENDATIONS
-- ===============================================
-- Get list of orphaned BLS result IDs for cleanup
SELECT 
  'CLEANUP_BLS_IDS' as check_type,
  ARRAY_AGG(br.id) as orphaned_ids
FROM bls_results br
LEFT JOIN profiles p ON br.user_id = p.id
WHERE p.id IS NULL OR p.role IN ('admin', 'staff');

-- Get list of orphaned checklist result IDs for cleanup
SELECT 
  'CLEANUP_CHECKLIST_IDS' as check_type,
  ARRAY_AGG(cr.id) as orphaned_ids
FROM checklist_results cr
LEFT JOIN profiles p ON cr.user_id = p.id
WHERE p.id IS NULL OR p.role IN ('admin', 'staff');

-- Get list of orphaned quiz session IDs for cleanup
SELECT 
  'CLEANUP_QUIZ_IDS' as check_type,
  ARRAY_AGG(qs.id) as orphaned_ids
FROM quiz_sessions qs
LEFT JOIN profiles p ON qs.user_id = p.id
WHERE p.id IS NULL OR p.role IN ('admin', 'staff');
