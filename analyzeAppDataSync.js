// analyzeAppDataSync.js
// Analyze how data flows when new data is added from the app

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ymajroaavaptafmoqciq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E'
);

async function analyzeAppDataSync() {
  try {
    console.log('🔄 Analyzing App Data Synchronization Flow\n');
    console.log('=' .repeat(60));
    
    // 1. Check current table relationships
    console.log('1. 📊 Current Table Structure Analysis:');
    console.log('-' .repeat(40));
    
    // Get sample data from each table
    const { data: profiles } = await supabase.from('profiles').select('id, full_name').limit(1);
    const { data: checklistResults } = await supabase.from('checklist_results').select('id, user_id, checklist_type').limit(1);
    const { data: quizSessions } = await supabase.from('quiz_sessions').select('id, user_id, quiz_key').limit(1);
    const { data: blsResults } = await supabase.from('bls_results').select('id, user_id').limit(1);
    
    console.log('📋 Tables and their purposes:');
    console.log('   • profiles: User master data');
    console.log('   • checklist_results: Individual station assessments (5 per user)');
    console.log('   • quiz_sessions: Pre/post test scores (2 per user)');
    console.log('   • bls_results: Comprehensive BLS assessment summary (1 per user)');
    
    // 2. Analyze data flow when new user is added
    console.log('\n2. 🔄 Data Flow Analysis (New User):');
    console.log('-' .repeat(40));
    
    console.log('When a new user completes BLS assessment:');
    console.log('');
    console.log('📱 APP FLOW:');
    console.log('   1. User registers → profiles table');
    console.log('   2. User takes pretest → quiz_sessions table (quiz_key: "pretest")');
    console.log('   3. User completes 5 BLS stations → checklist_results table (5 records)');
    console.log('   4. User takes posttest → quiz_sessions table (quiz_key: "posttest")');
    console.log('   5. System calculates overall BLS result → bls_results table (1 record)');
    console.log('   6. System generates comments → bls_results.comments column');
    
    // 3. Check if there are any triggers or automatic sync
    console.log('\n3. 🔍 Current Synchronization Status:');
    console.log('-' .repeat(40));
    
    // Check if there are any missing relationships
    const { data: allChecklistResults } = await supabase
      .from('checklist_results')
      .select('user_id')
      .not('user_id', 'is', null);
    
    const { data: allQuizSessions } = await supabase
      .from('quiz_sessions')
      .select('user_id')
      .not('user_id', 'is', null);
    
    const { data: allBLSResults } = await supabase
      .from('bls_results')
      .select('user_id')
      .not('user_id', 'is', null);
    
    const checklistUsers = new Set(allChecklistResults.map(r => r.user_id));
    const quizUsers = new Set(allQuizSessions.map(r => r.user_id));
    const blsUsers = new Set(allBLSResults.map(r => r.user_id));
    
    console.log('✅ Current synchronization:');
    console.log(`   • Checklist Results: ${checklistUsers.size} unique users`);
    console.log(`   • Quiz Sessions: ${quizUsers.size} unique users`);
    console.log(`   • BLS Results: ${blsUsers.size} unique users`);
    
    const allUsers = new Set([...checklistUsers, ...quizUsers, ...blsUsers]);
    const completeUsers = [...allUsers].filter(userId => 
      checklistUsers.has(userId) && quizUsers.has(userId) && blsUsers.has(userId)
    );
    
    console.log(`   • Complete data: ${completeUsers.length}/${allUsers.size} users`);
    
    // 4. Identify potential sync issues
    console.log('\n4. ⚠️ Potential Synchronization Issues:');
    console.log('-' .repeat(40));
    
    const missingFromChecklist = [...allUsers].filter(userId => !checklistUsers.has(userId));
    const missingFromQuiz = [...allUsers].filter(userId => !quizUsers.has(userId));
    const missingFromBLS = [...allUsers].filter(userId => !blsUsers.has(userId));
    
    if (missingFromChecklist.length > 0) {
      console.log(`❌ ${missingFromChecklist.length} users missing checklist results`);
    }
    if (missingFromQuiz.length > 0) {
      console.log(`❌ ${missingFromQuiz.length} users missing quiz sessions`);
    }
    if (missingFromBLS.length > 0) {
      console.log(`❌ ${missingFromBLS.length} users missing BLS results`);
    }
    
    if (missingFromChecklist.length === 0 && missingFromQuiz.length === 0 && missingFromBLS.length === 0) {
      console.log('✅ All users have complete data across all tables');
    }
    
    // 5. App synchronization recommendations
    console.log('\n5. 💡 App Synchronization Recommendations:');
    console.log('-' .repeat(40));
    
    console.log('🔧 TO ENSURE PROPER SYNC WHEN ADDING NEW DATA:');
    console.log('');
    console.log('1. 📱 APP-SIDE VALIDATION:');
    console.log('   • Validate user exists in profiles before creating other records');
    console.log('   • Ensure all 5 checklist stations are completed before creating bls_results');
    console.log('   • Validate both pretest and posttest are completed');
    console.log('');
    console.log('2. 🔄 DATABASE TRIGGERS (Recommended):');
    console.log('   • Create trigger to auto-generate bls_results when all 5 checklist_results exist');
    console.log('   • Create trigger to auto-update comments when bls_results is created/updated');
    console.log('   • Create trigger to validate data integrity');
    console.log('');
    console.log('3. 📊 DATA CONSISTENCY CHECKS:');
    console.log('   • Run periodic sync checks');
    console.log('   • Validate user_id consistency across all tables');
    console.log('   • Ensure checklist_results use standardized items from checklist_items');
    console.log('');
    console.log('4. 🚨 ERROR HANDLING:');
    console.log('   • Handle partial data creation gracefully');
    console.log('   • Provide rollback mechanisms for failed syncs');
    console.log('   • Log sync operations for debugging');
    
    // 6. Show current sync status
    console.log('\n6. 📈 Current Sync Status Summary:');
    console.log('=' .repeat(60));
    
    if (completeUsers.length === allUsers.size) {
      console.log('🎉 PERFECT SYNCHRONIZATION!');
      console.log('   All users have complete data across all tables');
      console.log('   System is ready for new data additions');
    } else {
      console.log('⚠️ PARTIAL SYNCHRONIZATION');
      console.log(`   ${completeUsers.length}/${allUsers.size} users have complete data`);
      console.log('   Some users may have incomplete records');
    }
    
    console.log('\n🔧 NEXT STEPS FOR APP DATA SYNC:');
    console.log('1. Implement proper validation in the app');
    console.log('2. Add database triggers for automatic sync');
    console.log('3. Test with new user data');
    console.log('4. Monitor sync status regularly');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

// Run the analysis
analyzeAppDataSync();
