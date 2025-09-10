// checkMissingIC.js
// Check why some IC numbers are missing from profiles table

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkMissingIC() {
  console.log('🔍 Checking Missing IC Numbers in Profiles Table\n');
  console.log('=' .repeat(60));
  
  try {
    // Get all profiles
    console.log('📋 Fetching all profiles...');
    
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, email, role, created_at')
      .order('full_name');
    
    if (profilesError) {
      console.log(`❌ Error fetching profiles: ${profilesError.message}`);
      return;
    }
    
    console.log(`   📊 Found ${profilesData.length} profiles`);
    
    // Analyze IC data
    console.log('\n🔍 Analyzing IC data...');
    
    const profilesWithIC = profilesData.filter(p => p.ic && p.ic.trim() !== '');
    const profilesWithoutIC = profilesData.filter(p => !p.ic || p.ic.trim() === '');
    
    console.log(`   ✅ Profiles with IC: ${profilesWithIC.length}`);
    console.log(`   ❌ Profiles without IC: ${profilesWithoutIC.length}`);
    console.log(`   📊 Percentage with IC: ${((profilesWithIC.length / profilesData.length) * 100).toFixed(1)}%`);
    
    // Show profiles without IC
    if (profilesWithoutIC.length > 0) {
      console.log('\n❌ PROFILES WITHOUT IC:');
      console.log('=' .repeat(60));
      
      profilesWithoutIC.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.full_name}`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   Role: ${profile.role}`);
        console.log(`   Auth ID: ${profile.id}`);
        console.log(`   Created: ${profile.created_at}`);
        console.log('');
      });
    }
    
    // Check if these are auth-created profiles vs migrated profiles
    console.log('\n🔍 Analyzing profile types...');
    
    const authCreatedProfiles = profilesWithoutIC.filter(p => 
      p.email && p.email.includes('@hospital-lawas.local')
    );
    const regularProfiles = profilesWithoutIC.filter(p => 
      !p.email || !p.email.includes('@hospital-lawas.local')
    );
    
    console.log(`   🏥 Auth-created profiles (hospital-lawas.local): ${authCreatedProfiles.length}`);
    console.log(`   👤 Regular profiles: ${regularProfiles.length}`);
    
    if (authCreatedProfiles.length > 0) {
      console.log('\n🏥 AUTH-CREATED PROFILES (Missing IC):');
      console.log('=' .repeat(60));
      authCreatedProfiles.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.full_name}`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   Auth ID: ${profile.id}`);
        console.log('');
      });
    }
    
    if (regularProfiles.length > 0) {
      console.log('\n👤 REGULAR PROFILES (Missing IC):');
      console.log('=' .repeat(60));
      regularProfiles.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.full_name}`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   Auth ID: ${profile.id}`);
        console.log('');
      });
    }
    
    // Check if there are any patterns in the missing ICs
    console.log('\n🔍 Checking for patterns...');
    
    const icPatterns = {
      validIC: profilesWithIC.filter(p => /^\d{12}$/.test(p.ic)).length,
      invalidFormat: profilesWithIC.filter(p => !/^\d{12}$/.test(p.ic)).length,
      empty: profilesWithoutIC.length
    };
    
    console.log(`   ✅ Valid IC format (12 digits): ${icPatterns.validIC}`);
    console.log(`   ⚠️  Invalid IC format: ${icPatterns.invalidFormat}`);
    console.log(`   ❌ Empty IC: ${icPatterns.empty}`);
    
    if (icPatterns.invalidFormat > 0) {
      console.log('\n⚠️  PROFILES WITH INVALID IC FORMAT:');
      console.log('=' .repeat(60));
      const invalidICs = profilesWithIC.filter(p => !/^\d{12}$/.test(p.ic));
      invalidICs.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.full_name}: "${profile.ic}"`);
      });
    }
    
    // Summary and recommendations
    console.log('\n📊 SUMMARY:');
    console.log('=' .repeat(60));
    console.log(`   Total profiles: ${profilesData.length}`);
    console.log(`   With IC: ${profilesWithIC.length} (${((profilesWithIC.length / profilesData.length) * 100).toFixed(1)}%)`);
    console.log(`   Without IC: ${profilesWithoutIC.length} (${((profilesWithoutIC.length / profilesData.length) * 100).toFixed(1)}%)`);
    console.log(`   Auth-created: ${authCreatedProfiles.length}`);
    console.log(`   Regular profiles: ${regularProfiles.length}`);
    
    console.log('\n🔧 RECOMMENDATIONS:');
    console.log('=' .repeat(60));
    
    if (profilesWithoutIC.length > 0) {
      console.log('1. 🔍 Investigate missing IC numbers');
      console.log('2. 📝 Add IC numbers for profiles that need them');
      console.log('3. 🧪 Test login functionality for profiles without IC');
    }
    
    if (authCreatedProfiles.length > 0) {
      console.log('4. 🏥 Auth-created profiles may not need IC for login');
      console.log('5. 🔄 Consider if IC is required for all profile types');
    }
    
    if (icPatterns.invalidFormat > 0) {
      console.log('6. ⚠️  Fix invalid IC formats');
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

// Run the check
checkMissingIC();
