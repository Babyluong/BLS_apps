-- SUPABASE DATABASE CLEANUP SCRIPT
-- Run this AFTER running the verification script to fix sync issues
-- ⚠️ BACKUP YOUR DATABASE BEFORE RUNNING THESE COMMANDS ⚠️

-- ===============================================
-- 1. UPDATE MISSING JAWATAN IN BLS_RESULTS
-- ===============================================
-- Update existing BLS results with jawatan from profiles
UPDATE bls_results 
SET jawatan = COALESCE(
  profiles.jawatan, 
  profiles.job_position, 
  profiles.gred, 
  'Unknown Position'
)
FROM profiles 
WHERE bls_results.user_id = profiles.id 
AND (bls_results.jawatan IS NULL OR bls_results.jawatan = 'Unknown Position')
AND profiles.role NOT IN ('admin', 'staff');

-- ===============================================
-- 2. CLEAN UP ORPHANED RECORDS
-- ===============================================
-- Delete BLS results for admin/staff or non-existent users
DELETE FROM bls_results 
WHERE user_id IN (
  SELECT br.user_id 
  FROM bls_results br
  LEFT JOIN profiles p ON br.user_id = p.id
  WHERE p.id IS NULL OR p.role IN ('admin', 'staff')
);

-- Delete checklist results for admin/staff or non-existent users
DELETE FROM checklist_results 
WHERE user_id IN (
  SELECT cr.user_id 
  FROM checklist_results cr
  LEFT JOIN profiles p ON cr.user_id = p.id
  WHERE p.id IS NULL OR p.role IN ('admin', 'staff')
);

-- Delete quiz sessions for admin/staff or non-existent users
DELETE FROM quiz_sessions 
WHERE user_id IN (
  SELECT qs.user_id 
  FROM quiz_sessions qs
  LEFT JOIN profiles p ON qs.user_id = p.id
  WHERE p.id IS NULL OR p.role IN ('admin', 'staff')
);

-- ===============================================
-- 3. REMOVE DUPLICATE BLS RESULTS
-- ===============================================
-- Keep only the latest BLS result per user per day
DELETE FROM bls_results 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, DATE(created_at)) id
  FROM bls_results
  ORDER BY user_id, DATE(created_at), created_at DESC
);

-- ===============================================
-- 4. REMOVE DUPLICATE CHECKLIST RESULTS
-- ===============================================
-- Keep only the latest checklist result per user per type per day
DELETE FROM checklist_results 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, checklist_type, DATE(created_at)) id
  FROM checklist_results
  ORDER BY user_id, checklist_type, DATE(created_at), created_at DESC
);

-- ===============================================
-- 5. REMOVE DUPLICATE QUIZ SESSIONS
-- ===============================================
-- Keep only the latest quiz session per user per test type per day
DELETE FROM quiz_sessions 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, test_type, DATE(created_at)) id
  FROM quiz_sessions
  ORDER BY user_id, test_type, DATE(created_at), created_at DESC
);

-- ===============================================
-- 6. FIX INVALID DATA
-- ===============================================
-- Fix invalid scores (outside 0-30 range)
UPDATE bls_results 
SET pre_test_score = CASE 
  WHEN pre_test_score < 0 THEN 0
  WHEN pre_test_score > 30 THEN 30
  ELSE pre_test_score
END,
post_test_score = CASE 
  WHEN post_test_score < 0 THEN 0
  WHEN post_test_score > 30 THEN 30
  ELSE post_test_score
END
WHERE pre_test_score < 0 OR pre_test_score > 30 OR
      post_test_score < 0 OR post_test_score > 30;

-- ===============================================
-- 7. ENSURE DATA CONSISTENCY
-- ===============================================
-- Update profile completeness for active users
UPDATE profiles 
SET full_name = COALESCE(full_name, 'Unknown Name'),
    id_number = COALESCE(id_number, 'Unknown ID')
WHERE (role NOT IN ('admin', 'staff') OR role IS NULL)
AND (full_name IS NULL OR full_name = '' OR id_number IS NULL OR id_number = '');

-- ===============================================
-- 8. CREATE MISSING INDEXES FOR PERFORMANCE
-- ===============================================
-- Index on bls_results for better query performance
CREATE INDEX IF NOT EXISTS idx_bls_results_user_created 
ON bls_results(user_id, created_at DESC);

-- Index on checklist_results for better query performance  
CREATE INDEX IF NOT EXISTS idx_checklist_results_user_type_created
ON checklist_results(user_id, checklist_type, created_at DESC);

-- Index on quiz_sessions for better query performance
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_type_created
ON quiz_sessions(user_id, test_type, created_at DESC);

-- Index on profiles for active users
CREATE INDEX IF NOT EXISTS idx_profiles_active_users
ON profiles(id) WHERE role NOT IN ('admin', 'staff') OR role IS NULL;

-- ===============================================
-- 9. VERIFICATION QUERIES
-- ===============================================
-- Run these to verify cleanup was successful

-- Check remaining orphaned records
SELECT 'Orphaned BLS Results' as check_name, COUNT(*) as count
FROM bls_results br
LEFT JOIN profiles p ON br.user_id = p.id
WHERE p.id IS NULL OR p.role IN ('admin', 'staff')

UNION ALL

SELECT 'Orphaned Checklist Results' as check_name, COUNT(*) as count
FROM checklist_results cr
LEFT JOIN profiles p ON cr.user_id = p.id
WHERE p.id IS NULL OR p.role IN ('admin', 'staff')

UNION ALL

SELECT 'Orphaned Quiz Sessions' as check_name, COUNT(*) as count
FROM quiz_sessions qs
LEFT JOIN profiles p ON qs.user_id = p.id
WHERE p.id IS NULL OR p.role IN ('admin', 'staff')

UNION ALL

-- Check remaining duplicates
SELECT 'Duplicate BLS Results' as check_name, COUNT(*) as count
FROM (
  SELECT user_id, DATE(created_at)
  FROM bls_results
  GROUP BY user_id, DATE(created_at)
  HAVING COUNT(*) > 1
) duplicates

UNION ALL

-- Check missing jawatan
SELECT 'BLS Results Missing Jawatan' as check_name, COUNT(*) as count
FROM bls_results
WHERE jawatan IS NULL OR jawatan = 'Unknown Position'

UNION ALL

-- Check active profiles
SELECT 'Active Profiles' as check_name, COUNT(*) as count
FROM profiles
WHERE role NOT IN ('admin', 'staff') OR role IS NULL;

-- ===============================================
-- 10. FINAL SUMMARY
-- ===============================================
SELECT 
  'CLEANUP_SUMMARY' as report_type,
  (SELECT COUNT(*) FROM profiles WHERE role NOT IN ('admin', 'staff') OR role IS NULL) as active_profiles,
  (SELECT COUNT(*) FROM bls_results) as bls_results_total,
  (SELECT COUNT(*) FROM checklist_results) as checklist_results_total,
  (SELECT COUNT(*) FROM quiz_sessions) as quiz_sessions_total,
  NOW() as cleanup_completed_at;
