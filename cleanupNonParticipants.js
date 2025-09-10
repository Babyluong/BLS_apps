// cleanupNonParticipants.js - Remove non-participants from profiles table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

// Non-participants to remove
const nonParticipants = [
  { ic: '940120126733', name: 'AMRI AMIT' },
  { ic: '981013125488', name: 'JUSNIE GAMBAR' }
];

async function cleanupNonParticipants() {
  console.log('🧹 Cleaning up non-participants from profiles table...\n');

  try {
    // First, check if these profiles exist
    console.log('1. Checking for non-participants in profiles...');
    const { data: existingProfiles, error: fetchError } = await supabase
      .from('profiles')
      .select('id, ic, full_name, role')
      .in('ic', nonParticipants.map(p => p.ic));

    if (fetchError) {
      console.error('❌ Error fetching profiles:', fetchError);
      return;
    }

    console.log('Found non-participants:');
    existingProfiles.forEach(profile => {
      console.log(`- ${profile.full_name} (${profile.ic}) - Role: ${profile.role}`);
    });

    // Remove these profiles
    console.log('\n2. Removing non-participants...');
    for (const profile of existingProfiles) {
      console.log(`Removing ${profile.full_name} (${profile.ic})...`);
      
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profile.id);

      if (deleteError) {
        console.error(`❌ Error removing ${profile.full_name}:`, deleteError.message);
      } else {
        console.log(`✅ Successfully removed ${profile.full_name}`);
      }
    }

    // Verify the cleanup
    console.log('\n3. Verifying cleanup...');
    const { count: totalProfiles, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error counting profiles:', countError);
    } else {
      console.log(`✅ Total profiles after cleanup: ${totalProfiles}`);
    }

    // Check user role profiles
    const { count: userProfiles, error: userCountError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'user');

    if (userCountError) {
      console.error('❌ Error counting user profiles:', userCountError);
    } else {
      console.log(`✅ User role profiles (participants): ${userProfiles}`);
      
      if (userProfiles === 56) {
        console.log('🎉 Perfect! We now have exactly 56 participants');
      } else if (userProfiles > 56) {
        console.log(`⚠️  Still have ${userProfiles} participants (expected 56)`);
      } else {
        console.log(`⚠️  Have ${userProfiles} participants (expected 56) - missing ${56 - userProfiles}`);
      }
    }

    // Check for remaining profiles with missing data
    console.log('\n4. Checking for remaining profiles with missing data...');
    const { data: profilesWithMissingData, error: missingError } = await supabase
      .from('profiles')
      .select('ic, full_name, email, jawatan, tempat_bertugas, gred, role')
      .eq('role', 'user')
      .or('tempat_bertugas.is.null,jawatan.is.null,gred.is.null');

    if (missingError) {
      console.error('❌ Error fetching profiles with missing data:', missingError);
    } else if (profilesWithMissingData.length > 0) {
      console.log(`⚠️  Profiles with missing data: ${profilesWithMissingData.length}`);
      profilesWithMissingData.forEach(profile => {
        console.log(`- ${profile.full_name} (${profile.ic})`);
        console.log(`  Workplace: ${profile.tempat_bertugas || 'MISSING'}`);
        console.log(`  Position: ${profile.jawatan || 'MISSING'}`);
        console.log(`  Grade: ${profile.gred || 'MISSING'}`);
        console.log('');
      });
    } else {
      console.log('✅ All user profiles have complete data');
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
cleanupNonParticipants();

