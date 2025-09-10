// removeAmriFromQuizSessions.js - Remove AMRI AMIT from quiz_sessions table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeAmriFromQuizSessions() {
  console.log('🔧 Removing AMRI AMIT from quiz_sessions table...\n');

  try {
    // Check AMRI AMIT in quiz_sessions
    console.log('1. Checking AMRI AMIT in quiz_sessions...');
    const { data: amriQuiz, error: amriQuizError } = await supabase
      .from('quiz_sessions')
      .select('id, user_id, participant_name, participant_ic, created_at')
      .eq('user_id', '60885e29-e0e9-45f6-9161-ac564e69609d');

    if (amriQuizError) {
      console.error('❌ Error checking AMRI AMIT in quiz_sessions:', amriQuizError);
      return;
    }

    console.log(`Found ${amriQuiz.length} AMRI AMIT records in quiz_sessions:`);
    amriQuiz.forEach((record, index) => {
      console.log(`${index + 1}. ID: ${record.id}, Name: ${record.participant_name}, IC: ${record.participant_ic}, Created: ${record.created_at}`);
    });
    console.log('');

    if (amriQuiz.length === 0) {
      console.log('✅ AMRI AMIT not found in quiz_sessions - no action needed');
      return;
    }

    // Remove AMRI AMIT from quiz_sessions
    console.log('2. Removing AMRI AMIT from quiz_sessions...');
    const { error: deleteError } = await supabase
      .from('quiz_sessions')
      .delete()
      .eq('user_id', '60885e29-e0e9-45f6-9161-ac564e69609d');

    if (deleteError) {
      console.error('❌ Error removing AMRI AMIT from quiz_sessions:', deleteError);
      return;
    }

    console.log('✅ Successfully removed AMRI AMIT from quiz_sessions');
    console.log('');

    // Verify removal
    console.log('3. Verifying removal...');
    const { data: verifyResults, error: verifyError } = await supabase
      .from('quiz_sessions')
      .select('id, user_id, participant_name, participant_ic')
      .eq('user_id', '60885e29-e0e9-45f6-9161-ac564e69609d');

    if (verifyError) {
      console.error('❌ Error verifying removal:', verifyError);
      return;
    }

    if (verifyResults.length === 0) {
      console.log('✅ AMRI AMIT successfully removed from quiz_sessions');
    } else {
      console.log(`❌ AMRI AMIT still found in quiz_sessions: ${verifyResults.length} records`);
    }
    console.log('');

    // Check final counts
    console.log('4. Final counts...');
    const { count: finalQuizCount, error: finalQuizCountError } = await supabase
      .from('quiz_sessions')
      .select('*', { count: 'exact', head: true });

    const { data: finalQuizResults, error: finalQuizResultsError } = await supabase
      .from('quiz_sessions')
      .select('user_id')
      .not('user_id', 'is', null);

    if (finalQuizCountError || finalQuizResultsError) {
      console.error('❌ Error getting final counts');
      return;
    }

    const finalQuizUserIds = [...new Set(finalQuizResults.map(r => r.user_id))];

    console.log(`Final quiz_sessions count: ${finalQuizCount} records`);
    console.log(`Final unique participants: ${finalQuizUserIds.length}`);
    console.log('');

    // Test the app query now
    console.log('5. Testing app query after cleanup...');
    const { data: testBlsResults, error: testBlsError } = await supabase
      .from('bls_results')
      .select(`
        id,
        user_id,
        participant_name,
        participant_ic,
        pre_test_score,
        post_test_score,
        one_man_cpr_pass,
        two_man_cpr_pass,
        adult_choking_pass,
        infant_choking_pass,
        infant_cpr_pass,
        one_man_cpr_details,
        two_man_cpr_details,
        adult_choking_details,
        infant_choking_details,
        infant_cpr_details,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (testBlsError) {
      console.error('❌ BLS query failed:', testBlsError);
      return;
    }

    console.log(`✅ BLS query successful: ${testBlsResults.length} records`);

    // Test profiles query
    const userIds = [...new Set(testBlsResults.map(r => r.user_id))];
    const { data: testProfiles, error: testProfilesError } = await supabase
      .from('profiles')
      .select('id, jawatan, role')
      .in('id', userIds);

    if (testProfilesError) {
      console.error('❌ Profiles query failed:', testProfilesError);
      return;
    }

    console.log(`✅ Profiles query successful: ${testProfiles.length} records`);
    console.log('');

    // Check if all user_ids in bls_results exist in profiles
    console.log('6. Checking user_id consistency...');
    const missingProfiles = userIds.filter(userId => !testProfiles.some(p => p.id === userId));
    
    if (missingProfiles.length > 0) {
      console.log(`❌ Found ${missingProfiles.length} user_ids in bls_results that don't exist in profiles:`);
      missingProfiles.forEach(userId => console.log(`  - ${userId}`));
    } else {
      console.log('✅ All user_ids in bls_results exist in profiles');
    }

    console.log('\n🎉 Cleanup completed! The app should now work correctly.');

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
removeAmriFromQuizSessions();

