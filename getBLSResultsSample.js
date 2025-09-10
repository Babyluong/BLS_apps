// getBLSResultsSample.js
// Get a sample from bls_results table to see its structure

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function getBLSResultsSample() {
  try {
    console.log('🔍 Getting sample from bls_results table...\n');

    // Get all records to see the structure
    const { data, error } = await supabase
      .from('bls_results')
      .select('*')
      .limit(5);

    if (error) {
      console.log('❌ Error accessing bls_results table:', error.message);
      return;
    }

    if (!data || data.length === 0) {
      console.log('⚠️ bls_results table is empty');
      return;
    }

    console.log(`✅ Found ${data.length} records in bls_results table`);
    console.log('Table structure:', Object.keys(data[0]));
    
    // Show sample data
    console.log('\nSample record:');
    Object.entries(data[0]).forEach(([key, value]) => {
      console.log(`  ${key}: ${typeof value} (${value})`);
    });

    // Show all records
    console.log('\nAll records:');
    data.forEach((record, index) => {
      console.log(`\nRecord ${index + 1}:`);
      console.log(`  ID: ${record.id}`);
      console.log(`  User ID: ${record.user_id}`);
      console.log(`  Pre-test: ${record.pre_test_score || 'N/A'}`);
      console.log(`  Post-test: ${record.post_test_score || 'N/A'}`);
      console.log(`  One-man CPR: ${record.one_man_cpr_pass || 'N/A'}`);
      console.log(`  Two-man CPR: ${record.two_man_cpr_pass || 'N/A'}`);
      console.log(`  Adult Choking: ${record.adult_choking_pass || 'N/A'}`);
      console.log(`  Infant Choking: ${record.infant_choking_pass || 'N/A'}`);
      console.log(`  Infant CPR: ${record.infant_cpr_pass || 'N/A'}`);
    });

  } catch (error) {
    console.error('❌ Error checking table:', error);
  }
}

getBLSResultsSample();

