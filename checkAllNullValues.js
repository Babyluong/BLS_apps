// checkAllNullValues.js - Check for all participants with null values in bls_results
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAllNullValues() {
  console.log('🔍 Checking for all participants with null values in bls_results...\n');

  try {
    // Get all bls_results
    console.log('1. Getting all bls_results...');
    const { data: allBlsResults, error: allBlsError } = await supabase
      .from('bls_results')
      .select('id, participant_name, participant_ic, pre_test_score, post_test_score, one_man_cpr_pass, two_man_cpr_pass, adult_choking_pass, infant_choking_pass, infant_cpr_pass');

    if (allBlsError) {
      console.error('❌ Error getting bls_results:', allBlsError);
      return;
    }

    console.log(`Found ${allBlsResults.length} bls_results records`);
    console.log('');

    // Check for null values
    console.log('2. Checking for null values...');
    const participantsWithNulls = [];

    allBlsResults.forEach(result => {
      const nullFields = [];
      
      if (result.pre_test_score === null) nullFields.push('pre_test_score');
      if (result.post_test_score === null) nullFields.push('post_test_score');
      if (result.one_man_cpr_pass === null) nullFields.push('one_man_cpr_pass');
      if (result.two_man_cpr_pass === null) nullFields.push('two_man_cpr_pass');
      if (result.adult_choking_pass === null) nullFields.push('adult_choking_pass');
      if (result.infant_choking_pass === null) nullFields.push('infant_choking_pass');
      if (result.infant_cpr_pass === null) nullFields.push('infant_cpr_pass');

      if (nullFields.length > 0) {
        participantsWithNulls.push({
          name: result.participant_name,
          ic: result.participant_ic,
          id: result.id,
          nullFields: nullFields
        });
      }
    });

    if (participantsWithNulls.length > 0) {
      console.log(`❌ Found ${participantsWithNulls.length} participants with null values:`);
      participantsWithNulls.forEach((participant, index) => {
        console.log(`\n${index + 1}. ${participant.name} (${participant.ic}):`);
        console.log(`   Null fields: ${participant.nullFields.join(', ')}`);
      });
    } else {
      console.log('✅ No participants with null values found');
    }
    console.log('');

    // Check for participants with all null values
    console.log('3. Checking for participants with all null values...');
    const participantsWithAllNulls = participantsWithNulls.filter(p => p.nullFields.length >= 5);
    
    if (participantsWithAllNulls.length > 0) {
      console.log(`❌ Found ${participantsWithAllNulls.length} participants with most/all null values:`);
      participantsWithAllNulls.forEach((participant, index) => {
        console.log(`   ${index + 1}. ${participant.name} (${participant.ic}) - ${participant.nullFields.length} null fields`);
      });
    } else {
      console.log('✅ No participants with all null values found');
    }
    console.log('');

    // Check for participants with partial null values
    console.log('4. Checking for participants with partial null values...');
    const participantsWithPartialNulls = participantsWithNulls.filter(p => p.nullFields.length < 5 && p.nullFields.length > 0);
    
    if (participantsWithPartialNulls.length > 0) {
      console.log(`⚠️  Found ${participantsWithPartialNulls.length} participants with partial null values:`);
      participantsWithPartialNulls.forEach((participant, index) => {
        console.log(`   ${index + 1}. ${participant.name} (${participant.ic}) - ${participant.nullFields.join(', ')}`);
      });
    } else {
      console.log('✅ No participants with partial null values found');
    }
    console.log('');

    // Summary
    console.log('5. Summary:');
    console.log(`   Total participants: ${allBlsResults.length}`);
    console.log(`   Participants with null values: ${participantsWithNulls.length}`);
    console.log(`   Participants with all null values: ${participantsWithAllNulls.length}`);
    console.log(`   Participants with partial null values: ${participantsWithPartialNulls.length}`);
    console.log(`   Participants with no null values: ${allBlsResults.length - participantsWithNulls.length}`);

    if (participantsWithNulls.length > 0) {
      console.log('\n🔧 Next steps:');
      console.log('1. Fix participants with all null values first');
      console.log('2. Then fix participants with partial null values');
      console.log('3. Verify all data is complete');
    } else {
      console.log('\n🎉 All participants have complete data!');
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
checkAllNullValues();

