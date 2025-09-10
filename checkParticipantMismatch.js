// checkParticipantMismatch.js - Check why we have 48 participants in checklist_results but should have 57
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkParticipantMismatch() {
  console.log('🔍 Checking participant count mismatch...\n');

  try {
    // Check bls_results count
    console.log('1. Checking bls_results count...');
    const { count: blsCount, error: blsCountError } = await supabase
      .from('bls_results')
      .select('*', { count: 'exact', head: true });

    if (blsCountError) {
      console.error('❌ Error counting bls_results:', blsCountError);
      return;
    }

    console.log(`bls_results count: ${blsCount}`);
    console.log('');

    // Check checklist_results count
    console.log('2. Checking checklist_results count...');
    const { count: checklistCount, error: checklistCountError } = await supabase
      .from('checklist_results')
      .select('*', { count: 'exact', head: true });

    if (checklistCountError) {
      console.error('❌ Error counting checklist_results:', checklistCountError);
      return;
    }

    console.log(`checklist_results count: ${checklistCount}`);
    console.log('');

    // Get unique participants from bls_results
    console.log('3. Getting unique participants from bls_results...');
    const { data: blsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('user_id, participant_name, participant_ic')
      .not('user_id', 'is', null);

    if (blsError) {
      console.error('❌ Error getting bls_results:', blsError);
      return;
    }

    const blsUserIds = [...new Set(blsResults.map(r => r.user_id))];
    console.log(`Unique participants in bls_results: ${blsUserIds.length}`);
    console.log('');

    // Get unique participants from checklist_results
    console.log('4. Getting unique participants from checklist_results...');
    const { data: checklistResults, error: checklistError } = await supabase
      .from('checklist_results')
      .select('user_id, participant_name, participant_ic')
      .not('user_id', 'is', null);

    if (checklistError) {
      console.error('❌ Error getting checklist_results:', checklistError);
      return;
    }

    const checklistUserIds = [...new Set(checklistResults.map(r => r.user_id))];
    console.log(`Unique participants in checklist_results: ${checklistUserIds.length}`);
    console.log('');

    // Find participants in bls_results but not in checklist_results
    console.log('5. Finding participants missing from checklist_results...');
    const missingFromChecklist = blsUserIds.filter(userId => !checklistUserIds.includes(userId));
    console.log(`Participants in bls_results but NOT in checklist_results: ${missingFromChecklist.length}`);
    
    if (missingFromChecklist.length > 0) {
      console.log('Missing participants:');
      missingFromChecklist.forEach((userId, index) => {
        const participant = blsResults.find(r => r.user_id === userId);
        console.log(`${index + 1}. ${participant?.participant_name} (${participant?.participant_ic}) - ${userId}`);
      });
    }
    console.log('');

    // Find participants in checklist_results but not in bls_results
    console.log('6. Finding participants missing from bls_results...');
    const missingFromBls = checklistUserIds.filter(userId => !blsUserIds.includes(userId));
    console.log(`Participants in checklist_results but NOT in bls_results: ${missingFromBls.length}`);
    
    if (missingFromBls.length > 0) {
      console.log('Extra participants:');
      missingFromBls.forEach((userId, index) => {
        const participant = checklistResults.find(r => r.user_id === userId);
        console.log(`${index + 1}. ${participant?.participant_name} (${participant?.participant_ic}) - ${userId}`);
      });
    }
    console.log('');

    // Check profiles count
    console.log('7. Checking profiles count...');
    const { count: profilesCount, error: profilesCountError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user');

    if (profilesCountError) {
      console.error('❌ Error counting profiles:', profilesCountError);
      return;
    }

    console.log(`Profiles count (role=user): ${profilesCount}`);
    console.log('');

    // Check if some participants only have quiz results (no checklist results)
    console.log('8. Checking participants with only quiz results...');
    const { data: quizSessions, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('user_id, participant_name, participant_ic')
      .not('user_id', 'is', null);

    if (quizError) {
      console.error('❌ Error getting quiz_sessions:', quizError);
      return;
    }

    const quizUserIds = [...new Set(quizSessions.map(r => r.user_id))];
    console.log(`Unique participants in quiz_sessions: ${quizUserIds.length}`);

    // Find participants with quiz results but no checklist results
    const quizOnlyParticipants = quizUserIds.filter(userId => !checklistUserIds.includes(userId));
    console.log(`Participants with quiz results but NO checklist results: ${quizOnlyParticipants.length}`);
    
    if (quizOnlyParticipants.length > 0) {
      console.log('Quiz-only participants:');
      quizOnlyParticipants.forEach((userId, index) => {
        const participant = quizSessions.find(r => r.user_id === userId);
        console.log(`${index + 1}. ${participant?.participant_name} (${participant?.participant_ic}) - ${userId}`);
      });
    }
    console.log('');

    // Summary
    console.log('9. SUMMARY:');
    console.log(`Expected participants: 57`);
    console.log(`bls_results participants: ${blsUserIds.length}`);
    console.log(`checklist_results participants: ${checklistUserIds.length}`);
    console.log(`profiles participants: ${profilesCount}`);
    console.log(`quiz_sessions participants: ${quizUserIds.length}`);
    console.log(`Missing from checklist: ${missingFromChecklist.length}`);
    console.log(`Quiz-only participants: ${quizOnlyParticipants.length}`);

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
checkParticipantMismatch();

