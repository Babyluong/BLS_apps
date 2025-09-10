// addFinalICNumbers.js
// Add the final IC numbers for the two remaining profiles

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Final IC numbers to add
const finalICData = [
  { name: "SA'DI BIN USOP", ic: "680924135151" },
  { name: "AWANGKU MOHAMAD ZULFAZLI BIN AWANGKU ABDUL RAZAK", ic: "950821136503" }
];

async function addFinalICNumbers() {
  console.log('📝 Adding Final IC Numbers\n');
  console.log('=' .repeat(60));
  
  try {
    // Get the two profiles without IC
    console.log('📋 Fetching profiles without IC...');
    
    const { data: profilesWithoutIC, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, email, role, created_at')
      .or('ic.is.null,ic.eq.')
      .order('full_name');
    
    if (profilesError) {
      console.log(`❌ Error fetching profiles: ${profilesError.message}`);
      return;
    }
    
    console.log(`   📊 Found ${profilesWithoutIC.length} profiles without IC`);
    
    // Show current profiles
    console.log('\n📋 Current profiles without IC:');
    profilesWithoutIC.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.full_name} (${profile.email})`);
    });
    
    // Match and update profiles
    console.log('\n🔄 Updating profiles with IC numbers...');
    
    let successCount = 0;
    let errorCount = 0;
    const results = [];
    
    for (const profile of profilesWithoutIC) {
      console.log(`\n👤 Processing: ${profile.full_name}`);
      console.log(`   Email: ${profile.email}`);
      
      // Find matching IC data
      const icData = finalICData.find(ic => 
        ic.name.toUpperCase() === profile.full_name.toUpperCase()
      );
      
      if (!icData) {
        console.log(`   ⚠️  No IC data found for this profile`);
        results.push({
          name: profile.full_name,
          email: profile.email,
          status: 'NO_IC_DATA',
          error: 'No IC data provided'
        });
        errorCount++;
        continue;
      }
      
      console.log(`   📝 IC: ${icData.ic}`);
      
      // Validate IC format
      if (!/^\d{12}$/.test(icData.ic)) {
        console.log(`   ❌ Invalid IC format: ${icData.ic}`);
        results.push({
          name: profile.full_name,
          email: profile.email,
          status: 'INVALID_IC',
          error: `Invalid IC format: ${icData.ic}`
        });
        errorCount++;
        continue;
      }
      
      // Update the profile with IC
      try {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            ic: icData.ic,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);
        
        if (updateError) {
          console.log(`   ❌ Update failed: ${updateError.message}`);
          results.push({
            name: profile.full_name,
            email: profile.email,
            status: 'UPDATE_ERROR',
            error: updateError.message,
            ic: icData.ic
          });
          errorCount++;
        } else {
          console.log(`   ✅ IC added successfully: ${icData.ic}`);
          results.push({
            name: profile.full_name,
            email: profile.email,
            status: 'SUCCESS',
            ic: icData.ic
          });
          successCount++;
        }
        
      } catch (error) {
        console.log(`   ❌ Unexpected error: ${error.message}`);
        results.push({
          name: profile.full_name,
          email: profile.email,
          status: 'UNEXPECTED_ERROR',
          error: error.message,
          ic: icData.ic
        });
        errorCount++;
      }
    }
    
    // Summary
    console.log('\n📊 UPDATE SUMMARY:');
    console.log('=' .repeat(60));
    console.log(`   ✅ Successfully updated: ${successCount} profiles`);
    console.log(`   ❌ Errors: ${errorCount} profiles`);
    console.log(`   📊 Total processed: ${profilesWithoutIC.length} profiles`);
    
    if (successCount > 0) {
      console.log('\n🎉 SUCCESS! IC numbers added:');
      console.log('=' .repeat(60));
      const successful = results.filter(r => r.status === 'SUCCESS');
      successful.forEach((result, index) => {
        console.log(`${index + 1}. ${result.name}: ${result.ic}`);
      });
    }
    
    if (errorCount > 0) {
      console.log('\n❌ ERRORS:');
      console.log('=' .repeat(60));
      const errors = results.filter(r => r.status !== 'SUCCESS');
      errors.forEach((result, index) => {
        console.log(`${index + 1}. ${result.name}: ${result.error}`);
      });
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
        console.log('   ✅ All users can login with Name + IC');
        console.log('   ✅ Migration is 100% complete');
      }
    }
    
    console.log('\n🔄 NEXT STEPS:');
    console.log('=' .repeat(60));
    console.log('1. ✅ IC numbers added to final profiles');
    console.log('2. 🧪 Test login functionality for all users');
    console.log('3. 🔄 Update application code to use profiles only');
    console.log('4. 🗑️ Drop users table after testing');
    console.log('5. 🎉 Migration 100% complete!');
    
  } catch (error) {
    console.error('❌ Process failed:', error);
  }
}

// Run the process
addFinalICNumbers();
