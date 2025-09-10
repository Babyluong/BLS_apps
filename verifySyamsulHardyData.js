// verifySyamsulHardyData.js - Verify SYAMSUL HARDY's data consistency across tables
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySyamsulHardyData() {
  console.log('🔍 Verifying SYAMSUL HARDY\'s data consistency across all tables...\n');

  try {
    const syamsulIc = '921022136061';
    const syamsulName = 'SYAMSUL HARDY BIN RAMLAN';

    // 1. Check bls_results
    console.log('1. Checking bls_results table...');
    const { data: blsData, error: blsError } = await supabase
      .from('bls_results')
      .select('*')
      .eq('participant_ic', syamsulIc);

    if (blsError) {
      console.error('❌ Error getting bls_results:', blsError);
      return;
    }

    if (blsData && blsData.length > 0) {
      const bls = blsData[0];
      console.log('✅ bls_results data:');
      console.log(`   Name: ${bls.participant_name}`);
      console.log(`   IC: ${bls.participant_ic}`);
      console.log(`   User ID: ${bls.user_id}`);
      console.log(`   Pre-test: ${bls.pre_test_score}/30 (${Math.round((bls.pre_test_score / 30) * 100)}%)`);
      console.log(`   Post-test: ${bls.post_test_score}/30 (${Math.round((bls.post_test_score / 30) * 100)}%)`);
      console.log(`   One-man CPR: ${bls.one_man_cpr_pass ? 'PASS' : 'FAIL'}`);
      console.log(`   Two-man CPR: ${bls.two_man_cpr_pass ? 'PASS' : 'FAIL'}`);
      console.log(`   Adult choking: ${bls.adult_choking_pass ? 'PASS' : 'FAIL'}`);
      console.log(`   Infant choking: ${bls.infant_choking_pass ? 'PASS' : 'FAIL'}`);
      console.log(`   Infant CPR: ${bls.infant_cpr_pass ? 'PASS' : 'FAIL'}`);
      console.log('');
    } else {
      console.log('❌ No data found in bls_results');
      return;
    }

    // 2. Check quiz_sessions
    console.log('2. Checking quiz_sessions table...');
    const { data: quizData, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('participant_ic', syamsulIc)
      .order('updated_at', { ascending: true });

    if (quizError) {
      console.error('❌ Error getting quiz_sessions:', quizError);
      return;
    }

    if (quizData && quizData.length > 0) {
      console.log(`✅ quiz_sessions data (${quizData.length} records):`);
      quizData.forEach((quiz, index) => {
        console.log(`   ${index + 1}. ${quiz.quiz_key.toUpperCase()}:`);
        console.log(`      Score: ${quiz.score}/${quiz.total_questions} (${quiz.percentage}%)`);
        console.log(`      Status: ${quiz.status}`);
        console.log(`      User ID: ${quiz.user_id}`);
        console.log(`      Updated: ${new Date(quiz.updated_at).toLocaleString()}`);
        console.log('');
      });
    } else {
      console.log('❌ No data found in quiz_sessions');
    }

    // 3. Check checklist_results
    console.log('3. Checking checklist_results table...');
    const { data: checklistData, error: checklistError } = await supabase
      .from('checklist_results')
      .select('*')
      .eq('participant_ic', syamsulIc)
      .order('created_at', { ascending: true });

    if (checklistError) {
      console.error('❌ Error getting checklist_results:', checklistError);
      return;
    }

    if (checklistData && checklistData.length > 0) {
      console.log(`✅ checklist_results data (${checklistData.length} records):`);
      checklistData.forEach((checklist, index) => {
        console.log(`   ${index + 1}. ${checklist.checklist_type}:`);
        console.log(`      Score: ${checklist.score}/${checklist.total_items} (${checklist.percentage}%)`);
        console.log(`      Status: ${checklist.status}`);
        console.log(`      User ID: ${checklist.user_id}`);
        console.log(`      Created: ${new Date(checklist.created_at).toLocaleString()}`);
        console.log('');
      });
    } else {
      console.log('❌ No data found in checklist_results');
    }

    // 4. Check profiles
    console.log('4. Checking profiles table...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', blsData[0].user_id);

    if (profileError) {
      console.error('❌ Error getting profiles:', profileError);
      return;
    }

    if (profileData && profileData.length > 0) {
      const profile = profileData[0];
      console.log('✅ profiles data:');
      console.log(`   Name: ${profile.full_name}`);
      console.log(`   IC: ${profile.ic_number}`);
      console.log(`   User ID: ${profile.id}`);
      console.log(`   Jawatan: ${profile.jawatan}`);
      console.log(`   Role: ${profile.role}`);
      console.log(`   Email: ${profile.email}`);
      console.log(`   Tempat Bertugas: ${profile.tempat_bertugas}`);
      console.log('');
    } else {
      console.log('❌ No data found in profiles');
    }

    // 5. Data consistency check
    console.log('5. Data consistency check...');
    const bls = blsData[0];
    const preTestQuiz = quizData.find(q => q.quiz_key === 'pretest');
    const postTestQuiz = quizData.find(q => q.quiz_key === 'posttest');

    let isConsistent = true;

    // Check quiz scores consistency
    if (preTestQuiz && bls.pre_test_score !== preTestQuiz.score) {
      console.log(`❌ Pre-test score mismatch: bls_results(${bls.pre_test_score}) vs quiz_sessions(${preTestQuiz.score})`);
      isConsistent = false;
    } else if (preTestQuiz) {
      console.log(`✅ Pre-test scores match: ${bls.pre_test_score}`);
    }

    if (postTestQuiz && bls.post_test_score !== postTestQuiz.score) {
      console.log(`❌ Post-test score mismatch: bls_results(${bls.post_test_score}) vs quiz_sessions(${postTestQuiz.score})`);
      isConsistent = false;
    } else if (postTestQuiz) {
      console.log(`✅ Post-test scores match: ${bls.post_test_score}`);
    }

    // Check user_id consistency
    const userIds = [bls.user_id];
    if (preTestQuiz) userIds.push(preTestQuiz.user_id);
    if (postTestQuiz) userIds.push(postTestQuiz.user_id);
    if (checklistData.length > 0) userIds.push(...checklistData.map(c => c.user_id));
    if (profileData.length > 0) userIds.push(profileData[0].id);

    const uniqueUserIds = [...new Set(userIds)];
    if (uniqueUserIds.length > 1) {
      console.log(`❌ User ID mismatch: Found ${uniqueUserIds.length} different user IDs`);
      isConsistent = false;
    } else {
      console.log(`✅ User ID consistent: ${uniqueUserIds[0]}`);
    }

    // Final summary
    console.log('\n6. Final summary:');
    if (isConsistent) {
      console.log('🎉 All data is consistent across all tables!');
      console.log(`✅ SYAMSUL HARDY BIN RAMLAN (${syamsulIc}) has complete data in:`);
      console.log(`   - bls_results: Quiz scores + checklist results`);
      console.log(`   - quiz_sessions: ${quizData.length} quiz records`);
      console.log(`   - checklist_results: ${checklistData.length} checklist records`);
      console.log(`   - profiles: Complete profile information`);
    } else {
      console.log('❌ Data inconsistencies found - please review the above details');
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
verifySyamsulHardyData();

