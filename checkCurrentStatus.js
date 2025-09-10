// checkCurrentStatus.js
// Check current status of bls_results table

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCurrentStatus() {
  try {
    console.log('🔍 Checking current status of bls_results...\n');

    // Get all bls_results records
    const { data: blsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('*')
      .order('created_at', { ascending: false });

    if (blsError) {
      console.log('❌ Error fetching bls_results:', blsError.message);
      return;
    }

    console.log(`📊 Current bls_results status:`);
    console.log(`- Total records: ${blsResults.length}`);
    
    const uniqueUsers = new Set(blsResults.map(r => r.user_id));
    console.log(`- Unique users: ${uniqueUsers.size}`);

    // Check if we have the expected 56 records
    if (blsResults.length === 56) {
      console.log(`✅ Perfect! We have exactly 56 records for 56 participants.`);
    } else if (blsResults.length > 56) {
      console.log(`⚠️ We have ${blsResults.length} records instead of 56. Extra: ${blsResults.length - 56}`);
    } else {
      console.log(`⚠️ We have ${blsResults.length} records instead of 56. Missing: ${56 - blsResults.length}`);
    }

    // Show sample records
    console.log(`\n📋 Sample records:`);
    blsResults.slice(0, 3).forEach((record, index) => {
      console.log(`  ${index + 1}. User: ${record.user_id.substring(0, 8)}...`);
      console.log(`     Pre-test: ${record.pre_test_score || 'N/A'}, Post-test: ${record.post_test_score || 'N/A'}`);
      console.log(`     One-man CPR: ${record.one_man_cpr_pass ? '✓' : '✗'}`);
      console.log(`     Two-man CPR: ${record.two_man_cpr_pass ? '✓' : '✗'}`);
      console.log(`     Adult Choking: ${record.adult_choking_pass ? '✓' : '✗'}`);
      console.log(`     Infant Choking: ${record.infant_choking_pass ? '✓' : '✗'}`);
      console.log(`     Infant CPR: ${record.infant_cpr_pass ? '✓' : '✗'}`);
    });

  } catch (error) {
    console.error('❌ Error checking status:', error);
  }
}

checkCurrentStatus();

