// removeExtraParticipant.js - Remove the extra participant to get exactly 56
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

// Extra participant to remove (not in the original 56 list)
const extraParticipant = {
  ic: '950821136503',
  name: 'AWANGKU MOHAMAD ZULFAZLI BIN AWANGKU ABDUL RAZAK'
};

async function removeExtraParticipant() {
  console.log('🗑️  Removing extra participant to get exactly 56...\n');

  try {
    // Find the extra participant
    console.log(`1. Finding extra participant: ${extraParticipant.name} (${extraParticipant.ic})`);
    const { data: foundProfile, error: findError } = await supabase
      .from('profiles')
      .select('id, ic, full_name, email, jawatan, tempat_bertugas, gred')
      .eq('ic', extraParticipant.ic)
      .eq('role', 'user')
      .single();

    if (findError) {
      console.error('❌ Error finding extra participant:', findError);
      return;
    }

    if (!foundProfile) {
      console.log('❌ Extra participant not found');
      return;
    }

    console.log('Found extra participant:');
    console.log(`- Name: ${foundProfile.full_name}`);
    console.log(`- IC: ${foundProfile.ic}`);
    console.log(`- Email: ${foundProfile.email}`);
    console.log(`- Workplace: ${foundProfile.tempat_bertugas}`);
    console.log(`- Position: ${foundProfile.jawatan} (${foundProfile.gred})`);
    console.log('');

    // Remove the extra participant
    console.log('2. Removing extra participant...');
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', foundProfile.id);

    if (deleteError) {
      console.error('❌ Error removing extra participant:', deleteError.message);
      return;
    }

    console.log('✅ Successfully removed extra participant');
    console.log('');

    // Verify we now have exactly 56 participants
    console.log('3. Verifying participant count...');
    const { count: userCount, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user');

    if (countError) {
      console.error('❌ Error counting user profiles:', countError);
    } else {
      console.log(`Current user profiles: ${userCount}`);
      
      if (userCount === 56) {
        console.log('🎉 Perfect! We now have exactly 56 participants');
      } else if (userCount > 56) {
        console.log(`⚠️  Still have ${userCount} participants (expected 56)`);
      } else {
        console.log(`⚠️  Have ${userCount} participants (expected 56) - missing ${56 - userCount}`);
      }
    }

    // Final verification - show all participants
    console.log('\n4. Final verification - all 56 participants:');
    const { data: allParticipants, error: participantsError } = await supabase
      .from('profiles')
      .select('ic, full_name, email, jawatan, tempat_bertugas, gred')
      .eq('role', 'user')
      .order('full_name');

    if (participantsError) {
      console.error('❌ Error fetching participants:', participantsError);
    } else {
      console.log(`Total participants: ${allParticipants.length}`);
      console.log('');
      
      // Show first 10 participants
      console.log('First 10 participants:');
      allParticipants.slice(0, 10).forEach((participant, index) => {
        console.log(`${index + 1}. ${participant.full_name} (${participant.ic})`);
        console.log(`   Email: ${participant.email}`);
        console.log(`   Workplace: ${participant.tempat_bertugas}`);
        console.log(`   Position: ${participant.jawatan} (${participant.gred})`);
        console.log('');
      });
      
      if (allParticipants.length > 10) {
        console.log(`... and ${allParticipants.length - 10} more participants`);
      }
    }

    // Check if all participants have complete data
    console.log('\n5. Checking data completeness...');
    const { data: incompleteProfiles, error: incompleteError } = await supabase
      .from('profiles')
      .select('ic, full_name, email, jawatan, tempat_bertugas, gred')
      .eq('role', 'user')
      .or('tempat_bertugas.is.null,jawatan.is.null,gred.is.null');

    if (incompleteError) {
      console.error('❌ Error checking incomplete profiles:', incompleteError);
    } else if (incompleteProfiles.length > 0) {
      console.log(`⚠️  Still have ${incompleteProfiles.length} profiles with missing data:`);
      incompleteProfiles.forEach(profile => {
        console.log(`- ${profile.full_name} (${profile.ic})`);
        console.log(`  Workplace: ${profile.tempat_bertugas || 'MISSING'}`);
        console.log(`  Position: ${profile.jawatan || 'MISSING'}`);
        console.log(`  Grade: ${profile.gred || 'MISSING'}`);
        console.log('');
      });
    } else {
      console.log('✅ All 56 participants have complete data!');
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
removeExtraParticipant();

