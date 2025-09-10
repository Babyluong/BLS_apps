// fixCorrectMissingParticipant.js
// Remove AMRI AMIT (admin) and restore EMILY AKUP (missing participant)

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixCorrectMissingParticipant() {
  try {
    console.log('🔧 Fixing correct missing participant...\n');
    console.log('1. Removing AMRI AMIT (admin) from bls_results');
    console.log('2. Restoring EMILY AKUP (missing participant)');

    // Step 1: Remove AMRI AMIT (admin) from bls_results
    console.log('\n🗑️ Removing AMRI AMIT (admin) from bls_results...');
    const { error: deleteAmriError } = await supabase
      .from('bls_results')
      .delete()
      .eq('participant_ic', '940120126733'); // AMRI AMIT's IC

    if (deleteAmriError) {
      console.log('❌ Error deleting AMRI AMIT:', deleteAmriError.message);
    } else {
      console.log('✅ Deleted AMRI AMIT (admin) from bls_results');
    }

    // Step 2: Find EMILY AKUP's data
    console.log('\n🔍 Finding EMILY AKUP data...');
    
    // Get EMILY AKUP's quiz sessions
    const { data: emilyQuizSessions, error: emilyQuizError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('participant_ic', '820924135946') // EMILY AKUP's IC
      .eq('status', 'submitted');

    if (emilyQuizError) {
      console.log('❌ Error fetching EMILY AKUP quiz sessions:', emilyQuizError.message);
      return;
    }

    // Get EMILY AKUP's checklist results
    const { data: emilyChecklistResults, error: emilyChecklistError } = await supabase
      .from('checklist_results')
      .select('*')
      .eq('participant_ic', '820924135946'); // EMILY AKUP's IC

    if (emilyChecklistError) {
      console.log('❌ Error fetching EMILY AKUP checklist results:', emilyChecklistError.message);
      return;
    }

    console.log(`📊 EMILY AKUP data found:`);
    console.log(`- Quiz sessions: ${emilyQuizSessions.length}`);
    console.log(`- Checklist results: ${emilyChecklistResults.length}`);

    if (emilyQuizSessions.length === 0 && emilyChecklistResults.length === 0) {
      console.log('❌ No data found for EMILY AKUP. Cannot create bls_results record.');
      return;
    }

    // Step 3: Create bls_results record for EMILY AKUP
    console.log('\n🔄 Creating bls_results for EMILY AKUP...');
    
    // Find pre-test and post-test sessions
    const preTestSession = emilyQuizSessions.find(s => s.quiz_key === 'pretest');
    const postTestSession = emilyQuizSessions.find(s => s.quiz_key === 'posttest');

    // Group checklist results by type
    const checklistByType = {};
    emilyChecklistResults.forEach(result => {
      checklistByType[result.checklist_type] = result;
    });

    // Create new bls_results record for EMILY AKUP
    const emilyBlsResult = {
      user_id: emilyQuizSessions[0]?.user_id || emilyChecklistResults[0]?.user_id,
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
      participant_name: emilyQuizSessions[0]?.participant_name || emilyChecklistResults[0]?.participant_name,
      participant_ic: emilyQuizSessions[0]?.participant_ic || emilyChecklistResults[0]?.participant_ic
    };

    const { error: insertEmilyError } = await supabase
      .from('bls_results')
      .insert([emilyBlsResult]);

    if (insertEmilyError) {
      console.log('❌ Error creating bls_results for EMILY AKUP:', insertEmilyError.message);
    } else {
      console.log('✅ Created bls_results for EMILY AKUP');
    }

    // Step 4: Verify the final result
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
      console.log(`\n⚠️ Still need to fix: ${finalBlsResults.length} records, EMILY: ${emilyPresent}, AMRI: ${amriPresent}`);
    }

    // Show final participant list
    console.log(`\n📋 Final participant list:`);
    finalBlsResults.forEach((record, index) => {
      const isEmily = record.participant_ic === '820924135946';
      const isAmri = record.participant_ic === '940120126733';
      const marker = isEmily ? ' ✅' : isAmri ? ' ❌' : '';
      console.log(`  ${index + 1}. ${record.participant_name || 'N/A'} (${record.participant_ic || 'N/A'})${marker}`);
    });

  } catch (error) {
    console.error('❌ Error fixing correct missing participant:', error);
  }
}

fixCorrectMissingParticipant();

