// checkChecklistDetails.js - Check the current state of checklist_details in bls_results
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkChecklistDetails() {
  console.log('🔍 Checking checklist_details in bls_results...\n');

  try {
    // Check current checklist_details in bls_results
    console.log('1. Checking current checklist_details in bls_results...');
    const { data: blsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('id, participant_name, participant_ic, one_man_cpr_details, two_man_cpr_details, adult_choking_details, infant_choking_details, infant_cpr_details')
      .limit(5);

    if (blsError) {
      console.error('❌ Error checking bls_results:', blsError);
      return;
    }

    console.log(`Found ${blsResults.length} bls_results records`);
    blsResults.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.participant_name} (${result.participant_ic}):`);
      console.log(`   One-man CPR details: ${JSON.stringify(result.one_man_cpr_details)}`);
      console.log(`   Two-man CPR details: ${JSON.stringify(result.two_man_cpr_details)}`);
      console.log(`   Adult choking details: ${JSON.stringify(result.adult_choking_details)}`);
      console.log(`   Infant choking details: ${JSON.stringify(result.infant_choking_details)}`);
      console.log(`   Infant CPR details: ${JSON.stringify(result.infant_cpr_details)}`);
    });
    console.log('');

    // Check checklist_results for reference data
    console.log('2. Checking checklist_results for reference data...');
    const { data: checklistResults, error: checklistError } = await supabase
      .from('checklist_results')
      .select('user_id, participant_name, participant_ic, checklist_type, score, total_items, status, created_at')
      .limit(10);

    if (checklistError) {
      console.error('❌ Error checking checklist_results:', checklistError);
      return;
    }

    console.log(`Found ${checklistResults.length} checklist_results records`);
    console.log('Sample checklist results:');
    checklistResults.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.participant_name} (${result.participant_ic}):`);
      console.log(`   Type: ${result.checklist_type}`);
      console.log(`   Score: ${result.score}/${result.total_items}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Date: ${result.created_at}`);
    });
    console.log('');

    // Check if there are any non-empty details
    console.log('3. Checking for non-empty details...');
    const { data: nonEmptyDetails, error: nonEmptyError } = await supabase
      .from('bls_results')
      .select('id, participant_name, one_man_cpr_details, two_man_cpr_details, adult_choking_details, infant_choking_details, infant_cpr_details')
      .not('one_man_cpr_details', 'is', null)
      .not('one_man_cpr_details', 'eq', '{}')
      .limit(5);

    if (nonEmptyError) {
      console.error('❌ Error checking non-empty details:', nonEmptyError);
    } else {
      console.log(`Found ${nonEmptyDetails.length} records with non-empty details`);
      if (nonEmptyDetails.length > 0) {
        console.log('Sample non-empty details:');
        nonEmptyDetails.forEach((result, index) => {
          console.log(`\n${index + 1}. ${result.participant_name}:`);
          console.log(`   One-man CPR: ${JSON.stringify(result.one_man_cpr_details)}`);
        });
      }
    }
    console.log('');

    // Check the structure of checklist_details columns
    console.log('4. Checking column structure...');
    const { data: sampleResult, error: sampleError } = await supabase
      .from('bls_results')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.error('❌ Error getting sample result:', sampleError);
    } else if (sampleResult && sampleResult.length > 0) {
      console.log('Available columns in bls_results:');
      Object.keys(sampleResult[0]).forEach(key => {
        if (key.includes('details')) {
          console.log(`   ${key}: ${typeof sampleResult[0][key]} - ${JSON.stringify(sampleResult[0][key])}`);
        }
      });
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
checkChecklistDetails();

