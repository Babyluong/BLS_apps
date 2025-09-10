// addBackParticipant.js - Add back AWANGKU MOHAMAD ZULFAZLI as the 57th participant
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

// Participant to add back
const participantToAdd = {
  ic: '950821136503',
  name: 'AWANGKU MOHAMAD ZULFAZLI BIN AWANGKU ABDUL RAZAK',
  email: 'awangku7467@gmail.com',
  workplace: 'HOSPITAL LAWAS',
  jawatan: 'PEGAWAI PERUBATAN',
  gred: 'UD 10'
};

async function addBackParticipant() {
  console.log('➕ Adding back AWANGKU MOHAMAD ZULFAZLI as the 57th participant...\n');

  try {
    // First, check if this participant exists in bls_results
    console.log('1. Checking if participant exists in bls_results...');
    const { data: blsResult, error: blsError } = await supabase
      .from('bls_results')
      .select('user_id, participant_name, participant_ic')
      .eq('participant_ic', participantToAdd.ic)
      .single();

    if (blsError) {
      console.error('❌ Error checking bls_results:', blsError);
      return;
    }

    if (!blsResult) {
      console.log('❌ Participant not found in bls_results. Cannot create profile without user_id.');
      return;
    }

    console.log('✅ Found participant in bls_results:');
    console.log(`- Name: ${blsResult.participant_name}`);
    console.log(`- IC: ${blsResult.participant_ic}`);
    console.log(`- User ID: ${blsResult.user_id}`);
    console.log('');

    // Check if this user_id exists in auth.users
    console.log('2. Checking if user_id exists in auth.users...');
    const { data: authUser, error: authError } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('id', blsResult.user_id)
      .single();

    if (authError) {
      console.error('❌ Error checking auth.users:', authError);
      console.log('This user_id does not exist in auth.users, cannot create profile.');
      return;
    }

    console.log('✅ Found user in auth.users:');
    console.log(`- User ID: ${authUser.id}`);
    console.log(`- Email: ${authUser.email}`);
    console.log('');

    // Create the profile
    console.log('3. Creating profile for participant...');
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: blsResult.user_id,
        ic: participantToAdd.ic,
        full_name: participantToAdd.name,
        email: participantToAdd.email,
        jawatan: participantToAdd.jawatan,
        job_position: participantToAdd.jawatan,
        tempat_bertugas: participantToAdd.workplace,
        gred: participantToAdd.gred,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('❌ Error creating profile:', insertError.message);
      return;
    }

    console.log('✅ Successfully created profile for AWANGKU MOHAMAD ZULFAZLI');
    console.log('');

    // Verify the addition
    console.log('4. Verifying participant count...');
    const { count: userCount, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user');

    if (countError) {
      console.error('❌ Error counting user profiles:', countError);
    } else {
      console.log(`Current user profiles: ${userCount}`);
      
      if (userCount === 57) {
        console.log('🎉 Perfect! We now have exactly 57 participants');
      } else {
        console.log(`⚠️  Have ${userCount} participants (expected 57)`);
      }
    }

    // Show the added participant
    console.log('\n5. Verifying added participant...');
    const { data: addedProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('ic, full_name, email, jawatan, tempat_bertugas, gred')
      .eq('ic', participantToAdd.ic)
      .single();

    if (verifyError) {
      console.error('❌ Error verifying added profile:', verifyError);
    } else {
      console.log('✅ Added participant:');
      console.log(`- Name: ${addedProfile.full_name}`);
      console.log(`- IC: ${addedProfile.ic}`);
      console.log(`- Email: ${addedProfile.email}`);
      console.log(`- Workplace: ${addedProfile.tempat_bertugas}`);
      console.log(`- Position: ${addedProfile.jawatan} (${addedProfile.gred})`);
    }

    // Final verification - check all participants
    console.log('\n6. Final verification - all participants:');
    const { data: allParticipants, error: participantsError } = await supabase
      .from('profiles')
      .select('ic, full_name, email, jawatan, tempat_bertugas, gred')
      .eq('role', 'user')
      .order('full_name');

    if (participantsError) {
      console.error('❌ Error fetching participants:', participantsError);
    } else {
      console.log(`Total participants: ${allParticipants.length}`);
      
      // Show last 5 participants to confirm the addition
      console.log('\nLast 5 participants:');
      allParticipants.slice(-5).forEach((participant, index) => {
        const actualIndex = allParticipants.length - 5 + index + 1;
        console.log(`${actualIndex}. ${participant.full_name} (${participant.ic})`);
        console.log(`   Email: ${participant.email}`);
        console.log(`   Workplace: ${participant.tempat_bertugas}`);
        console.log(`   Position: ${participant.jawatan} (${participant.gred})`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
addBackParticipant();

