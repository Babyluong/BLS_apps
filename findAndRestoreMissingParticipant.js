// findAndRestoreMissingParticipant.js
// Find and restore the missing participant

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function findAndRestoreMissingParticipant() {
  try {
    console.log('🔍 Finding and restoring missing participant...\n');

    // Get current bls_results count
    const { data: currentBlsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('user_id, participant_name, participant_ic');

    if (blsError) {
      console.log('❌ Error fetching bls_results:', blsError.message);
      return;
    }

    console.log(`📊 Current bls_results: ${currentBlsResults.length} records`);

    // Get all quiz sessions
    const { data: quizSessions, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('user_id, participant_name, participant_ic, quiz_key, score, total_questions')
      .eq('status', 'submitted');

    if (quizError) {
      console.log('❌ Error fetching quiz_sessions:', quizError.message);
      return;
    }

    // Get all checklist results
    const { data: checklistResults, error: checklistError } = await supabase
      .from('checklist_results')
      .select('user_id, participant_name, participant_ic, checklist_type, status, score, total_items');

    if (checklistError) {
      console.log('❌ Error fetching checklist_results:', checklistError.message);
      return;
    }

    console.log(`📊 Quiz sessions: ${quizSessions.length} records`);
    console.log(`📊 Checklist results: ${checklistResults.length} records`);

    // Find unique users from original data
    const uniqueQuizUsers = new Set(quizSessions.map(s => s.user_id));
    const uniqueChecklistUsers = new Set(checklistResults.map(s => s.user_id));
    const allOriginalUsers = new Set([...uniqueQuizUsers, ...uniqueChecklistUsers]);

    console.log(`\n👥 Original data analysis:`);
    console.log(`- Unique users in quiz_sessions: ${uniqueQuizUsers.size}`);
    console.log(`- Unique users in checklist_results: ${uniqueChecklistUsers.size}`);
    console.log(`- Combined unique users: ${allOriginalUsers.size}`);

    // Find users in original data but not in bls_results
    const blsUserIds = new Set(currentBlsResults.map(r => r.user_id));
    const missingUsers = [...allOriginalUsers].filter(userId => !blsUserIds.has(userId));

    console.log(`\n⚠️ Missing users (${missingUsers.length}):`);
    
    if (missingUsers.length === 0) {
      console.log('✅ No missing users found. All participants are accounted for.');
      return;
    }

    // Process each missing user
    for (const userId of missingUsers) {
      console.log(`\n🔍 Processing missing user: ${userId}`);
      
      // Get quiz sessions for this user
      const userQuizSessions = quizSessions.filter(s => s.user_id === userId);
      console.log(`  Quiz sessions: ${userQuizSessions.length}`);
      
      // Get checklist results for this user
      const userChecklistResults = checklistResults.filter(r => r.user_id === userId);
      console.log(`  Checklist results: ${userChecklistResults.length}`);

      if (userQuizSessions.length > 0) {
        console.log(`  Participant: ${userQuizSessions[0].participant_name} (${userQuizSessions[0].participant_ic})`);
      } else if (userChecklistResults.length > 0) {
        console.log(`  Participant: ${userChecklistResults[0].participant_name} (${userChecklistResults[0].participant_ic})`);
      }

      // Create bls_results record for this user
      const preTestSession = userQuizSessions.find(s => s.quiz_key === 'pretest');
      const postTestSession = userQuizSessions.find(s => s.quiz_key === 'posttest');

      // Group checklist results by type
      const checklistByType = {};
      userChecklistResults.forEach(result => {
        checklistByType[result.checklist_type] = result;
      });

      // Create new bls_results record
      const newBlsResult = {
        user_id: userId,
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
        participant_name: userQuizSessions[0]?.participant_name || userChecklistResults[0]?.participant_name,
        participant_ic: userQuizSessions[0]?.participant_ic || userChecklistResults[0]?.participant_ic
      };

      // Insert the new record
      const { error: insertError } = await supabase
        .from('bls_results')
        .insert([newBlsResult]);

      if (insertError) {
        console.log(`❌ Error creating bls_results for ${userId}: ${insertError.message}`);
      } else {
        console.log(`✅ Created bls_results for ${userId}`);
      }
    }

    // Verify the fix
    console.log(`\n🔍 Verifying fix...`);
    const { data: finalBlsResults, error: finalError } = await supabase
      .from('bls_results')
      .select('user_id, participant_name, participant_ic')
      .order('created_at', { ascending: false });

    if (finalError) {
      console.log('❌ Error verifying fix:', finalError.message);
      return;
    }

    console.log(`✅ Final verification:`);
    console.log(`- Total bls_results records: ${finalBlsResults.length}`);
    console.log(`- Expected: 56 records`);

    if (finalBlsResults.length === 56) {
      console.log(`🎉 SUCCESS! Now have exactly 56 records for 56 participants.`);
    } else {
      console.log(`⚠️ Still have ${finalBlsResults.length} records instead of 56.`);
    }

    // Show all participant names
    console.log(`\n📋 All participant names:`);
    finalBlsResults.forEach((record, index) => {
      console.log(`  ${index + 1}. ${record.participant_name || 'N/A'} (${record.participant_ic || 'N/A'})`);
    });

  } catch (error) {
    console.error('❌ Error finding and restoring missing participant:', error);
  }
}

findAndRestoreMissingParticipant();

