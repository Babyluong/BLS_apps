// fixFinalMissingBlsResults.js - Fix the final missing BLS results
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixFinalMissingBlsResults() {
  console.log('🔧 Fixing final missing BLS results...\n');

  try {
    // Get participants missing from BLS results
    console.log('1. Finding participants missing from BLS results...');
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, ic')
      .eq('role', 'user')
      .order('full_name');

    const { data: blsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('user_id')
      .not('user_id', 'is', null);

    if (profilesError || blsError) {
      console.error('❌ Error getting data');
      return;
    }

    const blsUserIds = [...new Set(blsResults.map(r => r.user_id))];
    const missingFromBls = profiles.filter(profile => !blsUserIds.includes(profile.id));

    console.log(`Found ${missingFromBls.length} participants missing from BLS results:`);
    missingFromBls.forEach((participant, index) => {
      console.log(`${index + 1}. ${participant.full_name} (${participant.ic}) - ${participant.id}`);
    });
    console.log('');

    // Create BLS results for missing participants
    console.log('2. Creating BLS results for missing participants...');
    
    let createdCount = 0;
    let errorCount = 0;

    for (const participant of missingFromBls) {
      console.log(`Creating BLS result for ${participant.full_name}...`);
      
      // Check if participant has quiz results to determine if they took assessments
      const { data: quizResults, error: quizError } = await supabase
        .from('quiz_sessions')
        .select('pre_test_score, post_test_score')
        .eq('user_id', participant.id)
        .limit(1);

      let preTestScore = null;
      let postTestScore = null;

      if (quizResults && quizResults.length > 0) {
        preTestScore = quizResults[0].pre_test_score;
        postTestScore = quizResults[0].post_test_score;
        console.log(`  Found quiz results: Pre-test: ${preTestScore}, Post-test: ${postTestScore}`);
      } else {
        console.log(`  No quiz results found - will create with null scores`);
      }

      // Create BLS result
      const { error: createError } = await supabase
        .from('bls_results')
        .insert({
          user_id: participant.id,
          participant_name: participant.full_name,
          participant_ic: participant.ic,
          pre_test_score: preTestScore,
          post_test_score: postTestScore,
          one_man_cpr_pass: null,
          two_man_cpr_pass: null,
          adult_choking_pass: null,
          infant_choking_pass: null,
          infant_cpr_pass: null,
          one_man_cpr_details: null,
          two_man_cpr_details: null,
          adult_choking_details: null,
          infant_choking_details: null,
          infant_cpr_details: null
        });

      if (createError) {
        console.log(`  ❌ Error creating BLS result: ${createError.message}`);
        errorCount++;
      } else {
        console.log(`  ✅ Created BLS result for ${participant.full_name}`);
        createdCount++;
      }
    }

    console.log(`\n✅ Created BLS results for ${createdCount} participants`);
    console.log(`❌ Errors for ${errorCount} participants`);
    console.log('');

    // Final verification
    console.log('3. Final verification...');
    
    const { count: finalBlsCount, error: finalBlsError } = await supabase
      .from('bls_results')
      .select('*', { count: 'exact', head: true });

    const { data: finalBlsResults, error: finalBlsResultsError } = await supabase
      .from('bls_results')
      .select('user_id')
      .not('user_id', 'is', null);

    if (finalBlsError || finalBlsResultsError) {
      console.error('❌ Error getting final counts');
      return;
    }

    const finalBlsUserIds = [...new Set(finalBlsResults.map(r => r.user_id))];

    console.log(`Final BLS Results: ${finalBlsCount} records (${finalBlsUserIds.length} unique participants)`);
    console.log(`Expected: 57 participants`);
    console.log(`Status: ${finalBlsUserIds.length === 57 ? '✅ COMPLETE' : '❌ INCOMPLETE'}`);

    if (finalBlsUserIds.length === 57) {
      console.log('\n🎉 SUCCESS! All 57 participants now have BLS results!');
    } else {
      console.log('\n⚠️  Still missing some BLS results');
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
fixFinalMissingBlsResults();

