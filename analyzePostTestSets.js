// analyzePostTestSets.js
// Analyze how to handle multiple post-test sets (A, B, C) in Supabase

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ymajroaavaptafmoqciq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E'
);

async function analyzePostTestSets() {
  try {
    console.log('📚 Analyzing Post-Test Sets (A, B, C) Implementation\n');
    console.log('=' .repeat(60));
    
    // 1. Check current quiz_sessions structure
    console.log('1. 📊 Current Quiz Sessions Structure:');
    console.log('-' .repeat(40));
    
    const { data: quizSessions, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('id, user_id, quiz_key, score, total_questions, answers')
      .limit(5);
    
    if (quizError) {
      console.error('❌ Error fetching quiz sessions:', quizError);
      return;
    }
    
    console.log('Current structure:');
    console.log('   • quiz_key: "pretest" or "posttest"');
    console.log('   • score: Total score');
    console.log('   • total_questions: Number of questions');
    console.log('   • answers: JSON object with answers');
    
    if (quizSessions && quizSessions.length > 0) {
      const sample = quizSessions[0];
      console.log('\nSample quiz session:');
      console.log(`   Quiz Key: ${sample.quiz_key}`);
      console.log(`   Score: ${sample.score}/${sample.total_questions}`);
      console.log(`   Answers: ${Object.keys(sample.answers || {}).length} questions`);
    }
    
    // 2. Analyze the problem
    console.log('\n2. ⚠️ Current Problem:');
    console.log('-' .repeat(40));
    console.log('❌ Current system only supports:');
    console.log('   • quiz_key: "pretest" (single set)');
    console.log('   • quiz_key: "posttest" (single set)');
    console.log('');
    console.log('✅ Need to support:');
    console.log('   • quiz_key: "pretest" (single set)');
    console.log('   • quiz_key: "posttest-set-a" (Set A)');
    console.log('   • quiz_key: "posttest-set-b" (Set B)');
    console.log('   • quiz_key: "posttest-set-c" (Set C)');
    
    // 3. Show current data distribution
    console.log('\n3. 📈 Current Data Distribution:');
    console.log('-' .repeat(40));
    
    const { data: allQuizSessions } = await supabase
      .from('quiz_sessions')
      .select('quiz_key, user_id');
    
    const quizDistribution = {};
    allQuizSessions.forEach(session => {
      quizDistribution[session.quiz_key] = (quizDistribution[session.quiz_key] || 0) + 1;
    });
    
    console.log('Current quiz distribution:');
    Object.entries(quizDistribution).forEach(([key, count]) => {
      console.log(`   ${key}: ${count} sessions`);
    });
    
    // 4. Proposed solution
    console.log('\n4. 💡 Proposed Solution:');
    console.log('-' .repeat(40));
    
    console.log('🔧 OPTION 1: Extend quiz_key values');
    console.log('   • Keep current structure');
    console.log('   • Change quiz_key to:');
    console.log('     - "pretest" (unchanged)');
    console.log('     - "posttest-set-a"');
    console.log('     - "posttest-set-b"');
    console.log('     - "posttest-set-c"');
    console.log('   • Add set_identifier column for easier querying');
    console.log('');
    
    console.log('🔧 OPTION 2: Add set_identifier column');
    console.log('   • Keep quiz_key as "posttest"');
    console.log('   • Add set_identifier: "A", "B", "C"');
    console.log('   • More normalized approach');
    console.log('');
    
    console.log('🔧 OPTION 3: Separate posttest_sets table');
    console.log('   • Create dedicated table for post-test sets');
    console.log('   • Link to quiz_sessions via foreign key');
    console.log('   • Most flexible for future expansion');
    
    // 5. Recommended implementation
    console.log('\n5. 🎯 Recommended Implementation (Option 1):');
    console.log('-' .repeat(40));
    
    console.log('✅ MODIFY quiz_sessions table:');
    console.log('   1. Add set_identifier column (VARCHAR)');
    console.log('   2. Update quiz_key values for posttest');
    console.log('   3. Update triggers and functions');
    console.log('   4. Update app logic');
    console.log('');
    
    console.log('📊 New structure:');
    console.log('   • pretest: quiz_key="pretest", set_identifier=null');
    console.log('   • posttest-set-a: quiz_key="posttest", set_identifier="A"');
    console.log('   • posttest-set-b: quiz_key="posttest", set_identifier="B"');
    console.log('   • posttest-set-c: quiz_key="posttest", set_identifier="C"');
    
    // 6. Show migration plan
    console.log('\n6. 🔄 Migration Plan:');
    console.log('-' .repeat(40));
    
    console.log('STEP 1: Add set_identifier column');
    console.log('   ALTER TABLE quiz_sessions ADD COLUMN set_identifier VARCHAR(1);');
    console.log('');
    console.log('STEP 2: Update existing posttest records');
    console.log('   UPDATE quiz_sessions SET set_identifier = \'A\' WHERE quiz_key = \'posttest\';');
    console.log('');
    console.log('STEP 3: Update app logic');
    console.log('   • When user selects Set A: quiz_key="posttest", set_identifier="A"');
    console.log('   • When user selects Set B: quiz_key="posttest", set_identifier="B"');
    console.log('   • When user selects Set C: quiz_key="posttest", set_identifier="C"');
    console.log('');
    console.log('STEP 4: Update triggers');
    console.log('   • Modify sync triggers to handle set_identifier');
    console.log('   • Update comment generation logic');
    
    // 7. Show example data structure
    console.log('\n7. 📋 Example Data Structure:');
    console.log('-' .repeat(40));
    
    console.log('Sample quiz_sessions records:');
    console.log('');
    console.log('User 1 (chose Set A):');
    console.log('   id: uuid-1');
    console.log('   user_id: user-1');
    console.log('   quiz_key: "pretest"');
    console.log('   set_identifier: null');
    console.log('   score: 25/30');
    console.log('');
    console.log('   id: uuid-2');
    console.log('   user_id: user-1');
    console.log('   quiz_key: "posttest"');
    console.log('   set_identifier: "A"');
    console.log('   score: 28/30');
    console.log('');
    console.log('User 2 (chose Set B):');
    console.log('   id: uuid-3');
    console.log('   user_id: user-2');
    console.log('   quiz_key: "pretest"');
    console.log('   set_identifier: null');
    console.log('   score: 22/30');
    console.log('');
    console.log('   id: uuid-4');
    console.log('   user_id: user-2');
    console.log('   quiz_key: "posttest"');
    console.log('   set_identifier: "B"');
    console.log('   score: 26/30');
    console.log('');
    console.log('User 3 (chose Set C):');
    console.log('   id: uuid-5');
    console.log('   user_id: user-3');
    console.log('   quiz_key: "pretest"');
    console.log('   set_identifier: null');
    console.log('   score: 24/30');
    console.log('');
    console.log('   id: uuid-6');
    console.log('   user_id: user-3');
    console.log('   quiz_key: "posttest"');
    console.log('   set_identifier: "C"');
    console.log('   score: 27/30');
    
    // 8. Query examples
    console.log('\n8. 🔍 Query Examples:');
    console.log('-' .repeat(40));
    
    console.log('Get all posttest results by set:');
    console.log('   SELECT * FROM quiz_sessions WHERE quiz_key = \'posttest\' AND set_identifier = \'A\';');
    console.log('');
    console.log('Get user\'s complete assessment:');
    console.log('   SELECT * FROM quiz_sessions WHERE user_id = \'user-1\';');
    console.log('');
    console.log('Get posttest statistics by set:');
    console.log('   SELECT set_identifier, COUNT(*), AVG(score) FROM quiz_sessions WHERE quiz_key = \'posttest\' GROUP BY set_identifier;');
    console.log('');
    console.log('Get users who chose each set:');
    console.log('   SELECT set_identifier, COUNT(DISTINCT user_id) FROM quiz_sessions WHERE quiz_key = \'posttest\' GROUP BY set_identifier;');
    
    console.log('\n🎯 IMPLEMENTATION READY!');
    console.log('This approach will properly handle all 3 post-test sets while maintaining data integrity.');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

// Run the analysis
analyzePostTestSets();
