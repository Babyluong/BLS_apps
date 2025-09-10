// findMissingUserIDs.js - Find the correct user IDs for missing participants
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

// Missing participants
const missingParticipants = [
  { ic: '981231136564', name: 'CAROL FOLLORRIN ANAK BUSTIN' },
  { ic: '960911136696', name: 'NURFAEEZA BINTI MASNI' }
];

async function findMissingUserIDs() {
  console.log('🔍 Finding user IDs for missing participants...\n');

  try {
    // Check if these participants exist in bls_results
    console.log('1. Checking bls_results for missing participants...');
    const { data: blsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('user_id, participant_name, participant_ic')
      .in('participant_ic', missingParticipants.map(p => p.ic));

    if (blsError) {
      console.error('❌ Error fetching bls_results:', blsError);
      return;
    }

    console.log('Found in bls_results:');
    blsResults.forEach(result => {
      console.log(`- ${result.participant_name} (${result.participant_ic}): ${result.user_id}`);
    });

    // Check if these user IDs exist in auth.users
    if (blsResults.length > 0) {
      const userIds = blsResults.map(r => r.user_id);
      console.log('\n2. Checking if user IDs exist in auth.users...');
      
      const { data: authUsers, error: authError } = await supabase
        .from('auth.users')
        .select('id, email')
        .in('id', userIds);

      if (authError) {
        console.error('❌ Error fetching auth.users:', authError);
      } else {
        console.log('Found in auth.users:');
        authUsers.forEach(user => {
          console.log(`- ${user.id}: ${user.email}`);
        });
      }
    }

    // Check if these participants exist in quiz_sessions or checklist_results
    console.log('\n3. Checking quiz_sessions and checklist_results...');
    
    const { data: quizSessions, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('user_id, participant_name, participant_ic')
      .in('participant_ic', missingParticipants.map(p => p.ic));

    if (quizError) {
      console.error('❌ Error fetching quiz_sessions:', quizError);
    } else {
      console.log('Found in quiz_sessions:');
      quizSessions.forEach(session => {
        console.log(`- ${session.participant_name} (${session.participant_ic}): ${session.user_id}`);
      });
    }

    const { data: checklistResults, error: checklistError } = await supabase
      .from('checklist_results')
      .select('user_id, participant_name, participant_ic')
      .in('participant_ic', missingParticipants.map(p => p.ic));

    if (checklistError) {
      console.error('❌ Error fetching checklist_results:', checklistError);
    } else {
      console.log('Found in checklist_results:');
      checklistResults.forEach(result => {
        console.log(`- ${result.participant_name} (${result.participant_ic}): ${result.user_id}`);
      });
    }

    // If we found user IDs, create the profiles
    const foundUserIds = new Set();
    [...blsResults, ...quizSessions, ...checklistResults].forEach(item => {
      if (item.user_id) {
        foundUserIds.add(item.user_id);
      }
    });

    if (foundUserIds.size > 0) {
      console.log('\n4. Creating profiles for found user IDs...');
      
      for (const userId of foundUserIds) {
        // Find the participant data for this user ID
        const participantData = [...blsResults, ...quizSessions, ...checklistResults]
          .find(item => item.user_id === userId);
        
        if (participantData) {
          const participant = missingParticipants.find(p => p.ic === participantData.participant_ic);
          if (participant) {
            console.log(`Creating profile for ${participant.name} with user ID: ${userId}`);
            
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                ic: participant.ic,
                full_name: participant.name,
                email: participant.email,
                jawatan: participant.jawatan,
                job_position: participant.jawatan,
                tempat_bertugas: participant.workplace,
                gred: participant.gred,
                role: 'user',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (insertError) {
              console.error(`❌ Error creating profile for ${participant.name}:`, insertError.message);
            } else {
              console.log(`✅ Successfully created profile for ${participant.name}`);
            }
          }
        }
      }
    } else {
      console.log('\n❌ No user IDs found for missing participants. They may not have user accounts.');
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
findMissingUserIDs();

