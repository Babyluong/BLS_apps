// verifyChecklistDetails.js - Verify that checklist_details are properly populated
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyChecklistDetails() {
  console.log('🔍 Verifying checklist_details are properly populated...\n');

  try {
    // Get sample records with different pass/fail statuses
    console.log('1. Getting sample records...');
    const { data: sampleResults, error: sampleError } = await supabase
      .from('bls_results')
      .select('id, participant_name, participant_ic, one_man_cpr_pass, two_man_cpr_pass, adult_choking_pass, infant_choking_pass, infant_cpr_pass, one_man_cpr_details, two_man_cpr_details, adult_choking_details, infant_choking_details, infant_cpr_details')
      .limit(10);

    if (sampleError) {
      console.error('❌ Error getting sample results:', sampleError);
      return;
    }

    console.log(`Found ${sampleResults.length} sample records`);
    console.log('');

    // Show detailed breakdown for each record
    sampleResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.participant_name} (${result.participant_ic}):`);
      console.log(`   Pass Status: One-man: ${result.one_man_cpr_pass}, Two-man: ${result.two_man_cpr_pass}, Adult choking: ${result.adult_choking_pass}, Infant choking: ${result.infant_choking_pass}, Infant CPR: ${result.infant_cpr_pass}`);
      console.log('');

      // Show one-man CPR details
      console.log(`   One-man CPR Details:`);
      console.log(`     Status: ${result.one_man_cpr_details.status} (${result.one_man_cpr_details.score}/${result.one_man_cpr_details.totalItems} - ${result.one_man_cpr_details.percentage}%)`);
      console.log(`     Performed (${result.one_man_cpr_details.performed.length}): ${result.one_man_cpr_details.performed.slice(0, 3).join(', ')}${result.one_man_cpr_details.performed.length > 3 ? '...' : ''}`);
      console.log(`     Not Performed (${result.one_man_cpr_details.notPerformed.length}): ${result.one_man_cpr_details.notPerformed.slice(0, 3).join(', ')}${result.one_man_cpr_details.notPerformed.length > 3 ? '...' : ''}`);
      console.log('');

      // Show two-man CPR details
      console.log(`   Two-man CPR Details:`);
      console.log(`     Status: ${result.two_man_cpr_details.status} (${result.two_man_cpr_details.score}/${result.two_man_cpr_details.totalItems} - ${result.two_man_cpr_details.percentage}%)`);
      console.log(`     Performed (${result.two_man_cpr_details.performed.length}): ${result.two_man_cpr_details.performed.slice(0, 3).join(', ')}${result.two_man_cpr_details.performed.length > 3 ? '...' : ''}`);
      console.log(`     Not Performed (${result.two_man_cpr_details.notPerformed.length}): ${result.two_man_cpr_details.notPerformed.slice(0, 3).join(', ')}${result.two_man_cpr_details.notPerformed.length > 3 ? '...' : ''}`);
      console.log('');

      // Show adult choking details
      console.log(`   Adult Choking Details:`);
      console.log(`     Status: ${result.adult_choking_details.status} (${result.adult_choking_details.score}/${result.adult_choking_details.totalItems} - ${result.adult_choking_details.percentage}%)`);
      console.log(`     Performed (${result.adult_choking_details.performed.length}): ${result.adult_choking_details.performed.slice(0, 3).join(', ')}${result.adult_choking_details.performed.length > 3 ? '...' : ''}`);
      console.log(`     Not Performed (${result.adult_choking_details.notPerformed.length}): ${result.adult_choking_details.notPerformed.slice(0, 3).join(', ')}${result.adult_choking_details.notPerformed.length > 3 ? '...' : ''}`);
      console.log('');

      // Show infant choking details
      console.log(`   Infant Choking Details:`);
      console.log(`     Status: ${result.infant_choking_details.status} (${result.infant_choking_details.score}/${result.infant_choking_details.totalItems} - ${result.infant_choking_details.percentage}%)`);
      console.log(`     Performed (${result.infant_choking_details.performed.length}): ${result.infant_choking_details.performed.slice(0, 3).join(', ')}${result.infant_choking_details.performed.length > 3 ? '...' : ''}`);
      console.log(`     Not Performed (${result.infant_choking_details.notPerformed.length}): ${result.infant_choking_details.notPerformed.slice(0, 3).join(', ')}${result.infant_choking_details.notPerformed.length > 3 ? '...' : ''}`);
      console.log('');

      // Show infant CPR details
      console.log(`   Infant CPR Details:`);
      console.log(`     Status: ${result.infant_cpr_details.status} (${result.infant_cpr_details.score}/${result.infant_cpr_details.totalItems} - ${result.infant_cpr_details.percentage}%)`);
      console.log(`     Performed (${result.infant_cpr_details.performed.length}): ${result.infant_cpr_details.performed.slice(0, 3).join(', ')}${result.infant_cpr_details.performed.length > 3 ? '...' : ''}`);
      console.log(`     Not Performed (${result.infant_cpr_details.notPerformed.length}): ${result.infant_cpr_details.notPerformed.slice(0, 3).join(', ')}${result.infant_cpr_details.notPerformed.length > 3 ? '...' : ''}`);
      console.log('');

      console.log('---');
    });

    // Check for any records with FAIL status
    console.log('2. Checking for records with FAIL status...');
    const { data: failResults, error: failError } = await supabase
      .from('bls_results')
      .select('participant_name, one_man_cpr_details, two_man_cpr_details, adult_choking_details, infant_choking_details, infant_cpr_details')
      .or('one_man_cpr_details.status.eq.FAIL,two_man_cpr_details.status.eq.FAIL,adult_choking_details.status.eq.FAIL,infant_choking_details.status.eq.FAIL,infant_cpr_details.status.eq.FAIL')
      .limit(5);

    if (failError) {
      console.error('❌ Error getting fail results:', failError);
    } else {
      console.log(`Found ${failResults.length} records with FAIL status`);
      if (failResults.length > 0) {
        failResults.forEach((result, index) => {
          console.log(`\n${index + 1}. ${result.participant_name}:`);
          const details = [
            { name: 'One-man CPR', data: result.one_man_cpr_details },
            { name: 'Two-man CPR', data: result.two_man_cpr_details },
            { name: 'Adult Choking', data: result.adult_choking_details },
            { name: 'Infant Choking', data: result.infant_choking_details },
            { name: 'Infant CPR', data: result.infant_cpr_details }
          ];
          
          details.forEach(detail => {
            if (detail.data.status === 'FAIL') {
              console.log(`   ${detail.name}: FAIL (${detail.data.score}/${detail.data.totalItems} - ${detail.data.percentage}%)`);
              console.log(`     Not Performed: ${detail.data.notPerformed.slice(0, 5).join(', ')}${detail.data.notPerformed.length > 5 ? '...' : ''}`);
            }
          });
        });
      }
    }
    console.log('');

    // Summary statistics
    console.log('3. Summary statistics...');
    const { data: allResults, error: allError } = await supabase
      .from('bls_results')
      .select('one_man_cpr_details, two_man_cpr_details, adult_choking_details, infant_choking_details, infant_cpr_details');

    if (allError) {
      console.error('❌ Error getting all results:', allError);
    } else {
      let totalPass = 0;
      let totalFail = 0;
      let totalRecords = allResults.length * 5; // 5 checklist types per record

      allResults.forEach(result => {
        const details = [
          result.one_man_cpr_details,
          result.two_man_cpr_details,
          result.adult_choking_details,
          result.infant_choking_details,
          result.infant_cpr_details
        ];

        details.forEach(detail => {
          if (detail.status === 'PASS') {
            totalPass++;
          } else {
            totalFail++;
          }
        });
      });

      console.log(`Total checklist assessments: ${totalRecords}`);
      console.log(`PASS: ${totalPass} (${Math.round((totalPass / totalRecords) * 100)}%)`);
      console.log(`FAIL: ${totalFail} (${Math.round((totalFail / totalRecords) * 100)}%)`);
    }

    console.log('\n🎉 Checklist details verification completed!');
    console.log('');
    console.log('The checklist_details now contain comprehensive information:');
    console.log('- Detailed breakdown of performed vs not performed items');
    console.log('- Actual scores and percentages');
    console.log('- PASS/FAIL status for each checklist type');
    console.log('- Proper data structure for the BLS app to display');

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
verifyChecklistDetails();

