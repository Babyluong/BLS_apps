// addBackParticipantFixed.js - Add back AWANGKU MOHAMAD ZULFAZLI as the 57th participant
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

async function addBackParticipantFixed() {
  console.log('➕ Adding back AWANGKU MOHAMAD ZULFAZLI as the 57th participant...\n');

  try {
    // First, check if this participant exists in bls_results
    console.log('1. Checking if participant exists in bls_results...');
    const { data: blsResult, error: blsError } = await supabase
      .from('bls_results')
      .select('user_id, participant_name, participant_ic, pre_test_score, post_test_score, one_man_cpr_pass, two_man_cpr_pass, adult_choking_pass, infant_choking_pass, infant_cpr_pass')
      .eq('participant_ic', participantToAdd.ic)
      .single();

    if (blsError) {
      console.error('❌ Error checking bls_results:', blsError);
      return;
    }

    if (!blsResult) {
      console.log('❌ Participant not found in bls_results. Cannot add profile without data.');
      return;
    }

    console.log('✅ Found participant in bls_results:');
    console.log(`- Name: ${blsResult.participant_name}`);
    console.log(`- IC: ${blsResult.participant_ic}`);
    console.log(`- User ID: ${blsResult.user_id}`);
    console.log('');

    // Generate a new UUID for the profile
    const newUserId = crypto.randomUUID();
    console.log(`2. Generated new user ID: ${newUserId}`);

    // Create the profile with the new user ID
    console.log('3. Creating profile for participant...');
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: newUserId,
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

    // Update the bls_results to use the new user_id
    console.log('4. Updating bls_results with new user_id...');
    const { error: updateError } = await supabase
      .from('bls_results')
      .update({
        user_id: newUserId,
        updated_at: new Date().toISOString()
      })
      .eq('participant_ic', participantToAdd.ic);

    if (updateError) {
      console.error('❌ Error updating bls_results:', updateError.message);
      return;
    }

    console.log('✅ Successfully updated bls_results with new user_id');
    console.log('');

    // Verify the addition
    console.log('5. Verifying participant count...');
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
    console.log('\n6. Verifying added participant...');
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

    // Verify bls_results was updated
    console.log('\n7. Verifying bls_results update...');
    const { data: updatedBlsResult, error: blsVerifyError } = await supabase
      .from('bls_results')
      .select('user_id, participant_name, participant_ic, pre_test_score, post_test_score')
      .eq('participant_ic', participantToAdd.ic)
      .single();

    if (blsVerifyError) {
      console.error('❌ Error verifying bls_results update:', blsVerifyError);
    } else {
      console.log('✅ bls_results updated:');
      console.log(`- Name: ${updatedBlsResult.participant_name}`);
      console.log(`- IC: ${updatedBlsResult.participant_ic}`);
      console.log(`- New User ID: ${updatedBlsResult.user_id}`);
      console.log(`- Pre-test: ${updatedBlsResult.pre_test_score}/30`);
      console.log(`- Post-test: ${updatedBlsResult.post_test_score}/30`);
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
addBackParticipantFixed();

