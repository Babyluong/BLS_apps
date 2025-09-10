// fixEmilyAkupQuizScore.js - Fix EMILY AKUP's quiz score mismatch
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixEmilyAkupQuizScore() {
  console.log('🔧 Fixing EMILY AKUP\'s quiz score mismatch...\n');

  try {
    const emilyIc = '820924135946';
    const emilyName = 'EMILY AKUP';

    // Get current data
    console.log('1. Getting current data...');
    const { data: blsData, error: blsError } = await supabase
      .from('bls_results')
      .select('*')
      .eq('participant_ic', emilyIc);

    const { data: quizData, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('participant_ic', emilyIc)
      .order('updated_at', { ascending: true });

    if (blsError) {
      console.error('❌ Error getting bls_results:', blsError);
      return;
    }

    if (quizError) {
      console.error('❌ Error getting quiz_sessions:', quizError);
      return;
    }

    if (!blsData || blsData.length === 0) {
      console.error('❌ EMILY AKUP not found in bls_results');
      return;
    }

    const bls = blsData[0];
    const postTestQuiz = quizData.find(q => q.quiz_key === 'posttest');

    console.log('Current data:');
    console.log(`   bls_results post-test: ${bls.post_test_score}`);
    if (postTestQuiz) {
      console.log(`   quiz_sessions post-test: ${postTestQuiz.score}`);
    } else {
      console.log('   quiz_sessions post-test: Not found');
    }
    console.log('');

    // Update bls_results to match quiz_sessions
    if (postTestQuiz && bls.post_test_score !== postTestQuiz.score) {
      console.log('2. Updating bls_results to match quiz_sessions...');
      const { error: updateError } = await supabase
        .from('bls_results')
        .update({
          post_test_score: postTestQuiz.score,
          updated_at: new Date().toISOString()
        })
        .eq('participant_ic', emilyIc);

      if (updateError) {
        console.error('❌ Error updating bls_results:', updateError);
        return;
      }

      console.log(`✅ Updated bls_results post-test score from ${bls.post_test_score} to ${postTestQuiz.score}`);
    } else {
      console.log('ℹ️  No mismatch found or post-test quiz not found');
    }

    // Verify the update
    console.log('\n3. Verifying the update...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('bls_results')
      .select('*')
      .eq('participant_ic', emilyIc);

    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError);
      return;
    }

    if (verifyData && verifyData.length > 0) {
      const updatedBls = verifyData[0];
      console.log('✅ Updated data:');
      console.log(`   Name: ${updatedBls.participant_name}`);
      console.log(`   IC: ${updatedBls.participant_ic}`);
      console.log(`   Pre-test: ${updatedBls.pre_test_score}/30 (${Math.round((updatedBls.pre_test_score / 30) * 100)}%)`);
      console.log(`   Post-test: ${updatedBls.post_test_score}/30 (${Math.round((updatedBls.post_test_score / 30) * 100)}%)`);
      console.log(`   One-man CPR: ${updatedBls.one_man_cpr_pass ? 'PASS' : 'FAIL'}`);
      console.log(`   Two-man CPR: ${updatedBls.two_man_cpr_pass ? 'PASS' : 'FAIL'}`);
      console.log(`   Adult choking: ${updatedBls.adult_choking_pass ? 'PASS' : 'FAIL'}`);
      console.log(`   Infant choking: ${updatedBls.infant_choking_pass ? 'PASS' : 'FAIL'}`);
      console.log(`   Infant CPR: ${updatedBls.infant_cpr_pass ? 'PASS' : 'FAIL'}`);
    }

    console.log('\n🎉 EMILY AKUP\'s quiz score mismatch has been fixed!');

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
fixEmilyAkupQuizScore();

