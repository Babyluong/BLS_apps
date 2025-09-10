// testBLSAppWithUpdatedData.js
// Test BLS app with updated Supabase data

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBLSAppWithUpdatedData() {
  try {
    console.log('🧪 Testing BLS app with updated Supabase data...\n');

    // Test 1: Check bls_results data
    console.log('1. Testing bls_results data...');
    const { data: blsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('*')
      .order('created_at', { ascending: false });

    if (blsError) {
      console.log('❌ Error fetching bls_results:', blsError.message);
      return;
    }

    console.log(`✅ Fetched ${blsResults.length} bls_results records`);

    // Check for EMILY AKUP and AMRI AMIT
    const emilyPresent = blsResults.some(r => r.participant_ic === '820924135946');
    const amriPresent = blsResults.some(r => r.participant_ic === '940120126733');
    
    console.log(`- EMILY AKUP present: ${emilyPresent ? 'YES' : 'NO'}`);
    console.log(`- AMRI AMIT present: ${amriPresent ? 'YES (ERROR)' : 'NO (CORRECT)'}`);

    // Test 2: Check participant data quality
    console.log('\n2. Testing participant data quality...');
    const recordsWithNames = blsResults.filter(r => r.participant_name).length;
    const recordsWithICs = blsResults.filter(r => r.participant_ic).length;
    const recordsWithBoth = blsResults.filter(r => r.participant_name && r.participant_ic).length;

    console.log(`- Records with names: ${recordsWithNames}/${blsResults.length}`);
    console.log(`- Records with ICs: ${recordsWithICs}/${blsResults.length}`);
    console.log(`- Records with both: ${recordsWithBoth}/${blsResults.length}`);

    // Test 3: Check for duplicates
    console.log('\n3. Testing for duplicates...');
    const icGroups = {};
    blsResults.forEach(record => {
      const ic = record.participant_ic || 'NO_IC';
      if (!icGroups[ic]) {
        icGroups[ic] = [];
      }
      icGroups[ic].push(record);
    });

    const duplicateICs = Object.entries(icGroups).filter(([ic, records]) => records.length > 1);
    console.log(`- Duplicate ICs: ${duplicateICs.length}`);

    if (duplicateICs.length > 0) {
      console.log('⚠️ Duplicate ICs found:');
      duplicateICs.forEach(([ic, records]) => {
        console.log(`  - IC ${ic}: ${records.length} records`);
      });
    }

    // Test 4: Sample data for BLS app
    console.log('\n4. Sample data for BLS app:');
    const sampleRecords = blsResults.slice(0, 5);
    sampleRecords.forEach((record, index) => {
      console.log(`\nRecord ${index + 1}:`);
      console.log(`  Participant: ${record.participant_name} (${record.participant_ic})`);
      console.log(`  Pre-test: ${record.pre_test_score || 'N/A'}/30`);
      console.log(`  Post-test: ${record.post_test_score || 'N/A'}/30`);
      console.log(`  One-man CPR: ${record.one_man_cpr_pass ? 'PASS' : 'FAIL'}`);
      console.log(`  Two-man CPR: ${record.two_man_cpr_pass ? 'PASS' : 'FAIL'}`);
      console.log(`  Adult Choking: ${record.adult_choking_pass ? 'PASS' : 'FAIL'}`);
      console.log(`  Infant Choking: ${record.infant_choking_pass ? 'PASS' : 'FAIL'}`);
      console.log(`  Infant CPR: ${record.infant_cpr_pass ? 'PASS' : 'FAIL'}`);
    });

    // Test 5: Check BLS app service compatibility
    console.log('\n5. Testing BLS app service compatibility...');
    
    // Simulate the BLSResultsService.getUserBLSResults method
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, participant_name, participant_ic, jawatan, role');

    if (profilesError) {
      console.log('❌ Error fetching profiles:', profilesError.message);
    } else {
      console.log(`✅ Fetched ${profiles.length} profiles`);
    }

    // Test 6: Summary statistics
    console.log('\n6. Summary statistics:');
    const preTestScores = blsResults.filter(r => r.pre_test_score > 0).map(r => r.pre_test_score);
    const postTestScores = blsResults.filter(r => r.post_test_score > 0).map(r => r.post_test_score);
    
    const preTestPass = blsResults.filter(r => r.pre_test_score >= 18).length; // 60% pass rate
    const postTestPass = blsResults.filter(r => r.post_test_score >= 18).length;
    
    const oneManCprPass = blsResults.filter(r => r.one_man_cpr_pass).length;
    const twoManCprPass = blsResults.filter(r => r.two_man_cpr_pass).length;
    const adultChokingPass = blsResults.filter(r => r.adult_choking_pass).length;
    const infantChokingPass = blsResults.filter(r => r.infant_choking_pass).length;
    const infantCprPass = blsResults.filter(r => r.infant_cpr_pass).length;

    console.log(`- Pre-test pass rate: ${preTestPass}/${blsResults.length} (${((preTestPass/blsResults.length)*100).toFixed(1)}%)`);
    console.log(`- Post-test pass rate: ${postTestPass}/${blsResults.length} (${((postTestPass/blsResults.length)*100).toFixed(1)}%)`);
    console.log(`- One-man CPR pass rate: ${oneManCprPass}/${blsResults.length} (${((oneManCprPass/blsResults.length)*100).toFixed(1)}%)`);
    console.log(`- Two-man CPR pass rate: ${twoManCprPass}/${blsResults.length} (${((twoManCprPass/blsResults.length)*100).toFixed(1)}%)`);
    console.log(`- Adult Choking pass rate: ${adultChokingPass}/${blsResults.length} (${((adultChokingPass/blsResults.length)*100).toFixed(1)}%)`);
    console.log(`- Infant Choking pass rate: ${infantChokingPass}/${blsResults.length} (${((infantChokingPass/blsResults.length)*100).toFixed(1)}%)`);
    console.log(`- Infant CPR pass rate: ${infantCprPass}/${blsResults.length} (${((infantCprPass/blsResults.length)*100).toFixed(1)}%)`);

    // Test 7: Final verification
    console.log('\n7. Final verification:');
    console.log(`✅ Total participants: ${blsResults.length} (expected: 56)`);
    console.log(`✅ EMILY AKUP included: ${emilyPresent ? 'YES' : 'NO'}`);
    console.log(`✅ AMRI AMIT excluded: ${!amriPresent ? 'YES' : 'NO'}`);
    console.log(`✅ Data quality: ${recordsWithBoth === blsResults.length ? 'PERFECT' : 'NEEDS ATTENTION'}`);
    console.log(`✅ No duplicates: ${duplicateICs.length === 0 ? 'YES' : 'NO'}`);

    if (blsResults.length === 56 && emilyPresent && !amriPresent && recordsWithBoth === blsResults.length && duplicateICs.length === 0) {
      console.log('\n🎉 BLS APP IS READY! All data is correct and the app should work perfectly.');
    } else {
      console.log('\n⚠️ BLS APP NEEDS ATTENTION! Some issues need to be fixed.');
    }

  } catch (error) {
    console.error('❌ Error testing BLS app:', error);
  }
}

testBLSAppWithUpdatedData();

