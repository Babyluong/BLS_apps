// checkBLSResultsStructure.js
// Check the actual structure of bls_results table

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ymajroaavaptafmoqciq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E'
);

async function checkBLSResultsStructure() {
  try {
    console.log('🔍 Checking bls_results table structure...\n');
    
    // Get a sample record to see the actual structure
    const { data: sample, error: sampleError } = await supabase
      .from('bls_results')
      .select('*')
      .limit(1);
    
    if (sampleError) {
      console.error('❌ Error fetching sample from bls_results:', sampleError);
      return;
    }
    
    if (sample && sample.length > 0) {
      console.log('📊 Sample bls_results record:');
      console.log(JSON.stringify(sample[0], null, 2));
      
      console.log('\n📋 Available columns:');
      Object.keys(sample[0]).forEach(column => {
        console.log(`   - ${column}: ${typeof sample[0][column]}`);
      });
    } else {
      console.log('⚠️  No records found in bls_results table');
    }
    
    // Get total count
    const { count, error: countError } = await supabase
      .from('bls_results')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error getting count:', countError);
    } else {
      console.log(`\n📊 Total records in bls_results: ${count}`);
    }
    
  } catch (error) {
    console.error('❌ Error checking bls_results structure:', error);
  }
}

// Run the check
checkBLSResultsStructure();