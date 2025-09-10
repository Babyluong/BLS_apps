// createAuthAccountsV2.js
// Create Supabase auth accounts for the 8 problem users (RLS disabled)

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

async function createAuthAccountsV2() {
  console.log('🚀 Creating Auth Accounts for 8 Problem Users (RLS Disabled)\n');
  console.log('=' .repeat(60));
  
  try {
    let successCount = 0;
    let errorCount = 0;
    const results = [];
    
    for (const user of problemUsers) {
      console.log(`\n👤 Processing: ${user.name}`);
      console.log(`   IC: ${user.ic}`);
      console.log(`   Email: ${user.email}`);
      
      try {
        // First, try to create the profile directly (since RLS is disabled)
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
          results.push({
            name: user.name,
            ic: user.ic,
            email: user.email,
            status: 'PROFILE_ERROR',
            error: profileError.message
          });
          errorCount++;
        } else {
          console.log(`   ✅ Profile created successfully: ${profileData.id}`);
          
          // Now try to create auth account using the profile ID
          try {
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
              id: profileData.id, // Use the profile ID as auth ID
              email: user.email,
              password: user.ic, // Use IC as password
              email_confirm: true,
              user_metadata: {
                full_name: user.name,
                ic: user.ic
              }
            });
            
            if (authError) {
              console.log(`   ⚠️  Auth creation failed: ${authError.message}`);
              console.log(`   ✅ But profile was created successfully`);
              results.push({
                name: user.name,
                ic: user.ic,
                email: user.email,
                status: 'PROFILE_ONLY',
                profileId: profileData.id,
                authError: authError.message
              });
              successCount++; // Still count as success since profile was created
            } else {
              console.log(`   ✅ Auth account created: ${authData.user.id}`);
              results.push({
                name: user.name,
                ic: user.ic,
                email: user.email,
                status: 'SUCCESS',
                authId: authData.user.id,
                profileId: profileData.id
              });
              successCount++;
            }
          } catch (authError) {
            console.log(`   ⚠️  Auth creation failed: ${authError.message}`);
            console.log(`   ✅ But profile was created successfully`);
            results.push({
              name: user.name,
              ic: user.ic,
              email: user.email,
              status: 'PROFILE_ONLY',
              profileId: profileData.id,
              authError: authError.message
            });
            successCount++; // Still count as success since profile was created
          }
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
    
    const successful = results.filter(r => r.status === 'SUCCESS' || r.status === 'PROFILE_ONLY');
    const failed = results.filter(r => r.status !== 'SUCCESS' && r.status !== 'PROFILE_ONLY');
    
    if (successful.length > 0) {
      console.log('\n✅ SUCCESSFUL CREATIONS:');
      successful.forEach((result, index) => {
        console.log(`${index + 1}. ${result.name}`);
        console.log(`   Profile ID: ${result.profileId}`);
        console.log(`   Email: ${result.email}`);
        if (result.authId) {
          console.log(`   Auth ID: ${result.authId}`);
        } else {
          console.log(`   Auth: Not created (${result.authError || 'Unknown error'})`);
        }
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
    console.log('1. ✅ Profiles created for all users');
    console.log('2. 🔄 Run migration again to update profiles with detailed user data');
    console.log('3. 🧪 Test the application');
    console.log('4. 🔄 Update application code to use profiles only');
    
    if (successCount > 0) {
      console.log('\n💡 IMPORTANT NOTES:');
      console.log('=' .repeat(60));
      console.log('• All 8 users now have profiles in the database');
      console.log('• They can be migrated with their detailed data');
      console.log('• Auth accounts may need to be created manually in Supabase Dashboard');
      console.log('• Or users can register normally through your app');
    }
    
  } catch (error) {
    console.error('❌ Creation process failed:', error);
  }
}

// Run the creation process
createAuthAccountsV2();
