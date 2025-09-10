// checkBLSResultTable.js
// Check the current structure of bls_result table

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBLSResultTable() {
  try {
    console.log('🔍 Checking bls_result table structure...\n');

    // Get a sample record to see the structure
    const { data, error } = await supabase
      .from('bls_result')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Error accessing bls_result table:', error.message);
      return;
    }

    if (!data || data.length === 0) {
      console.log('⚠️ bls_result table is empty or does not exist');
      
      // Try to create a simple test record to see the structure
      console.log('Creating a test record to check structure...');
      const { data: insertData, error: insertError } = await supabase
        .from('bls_result')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000',
          pre_test_score: 0,
          post_test_score: 0,
          one_man_cpr_pass: false,
          two_man_cpr_pass: false,
          adult_choking_pass: false,
          infant_choking_pass: false,
          infant_cpr_pass: false
        })
        .select();

      if (insertError) {
        console.log('❌ Error creating test record:', insertError.message);
        console.log('This suggests the table structure is different than expected');
      } else {
        console.log('✅ Test record created successfully');
        console.log('Table structure:', Object.keys(insertData[0]));
      }
    } else {
      console.log('✅ bls_result table exists and has data');
      console.log('Table structure:', Object.keys(data[0]));
      
      // Show sample data
      console.log('\nSample record:');
      Object.entries(data[0]).forEach(([key, value]) => {
        console.log(`  ${key}: ${typeof value} (${value})`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking table:', error);
  }
}

checkBLSResultTable();

