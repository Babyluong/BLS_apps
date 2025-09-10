// finalVerification.js - Final verification of all 57 participants
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function finalVerification() {
  console.log('🎉 Final verification of all 57 participants...\n');

  try {
    // Get all counts
    console.log('1. Table counts:');
    
    const { count: profilesCount, error: profilesError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user');

    const { count: blsCount, error: blsError } = await supabase
      .from('bls_results')
      .select('*', { count: 'exact', head: true });

    const { count: checklistCount, error: checklistError } = await supabase
      .from('checklist_results')
      .select('*', { count: 'exact', head: true });

    const { count: quizCount, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('*', { count: 'exact', head: true });

    if (profilesError || blsError || checklistError || quizError) {
      console.error('❌ Error getting counts');
      return;
    }

    console.log(`Profiles: ${profilesCount} participants`);
    console.log(`BLS Results: ${blsCount} records`);
    console.log(`Checklist Results: ${checklistCount} records`);
    console.log(`Quiz Sessions: ${quizCount} records`);
    console.log('');

    // Get unique participants from each table
    console.log('2. Unique participants per table:');
    
    const { data: profiles, error: profilesDataError } = await supabase
      .from('profiles')
      .select('id, full_name, ic')
      .eq('role', 'user')
      .order('full_name');

    const { data: blsResults, error: blsDataError } = await supabase
      .from('bls_results')
      .select('user_id, participant_name, participant_ic')
      .not('user_id', 'is', null);

    const { data: checklistResults, error: checklistDataError } = await supabase
      .from('checklist_results')
      .select('user_id, participant_name, participant_ic')
      .not('user_id', 'is', null);

    const { data: quizResults, error: quizDataError } = await supabase
      .from('quiz_sessions')
      .select('user_id, participant_name, participant_ic')
      .not('user_id', 'is', null);

    if (profilesDataError || blsDataError || checklistDataError || quizDataError) {
      console.error('❌ Error getting data');
      return;
    }

    const blsUserIds = [...new Set(blsResults.map(r => r.user_id))];
    const checklistUserIds = [...new Set(checklistResults.map(r => r.user_id))];
    const quizUserIds = [...new Set(quizResults.map(r => r.user_id))];

    console.log(`Profiles: ${profiles.length} participants`);
    console.log(`BLS Results: ${blsUserIds.length} unique participants`);
    console.log(`Checklist Results: ${checklistUserIds.length} unique participants`);
    console.log(`Quiz Sessions: ${quizUserIds.length} unique participants`);
    console.log('');

    // Check for missing participants
    console.log('3. Checking for missing participants:');
    
    const missingFromBls = profiles.filter(profile => !blsUserIds.includes(profile.id));
    const missingFromChecklist = profiles.filter(profile => !checklistUserIds.includes(profile.id));
    const missingFromQuiz = profiles.filter(profile => !quizUserIds.includes(profile.id));

    console.log(`Missing from BLS Results: ${missingFromBls.length}`);
    if (missingFromBls.length > 0) {
      missingFromBls.forEach(p => console.log(`  - ${p.full_name} (${p.ic})`));
    }

    console.log(`Missing from Checklist Results: ${missingFromChecklist.length}`);
    if (missingFromChecklist.length > 0) {
      missingFromChecklist.forEach(p => console.log(`  - ${p.full_name} (${p.ic})`));
    }

    console.log(`Missing from Quiz Sessions: ${missingFromQuiz.length}`);
    if (missingFromQuiz.length > 0) {
      missingFromQuiz.forEach(p => console.log(`  - ${p.full_name} (${p.ic})`));
    }
    console.log('');

    // Check checklist results per participant
    console.log('4. Checking checklist results per participant:');
    const checklistCounts = {};
    checklistResults.forEach(result => {
      const userId = result.user_id;
      checklistCounts[userId] = (checklistCounts[userId] || 0) + 1;
    });

    const participantsWithIncorrectCount = Object.entries(checklistCounts).filter(([userId, count]) => count !== 5);
    
    if (participantsWithIncorrectCount.length > 0) {
      console.log(`Participants with incorrect checklist count: ${participantsWithIncorrectCount.length}`);
      participantsWithIncorrectCount.forEach(([userId, count]) => {
        const participant = checklistResults.find(r => r.user_id === userId);
        console.log(`  - ${participant?.participant_name}: ${count} results`);
      });
    } else {
      console.log('✅ All participants have exactly 5 checklist results');
    }
    console.log('');

    // Summary
    console.log('5. FINAL SUMMARY:');
    console.log(`Expected participants: 57`);
    console.log(`Actual participants: ${profiles.length}`);
    console.log(`Status: ${profiles.length === 57 ? '✅ CORRECT' : '❌ INCORRECT'}`);
    console.log('');
    console.log(`BLS Results: ${blsUserIds.length}/57 participants`);
    console.log(`Checklist Results: ${checklistUserIds.length}/57 participants`);
    console.log(`Quiz Sessions: ${quizUserIds.length}/57 participants`);
    console.log('');
    console.log(`Average checklist results per participant: ${(checklistCount / checklistUserIds.length).toFixed(2)}`);
    
    if (profiles.length === 57 && blsUserIds.length === 57 && checklistUserIds.length === 57) {
      console.log('\n🎉 SUCCESS! All 57 participants have complete data!');
    } else {
      console.log('\n⚠️  Some participants are still missing data');
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
finalVerification();

