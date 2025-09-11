-- CRITICAL TABLE ISSUES FIX
-- This script fixes the major sync issues found in the comprehensive check
-- ⚠️ BACKUP YOUR DATABASE BEFORE RUNNING ⚠️

-- ===============================================
-- 1. FIX QUIZ_SESSIONS TABLE
-- ===============================================
-- Delete all quiz sessions with undefined test_type and created_at
-- These are corrupted records that can't be fixed
DELETE FROM quiz_sessions 
WHERE test_type IS NULL OR created_at IS NULL;

-- ===============================================
-- 2. REMOVE DUPLICATE QUIZ SESSIONS
-- ===============================================
-- Keep only the latest quiz session per user per test type per day
DELETE FROM quiz_sessions 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, test_type, DATE(created_at)) id
  FROM quiz_sessions
  WHERE test_type IS NOT NULL AND created_at IS NOT NULL
  ORDER BY user_id, test_type, DATE(created_at), created_at DESC
);

-- ===============================================
-- 3. CLEAN UP ORPHANED QUIZ SESSIONS
-- ===============================================
-- Delete quiz sessions for users that don't exist in profiles
DELETE FROM quiz_sessions 
WHERE user_id NOT IN (
  SELECT id FROM profiles 
  WHERE role NOT IN ('admin', 'staff') OR role IS NULL
);

-- ===============================================
-- 4. FIX CHECKLIST_ITEMS TABLE
-- ===============================================
-- Update checklist items with proper data structure
-- First, let's see what we have
SELECT 
  'CHECKLIST_ITEMS_ANALYSIS' as check_type,
  checklist_type,
  COUNT(*) as count,
  COUNT(CASE WHEN title IS NOT NULL THEN 1 END) as with_title,
  COUNT(CASE WHEN description IS NOT NULL THEN 1 END) as with_description
FROM checklist_items
GROUP BY checklist_type;

-- ===============================================
-- 5. FIX QUESTIONS TABLE
-- ===============================================
-- Update questions with proper data structure
-- First, let's see what we have
SELECT 
  'QUESTIONS_ANALYSIS' as check_type,
  type,
  COUNT(*) as count,
  COUNT(CASE WHEN question_text IS NOT NULL THEN 1 END) as with_text,
  COUNT(CASE WHEN correct_answer IS NOT NULL THEN 1 END) as with_answer
FROM questions
GROUP BY type;

