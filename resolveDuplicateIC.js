// resolveDuplicateIC.js
// Resolve duplicate IC constraint for AWANGKU MOHAMAD ZULFAZLI BIN AWANGKU ABDUL RAZAK

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resolveDuplicateIC() {
  console.log('🔍 Resolving Duplicate IC Constraint\n');
  console.log('=' .repeat(60));
  
  try {
    const duplicateIC = "950821136503";
    const targetName = "AWANGKU MOHAMAD ZULFAZLI BIN AWANGKU ABDUL RAZAK";
    
    console.log(`🔍 Checking for IC: ${duplicateIC}`);
    console.log(`👤 Target profile: ${targetName}`);
    
    // Find all profiles with this IC
    const { data: profilesWithIC, error: fetchError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, email, role, created_at')
      .eq('ic', duplicateIC);
    
    if (fetchError) {
      console.log(`❌ Error fetching profiles: ${fetchError.message}`);
      return;
    }
    
    console.log(`\n📊 Found ${profilesWithIC.length} profiles with IC ${duplicateIC}:`);
    console.log('=' .repeat(60));
    
    profilesWithIC.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.full_name}`);
      console.log(`   Email: ${profile.email}`);
      console.log(`   IC: ${profile.ic}`);
      console.log(`   Role: ${profile.role}`);
      console.log(`   Auth ID: ${profile.id}`);
      console.log(`   Created: ${profile.created_at}`);
      console.log('');
    });
    
    // Find the target profile
    const { data: targetProfile, error: targetError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, email, role, created_at')
      .eq('full_name', targetName)
      .single();
    
    if (targetError) {
      console.log(`❌ Error fetching target profile: ${targetError.message}`);
      return;
    }
    
    console.log(`\n👤 Target profile details:`);
    console.log('=' .repeat(60));
    console.log(`   Name: ${targetProfile.full_name}`);
    console.log(`   Email: ${targetProfile.email}`);
    console.log(`   IC: ${targetProfile.ic || 'NULL'}`);
    console.log(`   Role: ${targetProfile.role}`);
    console.log(`   Auth ID: ${targetProfile.id}`);
    console.log(`   Created: ${targetProfile.created_at}`);
    
    // Check if target profile is in the duplicate list
    const isTargetInDuplicates = profilesWithIC.some(p => p.id === targetProfile.id);
    
    if (isTargetInDuplicates) {
      console.log('\n✅ Target profile already has the correct IC!');
      console.log('   No action needed.');
    } else {
      console.log('\n⚠️  IC conflict detected!');
      console.log('   The IC is already used by another profile.');
      
      // Show options
      console.log('\n🔧 RESOLUTION OPTIONS:');
      console.log('=' .repeat(60));
      console.log('1. Update the target profile with the IC (will fail due to constraint)');
      console.log('2. Remove IC from the conflicting profile first');
      console.log('3. Use a different IC for the target profile');
      console.log('4. Merge the profiles if they are the same person');
      
      // Check if any of the profiles with the IC are duplicates or can be removed
      const profilesToCheck = profilesWithIC.filter(p => p.id !== targetProfile.id);
      
      if (profilesToCheck.length > 0) {
        console.log('\n📋 Conflicting profiles:');
        profilesToCheck.forEach((profile, index) => {
          console.log(`${index + 1}. ${profile.full_name} (${profile.email})`);
        });
        
        // Check if any of these are likely duplicates
        const potentialDuplicates = profilesToCheck.filter(p => 
          p.full_name.toUpperCase().includes('AWANGKU') ||
          p.email.includes('awangku')
        );
        
        if (potentialDuplicates.length > 0) {
          console.log('\n🔍 Potential duplicates found:');
          potentialDuplicates.forEach((profile, index) => {
            console.log(`${index + 1}. ${profile.full_name} (${profile.email})`);
          });
        }
      }
    }
    
    // Final recommendation
    console.log('\n💡 RECOMMENDATION:');
    console.log('=' .repeat(60));
    console.log('The IC 950821136503 is already assigned to another profile.');
    console.log('You have a few options:');
    console.log('1. Use a different IC for AWANGKU MOHAMAD ZULFAZLI BIN AWANGKU ABDUL RAZAK');
    console.log('2. Check if the existing profile with this IC is a duplicate');
    console.log('3. Remove the IC from the conflicting profile first');
    
  } catch (error) {
    console.error('❌ Process failed:', error);
  }
}

// Run the resolution check
resolveDuplicateIC();
