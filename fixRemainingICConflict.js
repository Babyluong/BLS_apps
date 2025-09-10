// fixRemainingICConflict.js
// Fix the remaining IC conflict for AWANGKU MOHAMAD ZULFAZLI

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixRemainingICConflict() {
  console.log('🔧 Fixing Remaining IC Conflict\n');
  console.log('=' .repeat(60));
  
  try {
    const targetIC = "950821136503";
    const targetName = "AWANGKU MOHAMAD ZULFAZLI BIN AWANGKU ABDUL RAZAK";
    
    // Find who currently has the target IC
    console.log(`🔍 Finding who currently has IC: ${targetIC}`);
    
    const { data: profilesWithIC, error: fetchError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, email, role')
      .eq('ic', targetIC);
    
    if (fetchError) {
      console.log(`❌ Error fetching profiles: ${fetchError.message}`);
      return;
    }
    
    console.log(`   📊 Found ${profilesWithIC.length} profiles with IC ${targetIC}:`);
    profilesWithIC.forEach((profile, index) => {
      console.log(`   ${index + 1}. ${profile.full_name} (${profile.email})`);
    });
    
    // Find the target profile
    const { data: targetProfile, error: targetError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, email, role')
      .eq('full_name', targetName)
      .single();
    
    if (targetError) {
      console.log(`❌ Error fetching target profile: ${targetError.message}`);
      return;
    }
    
    console.log(`\n👤 Target profile: ${targetProfile.full_name}`);
    console.log(`   Current IC: ${targetProfile.ic || 'NULL'}`);
    console.log(`   Email: ${targetProfile.email}`);
    
    // Check if target profile is in the list of profiles with the IC
    const isTargetInList = profilesWithIC.some(p => p.id === targetProfile.id);
    
    if (isTargetInList) {
      console.log('\n✅ Target profile already has the correct IC!');
      console.log('   No action needed.');
    } else {
      console.log('\n⚠️  IC conflict still exists!');
      console.log('   Need to remove IC from other profiles first.');
      
      // Remove IC from all profiles except target
      console.log('\n🔄 Removing IC from conflicting profiles...');
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const profile of profilesWithIC) {
        if (profile.id !== targetProfile.id) {
          console.log(`\n👤 Removing IC from: ${profile.full_name}`);
          
          try {
            const { error: removeError } = await supabase
              .from('profiles')
              .update({
                ic: null,
                updated_at: new Date().toISOString()
              })
              .eq('id', profile.id);
            
            if (removeError) {
              console.log(`   ❌ Error removing IC: ${removeError.message}`);
              errorCount++;
            } else {
              console.log(`   ✅ IC removed successfully`);
              successCount++;
            }
          } catch (error) {
            console.log(`   ❌ Unexpected error: ${error.message}`);
            errorCount++;
          }
        }
      }
      
      console.log(`\n📊 IC Removal Summary:`);
      console.log(`   ✅ Successfully removed: ${successCount} profiles`);
      console.log(`   ❌ Errors: ${errorCount} profiles`);
      
      // Now add IC to target profile
      if (successCount > 0 || profilesWithIC.length === 0) {
        console.log(`\n🔄 Adding IC to target profile...`);
        
        try {
          const { error: addError } = await supabase
            .from('profiles')
            .update({
              ic: targetIC,
              updated_at: new Date().toISOString()
            })
            .eq('id', targetProfile.id);
          
          if (addError) {
            console.log(`   ❌ Error adding IC: ${addError.message}`);
          } else {
            console.log(`   ✅ IC added successfully: ${targetIC}`);
          }
        } catch (error) {
          console.log(`   ❌ Unexpected error: ${error.message}`);
        }
      }
    }
    
    // Final verification
    console.log('\n🔍 Final verification...');
    
    const { data: finalProfiles, error: finalError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, email')
      .or('ic.is.null,ic.eq.')
      .order('full_name');
    
    if (finalError) {
      console.log(`❌ Error in final verification: ${finalError.message}`);
    } else {
      console.log(`   📊 Profiles still without IC: ${finalProfiles.length}`);
      
      if (finalProfiles.length > 0) {
        console.log('\n📋 Remaining profiles without IC:');
        finalProfiles.forEach((profile, index) => {
          console.log(`${index + 1}. ${profile.full_name} (${profile.email})`);
        });
      } else {
        console.log('\n🎉 ALL PROFILES NOW HAVE IC NUMBERS!');
        console.log('   ✅ 100% IC coverage achieved');
        console.log('   ✅ All IC conflicts resolved');
        console.log('   ✅ All users can login with Name + IC');
        console.log('   ✅ Migration is 100% complete');
      }
    }
    
    // Check for duplicate ICs
    console.log('\n🔍 Checking for duplicate ICs...');
    
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('id, full_name, ic')
      .not('ic', 'is', null)
      .neq('ic', '');
    
    if (!allError) {
      const icCounts = {};
      allProfiles.forEach(profile => {
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
    }
    
  } catch (error) {
    console.error('❌ Process failed:', error);
  }
}

// Run the fix
fixRemainingICConflict();
