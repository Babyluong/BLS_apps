-- COMPREHENSIVE TABLE SYNC VERIFICATION
-- Cross-check between: bls_results, checklist_results, quiz_sessions, profiles, checklist_items, questions
-- Run this in Supabase SQL Editor

-- ===============================================
-- 1. TABLE OVERVIEW
-- ===============================================
SELECT 
  'TABLE_OVERVIEW' as check_type,
  'profiles' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN role NOT IN ('admin','staff') OR role IS NULL THEN 1 END) as active_records
FROM profiles

UNION ALL

SELECT 
  'TABLE_OVERVIEW' as check_type,
  'bls_results' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN jawatan IS NOT NULL AND jawatan != 'Unknown Position' THEN 1 END) as active_records
FROM bls_results

UNION ALL

SELECT 
  'TABLE_OVERVIEW' as check_type,
  'checklist_results' as table_name,
  COUNT(*) as total_records,
  COUNT(*) as active_records
FROM checklist_results

UNION ALL

SELECT 
  'TABLE_OVERVIEW' as check_type,
  'quiz_sessions' as table_name,
  COUNT(*) as total_records,
  COUNT(*) as active_records
FROM quiz_sessions

UNION ALL

SELECT 
  'TABLE_OVERVIEW' as check_type,
  'checklist_items' as table_name,
  COUNT(*) as total_records,
  COUNT(*) as active_records
FROM checklist_items

UNION ALL

SELECT 
  'TABLE_OVERVIEW' as check_type,
  'questions' as table_name,
  COUNT(*) as total_records,
  COUNT(*) as active_records
FROM questions;

-- ===============================================
-- 2. ORPHANED RECORDS CHECK
-- ===============================================
-- Orphaned BLS results
SELECT 
  'ORPHANED_BLS' as check_type,
  COUNT(*) as orphaned_count,
  ARRAY_AGG(DISTINCT br.user_id) as affected_user_ids
FROM bls_results br
LEFT JOIN profiles p ON br.user_id = p.id
WHERE p.id IS NULL OR p.role IN ('admin', 'staff')

UNION ALL

-- Orphaned checklist results
SELECT 
  'ORPHANED_CHECKLIST' as check_type,
  COUNT(*) as orphaned_count,
  ARRAY_AGG(DISTINCT cr.user_id) as affected_user_ids
FROM checklist_results cr
LEFT JOIN profiles p ON cr.user_id = p.id
WHERE p.id IS NULL OR p.role IN ('admin', 'staff')

UNION ALL

-- Orphaned quiz sessions
SELECT 
  'ORPHANED_QUIZ' as check_type,
  COUNT(*) as orphaned_count,
  ARRAY_AGG(DISTINCT qs.user_id) as affected_user_ids
FROM quiz_sessions qs
LEFT JOIN profiles p ON qs.user_id = p.id
WHERE p.id IS NULL OR p.role IN ('admin', 'staff');

-- ===============================================
-- 3. CROSS-TABLE INTEGRITY CHECKS
-- ===============================================
-- Users with BLS but no checklist
SELECT 
  'MISSING_CHECKLIST_FOR_BLS' as check_type,
  COUNT(DISTINCT br.user_id) as affected_users,
  ARRAY_AGG(DISTINCT br.user_id) as user_ids
FROM bls_results br
LEFT JOIN checklist_results cr ON br.user_id = cr.user_id
WHERE cr.user_id IS NULL

UNION ALL

-- Users with checklist but no BLS
SELECT 
  'MISSING_BLS_FOR_CHECKLIST' as check_type,
  COUNT(DISTINCT cr.user_id) as affected_users,
  ARRAY_AGG(DISTINCT cr.user_id) as user_ids
FROM checklist_results cr
LEFT JOIN bls_results br ON cr.user_id = br.user_id
WHERE br.user_id IS NULL

UNION ALL

-- Users with quiz but no BLS
SELECT 
  'MISSING_BLS_FOR_QUIZ' as check_type,
  COUNT(DISTINCT qs.user_id) as affected_users,
  ARRAY_AGG(DISTINCT qs.user_id) as user_ids
FROM quiz_sessions qs
LEFT JOIN bls_results br ON qs.user_id = br.user_id
WHERE br.user_id IS NULL;

-- ===============================================
-- 4. DATA QUALITY CHECKS
-- ===============================================
-- BLS results with invalid scores
SELECT 
  'INVALID_BLS_SCORES' as check_type,
  COUNT(*) as invalid_count,
  ARRAY_AGG(br.id) as record_ids
FROM bls_results br
WHERE br.pre_test_score < 0 OR br.pre_test_score > 30 OR
      br.post_test_score < 0 OR br.post_test_score > 30

UNION ALL

-- BLS results missing jawatan
SELECT 
  'MISSING_JAWATAN' as check_type,
  COUNT(*) as missing_count,
  ARRAY_AGG(br.id) as record_ids
FROM bls_results br
WHERE br.jawatan IS NULL OR br.jawatan = 'Unknown Position'

UNION ALL

-- Profiles with missing essential data
SELECT 
  'INCOMPLETE_PROFILES' as check_type,
  COUNT(*) as incomplete_count,
  ARRAY_AGG(p.id) as record_ids
FROM profiles p
WHERE (p.role NOT IN ('admin', 'staff') OR p.role IS NULL)
AND (p.full_name IS NULL OR p.full_name = '' OR 
     p.ic IS NULL OR p.ic = '' OR 
     p.jawatan IS NULL OR p.jawatan = '')

UNION ALL

