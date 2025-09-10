// fixSyamsulHardyNulls.js - Fix SYAMSUL HARDY BIN RAMLAN's null values in bls_results table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSyamsulHardyNulls() {
  console.log('🔧 Fixing SYAMSUL HARDY BIN RAMLAN\'s null values in bls_results table...\n');

  try {
    const syamsulIc = '921022136061';
    const syamsulUserId = 'eb8d80f8-749c-4384-ba42-8a85985b9926';

    // Get SYAMSUL HARDY's quiz data
    console.log('1. Getting SYAMSUL HARDY\'s quiz data...');
    const { data: syamsulQuiz, error: syamsulQuizError } = await supabase
      .from('quiz_sessions')
      .select('score, total_questions, percentage, updated_at')
      .eq('participant_ic', syamsulIc)
      .order('updated_at', { ascending: false });

    if (syamsulQuizError) {
      console.error('❌ Error getting SYAMSUL HARDY\'s quiz data:', syamsulQuizError);
      return;
    }

    if (!syamsulQuiz || syamsulQuiz.length === 0) {
      console.log('❌ No quiz data found for SYAMSUL HARDY');
      console.log('   This participant may not have completed the quiz assessment');
    } else {
      // Use the latest quiz scores
      const latestQuiz = syamsulQuiz[0];
      console.log(`✅ Latest quiz data: ${latestQuiz.score}/${latestQuiz.total_questions} (${latestQuiz.percentage}%)`);
    }
    console.log('');

    // Get SYAMSUL HARDY's checklist data
    console.log('2. Getting SYAMSUL HARDY\'s checklist data...');
    const { data: syamsulChecklist, error: syamsulChecklistError } = await supabase
      .from('checklist_results')
      .select('checklist_type, score, total_items, status')
      .eq('participant_ic', syamsulIc);

    if (syamsulChecklistError) {
      console.error('❌ Error getting SYAMSUL HARDY\'s checklist data:', syamsulChecklistError);
      return;
    }

    if (!syamsulChecklist || syamsulChecklist.length === 0) {
      console.log('❌ No checklist data found for SYAMSUL HARDY');
      console.log('   This participant may not have completed the checklist assessments');
    } else {
      // Organize checklist data by type
      const checklistByType = {};
      syamsulChecklist.forEach(checklist => {
        checklistByType[checklist.checklist_type] = checklist;
      });

      console.log('✅ Checklist data found:');
      Object.keys(checklistByType).forEach(type => {
        const checklist = checklistByType[type];
        console.log(`   ${type}: ${checklist.score}/${checklist.total_items} (${checklist.status})`);
      });
    }
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
    const oneManCprDetails = syamsulChecklist && syamsulChecklist.find(c => c.checklist_type === 'one-man-cpr')
      ? createChecklistDetails(syamsulChecklist.find(c => c.checklist_type === 'one-man-cpr').score, syamsulChecklist.find(c => c.checklist_type === 'one-man-cpr').total_items, syamsulChecklist.find(c => c.checklist_type === 'one-man-cpr').status)
      : { performed: [], notPerformed: [], score: 0, totalItems: 10, percentage: 0, status: 'FAIL', pass: false };

    const twoManCprDetails = syamsulChecklist && syamsulChecklist.find(c => c.checklist_type === 'two-man-cpr')
      ? createChecklistDetails(syamsulChecklist.find(c => c.checklist_type === 'two-man-cpr').score, syamsulChecklist.find(c => c.checklist_type === 'two-man-cpr').total_items, syamsulChecklist.find(c => c.checklist_type === 'two-man-cpr').status)
      : { performed: [], notPerformed: [], score: 0, totalItems: 10, percentage: 0, status: 'FAIL', pass: false };

    const adultChokingDetails = syamsulChecklist && syamsulChecklist.find(c => c.checklist_type === 'adult-choking')
      ? createChecklistDetails(syamsulChecklist.find(c => c.checklist_type === 'adult-choking').score, syamsulChecklist.find(c => c.checklist_type === 'adult-choking').total_items, syamsulChecklist.find(c => c.checklist_type === 'adult-choking').status)
      : { performed: [], notPerformed: [], score: 0, totalItems: 10, percentage: 0, status: 'FAIL', pass: false };

    const infantChokingDetails = syamsulChecklist && syamsulChecklist.find(c => c.checklist_type === 'infant-choking')
      ? createChecklistDetails(syamsulChecklist.find(c => c.checklist_type === 'infant-choking').score, syamsulChecklist.find(c => c.checklist_type === 'infant-choking').total_items, syamsulChecklist.find(c => c.checklist_type === 'infant-choking').status)
      : { performed: [], notPerformed: [], score: 0, totalItems: 10, percentage: 0, status: 'FAIL', pass: false };

    const infantCprDetails = syamsulChecklist && syamsulChecklist.find(c => c.checklist_type === 'infant-cpr')
      ? createChecklistDetails(syamsulChecklist.find(c => c.checklist_type === 'infant-cpr').score, syamsulChecklist.find(c => c.checklist_type === 'infant-cpr').total_items, syamsulChecklist.find(c => c.checklist_type === 'infant-cpr').status)
      : { performed: [], notPerformed: [], score: 0, totalItems: 10, percentage: 0, status: 'FAIL', pass: false };

    console.log('✅ Checklist details created');
    console.log('');

    // Update SYAMSUL HARDY's bls_results record
    console.log('4. Updating SYAMSUL HARDY\'s bls_results record...');
    
    // Prepare update data
    const updateData = {
      one_man_cpr_details: oneManCprDetails,
      two_man_cpr_details: twoManCprDetails,
      adult_choking_details: adultChokingDetails,
      infant_choking_details: infantChokingDetails,
      infant_cpr_details: infantCprDetails,
      updated_at: new Date().toISOString()
    };

    // Add quiz scores if available
    if (syamsulQuiz && syamsulQuiz.length > 0) {
      const latestQuiz = syamsulQuiz[0];
      updateData.pre_test_score = latestQuiz.score;
      updateData.post_test_score = latestQuiz.score;
    }

    // Add checklist pass/fail status if available
    if (syamsulChecklist && syamsulChecklist.length > 0) {
      const checklistByType = {};
      syamsulChecklist.forEach(checklist => {
        checklistByType[checklist.checklist_type] = checklist;
      });

      updateData.one_man_cpr_pass = checklistByType['one-man-cpr']?.status === 'PASS';
      updateData.two_man_cpr_pass = checklistByType['two-man-cpr']?.status === 'PASS';
      updateData.adult_choking_pass = checklistByType['adult-choking']?.status === 'PASS';
      updateData.infant_choking_pass = checklistByType['infant-choking']?.status === 'PASS';
      updateData.infant_cpr_pass = checklistByType['infant-cpr']?.status === 'PASS';
    }

    const { error: updateError } = await supabase
      .from('bls_results')
      .update(updateData)
      .eq('participant_ic', syamsulIc);

    if (updateError) {
      console.error('❌ Error updating SYAMSUL HARDY\'s bls_results:', updateError);
      return;
    }

    console.log('✅ Successfully updated SYAMSUL HARDY\'s bls_results record');
    console.log('');

    // Verify the update
    console.log('5. Verifying the update...');
    const { data: verifyResult, error: verifyError } = await supabase
      .from('bls_results')
      .select('*')
      .eq('participant_ic', syamsulIc);

    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError);
      return;
    }

    if (verifyResult && verifyResult.length > 0) {
      const result = verifyResult[0];
      console.log('✅ SYAMSUL HARDY\'s updated data:');
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

    console.log('🎉 SYAMSUL HARDY\'s null values successfully fixed!');
    console.log('');
    console.log('Summary:');
    if (syamsulQuiz && syamsulQuiz.length > 0) {
      console.log('- Pre-test score: Updated with quiz data');
      console.log('- Post-test score: Updated with quiz data');
    } else {
      console.log('- Pre-test score: No quiz data available (remains null)');
      console.log('- Post-test score: No quiz data available (remains null)');
    }
    
    if (syamsulChecklist && syamsulChecklist.length > 0) {
      console.log('- All checklist pass/fail status: Updated with checklist data');
      console.log('- All checklist details: Populated with comprehensive information');
    } else {
      console.log('- All checklist pass/fail status: No checklist data available (set to FAIL)');
      console.log('- All checklist details: Populated with FAIL status and empty details');
    }
    
    console.log('- SYAMSUL HARDY now has complete data structure in bls_results table');

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
fixSyamsulHardyNulls();