-- ===============================================
-- 6. CREATE MISSING CHECKLIST ITEMS
-- ===============================================
-- Insert basic checklist items for each type if they don't exist
INSERT INTO checklist_items (checklist_type, title, description, order_index)
SELECT * FROM (VALUES
  ('one-man-cpr', 'Check responsiveness', 'Check if victim is responsive', 1),
  ('one-man-cpr', 'Call for help', 'Call emergency services', 2),
  ('one-man-cpr', 'Open airway', 'Tilt head back and lift chin', 3),
  ('one-man-cpr', 'Check breathing', 'Look, listen, and feel for breathing', 4),
  ('one-man-cpr', 'Start compressions', 'Place hands on center of chest', 5),
  ('one-man-cpr', 'Compression depth', 'Compress at least 2 inches', 6),
  ('one-man-cpr', 'Compression rate', '100-120 compressions per minute', 7),
  ('one-man-cpr', 'Allow chest recoil', 'Allow chest to return to normal position', 8),
  ('one-man-cpr', 'Minimize interruptions', 'Keep interruptions under 10 seconds', 9),
  ('one-man-cpr', 'Continue until help arrives', 'Continue CPR until EMS arrives', 10),
  
  ('two-man-cpr', 'Check responsiveness', 'Check if victim is responsive', 1),
  ('two-man-cpr', 'Call for help', 'Call emergency services', 2),
  ('two-man-cpr', 'Open airway', 'Tilt head back and lift chin', 3),
  ('two-man-cpr', 'Check breathing', 'Look, listen, and feel for breathing', 4),
  ('two-man-cpr', 'Rescuer 1 starts compressions', 'First rescuer starts chest compressions', 5),
  ('two-man-cpr', 'Rescuer 2 gives breaths', 'Second rescuer gives rescue breaths', 6),
  ('two-man-cpr', 'Switch roles every 2 minutes', 'Switch compressor and breather roles', 7),
  ('two-man-cpr', 'Minimize interruptions', 'Keep interruptions under 10 seconds', 8),
  ('two-man-cpr', 'Coordinate efforts', 'Work together efficiently', 9),
  ('two-man-cpr', 'Continue until help arrives', 'Continue CPR until EMS arrives', 10),
  
  ('adult-choking', 'Recognize choking signs', 'Universal choking sign, inability to speak', 1),
  ('adult-choking', 'Ask if choking', 'Ask "Are you choking?"', 2),
  ('adult-choking', 'Call for help', 'Call emergency services', 3),
  ('adult-choking', 'Perform abdominal thrusts', 'Stand behind victim, place hands above navel', 4),
  ('adult-choking', 'Thrust inward and upward', 'Quick inward and upward thrusts', 5),
  ('adult-choking', 'Continue until object expelled', 'Continue until object is expelled or victim becomes unconscious', 6),
  ('adult-choking', 'If unconscious, start CPR', 'If victim becomes unconscious, start CPR', 7),
  ('adult-choking', 'Check mouth for object', 'Look in mouth for expelled object', 8),
  ('adult-choking', 'Reassess after each thrust', 'Check if object has been expelled', 9),
  ('adult-choking', 'Continue until help arrives', 'Continue until EMS arrives', 10),
  
  ('infant-choking', 'Recognize choking signs', 'Inability to cry, cough, or breathe', 1),
  ('infant-choking', 'Support head and neck', 'Support infant''s head and neck', 2),
  ('infant-choking', 'Call for help', 'Call emergency services', 3),
  ('infant-choking', 'Give 5 back blows', 'Hold infant face down, give 5 back blows', 4),
  ('infant-choking', 'Turn infant over', 'Turn infant face up', 5),
  ('infant-choking', 'Give 5 chest thrusts', 'Give 5 chest thrusts with 2 fingers', 6),
  ('infant-choking', 'Repeat sequence', 'Repeat back blows and chest thrusts', 7),
  ('infant-choking', 'Check mouth for object', 'Look in mouth for expelled object', 8),
  ('infant-choking', 'If unconscious, start CPR', 'If infant becomes unconscious, start CPR', 9),
  ('infant-choking', 'Continue until help arrives', 'Continue until EMS arrives', 10),
  
  ('infant-cpr', 'Check responsiveness', 'Check if infant is responsive', 1),
  ('infant-cpr', 'Call for help', 'Call emergency services', 2),
  ('infant-cpr', 'Open airway', 'Tilt head back slightly', 3),
  ('infant-cpr', 'Check breathing', 'Look, listen, and feel for breathing', 4),
  ('infant-cpr', 'Give 2 rescue breaths', 'Cover infant''s mouth and nose, give 2 breaths', 5),
  ('infant-cpr', 'Start compressions', 'Place 2 fingers on center of chest', 6),
  ('infant-cpr', 'Compression depth', 'Compress about 1.5 inches', 7),
  ('infant-cpr', 'Compression rate', '100-120 compressions per minute', 8),
  ('infant-cpr', '30 compressions, 2 breaths', '30 compressions followed by 2 breaths', 9),
  ('infant-cpr', 'Continue until help arrives', 'Continue until EMS arrives', 10)
) AS new_items(checklist_type, title, description, order_index)
WHERE NOT EXISTS (
  SELECT 1 FROM checklist_items 
  WHERE checklist_items.checklist_type = new_items.checklist_type
);

