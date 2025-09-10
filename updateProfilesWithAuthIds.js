// updateProfilesWithAuthIds.js
// Update existing profiles with new auth IDs

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// The 8 users with their new auth IDs
const usersWithAuthIds = [
  {
    name: "GRACE RURAN NGILO",
    ic: "880708135196",
    email: "gracee8788@gmail.com",
    authId: "b6d8b235-9863-4d6a-9695-f3563f3a6a6f"
  },
  {
    name: "MYRA ATHIRA BINTI OMAR",
    ic: "920529126298",
    email: "myraathira53@gmail.com",
    authId: "dc79fd0a-12b9-4af3-b477-18c613a04276"
  },
  {
    name: "AMIR LUQMAN",
    ic: "950623146647",
    email: "roketship101@gmail.com",
    authId: "e7578efe-15dd-4264-a5c1-8d307e8d1831"
  },
  {
    name: "SYAMSUL HARDY BIN RAMLAN",
    ic: "921022136061",
    email: "syamgunners22@gmail.com",
    authId: "eb8d80f8-749c-4384-ba42-8a85985b9926"
  },
  {
    name: "WENDY CHANDI ANAK SAMPURAI",
    ic: "930519135552",
    email: "weywenwen93@gmail.com",
    authId: "b5a8ca8f-de64-4899-b7b2-8ec2c920816e"
  },
  {
    name: "NORLINA BINTI ALI",
    ic: "951128126360",
    email: "norlinaali95@gmail.com",
    authId: "cfd91af0-0181-4616-875b-a732691dadb7"
  },
  {
    name: "SHAHRULNIZAM BIN IBRAHIM",
    ic: "960401135909",
    email: "shahrulnizam3716@gmail.com",
    authId: "70c199df-c801-483f-8a96-4da6766e940b"
  },
  {
    name: "SUHARMIE BIN SULAIMAN",
    ic: "850507135897",
    email: "suharmies@gmail.com",
    authId: "800d4966-8cf2-46d3-8453-e9fec58e9cc5"
  }
];

async function updateProfilesWithAuthIds() {
  console.log('🔄 Updating Profiles with Auth IDs\n');
  console.log('=' .repeat(60));
  
  try {
    let successCount = 0;
    let errorCount = 0;
    const results = [];
    
    console.log('📋 Updating profiles...\n');
    
    for (const user of usersWithAuthIds) {
      console.log(`👤 Processing: ${user.name}`);
      console.log(`   IC: ${user.ic}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Auth ID: ${user.authId}`);
      
      try {
        // First, check if a profile exists with this IC or email
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .or(`ic.eq.${user.ic},email.eq.${user.email}`)
          .single();
        
        if (fetchError && fetchError.code !== 'PGRST116') {
          console.log(`   ❌ Error fetching profile: ${fetchError.message}`);
          results.push({
            name: user.name,
            ic: user.ic,
            email: user.email,
            status: 'FETCH_ERROR',
            error: fetchError.message
          });
          errorCount++;
          continue;
        }
        
        if (existingProfile) {
          // Update existing profile with new auth ID
          const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({
              id: user.authId,
              email: user.email,
              full_name: user.name,
              ic: user.ic,
              role: 'user',
              updated_at: new Date().toISOString()
            })
            .eq('id', existingProfile.id)
            .select()
            .single();
          
          if (updateError) {
            console.log(`   ❌ Update failed: ${updateError.message}`);
            results.push({
              name: user.name,
              ic: user.ic,
              email: user.email,
              status: 'UPDATE_ERROR',
              error: updateError.message
            });
            errorCount++;
          } else {
            console.log(`   ✅ Profile updated successfully: ${updatedProfile.id}`);
            results.push({
              name: user.name,
              ic: user.ic,
              email: user.email,
              status: 'SUCCESS',
              authId: user.authId,
              profileId: updatedProfile.id
            });
            successCount++;
          }
        } else {
          // Create new profile with auth ID
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.authId,
              email: user.email,
              full_name: user.name,
              ic: user.ic,
              role: 'user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (createError) {
            console.log(`   ❌ Creation failed: ${createError.message}`);
            results.push({
              name: user.name,
              ic: user.ic,
              email: user.email,
              status: 'CREATE_ERROR',
              error: createError.message
            });
            errorCount++;
          } else {
            console.log(`   ✅ Profile created successfully: ${newProfile.id}`);
            results.push({
              name: user.name,
              ic: user.ic,
              email: user.email,
              status: 'SUCCESS',
              authId: user.authId,
              profileId: newProfile.id
            });
            successCount++;
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
    console.log('\n\n📊 UPDATE SUMMARY:');
    console.log('=' .repeat(60));
    console.log(`   ✅ Successfully updated: ${successCount} users`);
    console.log(`   ❌ Errors: ${errorCount} users`);
    console.log(`   📊 Total processed: ${usersWithAuthIds.length} users`);
    
    if (successCount > 0) {
      console.log('\n🎉 SUCCESS! All users can now log in:');
      console.log('=' .repeat(60));
      const successful = results.filter(r => r.status === 'SUCCESS');
      successful.forEach((result, index) => {
        console.log(`${index + 1}. ${result.name}`);
        console.log(`   Email: ${result.email}`);
        console.log(`   Password: ${result.ic}`);
        console.log(`   Auth ID: ${result.authId}`);
        console.log(`   Profile ID: ${result.profileId}`);
        console.log('');
      });
    }
    
    if (errorCount > 0) {
      console.log('\n❌ FAILED UPDATES:');
      console.log('=' .repeat(60));
      const failed = results.filter(r => r.status !== 'SUCCESS');
      failed.forEach((result, index) => {
        console.log(`${index + 1}. ${result.name}`);
        console.log(`   Status: ${result.status}`);
        console.log(`   Error: ${result.error}`);
        console.log('');
      });
    }
    
    console.log('\n🔄 NEXT STEPS:');
    console.log('=' .repeat(60));
    console.log('1. ✅ Auth accounts created');
    console.log('2. ✅ Profiles updated with auth IDs');
    console.log('3. 🧪 Test login with any of the created users');
    console.log('4. 🔄 Update application code to use profiles only');
    console.log('5. 🗑️ Consider dropping users table after testing');
    
  } catch (error) {
    console.error('❌ Update process failed:', error);
  }
}

// Run the update process
updateProfilesWithAuthIds();
