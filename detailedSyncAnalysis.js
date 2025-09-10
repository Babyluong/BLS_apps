// detailedSyncAnalysis.js
// Detailed analysis of synchronization between all BLS tables

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ymajroaavaptafmoqciq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E'
);

async function detailedSyncAnalysis() {
  try {
    console.log('🔍 Detailed Synchronization Analysis of BLS Tables\n');
    console.log('=' .repeat(60));
    
    // Get all data
    const { data: checklistResults } = await supabase
      .from('checklist_results')
      .select('id, user_id, checklist_type, created_at, checklist_details')
      .order('created_at', { ascending: true });
    
    const { data: quizSessions } = await supabase
      .from('quiz_sessions')
      .select('id, user_id, quiz_key, started_at, score, total_questions, participant_name, participant_ic')
      .order('started_at', { ascending: true });
    
    const { data: blsResults } = await supabase
      .from('bls_results')
      .select('id, user_id, created_at, pre_test_score, post_test_score, participant_name, participant_ic')
      .order('created_at', { ascending: true });
    
    // 1. Table Overview
    console.log('\n📊 TABLE OVERVIEW');
    console.log('-' .repeat(30));
    console.log(`📋 checklist_results: ${checklistResults.length} records`);
    console.log(`🧠 quiz_sessions:     ${quizSessions.length} records`);
    console.log(`🏥 bls_results:       ${blsResults.length} records`);
    
    // 2. User Analysis
    console.log('\n👥 USER ANALYSIS');
    console.log('-' .repeat(30));
    
    const checklistUsers = new Set(checklistResults.map(r => r.user_id));
    const quizUsers = new Set(quizSessions.map(r => r.user_id));
    const blsUsers = new Set(blsResults.map(r => r.user_id));
    
    console.log(`📋 Users with checklist results: ${checklistUsers.size}`);
    console.log(`🧠 Users with quiz sessions:     ${quizUsers.size}`);
    console.log(`🏥 Users with BLS results:       ${blsUsers.size}`);
    
    // Find complete users
    const allUsers = new Set([...checklistUsers, ...quizUsers, ...blsUsers]);
    const completeUsers = [...allUsers].filter(userId => 
      checklistUsers.has(userId) && quizUsers.has(userId) && blsUsers.has(userId)
    );
    
    console.log(`✅ Users with complete data:     ${completeUsers.length}`);
    console.log(`❌ Users with incomplete data:   ${allUsers.size - completeUsers.size}`);
    
    // 3. Data Distribution Analysis
    console.log('\n📈 DATA DISTRIBUTION');
    console.log('-' .repeat(30));
    
    // Checklist results by type
    const checklistByType = {};
    checklistResults.forEach(result => {
      checklistByType[result.checklist_type] = (checklistByType[result.checklist_type] || 0) + 1;
    });
    
    console.log('📋 Checklist Results by Station:');
    Object.entries(checklistByType).forEach(([type, count]) => {
      console.log(`   ${type.padEnd(20)}: ${count.toString().padStart(3)} results`);
    });
    
    // Quiz sessions by type
    const quizByType = {};
    quizSessions.forEach(session => {
      quizByType[session.quiz_key] = (quizByType[session.quiz_key] || 0) + 1;
    });
    
    console.log('\n🧠 Quiz Sessions by Type:');
    Object.entries(quizByType).forEach(([type, count]) => {
      console.log(`   ${type.padEnd(20)}: ${count.toString().padStart(3)} sessions`);
    });
    
    console.log(`\n🏥 BLS Results: ${blsResults.length} comprehensive records (1 per user)`);
    
    // 4. Per-User Analysis
    console.log('\n🔍 PER-USER ANALYSIS');
    console.log('-' .repeat(30));
    
    const userAnalysis = {};
    allUsers.forEach(userId => {
      userAnalysis[userId] = {
        checklist: checklistResults.filter(r => r.user_id === userId).length,
        quiz: quizSessions.filter(r => r.user_id === userId).length,
        bls: blsResults.filter(r => r.user_id === userId).length,
        checklistTypes: [...new Set(checklistResults.filter(r => r.user_id === userId).map(r => r.checklist_type))],
        quizTypes: [...new Set(quizSessions.filter(r => r.user_id === userId).map(r => r.quiz_key))]
      };
    });
    
    // Show sample users
    console.log('Sample User Analysis (first 5 users):');
    const sampleUsers = completeUsers.slice(0, 5);
    sampleUsers.forEach((userId, index) => {
      const user = userAnalysis[userId];
      console.log(`\n   User ${index + 1}: ${userId}`);
      console.log(`   📋 Checklist: ${user.checklist} results (${user.checklistTypes.join(', ')})`);
      console.log(`   🧠 Quiz:      ${user.quiz} sessions (${user.quizTypes.join(', ')})`);
      console.log(`   🏥 BLS:       ${user.bls} comprehensive record(s)`);
    });
    
    // 5. Data Quality Checks
    console.log('\n🔍 DATA QUALITY CHECKS');
    console.log('-' .repeat(30));
    
    let qualityIssues = 0;
    
    // Check for users with missing checklist results
    const missingChecklist = [...allUsers].filter(userId => !checklistUsers.has(userId));
    if (missingChecklist.length > 0) {
      console.log(`❌ ${missingChecklist.length} users missing checklist results`);
      qualityIssues++;
    }
    
    // Check for users with missing quiz sessions
    const missingQuiz = [...allUsers].filter(userId => !quizUsers.has(userId));
    if (missingQuiz.length > 0) {
      console.log(`❌ ${missingQuiz.length} users missing quiz sessions`);
      qualityIssues++;
    }
    
    // Check for users with missing BLS results
    const missingBLS = [...allUsers].filter(userId => !blsUsers.has(userId));
    if (missingBLS.length > 0) {
      console.log(`❌ ${missingBLS.length} users missing BLS results`);
      qualityIssues++;
    }
    
    // Check for expected checklist types per user
    const expectedChecklistTypes = ['one-man-cpr', 'two-man-cpr', 'infant-cpr', 'adult-choking', 'infant-choking'];
    const incompleteChecklistUsers = completeUsers.filter(userId => {
      const userChecklistTypes = userAnalysis[userId].checklistTypes;
      return !expectedChecklistTypes.every(type => userChecklistTypes.includes(type));
    });
    
    if (incompleteChecklistUsers.length > 0) {
      console.log(`⚠️  ${incompleteChecklistUsers.length} users missing some checklist types`);
      qualityIssues++;
    }
    
    // Check for expected quiz types per user
    const expectedQuizTypes = ['pretest', 'posttest'];
    const incompleteQuizUsers = completeUsers.filter(userId => {
      const userQuizTypes = userAnalysis[userId].quizTypes;
      return !expectedQuizTypes.every(type => userQuizTypes.includes(type));
    });
    
    if (incompleteQuizUsers.length > 0) {
      console.log(`⚠️  ${incompleteQuizUsers.length} users missing some quiz types`);
      qualityIssues++;
    }
    
    if (qualityIssues === 0) {
      console.log('✅ No data quality issues found!');
    }
    
    // 6. Synchronization Summary
    console.log('\n📊 SYNCHRONIZATION SUMMARY');
    console.log('=' .repeat(60));
    
    const syncStatus = {
      totalUsers: allUsers.size,
      completeUsers: completeUsers.length,
      incompleteUsers: allUsers.size - completeUsers.length,
      syncPercentage: Math.round((completeUsers.length / allUsers.size) * 100)
    };
    
    console.log(`📊 Total Users:           ${syncStatus.totalUsers}`);
    console.log(`✅ Complete Data:         ${syncStatus.completeUsers} (${syncStatus.syncPercentage}%)`);
    console.log(`❌ Incomplete Data:       ${syncStatus.incompleteUsers} (${100 - syncStatus.syncPercentage}%)`);
    
    if (syncStatus.syncPercentage === 100) {
      console.log('\n🎉 PERFECT SYNCHRONIZATION!');
      console.log('   All users have complete data across all three tables.');
    } else if (syncStatus.syncPercentage >= 90) {
      console.log('\n✅ EXCELLENT SYNCHRONIZATION!');
      console.log('   Most users have complete data with minor gaps.');
    } else if (syncStatus.syncPercentage >= 70) {
      console.log('\n⚠️  GOOD SYNCHRONIZATION');
      console.log('   Good data coverage but some users missing data.');
    } else {
      console.log('\n❌ POOR SYNCHRONIZATION');
      console.log('   Significant data gaps need attention.');
    }
    
    // 7. Recommendations
    console.log('\n💡 RECOMMENDATIONS');
    console.log('-' .repeat(30));
    
    if (syncStatus.syncPercentage === 100) {
      console.log('✅ No action needed - all data is perfectly synchronized!');
    } else {
      if (missingChecklist.length > 0) {
        console.log(`📋 Create missing checklist results for ${missingChecklist.length} users`);
      }
      if (missingQuiz.length > 0) {
        console.log(`🧠 Create missing quiz sessions for ${missingQuiz.length} users`);
      }
      if (missingBLS.length > 0) {
        console.log(`🏥 Create missing BLS results for ${missingBLS.length} users`);
      }
      if (incompleteChecklistUsers.length > 0) {
        console.log(`📋 Complete missing checklist types for ${incompleteChecklistUsers.length} users`);
      }
      if (incompleteQuizUsers.length > 0) {
        console.log(`🧠 Complete missing quiz types for ${incompleteQuizUsers.length} users`);
      }
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('🎯 Analysis Complete!');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

// Run the analysis
detailedSyncAnalysis();
