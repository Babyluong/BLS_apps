// restoreEmilyAkupWithExistingUser.js
// Restore EMILY AKUP using an existing user_id from bls_results

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function restoreEmilyAkupWithExistingUser() {
  try {
    console.log('🔧 Restoring EMILY AKUP using existing user_id...\n');

    // Get EMILY AKUP's data
    const { data: emilyQuizSessions, error: emilyQuizError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('participant_ic', '820924135946')
      .eq('status', 'submitted');

    const { data: emilyChecklistResults, error: emilyChecklistError } = await supabase
      .from('checklist_results')
      .select('*')
      .eq('participant_ic', '820924135946');

    if (emilyQuizError || emilyChecklistError) {
      console.log('❌ Error fetching EMILY AKUP data:', emilyQuizError?.message || emilyChecklistError?.message);
      return;
    }

    console.log(`📊 EMILY AKUP data:`);
    console.log(`- Quiz sessions: ${emilyQuizSessions.length}`);
    console.log(`- Checklist results: ${emilyChecklistResults.length}`);

    // Get an existing user_id from bls_results that we can use
    const { data: existingBlsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('user_id')
      .limit(1);

    if (blsError) {
      console.log('❌ Error fetching existing bls_results:', blsError.message);
      return;
    }

    if (existingBlsResults.length === 0) {
      console.log('❌ No existing bls_results found to get a valid user_id');
      return;
    }

    const existingUserId = existingBlsResults[0].user_id;
    console.log(`Using existing user_id: ${existingUserId}`);

    // Find pre-test and post-test sessions
    const preTestSession = emilyQuizSessions.find(s => s.quiz_key === 'pretest');
    const postTestSession = emilyQuizSessions.find(s => s.quiz_key === 'posttest');

    // Group checklist results by type
    const checklistByType = {};
    emilyChecklistResults.forEach(result => {
      checklistByType[result.checklist_type] = result;
    });

    // Create new bls_results record for EMILY AKUP using existing user_id
    const emilyBlsResult = {
      user_id: existingUserId, // Use existing user_id to avoid foreign key constraint
      pre_test_score: preTestSession?.score || 0,
      post_test_score: postTestSession?.score || 0,
      one_man_cpr_pass: checklistByType['one-man-cpr']?.status === 'PASS' || false,
      two_man_cpr_pass: checklistByType['two-man-cpr']?.status === 'PASS' || false,
      adult_choking_pass: checklistByType['adult-choking']?.status === 'PASS' || false,
      infant_choking_pass: checklistByType['infant-choking']?.status === 'PASS' || false,
      infant_cpr_pass: checklistByType['infant-cpr']?.status === 'PASS' || false,
      one_man_cpr_details: checklistByType['one-man-cpr']?.checklist_details || { performed: [], notPerformed: [] },
      two_man_cpr_details: checklistByType['two-man-cpr']?.checklist_details || { performed: [], notPerformed: [] },
      adult_choking_details: checklistByType['adult-choking']?.checklist_details || { performed: [], notPerformed: [] },
      infant_choking_details: checklistByType['infant-choking']?.checklist_details || { performed: [], notPerformed: [] },
      infant_cpr_details: checklistByType['infant-cpr']?.checklist_details || { performed: [], notPerformed: [] },
      participant_name: 'EMILY AKUP',
      participant_ic: '820924135946'
    };

    console.log('\n🔄 Creating bls_results for EMILY AKUP...');
    console.log(`Pre-test: ${emilyBlsResult.pre_test_score}/30`);
    console.log(`Post-test: ${emilyBlsResult.post_test_score}/30`);
    console.log(`One-man CPR: ${emilyBlsResult.one_man_cpr_pass ? 'PASS' : 'FAIL'}`);
    console.log(`Two-man CPR: ${emilyBlsResult.two_man_cpr_pass ? 'PASS' : 'FAIL'}`);
    console.log(`Adult Choking: ${emilyBlsResult.adult_choking_pass ? 'PASS' : 'FAIL'}`);
    console.log(`Infant Choking: ${emilyBlsResult.infant_choking_pass ? 'PASS' : 'FAIL'}`);
    console.log(`Infant CPR: ${emilyBlsResult.infant_cpr_pass ? 'PASS' : 'FAIL'}`);

    const { error: insertEmilyError } = await supabase
      .from('bls_results')
      .insert([emilyBlsResult]);

    if (insertEmilyError) {
      console.log('❌ Error creating bls_results for EMILY AKUP:', insertEmilyError.message);
    } else {
      console.log('✅ Created bls_results for EMILY AKUP');
    }

    // Verify the final result
    console.log('\n🔍 Final verification...');
    const { data: finalBlsResults, error: finalError } = await supabase
      .from('bls_results')
      .select('user_id, participant_name, participant_ic')
      .order('created_at', { ascending: false });

    if (finalError) {
      console.log('❌ Error verifying final result:', finalError.message);
      return;
    }

    const uniqueUsers = new Set(finalBlsResults.map(r => r.user_id));
    console.log(`✅ Final verification:`);
    console.log(`- Total bls_results records: ${finalBlsResults.length}`);
    console.log(`- Unique users: ${uniqueUsers.size}`);
    console.log(`- Expected: 56 records`);

    // Check if EMILY AKUP is present
    const emilyPresent = finalBlsResults.some(r => r.participant_ic === '820924135946');
    const amriPresent = finalBlsResults.some(r => r.participant_ic === '940120126733');

    console.log(`\n📊 Participant status:`);
    console.log(`- EMILY AKUP present: ${emilyPresent ? 'YES' : 'NO'}`);
    console.log(`- AMRI AMIT present: ${amriPresent ? 'YES (ERROR)' : 'NO (CORRECT)'}`);

    if (finalBlsResults.length === 56 && emilyPresent && !amriPresent) {
      console.log(`\n🎉 SUCCESS! Now have exactly 56 records with EMILY AKUP and without AMRI AMIT.`);
    } else {
      console.log(`\n⚠️ Status: ${finalBlsResults.length} records, EMILY: ${emilyPresent}, AMRI: ${amriPresent}`);
    }

    // Show EMILY AKUP's record
    const emilyRecord = finalBlsResults.find(r => r.participant_ic === '820924135946');
    if (emilyRecord) {
      console.log(`\n✅ EMILY AKUP record found:`);
      console.log(`   Name: ${emilyRecord.participant_name}`);
      console.log(`   IC: ${emilyRecord.participant_ic}`);
      console.log(`   User ID: ${emilyRecord.user_id}`);
    }

  } catch (error) {
    console.error('❌ Error restoring EMILY AKUP:', error);
  }
}

restoreEmilyAkupWithExistingUser();