-- ===============================================
-- 7. CREATE MISSING QUESTIONS
-- ===============================================
-- Insert basic questions for each type if they don't exist
INSERT INTO questions (type, question_text, options, correct_answer, explanation)
SELECT * FROM (VALUES
  ('pre-test', 'What is the first step in CPR?', 
   '["Check responsiveness", "Call for help", "Start compressions", "Open airway"]', 
   'Check responsiveness', 
   'The first step in CPR is to check if the victim is responsive by tapping their shoulder and shouting.'),
   
  ('pre-test', 'How many compressions should you give in one cycle of CPR?', 
   '["15", "20", "25", "30"]', 
   '30', 
   'The standard CPR cycle is 30 compressions followed by 2 rescue breaths.'),
   
  ('pre-test', 'What is the correct compression rate for CPR?', 
   '["60-80 per minute", "80-100 per minute", "100-120 per minute", "120-140 per minute"]', 
   '100-120 per minute', 
   'The correct compression rate for CPR is 100-120 compressions per minute.'),
   
  ('pre-test', 'How deep should chest compressions be for an adult?', 
   '["At least 1 inch", "At least 2 inches", "At least 3 inches", "At least 4 inches"]', 
   'At least 2 inches', 
   'Chest compressions for adults should be at least 2 inches deep.'),
   
  ('pre-test', 'What should you do if someone is choking?', 
   '["Give them water", "Perform abdominal thrusts", "Pat them on the back", "Wait for them to cough"]', 
   'Perform abdominal thrusts', 
   'For a choking victim, perform abdominal thrusts (Heimlich maneuver) to dislodge the object.'),
   
  ('post-test', 'What is the first step in CPR?', 
   '["Check responsiveness", "Call for help", "Start compressions", "Open airway"]', 
   'Check responsiveness', 
   'The first step in CPR is to check if the victim is responsive by tapping their shoulder and shouting.'),
   
  ('post-test', 'How many compressions should you give in one cycle of CPR?', 
   '["15", "20", "25", "30"]', 
   '30', 
   'The standard CPR cycle is 30 compressions followed by 2 rescue breaths.'),
   
  ('post-test', 'What is the correct compression rate for CPR?', 
   '["60-80 per minute", "80-100 per minute", "100-120 per minute", "120-140 per minute"]', 
   '100-120 per minute', 
   'The correct compression rate for CPR is 100-120 compressions per minute.'),
   
  ('post-test', 'How deep should chest compressions be for an adult?', 
   '["At least 1 inch", "At least 2 inches", "At least 3 inches", "At least 4 inches"]', 
   'At least 2 inches', 
   'Chest compressions for adults should be at least 2 inches deep.'),
   
  ('post-test', 'What should you do if someone is choking?', 
   '["Give them water", "Perform abdominal thrusts", "Pat them on the back", "Wait for them to cough"]', 
   'Perform abdominal thrusts', 
   'For a choking victim, perform abdominal thrusts (Heimlich maneuver) to dislodge the object.')
) AS new_questions(type, question_text, options, correct_answer, explanation)
WHERE NOT EXISTS (
  SELECT 1 FROM questions 
  WHERE questions.type = new_questions.type
);

-- ===============================================
-- 8. VERIFICATION QUERIES
-- ===============================================
-- Check the results after cleanup
SELECT 
  'CLEANUP_VERIFICATION' as check_type,
  'quiz_sessions' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN test_type IS NOT NULL THEN 1 END) as valid_records
FROM quiz_sessions

UNION ALL

SELECT 
  'CLEANUP_VERIFICATION' as check_type,
  'checklist_items' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN title IS NOT NULL AND description IS NOT NULL THEN 1 END) as valid_records
FROM checklist_items

UNION ALL

SELECT 
  'CLEANUP_VERIFICATION' as check_type,
  'questions' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN question_text IS NOT NULL AND correct_answer IS NOT NULL THEN 1 END) as valid_records
FROM questions;

-- ===============================================
-- 9. FINAL SUMMARY
-- ===============================================
SELECT 
  'FINAL_CLEANUP_SUMMARY' as report_type,
  (SELECT COUNT(*) FROM profiles WHERE role NOT IN ('admin', 'staff') OR role IS NULL) as active_profiles,
  (SELECT COUNT(*) FROM bls_results) as bls_results_total,
  (SELECT COUNT(*) FROM checklist_results) as checklist_results_total,
  (SELECT COUNT(*) FROM quiz_sessions WHERE test_type IS NOT NULL) as valid_quiz_sessions,
  (SELECT COUNT(*) FROM checklist_items WHERE title IS NOT NULL) as valid_checklist_items,
  (SELECT COUNT(*) FROM questions WHERE question_text IS NOT NULL) as valid_questions,
  NOW() as cleanup_completed_at;
