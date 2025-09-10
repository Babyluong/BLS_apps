// verifyAllProfiles.js - Verify all profiles and check for missing participants
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyAllProfiles() {
  console.log('🔍 Verifying all profiles and checking completeness...\n');

  try {
    // Get all profiles
    console.log('1. Fetching all profiles...');
    const { data: allProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('ic, full_name, email, jawatan, tempat_bertugas, gred, role')
      .order('full_name');

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }

    console.log(`✅ Total profiles: ${allProfiles.length}`);
    console.log('');

    // Check profiles with missing data
    console.log('2. Checking profiles with missing data...');
    const profilesWithMissingData = allProfiles.filter(profile => 
      !profile.tempat_bertugas || 
      !profile.gred || 
      !profile.jawatan ||
      profile.jawatan === 'N/A'
    );

    if (profilesWithMissingData.length > 0) {
      console.log(`⚠️  Profiles with missing data: ${profilesWithMissingData.length}`);
      profilesWithMissingData.forEach(profile => {
        console.log(`- ${profile.full_name} (${profile.ic})`);
        console.log(`  Workplace: ${profile.tempat_bertugas || 'MISSING'}`);
        console.log(`  Position: ${profile.jawatan || 'MISSING'}`);
        console.log(`  Grade: ${profile.gred || 'MISSING'}`);
        console.log('');
      });
    } else {
      console.log('✅ All profiles have complete data');
    }

    // Check for duplicate ICs
    console.log('3. Checking for duplicate ICs...');
    const icCounts = {};
    allProfiles.forEach(profile => {
      icCounts[profile.ic] = (icCounts[profile.ic] || 0) + 1;
    });

    const duplicateICs = Object.entries(icCounts).filter(([ic, count]) => count > 1);
    if (duplicateICs.length > 0) {
      console.log(`⚠️  Duplicate ICs found: ${duplicateICs.length}`);
      duplicateICs.forEach(([ic, count]) => {
        console.log(`- IC ${ic}: ${count} profiles`);
      });
    } else {
      console.log('✅ No duplicate ICs found');
    }

    // Check profiles by role
    console.log('\n4. Profiles by role:');
    const roleCounts = {};
    allProfiles.forEach(profile => {
      roleCounts[profile.role] = (roleCounts[profile.role] || 0) + 1;
    });

    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`- ${role}: ${count} profiles`);
    });

    // Check if we have exactly 56 user role profiles (participants)
    const userProfiles = allProfiles.filter(p => p.role === 'user');
    console.log(`\n5. User role profiles (participants): ${userProfiles.length}`);
    
    if (userProfiles.length === 56) {
      console.log('✅ Perfect! We have exactly 56 participants');
    } else if (userProfiles.length > 56) {
      console.log(`⚠️  We have ${userProfiles.length} participants (expected 56)`);
    } else {
      console.log(`⚠️  We have ${userProfiles.length} participants (expected 56) - missing ${56 - userProfiles.length}`);
    }

    // Show sample of complete profiles
    console.log('\n6. Sample of complete profiles:');
    const completeProfiles = allProfiles.filter(p => 
      p.role === 'user' && 
      p.tempat_bertugas && 
      p.gred && 
      p.jawatan && 
      p.jawatan !== 'N/A'
    ).slice(0, 5);

    completeProfiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.full_name} (${profile.ic})`);
      console.log(`   Email: ${profile.email}`);
      console.log(`   Workplace: ${profile.tempat_bertugas}`);
      console.log(`   Position: ${profile.jawatan} (${profile.gred})`);
      console.log('');
    });

    // Check if the two missing participants might be in the system with different data
    console.log('7. Searching for potential matches for missing participants...');
    const missingNames = ['CAROL FOLLORRIN', 'NURFAEEZA'];
    const missingICs = ['981231136564', '960911136696'];

    missingNames.forEach(name => {
      const matches = allProfiles.filter(p => 
        p.full_name.toLowerCase().includes(name.toLowerCase()) ||
        p.full_name.toLowerCase().includes(name.split(' ')[0].toLowerCase())
      );
      
      if (matches.length > 0) {
        console.log(`Potential matches for ${name}:`);
        matches.forEach(match => {
          console.log(`- ${match.full_name} (${match.ic})`);
        });
      }
    });

    missingICs.forEach(ic => {
      const matches = allProfiles.filter(p => p.ic === ic);
      if (matches.length > 0) {
        console.log(`Found IC ${ic}: ${matches[0].full_name}`);
      }
    });

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
verifyAllProfiles();

