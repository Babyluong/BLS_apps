// fixSharedUserID.js
// Fix the shared user_id issue by creating separate user_ids for each unique participant

const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSharedUserID() {
  try {
    const problemUserId = '1543357e-7c30-4f74-9b0f-333843e42a15';
    
    console.log('🔧 Fixing shared user_id issue...\n');

    // Get all data for the problem user
    const { data: quizSessions, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('user_id', problemUserId);

    const { data: checklistResults, error: checklistError } = await supabase
      .from('checklist_results')
      .select('*')
      .eq('user_id', problemUserId);

    const { data: blsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('*')
      .eq('user_id', problemUserId);

    if (quizError || checklistError || blsError) {
      console.log('❌ Error fetching data:', quizError?.message || checklistError?.message || blsError?.message);
      return;
    }

    console.log(`Found data for shared user_id:`);
    console.log(`- Quiz sessions: ${quizSessions.length}`);
    console.log(`- Checklist results: ${checklistResults.length}`);
    console.log(`- BLS results: ${blsResults.length}`);

    // Group data by unique participant (name + IC)
    const participantGroups = {};

    // Group quiz sessions
    quizSessions.forEach(session => {
      const key = `${session.participant_name}_${session.participant_ic}`;
      if (!participantGroups[key]) {
        participantGroups[key] = {
          participant_name: session.participant_name,
          participant_ic: session.participant_ic,
          quiz_sessions: [],
          checklist_results: [],
          new_user_id: uuidv4()
        };
      }
      participantGroups[key].quiz_sessions.push(session);
    });

    // Group checklist results
    checklistResults.forEach(result => {
      const key = `${result.participant_name}_${result.participant_ic}`;
      if (!participantGroups[key]) {
        participantGroups[key] = {
          participant_name: result.participant_name,
          participant_ic: result.participant_ic,
          quiz_sessions: [],
          checklist_results: [],
          new_user_id: uuidv4()
        };
      }
      participantGroups[key].checklist_results.push(result);
    });

    console.log(`\n📊 Found ${Object.keys(participantGroups).length} unique participants:`);
    Object.entries(participantGroups).forEach(([key, participant], index) => {
      console.log(`  ${index + 1}. ${participant.participant_name} (${participant.participant_ic})`);
      console.log(`     New User ID: ${participant.new_user_id}`);
      console.log(`     Quiz sessions: ${participant.quiz_sessions.length}`);
      console.log(`     Checklist results: ${participant.checklist_results.length}`);
    });

    // Update quiz sessions with new user_ids
    console.log(`\n🔄 Updating quiz sessions...`);
    let quizUpdateCount = 0;
    for (const [key, participant] of Object.entries(participantGroups)) {
      for (const session of participant.quiz_sessions) {
        const { error: updateError } = await supabase
          .from('quiz_sessions')
          .update({ user_id: participant.new_user_id })
          .eq('id', session.id);

        if (updateError) {
          console.log(`❌ Error updating quiz session ${session.id}: ${updateError.message}`);
        } else {
          quizUpdateCount++;
        }
      }
    }
    console.log(`✅ Updated ${quizUpdateCount} quiz sessions`);

    // Update checklist results with new user_ids
    console.log(`\n🔄 Updating checklist results...`);
    let checklistUpdateCount = 0;
    for (const [key, participant] of Object.entries(participantGroups)) {
      for (const result of participant.checklist_results) {
        const { error: updateError } = await supabase
          .from('checklist_results')
          .update({ user_id: participant.new_user_id })
          .eq('id', result.id);

        if (updateError) {
          console.log(`❌ Error updating checklist result ${result.id}: ${updateError.message}`);
        } else {
          checklistUpdateCount++;
        }
      }
    }
    console.log(`✅ Updated ${checklistUpdateCount} checklist results`);

    // Delete the old bls_results record
    console.log(`\n🗑️ Deleting old bls_results record...`);
    const { error: deleteError } = await supabase
      .from('bls_results')
      .delete()
      .eq('user_id', problemUserId);

    if (deleteError) {
      console.log(`❌ Error deleting old bls_results: ${deleteError.message}`);
    } else {
      console.log(`✅ Deleted old bls_results record`);
    }

    // Create new bls_results records for each participant
    console.log(`\n🔄 Creating new bls_results records...`);
    let blsCreateCount = 0;
    
    for (const [key, participant] of Object.entries(participantGroups)) {
      // Find pre-test and post-test sessions
      const preTestSession = participant.quiz_sessions.find(s => s.quiz_key === 'pretest');
      const postTestSession = participant.quiz_sessions.find(s => s.quiz_key === 'posttest');

      // Group checklist results by type
      const checklistByType = {};
      participant.checklist_results.forEach(result => {
        checklistByType[result.checklist_type] = result;
      });

      // Create new bls_results record
      const newBlsResult = {
        user_id: participant.new_user_id,
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
        infant_cpr_details: checklistByType['infant-cpr']?.checklist_details || { performed: [], notPerformed: [] }
      };

      const { error: insertError } = await supabase
        .from('bls_results')
        .insert([newBlsResult]);

      if (insertError) {
        console.log(`❌ Error creating bls_results for ${participant.participant_name}: ${insertError.message}`);
      } else {
        console.log(`✅ Created bls_results for ${participant.participant_name}`);
        blsCreateCount++;
      }
    }

    console.log(`\n📊 Fix Summary:`);
    console.log(`===============`);
    console.log(`- Quiz sessions updated: ${quizUpdateCount}`);
    console.log(`- Checklist results updated: ${checklistUpdateCount}`);
    console.log(`- New bls_results created: ${blsCreateCount}`);
    console.log(`- Old bls_results deleted: 1`);
    console.log(`- Net change: +${blsCreateCount - 1} records`);

    // Verify the fix
    console.log(`\n🔍 Verifying fix...`);
    const { data: finalBlsResults, error: finalError } = await supabase
      .from('bls_results')
      .select('user_id')
      .order('created_at', { ascending: false });

    if (finalError) {
      console.log('❌ Error verifying fix:', finalError.message);
      return;
    }

    const uniqueUsers = new Set(finalBlsResults.map(r => r.user_id));
    console.log(`✅ Final verification:`);
    console.log(`- Total bls_results records: ${finalBlsResults.length}`);
    console.log(`- Unique users: ${uniqueUsers.size}`);
    console.log(`- Expected: 56 + 10 = 66 records`);

  } catch (error) {
    console.error('❌ Error fixing shared user_id:', error);
  }
}

fixSharedUserID();

