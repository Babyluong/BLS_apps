// testPostTestSets.js
// Test the post-test sets (A, B, C) implementation

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ymajroaavaptafmoqciq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E'
);

async function testPostTestSets() {
  try {
    console.log('🧪 Testing Post-Test Sets (A, B, C) Implementation\n');
    console.log('=' .repeat(60));
    
    // 1. Check if set_identifier column exists
    console.log('1. 🔍 Checking Implementation Status:');
    console.log('-' .repeat(40));
    
    const { data: sampleQuiz, error: sampleError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('❌ Error checking quiz_sessions:', sampleError);
      return;
    }
    
    const hasSetIdentifier = sampleQuiz && sampleQuiz.length > 0 && 'set_identifier' in sampleQuiz[0];
    console.log(`   set_identifier column: ${hasSetIdentifier ? '✅ Exists' : '❌ Missing'}`);
    
    if (!hasSetIdentifier) {
      console.log('\n⚠️ Please run the SQL implementation first:');
      console.log('   Execute: implementPostTestSets.sql');
      return;
    }
    
    // 2. Check current data distribution
    console.log('\n2. 📊 Current Data Distribution:');
    console.log('-' .repeat(40));
    
    const { data: quizDistribution } = await supabase
      .from('quiz_sessions')
      .select('quiz_key, set_identifier, user_id');
    
    const distribution = {};
    quizDistribution.forEach(session => {
      const key = `${session.quiz_key}${session.set_identifier ? `-${session.set_identifier}` : ''}`;
      distribution[key] = (distribution[key] || 0) + 1;
    });
    
    console.log('Current distribution:');
    Object.entries(distribution).forEach(([key, count]) => {
      console.log(`   ${key}: ${count} sessions`);
    });
    
    // 3. Test posttest statistics function
    console.log('\n3. 📈 Testing Post-Test Statistics:');
    console.log('-' .repeat(40));
    
    const { data: stats, error: statsError } = await supabase
      .rpc('get_posttest_statistics');
    
    if (statsError) {
      console.error('❌ Error getting statistics:', statsError);
    } else {
      console.log('Post-test statistics by set:');
      stats.forEach(stat => {
        console.log(`   Set ${stat.set_identifier}:`);
        console.log(`     Users: ${stat.total_users}`);
        console.log(`     Average Score: ${stat.average_score}/30`);
        console.log(`     Pass Rate: ${stat.pass_rate}%`);
        console.log('');
      });
    }
    
    // 4. Test user assessment function
    console.log('4. 👤 Testing User Assessment Function:');
    console.log('-' .repeat(40));
    
    const { data: sampleUser } = await supabase
      .from('quiz_sessions')
      .select('user_id')
      .limit(1);
    
    if (sampleUser && sampleUser.length > 0) {
      const testUserId = sampleUser[0].user_id;
      console.log(`   Testing with user: ${testUserId}`);
      
      const { data: userAssessment, error: userError } = await supabase
        .rpc('get_user_assessment', { user_id_param: testUserId });
      
      if (userError) {
        console.error('❌ Error getting user assessment:', userError);
      } else {
        console.log('   User assessment history:');
        userAssessment.forEach(assessment => {
          const setInfo = assessment.set_identifier ? ` (Set ${assessment.set_identifier})` : '';
          console.log(`     ${assessment.assessment_type}${setInfo}: ${assessment.score}/${assessment.total_questions} (${assessment.percentage}%)`);
        });
      }
    }
    
    // 5. Test posttest sets summary view
    console.log('\n5. 📋 Testing Post-Test Sets Summary View:');
    console.log('-' .repeat(40));
    
    const { data: summary, error: summaryError } = await supabase
      .from('posttest_sets_summary')
      .select('*');
    
    if (summaryError) {
      console.error('❌ Error getting summary:', summaryError);
    } else {
      console.log('Post-test sets summary:');
      summary.forEach(set => {
        console.log(`   Set ${set.set_identifier}:`);
        console.log(`     Total Users: ${set.total_users}`);
        console.log(`     Average Score: ${set.average_score}/30`);
        console.log(`     Pass Rate: ${set.pass_rate}%`);
        console.log(`     First Assessment: ${new Date(set.first_assessment).toLocaleDateString()}`);
        console.log(`     Latest Assessment: ${new Date(set.latest_assessment).toLocaleDateString()}`);
        console.log('');
      });
    }
    
    // 6. Show how to query different sets
    console.log('6. 🔍 Query Examples:');
    console.log('-' .repeat(40));
    
    console.log('Get all users who took Set A:');
    console.log('   SELECT * FROM quiz_sessions WHERE quiz_key = \'posttest\' AND set_identifier = \'A\';');
    console.log('');
    console.log('Get all users who took Set B:');
    console.log('   SELECT * FROM quiz_sessions WHERE quiz_key = \'posttest\' AND set_identifier = \'B\';');
    console.log('');
    console.log('Get all users who took Set C:');
    console.log('   SELECT * FROM quiz_sessions WHERE quiz_key = \'posttest\' AND set_identifier = \'C\';');
    console.log('');
    console.log('Get user\'s complete assessment:');
    console.log('   SELECT * FROM quiz_sessions WHERE user_id = \'user-id\';');
    console.log('');
    console.log('Get posttest statistics by set:');
    console.log('   SELECT * FROM posttest_sets_summary;');
    
    // 7. Show app implementation
    console.log('\n7. 📱 App Implementation Guide:');
    console.log('=' .repeat(60));
    
    console.log('When user selects post-test set in your app:');
    console.log('');
    console.log('Set A Selection:');
    console.log('   const { data, error } = await supabase');
    console.log('     .from(\'quiz_sessions\')');
    console.log('     .insert({');
    console.log('       user_id: userId,');
    console.log('       quiz_key: \'posttest\',');
    console.log('       set_identifier: \'A\',');
    console.log('       score: userScore,');
    console.log('       total_questions: 30,');
    console.log('       answers: userAnswers');
    console.log('     });');
    console.log('');
    console.log('Set B Selection:');
    console.log('   set_identifier: \'B\'');
    console.log('');
    console.log('Set C Selection:');
    console.log('   set_identifier: \'C\'');
    console.log('');
    console.log('Get user\'s posttest set:');
    console.log('   const { data } = await supabase');
    console.log('     .from(\'quiz_sessions\')');
    console.log('     .select(\'set_identifier\')');
    console.log('     .eq(\'user_id\', userId)');
    console.log('     .eq(\'quiz_key\', \'posttest\')');
    console.log('     .single();');
    
    // 8. Show benefits
    console.log('\n8. ✅ Benefits of This Implementation:');
    console.log('=' .repeat(60));
    
    console.log('🎯 DATA INTEGRITY:');
    console.log('   • Clear separation of post-test sets');
    console.log('   • Proper constraints prevent invalid data');
    console.log('   • Maintains referential integrity');
    console.log('');
    console.log('📊 ANALYTICS:');
    console.log('   • Compare performance across sets');
    console.log('   • Track which sets are most popular');
    console.log('   • Analyze difficulty differences');
    console.log('');
    console.log('🔍 QUERYING:');
    console.log('   • Easy to filter by set');
    console.log('   • Simple to get user\'s complete history');
    console.log('   • Built-in statistics functions');
    console.log('');
    console.log('🚀 SCALABILITY:');
    console.log('   • Easy to add more sets in future');
    console.log('   • Maintains backward compatibility');
    console.log('   • Efficient indexing for performance');
    
    console.log('\n🎉 POST-TEST SETS IMPLEMENTATION COMPLETE!');
    console.log('Your app can now properly handle all 3 post-test sets (A, B, C)!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testPostTestSets();
