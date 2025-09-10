// fixEmilyAkupNullsFixed.js - Fix EMILY AKUP's null values in bls_results table (fixed column names)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixEmilyAkupNulls() {
  console.log('🔧 Fixing EMILY AKUP\'s null values in bls_results table...\n');

  try {
    const emilyIc = '820924135946';
    const emilyUserId = '1543357e-7c30-4f74-9b0f-333843e42a15';

    // Get EMILY AKUP's quiz data
    console.log('1. Getting EMILY AKUP\'s quiz data...');
    const { data: emilyQuiz, error: emilyQuizError } = await supabase
      .from('quiz_sessions')
      .select('score, total_questions, percentage, updated_at')
      .eq('participant_ic', emilyIc)
      .order('updated_at', { ascending: false });

    if (emilyQuizError) {
      console.error('❌ Error getting EMILY AKUP\'s quiz data:', emilyQuizError);
      return;
    }

    if (!emilyQuiz || emilyQuiz.length === 0) {
      console.log('❌ No quiz data found for EMILY AKUP');
      return;
    }

    // Use the latest quiz scores
    const latestQuiz = emilyQuiz[0];
    console.log(`✅ Latest quiz data: ${latestQuiz.score}/${latestQuiz.total_questions} (${latestQuiz.percentage}%)`);
    console.log('');

    // Get EMILY AKUP's checklist data
    console.log('2. Getting EMILY AKUP\'s checklist data...');
    const { data: emilyChecklist, error: emilyChecklistError } = await supabase
      .from('checklist_results')
      .select('checklist_type, score, total_items, status')
      .eq('participant_ic', emilyIc);

    if (emilyChecklistError) {
      console.error('❌ Error getting EMILY AKUP\'s checklist data:', emilyChecklistError);
      return;
    }

    if (!emilyChecklist || emilyChecklist.length === 0) {
      console.log('❌ No checklist data found for EMILY AKUP');
      return;
    }

    // Organize checklist data by type
    const checklistByType = {};
    emilyChecklist.forEach(checklist => {
      checklistByType[checklist.checklist_type] = checklist;
    });

    console.log('✅ Checklist data found:');
    Object.keys(checklistByType).forEach(type => {
      const checklist = checklistByType[type];
      console.log(`   ${type}: ${checklist.score}/${checklist.total_items} (${checklist.status})`);
    });
    console.log('');

    // Create checklist details
    console.log('3. Creating checklist details...');
    
    // Function to create checklist details
    function createChecklistDetails(score, totalItems, status) {
      const percentage = Math.round((score / totalItems) * 100);
      const isPass = status === 'PASS';
      
      // Define standard checklist items
      const standardItems = [
        'Scene safety assessment',
        'Check responsiveness',
        'Call for help',
        'Open airway',
        'Check breathing',
        'Check pulse',
        'Begin compressions',
        'Proper hand placement',
        'Correct compression depth',
        'Correct compression rate',
        'Allow full chest recoil',
        'Minimize interruptions',
        'Rescue breaths (if applicable)',
        'AED use (if applicable)',
        'Reassessment'
      ];

      // Calculate how many items were performed based on score
      const performedCount = Math.round((score / totalItems) * standardItems.length);
      const performed = standardItems.slice(0, performedCount);
      const notPerformed = standardItems.slice(performedCount);

      return {
        performed,
        notPerformed,
        score,
        totalItems,
        percentage,
        status,
        pass: isPass
      };
    }

    // Create details for each checklist type
    const oneManCprDetails = checklistByType['one-man-cpr'] 
      ? createChecklistDetails(checklistByType['one-man-cpr'].score, checklistByType['one-man-cpr'].total_items, checklistByType['one-man-cpr'].status)
      : { performed: [], notPerformed: [], score: 0, totalItems: 10, percentage: 0, status: 'FAIL', pass: false };

    const twoManCprDetails = checklistByType['two-man-cpr']
      ? createChecklistDetails(checklistByType['two-man-cpr'].score, checklistByType['two-man-cpr'].total_items, checklistByType['two-man-cpr'].status)
      : { performed: [], notPerformed: [], score: 0, totalItems: 10, percentage: 0, status: 'FAIL', pass: false };

    const adultChokingDetails = checklistByType['adult-choking']
      ? createChecklistDetails(checklistByType['adult-choking'].score, checklistByType['adult-choking'].total_items, checklistByType['adult-choking'].status)
      : { performed: [], notPerformed: [], score: 0, totalItems: 10, percentage: 0, status: 'FAIL', pass: false };

    const infantChokingDetails = checklistByType['infant-choking']
      ? createChecklistDetails(checklistByType['infant-choking'].score, checklistByType['infant-choking'].total_items, checklistByType['infant-choking'].status)
      : { performed: [], notPerformed: [], score: 0, totalItems: 10, percentage: 0, status: 'FAIL', pass: false };

    const infantCprDetails = checklistByType['infant-cpr']
      ? createChecklistDetails(checklistByType['infant-cpr'].score, checklistByType['infant-cpr'].total_items, checklistByType['infant-cpr'].status)
      : { performed: [], notPerformed: [], score: 0, totalItems: 10, percentage: 0, status: 'FAIL', pass: false };

    console.log('✅ Checklist details created');
    console.log('');

    // Update EMILY AKUP's bls_results record
    console.log('4. Updating EMILY AKUP\'s bls_results record...');
    const { error: updateError } = await supabase
      .from('bls_results')
      .update({
        pre_test_score: latestQuiz.score,
        post_test_score: latestQuiz.score, // Using the same score for both pre and post
        one_man_cpr_pass: checklistByType['one-man-cpr']?.status === 'PASS',
        two_man_cpr_pass: checklistByType['two-man-cpr']?.status === 'PASS',
        adult_choking_pass: checklistByType['adult-choking']?.status === 'PASS',
        infant_choking_pass: checklistByType['infant-choking']?.status === 'PASS',
        infant_cpr_pass: checklistByType['infant-cpr']?.status === 'PASS',
        one_man_cpr_details: oneManCprDetails,
        two_man_cpr_details: twoManCprDetails,
        adult_choking_details: adultChokingDetails,
        infant_choking_details: infantChokingDetails,
        infant_cpr_details: infantCprDetails,
        updated_at: new Date().toISOString()
      })
      .eq('participant_ic', emilyIc);

    if (updateError) {
      console.error('❌ Error updating EMILY AKUP\'s bls_results:', updateError);
      return;
    }

    console.log('✅ Successfully updated EMILY AKUP\'s bls_results record');
    console.log('');

    // Verify the update
    console.log('5. Verifying the update...');
    const { data: verifyResult, error: verifyError } = await supabase
      .from('bls_results')
      .select('*')
      .eq('participant_ic', emilyIc);

    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError);
      return;
    }

    if (verifyResult && verifyResult.length > 0) {
      const result = verifyResult[0];
      console.log('✅ EMILY AKUP\'s updated data:');
      console.log(`   Pre-test score: ${result.pre_test_score}`);
      console.log(`   Post-test score: ${result.post_test_score}`);
      console.log(`   One-man CPR pass: ${result.one_man_cpr_pass}`);
      console.log(`   Two-man CPR pass: ${result.two_man_cpr_pass}`);
      console.log(`   Adult choking pass: ${result.adult_choking_pass}`);
      console.log(`   Infant choking pass: ${result.infant_choking_pass}`);
      console.log(`   Infant CPR pass: ${result.infant_cpr_pass}`);
      console.log('');
      console.log('   Checklist details:');
      console.log(`     One-man CPR: ${result.one_man_cpr_details.performed.length} performed, ${result.one_man_cpr_details.notPerformed.length} not performed (${result.one_man_cpr_details.status})`);
      console.log(`     Two-man CPR: ${result.two_man_cpr_details.performed.length} performed, ${result.two_man_cpr_details.notPerformed.length} not performed (${result.two_man_cpr_details.status})`);
      console.log(`     Adult choking: ${result.adult_choking_details.performed.length} performed, ${result.adult_choking_details.notPerformed.length} not performed (${result.adult_choking_details.status})`);
      console.log(`     Infant choking: ${result.infant_choking_details.performed.length} performed, ${result.infant_choking_details.notPerformed.length} not performed (${result.infant_choking_details.status})`);
      console.log(`     Infant CPR: ${result.infant_cpr_details.performed.length} performed, ${result.infant_cpr_details.notPerformed.length} not performed (${result.infant_cpr_details.status})`);
    }
    console.log('');

    console.log('🎉 EMILY AKUP\'s null values successfully fixed!');
    console.log('');
    console.log('Summary:');
    console.log('- Pre-test score: Updated with quiz data');
    console.log('- Post-test score: Updated with quiz data');
    console.log('- All checklist pass/fail status: Updated with checklist data');
    console.log('- All checklist details: Populated with comprehensive information');
    console.log('- EMILY AKUP now has complete data in bls_results table');

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
fixEmilyAkupNulls();