-- Invalid checklist types
SELECT 
  'INVALID_CHECKLIST_TYPES' as check_type,
  COUNT(*) as invalid_count,
  ARRAY_AGG(DISTINCT cr.checklist_type) as invalid_types
FROM checklist_results cr
WHERE cr.checklist_type NOT IN ('one-man-cpr', 'two-man-cpr', 'adult-choking', 'infant-choking', 'infant-cpr')

UNION ALL

-- Invalid quiz test types
SELECT 
  'INVALID_QUIZ_TYPES' as check_type,
  COUNT(*) as invalid_count,
  ARRAY_AGG(DISTINCT qs.test_type) as invalid_types
FROM quiz_sessions qs
WHERE qs.test_type NOT IN ('pre-test', 'post-test')

UNION ALL

-- Invalid question types
SELECT 
  'INVALID_QUESTION_TYPES' as check_type,
  COUNT(*) as invalid_count,
  ARRAY_AGG(DISTINCT q.type) as invalid_types
FROM questions q
WHERE q.type NOT IN ('pre-test', 'post-test');

-- ===============================================
-- 5. DUPLICATE DETECTION
-- ===============================================
-- Duplicate BLS results
SELECT 
  'DUPLICATE_BLS' as check_type,
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
) duplicates

UNION ALL

-- Duplicate checklist results
SELECT 
  'DUPLICATE_CHECKLIST' as check_type,
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
) duplicates

UNION ALL

-- Duplicate quiz sessions
SELECT 
  'DUPLICATE_QUIZ' as check_type,
  COUNT(*) as duplicate_groups,
  SUM(duplicate_count - 1) as excess_records
FROM (
  SELECT 
    user_id,
    test_type,
    DATE(created_at) as test_date,
    COUNT(*) as duplicate_count
  FROM quiz_sessions
  GROUP BY user_id, test_type, DATE(created_at)
  HAVING COUNT(*) > 1
) duplicates;

-- ===============================================
-- 6. REFERENCE TABLE COVERAGE
-- ===============================================
-- Checklist items coverage
SELECT 
  'CHECKLIST_ITEMS_COVERAGE' as check_type,
  cr.checklist_type,
  COUNT(DISTINCT cr.user_id) as users_with_results,
  COUNT(DISTINCT ci.id) as available_items
FROM checklist_results cr
LEFT JOIN checklist_items ci ON cr.checklist_type = ci.checklist_type
GROUP BY cr.checklist_type
ORDER BY cr.checklist_type

UNION ALL

-- Questions coverage
SELECT 
  'QUESTIONS_COVERAGE' as check_type,
  qs.test_type as question_type,
  COUNT(DISTINCT qs.user_id) as users_with_sessions,
  COUNT(DISTINCT q.id) as available_questions
FROM quiz_sessions qs
LEFT JOIN questions q ON qs.test_type = q.type
GROUP BY qs.test_type
ORDER BY qs.test_type;

-- ===============================================
-- 7. RECENT ACTIVITY ANALYSIS
-- ===============================================
-- Recent activity summary (last 30 days)
SELECT 
  'RECENT_ACTIVITY' as check_type,
  'BLS Results' as activity_type,
  COUNT(*) as records_last_30_days,
  COUNT(DISTINCT user_id) as unique_users
FROM bls_results 
WHERE created_at >= NOW() - INTERVAL '30 days'

UNION ALL

SELECT 
  'RECENT_ACTIVITY' as check_type,
  'Checklist Results' as activity_type,
  COUNT(*) as records_last_30_days,
  COUNT(DISTINCT user_id) as unique_users
FROM checklist_results 
WHERE created_at >= NOW() - INTERVAL '30 days'

UNION ALL

SELECT 
  'RECENT_ACTIVITY' as check_type,
  'Quiz Sessions' as activity_type,
  COUNT(*) as records_last_30_days,
  COUNT(DISTINCT user_id) as unique_users
FROM quiz_sessions 
WHERE created_at >= NOW() - INTERVAL '30 days';

-- ===============================================
-- 8. DATA CONSISTENCY SUMMARY
-- ===============================================
-- Overall data consistency summary
SELECT 
  'CONSISTENCY_SUMMARY' as report_type,
  (SELECT COUNT(*) FROM profiles WHERE role NOT IN ('admin', 'staff') OR role IS NULL) as active_profiles,
  (SELECT COUNT(*) FROM bls_results) as total_bls_results,
  (SELECT COUNT(*) FROM checklist_results) as total_checklist_results,
  (SELECT COUNT(*) FROM quiz_sessions) as total_quiz_sessions,
  (SELECT COUNT(*) FROM checklist_items) as total_checklist_items,
  (SELECT COUNT(*) FROM questions) as total_questions,
  (SELECT COUNT(*) FROM bls_results WHERE jawatan IS NOT NULL AND jawatan != 'Unknown Position') as bls_with_jawatan,
  (SELECT COUNT(*) FROM bls_results br LEFT JOIN profiles p ON br.user_id = p.id WHERE p.id IS NULL OR p.role IN ('admin', 'staff')) as orphaned_bls,
  (SELECT COUNT(*) FROM checklist_results cr LEFT JOIN profiles p ON cr.user_id = p.id WHERE p.id IS NULL OR p.role IN ('admin', 'staff')) as orphaned_checklist,
  (SELECT COUNT(*) FROM quiz_sessions qs LEFT JOIN profiles p ON qs.user_id = p.id WHERE p.id IS NULL OR p.role IN ('admin', 'staff')) as orphaned_quiz,
  NOW() as check_completed_at;
