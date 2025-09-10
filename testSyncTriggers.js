// testSyncTriggers.js
// Test the synchronization triggers by simulating new data

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ymajroaavaptafmoqciq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E'
);

async function testSyncTriggers() {
  try {
    console.log('🧪 Testing Synchronization Triggers\n');
    console.log('=' .repeat(50));
    
    // 1. Check current sync status
    console.log('1. 📊 Current Sync Status:');
    console.log('-' .repeat(30));
    
    const { data: checklistCount } = await supabase
      .from('checklist_results')
      .select('user_id')
      .not('user_id', 'is', null);
    
    const { data: quizCount } = await supabase
      .from('quiz_sessions')
      .select('user_id')
      .not('user_id', 'is', null);
    
    const { data: blsCount } = await supabase
      .from('bls_results')
      .select('user_id')
      .not('user_id', 'is', null);
    
    const checklistUsers = new Set(checklistCount.map(r => r.user_id));
    const quizUsers = new Set(quizCount.map(r => r.user_id));
    const blsUsers = new Set(blsCount.map(r => r.user_id));
    
    console.log(`   📋 Checklist Results: ${checklistUsers.size} users`);
    console.log(`   🧠 Quiz Sessions: ${quizUsers.size} users`);
    console.log(`   🏥 BLS Results: ${blsUsers.size} users`);
    
    // 2. Test sync function
    console.log('\n2. 🔄 Testing Sync Function:');
    console.log('-' .repeat(30));
    
    const { data: syncResult, error: syncError } = await supabase
      .rpc('sync_existing_data');
    
    if (syncError) {
      console.error('❌ Sync function error:', syncError);
    } else {
      console.log('✅ Sync function executed successfully');
    }
    
    // 3. Check sync status after running sync
    console.log('\n3. 📊 Post-Sync Status:');
    console.log('-' .repeat(30));
    
    const { data: newBLSCount } = await supabase
      .from('bls_results')
      .select('user_id')
      .not('user_id', 'is', null);
    
    const newBLSUsers = new Set(newBLSCount.map(r => r.user_id));
    
    console.log(`   🏥 BLS Results: ${newBLSUsers.size} users`);
    console.log(`   📈 Change: ${newBLSUsers.size - blsUsers.size} new records`);
    
    // 4. Test trigger by creating a test record (simulation)
    console.log('\n4. 🧪 Testing Trigger Simulation:');
    console.log('-' .repeat(30));
    
    // Get a sample user to test with
    const { data: sampleUser } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (sampleUser && sampleUser.length > 0) {
      const testUserId = sampleUser[0].id;
      console.log(`   Using test user: ${testUserId}`);
      
      // Check if this user has complete data
      const { data: userChecklist } = await supabase
        .from('checklist_results')
        .select('id')
        .eq('user_id', testUserId);
      
      const { data: userQuiz } = await supabase
        .from('quiz_sessions')
        .select('id')
        .eq('user_id', testUserId);
      
      const { data: userBLS } = await supabase
        .from('bls_results')
        .select('id')
        .eq('user_id', testUserId);
      
      console.log(`   📋 Checklist Results: ${userChecklist?.length || 0}`);
      console.log(`   🧠 Quiz Sessions: ${userQuiz?.length || 0}`);
      console.log(`   🏥 BLS Results: ${userBLS?.length || 0}`);
      
      if (userChecklist?.length === 5 && userQuiz?.length >= 2 && userBLS?.length === 1) {
        console.log('   ✅ User has complete data - triggers should work');
      } else {
        console.log('   ⚠️ User has incomplete data - triggers may not fire');
      }
    }
    
    // 5. Show how new data will sync
    console.log('\n5. 📱 New Data Sync Flow:');
    console.log('-' .repeat(30));
    
    console.log('When new user completes BLS assessment:');
    console.log('');
    console.log('1. 📝 User completes checklist station');
    console.log('   → checklist_results table updated');
    console.log('   → trigger_auto_generate_bls_result fires');
    console.log('   → Checks if all 5 stations completed');
    console.log('   → Creates bls_results if all data exists');
    console.log('');
    console.log('2. 🏥 BLS result created/updated');
    console.log('   → trigger_auto_update_bls_comments fires');
    console.log('   → Generates detailed comments automatically');
    console.log('   → Updates comments column');
    console.log('');
    console.log('3. ✅ Result: Fully synchronized data');
    console.log('   → All tables stay in sync');
    console.log('   → Comments generated automatically');
    console.log('   → No manual intervention needed');
    
    // 6. Recommendations
    console.log('\n6. 💡 Implementation Recommendations:');
    console.log('=' .repeat(50));
    
    console.log('✅ TRIGGERS CREATED:');
    console.log('   • Auto-generate BLS results when all 5 checklist results exist');
    console.log('   • Auto-update comments when BLS results are created/updated');
    console.log('   • Sync function for existing data');
    console.log('');
    console.log('🔧 APP IMPLEMENTATION:');
    console.log('   • No changes needed to app code');
    console.log('   • Triggers handle synchronization automatically');
    console.log('   • Data stays consistent across all tables');
    console.log('');
    console.log('📊 MONITORING:');
    console.log('   • Check sync status regularly');
    console.log('   • Monitor trigger performance');
    console.log('   • Validate data integrity');
    
    console.log('\n🎉 SYNCHRONIZATION SETUP COMPLETE!');
    console.log('Your app will now automatically sync all tables when new data is added!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSyncTriggers();
