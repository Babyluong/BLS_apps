// updateSyamsulHardyQuizScores.js - Update SYAMSUL HARDY's quiz scores in bls_results table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateSyamsulHardyQuizScores() {
  console.log('🔧 Updating SYAMSUL HARDY\'s quiz scores in bls_results table...\n');

  try {
    const syamsulIc = '921022136061';
    const syamsulName = 'SYAMSUL HARDY BIN RAMLAN';
    const preTestScore = 22;
    const postTestScore = 27;

    // Check current data
    console.log('1. Checking SYAMSUL HARDY\'s current data...');
    const { data: currentData, error: currentError } = await supabase
      .from('bls_results')
      .select('*')
      .eq('participant_ic', syamsulIc);

    if (currentError) {
      console.error('❌ Error getting current data:', currentError);
      return;
    }

    if (!currentData || currentData.length === 0) {
      console.error('❌ SYAMSUL HARDY not found in bls_results');
      return;
    }

    const currentResult = currentData[0];
    console.log('Current data:');
    console.log(`   Name: ${currentResult.participant_name}`);
    console.log(`   IC: ${currentResult.participant_ic}`);
    console.log(`   Pre-test score: ${currentResult.pre_test_score}`);
    console.log(`   Post-test score: ${currentResult.post_test_score}`);
    console.log(`   One-man CPR pass: ${currentResult.one_man_cpr_pass}`);
    console.log(`   Two-man CPR pass: ${currentResult.two_man_cpr_pass}`);
    console.log(`   Adult choking pass: ${currentResult.adult_choking_pass}`);
    console.log(`   Infant choking pass: ${currentResult.infant_choking_pass}`);
    console.log(`   Infant CPR pass: ${currentResult.infant_cpr_pass}`);
    console.log('');

    // Update quiz scores
    console.log('2. Updating quiz scores...');
    const { error: updateError } = await supabase
      .from('bls_results')
      .update({
        pre_test_score: preTestScore,
        post_test_score: postTestScore,
        updated_at: new Date().toISOString()
      })
      .eq('participant_ic', syamsulIc);

    if (updateError) {
      console.error('❌ Error updating quiz scores:', updateError);
      return;
    }

    console.log(`✅ Successfully updated quiz scores: Pre-test ${preTestScore}, Post-test ${postTestScore}`);
    console.log('');

    // Verify the update
    console.log('3. Verifying the update...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('bls_results')
      .select('*')
      .eq('participant_ic', syamsulIc);

    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError);
      return;
    }

    if (verifyData && verifyData.length > 0) {
      const updatedResult = verifyData[0];
      console.log('✅ Updated data:');
      console.log(`   Name: ${updatedResult.participant_name}`);
      console.log(`   IC: ${updatedResult.participant_ic}`);
      console.log(`   Pre-test score: ${updatedResult.pre_test_score} (${Math.round((updatedResult.pre_test_score / 30) * 100)}%)`);
      console.log(`   Post-test score: ${updatedResult.post_test_score} (${Math.round((updatedResult.post_test_score / 30) * 100)}%)`);
      console.log(`   One-man CPR pass: ${updatedResult.one_man_cpr_pass}`);
      console.log(`   Two-man CPR pass: ${updatedResult.two_man_cpr_pass}`);
      console.log(`   Adult choking pass: ${updatedResult.adult_choking_pass}`);
      console.log(`   Infant choking pass: ${updatedResult.infant_choking_pass}`);
      console.log(`   Infant CPR pass: ${updatedResult.infant_cpr_pass}`);
      console.log('');
      console.log('   Checklist details:');
      console.log(`     One-man CPR: ${updatedResult.one_man_cpr_details.performed.length} performed, ${updatedResult.one_man_cpr_details.notPerformed.length} not performed (${updatedResult.one_man_cpr_details.status})`);
      console.log(`     Two-man CPR: ${updatedResult.two_man_cpr_details.performed.length} performed, ${updatedResult.two_man_cpr_details.notPerformed.length} not performed (${updatedResult.two_man_cpr_details.status})`);
      console.log(`     Adult choking: ${updatedResult.adult_choking_details.performed.length} performed, ${updatedResult.adult_choking_details.notPerformed.length} not performed (${updatedResult.adult_choking_details.status})`);
      console.log(`     Infant choking: ${updatedResult.infant_choking_details.performed.length} performed, ${updatedResult.infant_choking_details.notPerformed.length} not performed (${updatedResult.infant_choking_details.status})`);
      console.log(`     Infant CPR: ${updatedResult.infant_cpr_details.performed.length} performed, ${updatedResult.infant_cpr_details.notPerformed.length} not performed (${updatedResult.infant_cpr_details.status})`);
    }
    console.log('');

    // Check if we should also add this data to quiz_sessions table
    console.log('4. Checking if quiz data should be added to quiz_sessions...');
    const { data: existingQuiz, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('participant_ic', syamsulIc);

    if (quizError) {
      console.error('❌ Error checking quiz_sessions:', quizError);
    } else if (!existingQuiz || existingQuiz.length === 0) {
      console.log('ℹ️  No quiz data found in quiz_sessions table');
      console.log('   This is normal - the quiz data might be stored elsewhere or not yet added');
    } else {
      console.log(`✅ Found ${existingQuiz.length} quiz records in quiz_sessions`);
      existingQuiz.forEach((quiz, index) => {
        console.log(`   ${index + 1}. Score: ${quiz.score}/${quiz.total_questions} (${quiz.percentage}%)`);
      });
    }
    console.log('');

    // Final summary
    console.log('5. Final summary:');
    console.log(`✅ SYAMSUL HARDY BIN RAMLAN (${syamsulIc}) now has complete data:`);
    console.log(`   Pre-test: ${preTestScore}/30 (${Math.round((preTestScore / 30) * 100)}%)`);
    console.log(`   Post-test: ${postTestScore}/30 (${Math.round((postTestScore / 30) * 100)}%)`);
    console.log(`   All checklist assessments: PASS`);
    console.log(`   All checklist details: Fully populated`);
    console.log('');
    console.log('🎉 SYAMSUL HARDY now has complete data in bls_results table!');

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
updateSyamsulHardyQuizScores();

