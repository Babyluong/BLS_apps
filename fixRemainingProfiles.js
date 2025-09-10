// fixRemainingProfiles.js - Fix remaining profiles with missing data and identify extra participant
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

// Data for profiles with missing information
const profileUpdates = {
  '730818135601': { // MARZUKI RAJANG
    workplace: 'HOSPITAL LAWAS',
    jawatan: 'PEMBANTU PERAWATAN KESIHATAN',
    gred: 'U 1'
  },
  '920408085506': { // MUHSINAH BINTI ABDUL SHOMAD
    workplace: 'KLINIK PERGIGIAN LAWAS',
    jawatan: 'PEGAWAI PERGIGIAN',
    gred: 'UG 9'
  },
  '950821136503': { // AWANGKU MOHAMAD ZULFAZLI BIN AWANGKU ABDUL RAZAK
    workplace: 'HOSPITAL LAWAS',
    jawatan: 'PEGAWAI PERUBATAN',
    gred: 'UD 10'
  },
  '850507135897': { // SUHARMIE BIN SULAIMAN
    workplace: 'HOSPITAL LAWAS',
    jawatan: 'PEMBANTU PERAWATAN KESIHATAN',
    gred: 'U 1'
  },
  '930519135552': { // WENDY CHANDI ANAK SAMPURAI
    workplace: 'HOSPITAL LAWAS',
    jawatan: 'JURURAWAT',
    gred: 'U 5'
  }
};

async function fixRemainingProfiles() {
  console.log('🔧 Fixing remaining profiles with missing data...\n');

  try {
    // Get all user profiles
    console.log('1. Fetching all user profiles...');
    const { data: allUserProfiles, error: fetchError } = await supabase
      .from('profiles')
      .select('id, ic, full_name, email, jawatan, tempat_bertugas, gred, role')
      .eq('role', 'user')
      .order('full_name');

    if (fetchError) {
      console.error('❌ Error fetching profiles:', fetchError);
      return;
    }

    console.log(`Total user profiles: ${allUserProfiles.length}`);
    console.log('');

    // Update profiles with missing data
    console.log('2. Updating profiles with missing data...');
    let updatedCount = 0;

    for (const profile of allUserProfiles) {
      const updateData = profileUpdates[profile.ic];
      if (updateData) {
        console.log(`Updating ${profile.full_name} (${profile.ic})...`);
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            tempat_bertugas: updateData.workplace,
            jawatan: updateData.jawatan,
            job_position: updateData.jawatan, // Also update job_position
            gred: updateData.gred,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);

        if (updateError) {
          console.error(`❌ Error updating ${profile.full_name}:`, updateError.message);
        } else {
          console.log(`✅ Updated ${profile.full_name}`);
          updatedCount++;
        }
      }
    }

    console.log(`\n✅ Updated ${updatedCount} profiles`);
    console.log('');

    // Check if we still have 57 participants
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
        
        // Find the extra participant(s)
        console.log('\n3. Finding extra participants...');
        const { data: extraProfiles, error: extraError } = await supabase
          .from('profiles')
          .select('ic, full_name, email, jawatan, tempat_bertugas, gred')
          .eq('role', 'user')
          .order('full_name');

        if (extraError) {
          console.error('❌ Error fetching extra profiles:', extraError);
        } else {
          console.log('All user profiles:');
          extraProfiles.forEach((profile, index) => {
            console.log(`${index + 1}. ${profile.full_name} (${profile.ic})`);
            console.log(`   Email: ${profile.email}`);
            console.log(`   Workplace: ${profile.tempat_bertugas}`);
            console.log(`   Position: ${profile.jawatan} (${profile.gred})`);
            console.log('');
          });
        }
      } else {
        console.log(`⚠️  Have ${userCount} participants (expected 56) - missing ${56 - userCount}`);
      }
    }

    // Verify all profiles now have complete data
    console.log('\n4. Verifying all profiles have complete data...');
    const { data: incompleteProfiles, error: incompleteError } = await supabase
      .from('profiles')
      .select('ic, full_name, email, jawatan, tempat_bertugas, gred')
      .eq('role', 'user')
      .or('tempat_bertugas.is.null,jawatan.is.null,gred.is.null');

    if (incompleteError) {
      console.error('❌ Error fetching incomplete profiles:', incompleteError);
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
      console.log('✅ All user profiles now have complete data!');
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
fixRemainingProfiles();

