// removeAdminFromBlsResults.js - Remove AMRI AMIT (admin) from bls_results table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeAdminFromBlsResults() {
  console.log('🔧 Removing AMRI AMIT (admin) from bls_results table...\n');

  try {
    // First, check if AMRI AMIT exists in bls_results
    console.log('1. Checking for AMRI AMIT in bls_results...');
    const { data: amriBlsResults, error: amriBlsError } = await supabase
      .from('bls_results')
      .select('id, user_id, participant_name, participant_ic')
      .eq('user_id', '60885e29-e0e9-45f6-9161-ac564e69609d');

    if (amriBlsError) {
      console.error('❌ Error checking AMRI AMIT in bls_results:', amriBlsError);
      return;
    }

    if (amriBlsResults.length === 0) {
      console.log('✅ AMRI AMIT not found in bls_results - no action needed');
      return;
    }

    console.log(`Found ${amriBlsResults.length} AMRI AMIT records in bls_results:`);
    amriBlsResults.forEach((record, index) => {
      console.log(`${index + 1}. ID: ${record.id}, Name: ${record.participant_name}, IC: ${record.participant_ic}`);
    });
    console.log('');

    // Remove AMRI AMIT from bls_results
    console.log('2. Removing AMRI AMIT from bls_results...');
    const { error: deleteError } = await supabase
      .from('bls_results')
      .delete()
      .eq('user_id', '60885e29-e0e9-45f6-9161-ac564e69609d');

    if (deleteError) {
      console.error('❌ Error removing AMRI AMIT from bls_results:', deleteError);
      return;
    }

    console.log('✅ Successfully removed AMRI AMIT from bls_results');
    console.log('');

    // Verify removal
    console.log('3. Verifying removal...');
    const { data: verifyResults, error: verifyError } = await supabase
      .from('bls_results')
      .select('id, user_id, participant_name, participant_ic')
      .eq('user_id', '60885e29-e0e9-45f6-9161-ac564e69609d');

    if (verifyError) {
      console.error('❌ Error verifying removal:', verifyError);
      return;
    }

    if (verifyResults.length === 0) {
      console.log('✅ AMRI AMIT successfully removed from bls_results');
    } else {
      console.log(`❌ AMRI AMIT still found in bls_results: ${verifyResults.length} records`);
    }
    console.log('');

    // Check final counts
    console.log('4. Final counts...');
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

    // Test the app's query to make sure it works now
    console.log('\n5. Testing app query...');
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
removeAdminFromBlsResults();

