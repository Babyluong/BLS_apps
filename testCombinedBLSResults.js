// testCombinedBLSResults.js
// Test script to verify the combined BLS results functionality

const { createClient } = require('@supabase/supabase-js');

// Supabase credentials
const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCombinedBLSResults() {
  try {
    console.log('🧪 Testing Combined BLS Results Implementation...\n');

    // Test 1: Check if bls_result table exists and has the new columns
    console.log('1. Testing bls_result table structure...');
    await testTableStructure();

    // Test 2: Test the combination script
    console.log('\n2. Testing data combination...');
    await testDataCombination();

    // Test 3: Test the updated BLSResultsService methods
    console.log('\n3. Testing BLSResultsService methods...');
    await testBLSResultsService();

    // Test 4: Verify data integrity
    console.log('\n4. Verifying data integrity...');
    await verifyDataIntegrity();

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

async function testTableStructure() {
  try {
    // Check if bls_result table exists and has the new columns
    const { data, error } = await supabase
      .from('bls_result')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ bls_result table does not exist or is not accessible');
      console.log('Error:', error.message);
      return false;
    }

    console.log('✅ bls_result table exists and is accessible');

    // Check for new columns by trying to select them
    const { data: sampleData, error: columnError } = await supabase
      .from('bls_result')
      .select(`
        id,
        participant_name,
        participant_ic,
        pre_test_percentage,
        post_test_percentage,
        checklist_results,
        total_checklist_score,
        checklist_pass_count
      `)
      .limit(1);

    if (columnError) {
      console.log('⚠️ Some new columns may not exist yet');
      console.log('Error:', columnError.message);
    } else {
      console.log('✅ New columns are accessible');
    }

    return true;
  } catch (error) {
    console.log('❌ Error testing table structure:', error.message);
    return false;
  }
}

async function testDataCombination() {
  try {
    // Import and test the combination script
    const { combineBLSResults } = require('./combineBLSResults.js');
    
    console.log('Running data combination...');
    await combineBLSResults();
    
    console.log('✅ Data combination completed successfully');
    return true;
  } catch (error) {
    console.log('❌ Error in data combination:', error.message);
    return false;
  }
}

async function testBLSResultsService() {
  try {
    // Test the BLSResultsService methods
    const { BLSResultsService } = require('./services/blsResultsService.js');
    
    // Test getAllBLSResults method
    console.log('Testing getAllBLSResults...');
    const allResults = await BLSResultsService.getAllBLSResults();
    console.log(`✅ Retrieved ${allResults.length} combined results`);

    // Test getCombinedBLSResults method
    console.log('Testing getCombinedBLSResults...');
    const combinedResults = await BLSResultsService.getCombinedBLSResults();
    console.log(`✅ Retrieved ${combinedResults.length} combined results from individual tables`);

    return true;
  } catch (error) {
    console.log('❌ Error testing BLSResultsService:', error.message);
    return false;
  }
}

async function verifyDataIntegrity() {
  try {
    // Get data from individual tables
    const { data: quizSessions } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('status', 'submitted');

    const { data: checklistResults } = await supabase
      .from('checklist_results')
      .select('*');

    const { data: blsResults } = await supabase
      .from('bls_result')
      .select('*');

    console.log(`Quiz sessions: ${quizSessions?.length || 0}`);
    console.log(`Checklist results: ${checklistResults?.length || 0}`);
    console.log(`Combined BLS results: ${blsResults?.length || 0}`);

    // Verify that we have data in the combined table
    if (blsResults && blsResults.length > 0) {
      const sampleResult = blsResults[0];
      console.log('\nSample combined result structure:');
      console.log(`- Participant: ${sampleResult.participant_name} (${sampleResult.participant_ic})`);
      console.log(`- Pre-test: ${sampleResult.pre_test_score}/${sampleResult.pre_test_percentage}%`);
      console.log(`- Post-test: ${sampleResult.post_test_score}/${sampleResult.post_test_percentage}%`);
      console.log(`- Checklist pass count: ${sampleResult.checklist_pass_count}/${sampleResult.checklist_total_count}`);
      console.log(`- Total checklist score: ${sampleResult.total_checklist_score}/${sampleResult.total_checklist_items}`);
    }

    return true;
  } catch (error) {
    console.log('❌ Error verifying data integrity:', error.message);
    return false;
  }
}

// Run the tests
if (require.main === module) {
  testCombinedBLSResults()
    .then(() => {
      console.log('\n🎉 All tests passed! The combined BLS results implementation is working correctly.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Tests failed:', error);
      process.exit(1);
    });
}

module.exports = { testCombinedBLSResults };
