// addSyamsulHardyQuizSessions.js - Add SYAMSUL HARDY's quiz data to quiz_sessions table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addSyamsulHardyQuizSessions() {
  console.log('🔧 Adding SYAMSUL HARDY\'s quiz data to quiz_sessions table...\n');

  try {
    const syamsulIc = '921022136061';
    const syamsulName = 'SYAMSUL HARDY BIN RAMLAN';
    const preTestScore = 22;
    const postTestScore = 27;
    const totalQuestions = 30;

    // First, get SYAMSUL HARDY's user_id from bls_results
    console.log('1. Getting SYAMSUL HARDY\'s user_id from bls_results...');
    const { data: blsData, error: blsError } = await supabase
      .from('bls_results')
      .select('user_id, participant_name, participant_ic')
      .eq('participant_ic', syamsulIc);

    if (blsError) {
      console.error('❌ Error getting user_id from bls_results:', blsError);
      return;
    }

    if (!blsData || blsData.length === 0) {
      console.error('❌ SYAMSUL HARDY not found in bls_results');
      return;
    }

    const user_id = blsData[0].user_id;
    console.log(`✅ Found user_id: ${user_id}`);
    console.log(`   Name: ${blsData[0].participant_name}`);
    console.log(`   IC: ${blsData[0].participant_ic}`);
    console.log('');

    // Check if quiz data already exists
    console.log('2. Checking for existing quiz data...');
    const { data: existingQuiz, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('participant_ic', syamsulIc);

    if (quizError) {
      console.error('❌ Error checking existing quiz data:', quizError);
      return;
    }

    if (existingQuiz && existingQuiz.length > 0) {
      console.log(`ℹ️  Found ${existingQuiz.length} existing quiz records:`);
      existingQuiz.forEach((quiz, index) => {
        console.log(`   ${index + 1}. Type: ${quiz.quiz_type}, Score: ${quiz.score}/${quiz.total_questions} (${quiz.percentage}%)`);
      });
      console.log('');
    } else {
      console.log('ℹ️  No existing quiz data found');
      console.log('');
    }

    // Add pre-test data
    console.log('3. Adding pre-test data...');
    const preTestData = {
      user_id: user_id,
      participant_ic: syamsulIc,
      participant_name: syamsulName,
      quiz_type: 'pre_test',
      score: preTestScore,
      total_questions: totalQuestions,
      percentage: Math.round((preTestScore / totalQuestions) * 100),
      passed: preTestScore >= 18, // 60% pass mark
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: preTestError } = await supabase
      .from('quiz_sessions')
      .insert([preTestData]);

    if (preTestError) {
      console.error('❌ Error adding pre-test data:', preTestError);
      return;
    }

    console.log(`✅ Pre-test data added: ${preTestScore}/${totalQuestions} (${Math.round((preTestScore / totalQuestions) * 100)}%)`);
    console.log(`   Passed: ${preTestScore >= 18 ? 'Yes' : 'No'}`);
    console.log('');

    // Add post-test data
    console.log('4. Adding post-test data...');
    const postTestData = {
      user_id: user_id,
      participant_ic: syamsulIc,
      participant_name: syamsulName,
      quiz_type: 'post_test',
      score: postTestScore,
      total_questions: totalQuestions,
      percentage: Math.round((postTestScore / totalQuestions) * 100),
      passed: postTestScore >= 18, // 60% pass mark
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error: postTestError } = await supabase
      .from('quiz_sessions')
      .insert([postTestData]);

    if (postTestError) {
      console.error('❌ Error adding post-test data:', postTestError);
      return;
    }

    console.log(`✅ Post-test data added: ${postTestScore}/${totalQuestions} (${Math.round((postTestScore / totalQuestions) * 100)}%)`);
    console.log(`   Passed: ${postTestScore >= 18 ? 'Yes' : 'No'}`);
    console.log('');

    // Verify the additions
    console.log('5. Verifying the additions...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('participant_ic', syamsulIc)
      .order('created_at', { ascending: true });

    if (verifyError) {
      console.error('❌ Error verifying additions:', verifyError);
      return;
    }

    if (verifyData && verifyData.length > 0) {
      console.log(`✅ Found ${verifyData.length} quiz records for SYAMSUL HARDY:`);
      verifyData.forEach((quiz, index) => {
        console.log(`   ${index + 1}. Type: ${quiz.quiz_type}`);
        console.log(`      Score: ${quiz.score}/${quiz.total_questions} (${quiz.percentage}%)`);
        console.log(`      Passed: ${quiz.passed ? 'Yes' : 'No'}`);
        console.log(`      Created: ${new Date(quiz.created_at).toLocaleString()}`);
        console.log('');
      });
    }

    // Final summary
    console.log('6. Final summary:');
    console.log(`✅ SYAMSUL HARDY BIN RAMLAN (${syamsulIc}) now has quiz data in quiz_sessions:`);
    console.log(`   Pre-test: ${preTestScore}/${totalQuestions} (${Math.round((preTestScore / totalQuestions) * 100)}%) - ${preTestScore >= 18 ? 'PASS' : 'FAIL'}`);
    console.log(`   Post-test: ${postTestScore}/${totalQuestions} (${Math.round((postTestScore / totalQuestions) * 100)}%) - ${postTestScore >= 18 ? 'PASS' : 'FAIL'}`);
    console.log('');
    console.log('🎉 SYAMSUL HARDY now has complete quiz data in both bls_results and quiz_sessions!');

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
addSyamsulHardyQuizSessions();

