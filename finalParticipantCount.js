// finalParticipantCount.js - Final verification of participant counts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function finalParticipantCount() {
  console.log('📊 Final participant count verification...\n');

  try {
    // Check all table counts
    console.log('1. Table counts:');
    
    // bls_results
    const { count: blsCount, error: blsCountError } = await supabase
      .from('bls_results')
      .select('*', { count: 'exact', head: true });
    console.log(`bls_results: ${blsCount} records`);

    // checklist_results
    const { count: checklistCount, error: checklistCountError } = await supabase
      .from('checklist_results')
      .select('*', { count: 'exact', head: true });
    console.log(`checklist_results: ${checklistCount} records`);

    // profiles
    const { count: profilesCount, error: profilesCountError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user');
    console.log(`profiles (role=user): ${profilesCount} records`);

    // quiz_sessions
    const { count: quizCount, error: quizCountError } = await supabase
      .from('quiz_sessions')
      .select('*', { count: 'exact', head: true });
    console.log(`quiz_sessions: ${quizCount} records`);
    console.log('');

    // Get unique participants from each table
    console.log('2. Unique participants per table:');
    
    // bls_results
    const { data: blsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('user_id, participant_name, participant_ic')
      .not('user_id', 'is', null);
    const blsUserIds = [...new Set(blsResults.map(r => r.user_id))];
    console.log(`bls_results: ${blsUserIds.length} unique participants`);

    // checklist_results
    const { data: checklistResults, error: checklistError } = await supabase
      .from('checklist_results')
      .select('user_id, participant_name, participant_ic')
      .not('user_id', 'is', null);
    const checklistUserIds = [...new Set(checklistResults.map(r => r.user_id))];
    console.log(`checklist_results: ${checklistUserIds.length} unique participants`);

    // quiz_sessions
    const { data: quizResults, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('user_id, participant_name, participant_ic')
      .not('user_id', 'is', null);
    const quizUserIds = [...new Set(quizResults.map(r => r.user_id))];
    console.log(`quiz_sessions: ${quizUserIds.length} unique participants`);
    console.log('');

    // Find participants missing from checklist_results
    console.log('3. Participants missing from checklist_results:');
    const missingFromChecklist = blsUserIds.filter(userId => !checklistUserIds.includes(userId));
    console.log(`Count: ${missingFromChecklist.length}`);
    
    if (missingFromChecklist.length > 0) {
      console.log('Missing participants:');
      missingFromChecklist.forEach((userId, index) => {
        const participant = blsResults.find(r => r.user_id === userId);
        console.log(`${index + 1}. ${participant?.participant_name} (${participant?.participant_ic})`);
      });
    }
    console.log('');

    // Check for participants with only quiz results
    console.log('4. Participants with only quiz results (no checklist):');
    const quizOnlyParticipants = quizUserIds.filter(userId => !checklistUserIds.includes(userId));
    console.log(`Count: ${quizOnlyParticipants.length}`);
    
    if (quizOnlyParticipants.length > 0) {
      console.log('Quiz-only participants:');
      quizOnlyParticipants.forEach((userId, index) => {
        const participant = quizResults.find(r => r.user_id === userId);
        console.log(`${index + 1}. ${participant?.participant_name} (${participant?.participant_ic})`);
      });
    }
    console.log('');

    // Summary
    console.log('5. SUMMARY:');
    console.log(`Expected total participants: 57`);
    console.log(`Profiles: ${profilesCount} participants`);
    console.log(`Quiz sessions: ${quizUserIds.length} participants`);
    console.log(`BLS results: ${blsUserIds.length} participants`);
    console.log(`Checklist results: ${checklistUserIds.length} participants`);
    console.log(`Missing from checklist: ${missingFromChecklist.length} participants`);
    console.log(`Quiz-only participants: ${quizOnlyParticipants.length} participants`);
    console.log('');

    // Check if SHAHRULNIZAM is now properly linked
    console.log('6. SHAHRULNIZAM verification:');
    const shahrulBls = blsResults.find(r => r.participant_ic === '960401135909');
    const shahrulChecklist = checklistResults.find(r => r.participant_ic === '960401135909');
    
    if (shahrulBls && shahrulChecklist) {
      console.log(`✅ SHAHRULNIZAM found in both tables`);
      console.log(`   BLS user_id: ${shahrulBls.user_id}`);
      console.log(`   Checklist user_id: ${shahrulChecklist.user_id}`);
      console.log(`   User IDs match: ${shahrulBls.user_id === shahrulChecklist.user_id ? 'YES' : 'NO'}`);
    } else {
      console.log(`❌ SHAHRULNIZAM not found in both tables`);
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
finalParticipantCount();

