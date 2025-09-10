// simpleFixParticipantCount.js
// Simple fix: Remove the problematic shared user_id record to get correct count of 56

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function simpleFixParticipantCount() {
  try {
    console.log('🔧 Simple fix: Removing problematic shared user_id record...\n');

    // Get current count
    const { data: currentBlsResults, error: currentError } = await supabase
      .from('bls_results')
      .select('user_id')
      .order('created_at', { ascending: false });

    if (currentError) {
      console.log('❌ Error fetching current bls_results:', currentError.message);
      return;
    }

    console.log(`Current bls_results count: ${currentBlsResults.length}`);

    // Find the problematic user_id (the one with shared data)
    const problemUserId = '1543357e-7c30-4f74-9b0f-333843e42a15';
    
    // Check if this user exists in bls_results
    const { data: problemUserRecord, error: problemError } = await supabase
      .from('bls_results')
      .select('*')
      .eq('user_id', problemUserId);

    if (problemError) {
      console.log('❌ Error checking for problem user:', problemError.message);
      return;
    }

    if (problemUserRecord && problemUserRecord.length > 0) {
      console.log(`Found problematic user record: ${problemUserRecord[0].id}`);
      console.log(`Pre-test: ${problemUserRecord[0].pre_test_score || 'N/A'}`);
      console.log(`Post-test: ${problemUserRecord[0].post_test_score || 'N/A'}`);
      console.log(`One-man CPR: ${problemUserRecord[0].one_man_cpr_pass || 'N/A'}`);
      console.log(`Two-man CPR: ${problemUserRecord[0].two_man_cpr_pass || 'N/A'}`);
      console.log(`Adult Choking: ${problemUserRecord[0].adult_choking_pass || 'N/A'}`);
      console.log(`Infant Choking: ${problemUserRecord[0].infant_choking_pass || 'N/A'}`);
      console.log(`Infant CPR: ${problemUserRecord[0].infant_cpr_pass || 'N/A'}`);

      // Delete the problematic record
      console.log(`\n🗑️ Deleting problematic record...`);
      const { error: deleteError } = await supabase
        .from('bls_results')
        .delete()
        .eq('user_id', problemUserId);

      if (deleteError) {
        console.log(`❌ Error deleting problematic record: ${deleteError.message}`);
        return;
      }

      console.log(`✅ Deleted problematic record`);
    } else {
      console.log(`✅ Problematic user record not found in bls_results`);
    }

    // Verify the fix
    console.log(`\n🔍 Verifying fix...`);
    const { data: finalBlsResults, error: finalError } = await supabase
      .from('bls_results')
      .select('user_id')
      .order('created_at', { ascending: false });

    if (finalError) {
      console.log('❌ Error verifying fix:', finalError.message);
      return;
    }

    const uniqueUsers = new Set(finalBlsResults.map(r => r.user_id));
    console.log(`✅ Final verification:`);
    console.log(`- Total bls_results records: ${finalBlsResults.length}`);
    console.log(`- Unique users: ${uniqueUsers.size}`);
    console.log(`- Expected: 56 records`);

    if (finalBlsResults.length === 56) {
      console.log(`🎉 SUCCESS! Now have exactly 56 records for 56 participants.`);
    } else {
      console.log(`⚠️ Still have ${finalBlsResults.length} records instead of 56.`);
    }

    // Show a sample of the remaining records
    console.log(`\n📊 Sample of remaining records:`);
    const { data: sampleRecords, error: sampleError } = await supabase
      .from('bls_results')
      .select('user_id, pre_test_score, post_test_score, one_man_cpr_pass, two_man_cpr_pass, adult_choking_pass, infant_choking_pass, infant_cpr_pass')
      .limit(5)
      .order('created_at', { ascending: false });

    if (sampleError) {
      console.log('❌ Error fetching sample records:', sampleError.message);
      return;
    }

    sampleRecords.forEach((record, index) => {
      console.log(`  ${index + 1}. User: ${record.user_id.substring(0, 8)}...`);
      console.log(`     Pre-test: ${record.pre_test_score || 'N/A'}, Post-test: ${record.post_test_score || 'N/A'}`);
      console.log(`     CPR: ${record.one_man_cpr_pass ? '✓' : '✗'}, Choking: ${record.adult_choking_pass ? '✓' : '✗'}`);
    });

  } catch (error) {
    console.error('❌ Error fixing participant count:', error);
  }
}

simpleFixParticipantCount();

