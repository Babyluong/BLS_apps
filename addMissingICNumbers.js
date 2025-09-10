// addMissingICNumbers.js
// Add missing IC numbers for app-created profiles

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// IC numbers for the missing profiles (you'll need to provide these)
const missingICData = [
  // Format: { name: "FULL NAME", ic: "123456789012" }
  // Add the IC numbers for each profile that's missing IC
  // You can get these from the original users table or from the users themselves
];

async function addMissingICNumbers() {
  console.log('📝 Adding Missing IC Numbers\n');
  console.log('=' .repeat(60));
  
  try {
    // Get profiles without IC
    const { data: profilesWithoutIC, error: fetchError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, email, role, created_at')
      .or('ic.is.null,ic.eq.')
      .order('full_name');
    
    if (fetchError) {
      console.log(`❌ Error fetching profiles: ${fetchError.message}`);
      return;
    }
    
    console.log(`📊 Found ${profilesWithoutIC.length} profiles without IC`);
    
    if (missingICData.length === 0) {
      console.log('\n⚠️  No IC data provided in the script!');
      console.log('=' .repeat(60));
      console.log('To add IC numbers, you need to:');
      console.log('1. Get the IC numbers from the original users table');
      console.log('2. Add them to the missingICData array in this script');
      console.log('3. Run the script again');
      
      console.log('\n📋 Profiles that need IC numbers:');
      profilesWithoutIC.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.full_name} (${profile.email})`);
      });
      
      return;
    }
    
    // Match profiles with IC data
    console.log('\n🔍 Matching profiles with IC data...');
    
    let successCount = 0;
    let errorCount = 0;
    const results = [];
    
    for (const profile of profilesWithoutIC) {
      console.log(`\n👤 Processing: ${profile.full_name}`);
      console.log(`   Email: ${profile.email}`);
      
      // Find matching IC data
      const icData = missingICData.find(ic => 
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
            error: updateError.message
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
          error: error.message
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
    
    console.log('\n🔄 NEXT STEPS:');
    console.log('=' .repeat(60));
    console.log('1. ✅ IC numbers added to profiles');
    console.log('2. 🧪 Test login functionality');
    console.log('3. 🔄 Update registration form to collect IC');
    console.log('4. 🎉 All users can now login with Name + IC');
    
  } catch (error) {
    console.error('❌ Process failed:', error);
  }
}

// Run the process
addMissingICNumbers();
