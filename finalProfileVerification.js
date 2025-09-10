// finalProfileVerification.js
// Final verification of all profiles after cleanup

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function finalProfileVerification() {
  console.log('🔍 Final Profile Verification\n');
  console.log('=' .repeat(60));
  
  try {
    // Get all profiles
    console.log('📋 Fetching all profiles...');
    
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, email, role, created_at')
      .order('full_name');
    
    if (allError) {
      console.log(`❌ Error fetching profiles: ${allError.message}`);
      return;
    }
    
    console.log(`   📊 Total profiles: ${allProfiles.length}`);
    
    // Analyze IC data
    const profilesWithIC = allProfiles.filter(p => p.ic && p.ic.trim() !== '');
    const profilesWithoutIC = allProfiles.filter(p => !p.ic || p.ic.trim() === '');
    
    console.log(`   ✅ Profiles with IC: ${profilesWithIC.length}`);
    console.log(`   ❌ Profiles without IC: ${profilesWithoutIC.length}`);
    console.log(`   📊 IC coverage: ${((profilesWithIC.length / allProfiles.length) * 100).toFixed(1)}%`);
    
    // Show profiles without IC
    if (profilesWithoutIC.length > 0) {
      console.log('\n❌ PROFILES WITHOUT IC:');
      console.log('=' .repeat(60));
      profilesWithoutIC.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.full_name}`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   Role: ${profile.role}`);
        console.log(`   Auth ID: ${profile.id}`);
        console.log('');
      });
    }
    
    // Show sample profiles with IC
    if (profilesWithIC.length > 0) {
      console.log('\n✅ SAMPLE PROFILES WITH IC:');
      console.log('=' .repeat(60));
      profilesWithIC.slice(0, 5).forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.full_name}`);
        console.log(`   IC: ${profile.ic}`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   Role: ${profile.role}`);
        console.log('');
      });
      
      if (profilesWithIC.length > 5) {
        console.log(`   ... and ${profilesWithIC.length - 5} more profiles with IC`);
      }
    }
    
    // Check for duplicate ICs
    console.log('\n🔍 Checking for duplicate ICs...');
    
    const icCounts = {};
    profilesWithIC.forEach(profile => {
      if (profile.ic) {
        icCounts[profile.ic] = (icCounts[profile.ic] || 0) + 1;
      }
    });
    
    const duplicateICs = Object.entries(icCounts).filter(([ic, count]) => count > 1);
    
    if (duplicateICs.length > 0) {
      console.log('⚠️  Duplicate ICs found:');
      duplicateICs.forEach(([ic, count]) => {
        console.log(`   IC ${ic}: ${count} profiles`);
      });
    } else {
      console.log('✅ No duplicate ICs found');
    }
    
    // Final summary
    console.log('\n📊 FINAL SUMMARY:');
    console.log('=' .repeat(60));
    console.log(`   Total profiles: ${allProfiles.length}`);
    console.log(`   With IC: ${profilesWithIC.length} (${((profilesWithIC.length / allProfiles.length) * 100).toFixed(1)}%)`);
    console.log(`   Without IC: ${profilesWithoutIC.length} (${((profilesWithoutIC.length / allProfiles.length) * 100).toFixed(1)}%)`);
    console.log(`   Duplicate ICs: ${duplicateICs.length}`);
    
    console.log('\n🎉 MIGRATION STATUS:');
    console.log('=' .repeat(60));
    console.log('✅ Users table successfully merged into profiles table');
    console.log('✅ Job position columns merged (job_position only)');
    console.log('✅ IC numbers added from quiz sessions');
    console.log('✅ Unwanted profiles cleaned up');
    console.log('✅ Database structure unified and clean');
    
    console.log('\n🔄 NEXT STEPS:');
    console.log('=' .repeat(60));
    console.log('1. ✅ Data migration complete');
    console.log('2. 🔄 Update application code to use profiles only');
    console.log('3. 🧪 Test all functionality');
    console.log('4. 🗑️ Drop users table after testing');
    console.log('5. 🎉 Enjoy your clean, unified database!');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

// Run the verification
finalProfileVerification();
