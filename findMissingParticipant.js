// findMissingParticipant.js - Find the missing participant to make it 57 total
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function findMissingParticipant() {
  console.log('🔍 Finding the missing participant to make it 57 total...\n');

  try {
    // Get all participants from profiles
    console.log('1. Getting all participants from profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, role')
      .eq('role', 'user')
      .order('full_name');

    if (profilesError) {
      console.error('❌ Error getting profiles:', profilesError);
      return;
    }

    console.log(`Profiles count: ${profiles.length}`);
    console.log('');

    // Get all participants from bls_results
    console.log('2. Getting all participants from bls_results...');
    const { data: blsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('user_id, participant_name, participant_ic')
      .not('user_id', 'is', null)
      .order('participant_name');

    if (blsError) {
      console.error('❌ Error getting bls_results:', blsError);
      return;
    }

    const blsUserIds = [...new Set(blsResults.map(r => r.user_id))];
    console.log(`bls_results count: ${blsResults.length}`);
    console.log(`bls_results unique participants: ${blsUserIds.length}`);
    console.log('');

    // Get all participants from quiz_sessions
    console.log('3. Getting all participants from quiz_sessions...');
    const { data: quizResults, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('user_id, participant_name, participant_ic')
      .not('user_id', 'is', null)
      .order('participant_name');

    if (quizError) {
      console.error('❌ Error getting quiz_sessions:', quizError);
      return;
    }

    const quizUserIds = [...new Set(quizResults.map(r => r.user_id))];
    console.log(`quiz_sessions count: ${quizResults.length}`);
    console.log(`quiz_sessions unique participants: ${quizUserIds.length}`);
    console.log('');

    // Find participants in profiles but not in bls_results
    console.log('4. Finding participants in profiles but not in bls_results...');
    const missingFromBls = profiles.filter(profile => !blsUserIds.includes(profile.id));
    console.log(`Missing from bls_results: ${missingFromBls.length}`);
    
    if (missingFromBls.length > 0) {
      console.log('Missing participants:');
      missingFromBls.forEach((participant, index) => {
        console.log(`${index + 1}. ${participant.full_name} (${participant.ic}) - ${participant.id}`);
      });
    }
    console.log('');

    // Find participants in profiles but not in quiz_sessions
    console.log('5. Finding participants in profiles but not in quiz_sessions...');
    const missingFromQuiz = profiles.filter(profile => !quizUserIds.includes(profile.id));
    console.log(`Missing from quiz_sessions: ${missingFromQuiz.length}`);
    
    if (missingFromQuiz.length > 0) {
      console.log('Missing participants:');
      missingFromQuiz.forEach((participant, index) => {
        console.log(`${index + 1}. ${participant.full_name} (${participant.ic}) - ${participant.id}`);
      });
    }
    console.log('');

    // Find participants in bls_results but not in profiles
    console.log('6. Finding participants in bls_results but not in profiles...');
    const missingFromProfiles = blsUserIds.filter(userId => !profiles.some(p => p.id === userId));
    console.log(`Missing from profiles: ${missingFromProfiles.length}`);
    
    if (missingFromProfiles.length > 0) {
      console.log('Missing participants:');
      missingFromProfiles.forEach((userId, index) => {
        const participant = blsResults.find(r => r.user_id === userId);
        console.log(`${index + 1}. ${participant?.participant_name} (${participant?.participant_ic}) - ${userId}`);
      });
    }
    console.log('');

    // Find participants in quiz_sessions but not in profiles
    console.log('7. Finding participants in quiz_sessions but not in profiles...');
    const missingFromProfilesQuiz = quizUserIds.filter(userId => !profiles.some(p => p.id === userId));
    console.log(`Missing from profiles (quiz): ${missingFromProfilesQuiz.length}`);
    
    if (missingFromProfilesQuiz.length > 0) {
      console.log('Missing participants:');
      missingFromProfilesQuiz.forEach((userId, index) => {
        const participant = quizResults.find(r => r.user_id === userId);
        console.log(`${index + 1}. ${participant?.participant_name} (${participant?.participant_ic}) - ${userId}`);
      });
    }
    console.log('');

    // Check for participants with different user_ids but same IC
    console.log('8. Checking for participants with different user_ids but same IC...');
    const icToUserIdMap = {};
    const duplicateICs = [];

    // Check bls_results
    blsResults.forEach(result => {
      const ic = result.participant_ic;
      if (icToUserIdMap[ic]) {
        if (icToUserIdMap[ic] !== result.user_id) {
          duplicateICs.push({
            ic: ic,
            name: result.participant_name,
            blsUserId: result.user_id,
            profileUserId: icToUserIdMap[ic]
          });
        }
      } else {
        icToUserIdMap[ic] = result.user_id;
      }
    });

    // Check quiz_sessions
    quizResults.forEach(result => {
      const ic = result.participant_ic;
      if (icToUserIdMap[ic]) {
        if (icToUserIdMap[ic] !== result.user_id) {
          duplicateICs.push({
            ic: ic,
            name: result.participant_name,
            quizUserId: result.user_id,
            profileUserId: icToUserIdMap[ic]
          });
        }
      } else {
        icToUserIdMap[ic] = result.user_id;
      }
    });

    if (duplicateICs.length > 0) {
      console.log(`Found ${duplicateICs.length} participants with different user_ids:`);
      duplicateICs.forEach((duplicate, index) => {
        console.log(`${index + 1}. ${duplicate.name} (${duplicate.ic})`);
        console.log(`   Profile ID: ${duplicate.profileUserId}`);
        if (duplicate.blsUserId) console.log(`   BLS ID: ${duplicate.blsUserId}`);
        if (duplicate.quizUserId) console.log(`   Quiz ID: ${duplicate.quizUserId}`);
      });
    } else {
      console.log('No participants with different user_ids found');
    }
    console.log('');

    // Summary
    console.log('9. SUMMARY:');
    console.log(`Expected total participants: 57`);
    console.log(`Profiles: ${profiles.length} participants`);
    console.log(`BLS Results: ${blsUserIds.length} participants`);
    console.log(`Quiz Sessions: ${quizUserIds.length} participants`);
    console.log(`Missing from BLS: ${missingFromBls.length} participants`);
    console.log(`Missing from Quiz: ${missingFromQuiz.length} participants`);
    console.log(`Missing from Profiles (BLS): ${missingFromProfiles.length} participants`);
    console.log(`Missing from Profiles (Quiz): ${missingFromProfilesQuiz.length} participants`);
    console.log(`Duplicate ICs: ${duplicateICs.length} participants`);

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
findMissingParticipant();

