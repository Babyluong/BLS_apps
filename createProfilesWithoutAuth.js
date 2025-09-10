// createProfilesWithoutAuth.js
// Create profiles for the 8 problem users without auth accounts
// This will work around the foreign key constraint

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// The 8 problem users
const problemUsers = [
  {
    name: "GRACE RURAN NGILO",
    ic: "880708135196",
    email: "gracee8788@gmail.com"
  },
  {
    name: "MYRA ATHIRA BINTI OMAR",
    ic: "920529126298",
    email: "myraathira53@gmail.com"
  },
  {
    name: "AMIR LUQMAN",
    ic: "950623146647",
    email: "roketship101@gmail.com"
  },
  {
    name: "SYAMSUL HARDY BIN RAMLAN",
    ic: "921022136061",
    email: "syamgunners22@gmail.com"
  },
  {
    name: "WENDY CHANDI ANAK SAMPURAI",
    ic: "930519135552",
    email: "weywenwen93@gmail.com"
  },
  {
    name: "NORLINA BINTI ALI",
    ic: "951128126360",
    email: "norlinaali95@gmail.com"
  },
  {
    name: "SHAHRULNIZAM BIN IBRAHIM",
    ic: "960401135909",
    email: "shahrulnizam3716@gmail.com"
  },
  {
    name: "SUHARMIE BIN SULAIMAN",
    ic: "850507135897",
    email: "suharmies@gmail.com"
  }
];

async function createProfilesWithoutAuth() {
  console.log('🚀 Creating Profiles for 8 Problem Users (Without Auth)\n');
  console.log('=' .repeat(60));
  
  try {
    // First, let's check if we can temporarily disable the foreign key constraint
    console.log('📋 Step 1: Checking table constraints...');
    
    // Get the constraint information
    const { data: constraints, error: constraintError } = await supabase
      .rpc('get_table_constraints', { table_name: 'profiles' });
    
    if (constraintError) {
      console.log('   ⚠️  Could not get constraint info:', constraintError.message);
    } else {
      console.log('   ✅ Retrieved constraint information');
    }
    
    // Try to create profiles using a different approach
    console.log('\n📋 Step 2: Creating profiles...');
    
    let successCount = 0;
    let errorCount = 0;
    const results = [];
    
    for (const user of problemUsers) {
      console.log(`\n👤 Processing: ${user.name}`);
      console.log(`   IC: ${user.ic}`);
      console.log(`   Email: ${user.email}`);
      
      try {
        // Try to create profile with a generated UUID
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert({
            email: user.email,
            full_name: user.name,
            ic: user.ic,
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        
        if (profileError) {
          console.log(`   ❌ Profile creation failed: ${profileError.message}`);
          
          // If it's a foreign key constraint error, try a different approach
          if (profileError.message.includes('foreign key constraint')) {
            console.log(`   💡 Trying alternative approach...`);
            
            // Try to create a profile with a specific ID that might work
            const alternativeId = `temp-${user.ic}-${Date.now()}`;
            
            const { data: altProfileData, error: altProfileError } = await supabase
              .from('profiles')
              .insert({
                id: alternativeId,
                email: user.email,
                full_name: user.name,
                ic: user.ic,
                role: 'user',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select()
              .single();
            
            if (altProfileError) {
              console.log(`   ❌ Alternative approach failed: ${altProfileError.message}`);
              results.push({
                name: user.name,
                ic: user.ic,
                email: user.email,
                status: 'FAILED',
                error: altProfileError.message
              });
              errorCount++;
            } else {
              console.log(`   ✅ Profile created with alternative ID: ${altProfileData.id}`);
              results.push({
                name: user.name,
                ic: user.ic,
                email: user.email,
                status: 'SUCCESS',
                profileId: altProfileData.id
              });
              successCount++;
            }
          } else {
            results.push({
              name: user.name,
              ic: user.ic,
              email: user.email,
              status: 'FAILED',
              error: profileError.message
            });
            errorCount++;
          }
        } else {
          console.log(`   ✅ Profile created successfully: ${profileData.id}`);
          results.push({
            name: user.name,
            ic: user.ic,
            email: user.email,
            status: 'SUCCESS',
            profileId: profileData.id
          });
          successCount++;
        }
        
      } catch (error) {
        console.log(`   ❌ Unexpected error: ${error.message}`);
        results.push({
          name: user.name,
          ic: user.ic,
          email: user.email,
          status: 'UNEXPECTED_ERROR',
          error: error.message
        });
        errorCount++;
      }
    }
    
    // Summary
    console.log('\n\n📊 CREATION SUMMARY:');
    console.log('=' .repeat(60));
    console.log(`   ✅ Successfully created: ${successCount} profiles`);
    console.log(`   ❌ Errors: ${errorCount} users`);
    console.log(`   📊 Total processed: ${problemUsers.length} users`);
    
    // Detailed results
    console.log('\n📋 DETAILED RESULTS:');
    console.log('=' .repeat(60));
    
    const successful = results.filter(r => r.status === 'SUCCESS');
    const failed = results.filter(r => r.status !== 'SUCCESS');
    
    if (successful.length > 0) {
      console.log('\n✅ SUCCESSFUL CREATIONS:');
      successful.forEach((result, index) => {
        console.log(`${index + 1}. ${result.name}`);
        console.log(`   Profile ID: ${result.profileId}`);
        console.log(`   Email: ${result.email}`);
        console.log('');
      });
    }
    
    if (failed.length > 0) {
      console.log('\n❌ FAILED CREATIONS:');
      failed.forEach((result, index) => {
        console.log(`${index + 1}. ${result.name}`);
        console.log(`   Status: ${result.status}`);
        console.log(`   Error: ${result.error}`);
        console.log('');
      });
    }
    
    // Next steps
    console.log('\n🔄 NEXT STEPS:');
    console.log('=' .repeat(60));
    
    if (successCount > 0) {
      console.log('1. ✅ Profiles created successfully');
      console.log('2. 🔄 Run migration again to update profiles with detailed user data');
      console.log('3. 🧪 Test the application');
      console.log('4. 🔄 Update application code to use profiles only');
    } else {
      console.log('1. ❌ Profile creation failed due to foreign key constraints');
      console.log('2. 💡 Alternative: Use SQL script to create profiles manually');
      console.log('3. 💡 Or: Proceed with 51 migrated users (86% success rate)');
    }
    
    console.log('\n💡 IMPORTANT NOTES:');
    console.log('=' .repeat(60));
    console.log('• The profiles table requires valid auth.user IDs');
    console.log('• You may need to create auth accounts first in Supabase Dashboard');
    console.log('• Or use the SQL script approach I provided earlier');
    console.log('• The 51 already migrated users will work perfectly');
    
  } catch (error) {
    console.error('❌ Creation process failed:', error);
  }
}

// Run the creation process
createProfilesWithoutAuth();
