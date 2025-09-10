// crossCheckAllTables.js
// Cross-check checklist_results, quiz_sessions, and bls_results tables for synchronization

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ymajroaavaptafmoqciq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E'
);

async function crossCheckAllTables() {
  try {
    console.log('🔍 Starting comprehensive cross-check of all BLS tables...\n');
    
    // 1. Get checklist_results data
    console.log('1. 📋 Analyzing checklist_results table...');
    const { data: checklistResults, error: checklistError } = await supabase
      .from('checklist_results')
      .select('id, user_id, checklist_type, created_at, updated_at, checklist_details')
      .order('created_at', { ascending: true });
    
    if (checklistError) {
      console.error('❌ Error fetching checklist_results:', checklistError);
      return;
    }
    
    console.log(`   📊 Found ${checklistResults.length} checklist results`);
    
    // 2. Get quiz_sessions data
    console.log('\n2. 🧠 Analyzing quiz_sessions table...');
    const { data: quizSessions, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('id, user_id, quiz_key, started_at, updated_at, score, total_questions, participant_name, participant_ic')
      .order('started_at', { ascending: true });
    
    if (quizError) {
      console.error('❌ Error fetching quiz_sessions:', quizError);
      return;
    }
    
    console.log(`   📊 Found ${quizSessions.length} quiz sessions`);
    
    // 3. Get bls_results data
    console.log('\n3. 🏥 Analyzing bls_results table...');
    const { data: blsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('id, user_id, created_at, updated_at, pre_test_score, post_test_score, participant_name, participant_ic')
      .order('created_at', { ascending: true });
    
    if (blsError) {
      console.error('❌ Error fetching bls_results:', blsError);
      return;
    }
    
    console.log(`   📊 Found ${blsResults.length} BLS results`);
    
    // 4. Analyze user distribution
    console.log('\n4. 👥 Analyzing user distribution...');
    
    const checklistUsers = new Set(checklistResults.map(r => r.user_id));
    const quizUsers = new Set(quizSessions.map(r => r.user_id));
    const blsUsers = new Set(blsResults.map(r => r.user_id));
    
    console.log(`   📋 Checklist results: ${checklistUsers.size} unique users`);
    console.log(`   🧠 Quiz sessions: ${quizUsers.size} unique users`);
    console.log(`   🏥 BLS results: ${blsUsers.size} unique users`);
    
    // 5. Find users with data in all three tables
    const allUsers = new Set([...checklistUsers, ...quizUsers, ...blsUsers]);
    const completeUsers = new Set();
    
    allUsers.forEach(userId => {
      if (checklistUsers.has(userId) && quizUsers.has(userId) && blsUsers.has(userId)) {
        completeUsers.add(userId);
      }
    });
    
    console.log(`   ✅ Users with complete data (all 3 tables): ${completeUsers.size}`);
    
    // 6. Find users missing from each table
    const missingFromChecklist = [...allUsers].filter(userId => !checklistUsers.has(userId));
    const missingFromQuiz = [...allUsers].filter(userId => !quizUsers.has(userId));
    const missingFromBLS = [...allUsers].filter(userId => !blsUsers.has(userId));
    
    console.log(`   ❌ Users missing from checklist_results: ${missingFromChecklist.length}`);
    console.log(`   ❌ Users missing from quiz_sessions: ${missingFromQuiz.length}`);
    console.log(`   ❌ Users missing from bls_results: ${missingFromBLS.length}`);
    
    // 7. Analyze by station/quiz type
    console.log('\n5. 🎯 Analyzing by station/quiz type...');
    
    const checklistByType = {};
    checklistResults.forEach(result => {
      checklistByType[result.checklist_type] = (checklistByType[result.checklist_type] || 0) + 1;
    });
    
    const quizByType = {};
    quizSessions.forEach(session => {
      quizByType[session.quiz_key] = (quizByType[session.quiz_key] || 0) + 1;
    });
    
    console.log('   📋 Checklist results by type:');
    Object.entries(checklistByType).forEach(([type, count]) => {
      console.log(`      ${type}: ${count} results`);
    });
    
    console.log('   🧠 Quiz sessions by type:');
    Object.entries(quizByType).forEach(([type, count]) => {
      console.log(`      ${type}: ${count} sessions`);
    });
    
    console.log('   🏥 BLS results: Single comprehensive record per user');
    console.log(`      Total BLS results: ${blsResults.length} users`);
    
    // 8. Check for data consistency issues
    console.log('\n6. 🔍 Checking for data consistency issues...');
    
    let issuesFound = 0;
    
    // Check for users with checklist results but no quiz sessions
    const checklistOnlyUsers = [...checklistUsers].filter(userId => !quizUsers.has(userId));
    if (checklistOnlyUsers.length > 0) {
      console.log(`   ⚠️  ${checklistOnlyUsers.length} users have checklist results but no quiz sessions`);
      issuesFound++;
    }
    
    // Check for users with quiz sessions but no checklist results
    const quizOnlyUsers = [...quizUsers].filter(userId => !checklistUsers.has(userId));
    if (quizOnlyUsers.length > 0) {
      console.log(`   ⚠️  ${quizOnlyUsers.length} users have quiz sessions but no checklist results`);
      issuesFound++;
    }
    
    // Check for users with BLS results but no checklist results
    const blsOnlyUsers = [...blsUsers].filter(userId => !checklistUsers.has(userId));
    if (blsOnlyUsers.length > 0) {
      console.log(`   ⚠️  ${blsOnlyUsers.length} users have BLS results but no checklist results`);
      issuesFound++;
    }
    
    // Check for users with checklist results but no BLS results
    const checklistNoBLS = [...checklistUsers].filter(userId => !blsUsers.has(userId));
    if (checklistNoBLS.length > 0) {
      console.log(`   ⚠️  ${checklistNoBLS.length} users have checklist results but no BLS results`);
      issuesFound++;
    }
    
    // 9. Sample data verification
    console.log('\n7. 📝 Sample data verification...');
    
    if (completeUsers.size > 0) {
      const sampleUserId = [...completeUsers][0];
      console.log(`   🔍 Sample user: ${sampleUserId}`);
      
      const userChecklist = checklistResults.filter(r => r.user_id === sampleUserId);
      const userQuiz = quizSessions.filter(r => r.user_id === sampleUserId);
      const userBLS = blsResults.filter(r => r.user_id === sampleUserId);
      
      console.log(`      📋 Checklist results: ${userChecklist.length}`);
      console.log(`      🧠 Quiz sessions: ${userQuiz.length}`);
      console.log(`      🏥 BLS results: ${userBLS.length}`);
      
      // Show sample checklist details
      if (userChecklist.length > 0) {
        const sampleChecklist = userChecklist[0];
        const detailsCount = Object.keys(sampleChecklist.checklist_details || {}).length;
        console.log(`      📊 Sample checklist details: ${detailsCount} items`);
      }
    }
    
    // 10. Summary and recommendations
    console.log('\n8. 📊 Summary and Recommendations...');
    
    if (issuesFound === 0) {
      console.log('   ✅ All tables appear to be well synchronized!');
    } else {
      console.log(`   ⚠️  Found ${issuesFound} potential synchronization issues`);
      console.log('   💡 Recommendations:');
      
      if (missingFromChecklist.length > 0) {
        console.log('      - Consider creating missing checklist results for users with quiz/BLS data');
      }
      if (missingFromQuiz.length > 0) {
        console.log('      - Consider creating missing quiz sessions for users with checklist/BLS data');
      }
      if (missingFromBLS.length > 0) {
        console.log('      - Consider creating missing BLS results for users with checklist/quiz data');
      }
    }
    
    console.log(`\n🎯 Cross-check complete!`);
    console.log(`📊 Total unique users across all tables: ${allUsers.size}`);
    console.log(`✅ Users with complete data: ${completeUsers.size}`);
    console.log(`❌ Users with incomplete data: ${allUsers.size - completeUsers.size}`);
    
  } catch (error) {
    console.error('❌ Cross-check failed:', error);
  }
}

// Run the cross-check
crossCheckAllTables();