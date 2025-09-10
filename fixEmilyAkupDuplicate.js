// fixEmilyAkupDuplicate.js - Fix EMILY AKUP duplicate records
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixEmilyAkupDuplicate() {
  console.log('🔧 Fixing EMILY AKUP duplicate records...\n');

  try {
    // Get EMILY AKUP's records
    console.log('1. Getting EMILY AKUP records...');
    const { data: emilyRecords, error: emilyError } = await supabase
      .from('bls_results')
      .select('id, user_id, participant_name, participant_ic, created_at, pre_test_score, post_test_score')
      .eq('participant_ic', '820924135946')
      .eq('participant_name', 'EMILY AKUP')
      .order('created_at');

    if (emilyError) {
      console.error('❌ Error getting EMILY AKUP records:', emilyError);
      return;
    }

    console.log(`Found ${emilyRecords.length} EMILY AKUP records:`);
    emilyRecords.forEach((record, index) => {
      console.log(`${index + 1}. ID: ${record.id}, User: ${record.user_id}, Created: ${record.created_at}, Pre: ${record.pre_test_score}, Post: ${record.post_test_score}`);
    });
    console.log('');

    // Check which user_id is correct by checking profiles
    console.log('2. Checking which user_id is correct...');
    const userIds = [...new Set(emilyRecords.map(r => r.user_id))];
    
    for (const userId of userIds) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, ic, role')
        .eq('id', userId)
        .single();
      
      if (profileError) {
        console.log(`❌ User ${userId} not found in profiles: ${profileError.message}`);
      } else {
        console.log(`✅ User ${userId} found in profiles: ${profile.full_name} (${profile.ic}) - Role: ${profile.role}`);
      }
    }
    console.log('');

    // Determine which record to keep (the one with the correct user_id in profiles)
    const correctUserId = '1543357e-7c30-4f74-9b0f-333843e42a15'; // This should be the correct one
    const incorrectUserId = 'cfd91af0-0181-4616-875b-a732691dadb7'; // This should be removed

    console.log(`3. Keeping record with user_id: ${correctUserId}`);
    console.log(`   Removing record with user_id: ${incorrectUserId}`);
    console.log('');

    // Remove the incorrect record
    const { error: deleteError } = await supabase
      .from('bls_results')
      .delete()
      .eq('user_id', incorrectUserId)
      .eq('participant_ic', '820924135946')
      .eq('participant_name', 'EMILY AKUP');

    if (deleteError) {
      console.error('❌ Error removing incorrect record:', deleteError);
      return;
    }

    console.log('✅ Removed incorrect EMILY AKUP record');
    console.log('');

    // Verify the fix
    console.log('4. Verifying the fix...');
    const { data: verifyRecords, error: verifyError } = await supabase
      .from('bls_results')
      .select('id, user_id, participant_name, participant_ic, created_at')
      .eq('participant_ic', '820924135946')
      .eq('participant_name', 'EMILY AKUP');

    if (verifyError) {
      console.error('❌ Error verifying fix:', verifyError);
      return;
    }

    console.log(`EMILY AKUP records after fix: ${verifyRecords.length}`);
    verifyRecords.forEach((record, index) => {
      console.log(`${index + 1}. ID: ${record.id}, User: ${record.user_id}, Created: ${record.created_at}`);
    });
    console.log('');

    // Check final counts
    console.log('5. Final counts...');
    const { count: finalBlsCount, error: finalBlsCountError } = await supabase
      .from('bls_results')
      .select('*', { count: 'exact', head: true });

    const { data: finalBlsResults, error: finalBlsResultsError } = await supabase
      .from('bls_results')
      .select('user_id')
      .not('user_id', 'is', null);

    if (finalBlsCountError || finalBlsResultsError) {
      console.error('❌ Error getting final counts');
      return;
    }

    const finalBlsUserIds = [...new Set(finalBlsResults.map(r => r.user_id))];

    console.log(`Final bls_results count: ${finalBlsCount} records`);
    console.log(`Final unique participants: ${finalBlsUserIds.length}`);
    console.log(`Expected: 57 participants`);
    console.log(`Status: ${finalBlsUserIds.length === 57 ? '✅ CORRECT' : '❌ INCORRECT'}`);

    // Test the app query
    console.log('\n6. Testing app query...');
    const { data: testResults, error: testError } = await supabase
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

    if (testError) {
      console.error('❌ App query failed:', testError);
    } else {
      console.log(`✅ App query successful: ${testResults.length} records`);
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
fixEmilyAkupDuplicate();

