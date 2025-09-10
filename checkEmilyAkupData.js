// checkEmilyAkupData.js - Check EMILY AKUP's data in bls_results table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEmilyAkupData() {
  console.log('🔍 Checking EMILY AKUP\'s data in bls_results table...\n');

  try {
    const emilyIc = '820924135946';
    const emilyName = 'EMILY AKUP';

    // Check EMILY AKUP's current data in bls_results
    console.log('1. Checking EMILY AKUP\'s current data in bls_results...');
    const { data: emilyBlsResults, error: emilyBlsError } = await supabase
      .from('bls_results')
      .select('*')
      .eq('participant_ic', emilyIc);

    if (emilyBlsError) {
      console.error('❌ Error checking EMILY AKUP\'s bls_results:', emilyBlsError);
      return;
    }

    if (!emilyBlsResults || emilyBlsResults.length === 0) {
      console.log('❌ EMILY AKUP not found in bls_results');
      return;
    }

    console.log(`Found ${emilyBlsResults.length} EMILY AKUP records in bls_results`);
    emilyBlsResults.forEach((result, index) => {
      console.log(`\n${index + 1}. Record ID: ${result.id}`);
      console.log(`   User ID: ${result.user_id}`);
      console.log(`   Name: ${result.participant_name}`);
      console.log(`   IC: ${result.participant_ic}`);
      console.log(`   Pre-test score: ${result.pre_test_score}`);
      console.log(`   Post-test score: ${result.post_test_score}`);
      console.log(`   One-man CPR pass: ${result.one_man_cpr_pass}`);
      console.log(`   Two-man CPR pass: ${result.two_man_cpr_pass}`);
      console.log(`   Adult choking pass: ${result.adult_choking_pass}`);
      console.log(`   Infant choking pass: ${result.infant_choking_pass}`);
      console.log(`   Infant CPR pass: ${result.infant_cpr_pass}`);
      console.log(`   Created: ${result.created_at}`);
      console.log(`   Updated: ${result.updated_at}`);
    });
    console.log('');

    // Check EMILY AKUP's data in other tables for reference
    console.log('2. Checking EMILY AKUP\'s data in other tables...');
    
    // Check profiles
    const { data: emilyProfile, error: emilyProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('ic', emilyIc);

    if (emilyProfileError) {
      console.error('❌ Error checking EMILY AKUP\'s profile:', emilyProfileError);
    } else if (emilyProfile && emilyProfile.length > 0) {
      console.log('✅ EMILY AKUP profile found:');
      console.log(`   ID: ${emilyProfile[0].id}`);
      console.log(`   Name: ${emilyProfile[0].full_name}`);
      console.log(`   IC: ${emilyProfile[0].ic}`);
      console.log(`   Role: ${emilyProfile[0].role}`);
      console.log(`   Jawatan: ${emilyProfile[0].jawatan}`);
    } else {
      console.log('❌ EMILY AKUP profile not found');
    }

    // Check quiz_sessions
    const { data: emilyQuiz, error: emilyQuizError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('participant_ic', emilyIc);

    if (emilyQuizError) {
      console.error('❌ Error checking EMILY AKUP\'s quiz_sessions:', emilyQuizError);
    } else if (emilyQuiz && emilyQuiz.length > 0) {
      console.log(`✅ EMILY AKUP quiz_sessions found: ${emilyQuiz.length} records`);
      emilyQuiz.forEach((quiz, index) => {
        console.log(`   ${index + 1}. Score: ${quiz.score}/${quiz.total_questions} (${quiz.percentage}%)`);
      });
    } else {
      console.log('❌ EMILY AKUP quiz_sessions not found');
    }

    // Check checklist_results
    const { data: emilyChecklist, error: emilyChecklistError } = await supabase
      .from('checklist_results')
      .select('*')
      .eq('participant_ic', emilyIc);

    if (emilyChecklistError) {
      console.error('❌ Error checking EMILY AKUP\'s checklist_results:', emilyChecklistError);
    } else if (emilyChecklist && emilyChecklist.length > 0) {
      console.log(`✅ EMILY AKUP checklist_results found: ${emilyChecklist.length} records`);
      emilyChecklist.forEach((checklist, index) => {
        console.log(`   ${index + 1}. ${checklist.checklist_type}: ${checklist.score}/${checklist.total_items} (${checklist.status})`);
      });
    } else {
      console.log('❌ EMILY AKUP checklist_results not found');
    }
    console.log('');

    // Identify null values that need to be fixed
    console.log('3. Identifying null values that need to be fixed...');
    const emilyResult = emilyBlsResults[0]; // Get the first record
    const nullFields = [];

    if (emilyResult.pre_test_score === null) nullFields.push('pre_test_score');
    if (emilyResult.post_test_score === null) nullFields.push('post_test_score');
    if (emilyResult.one_man_cpr_pass === null) nullFields.push('one_man_cpr_pass');
    if (emilyResult.two_man_cpr_pass === null) nullFields.push('two_man_cpr_pass');
    if (emilyResult.adult_choking_pass === null) nullFields.push('adult_choking_pass');
    if (emilyResult.infant_choking_pass === null) nullFields.push('infant_choking_pass');
    if (emilyResult.infant_cpr_pass === null) nullFields.push('infant_cpr_pass');

    if (nullFields.length > 0) {
      console.log(`❌ Found ${nullFields.length} null fields: ${nullFields.join(', ')}`);
    } else {
      console.log('✅ No null fields found');
    }
    console.log('');

    // Show what data is available to fill the nulls
    console.log('4. Available data to fill null values...');
    
    // Get quiz scores
    if (emilyQuiz && emilyQuiz.length > 0) {
      const latestQuiz = emilyQuiz[emilyQuiz.length - 1]; // Get the latest quiz
      console.log(`   Quiz data: ${latestQuiz.score}/${latestQuiz.total_questions} (${latestQuiz.percentage}%)`);
    }

    // Get checklist scores
    if (emilyChecklist && emilyChecklist.length > 0) {
      const checklistByType = {};
      emilyChecklist.forEach(checklist => {
        checklistByType[checklist.checklist_type] = checklist;
      });
      
      console.log('   Checklist data:');
      Object.keys(checklistByType).forEach(type => {
        const checklist = checklistByType[type];
        console.log(`     ${type}: ${checklist.score}/${checklist.total_items} (${checklist.status})`);
      });
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
checkEmilyAkupData();