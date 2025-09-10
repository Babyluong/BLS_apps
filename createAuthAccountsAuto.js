// createAuthAccountsAuto.js
// Create auth accounts automatically using Service Role Key

import { createClient } from '@supabase/supabase-js';

// You need to replace this with your SERVICE ROLE KEY (not anon key)
// Get it from: Supabase Dashboard > Settings > API > service_role key
const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE"; // Service role key

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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

async function createAuthAccountsAuto() {
  console.log('🚀 Creating Auth Accounts Automatically\n');
  console.log('=' .repeat(60));
  
  // Check if service role key is set
  if (SUPABASE_SERVICE_ROLE_KEY === "YOUR_SERVICE_ROLE_KEY_HERE") {
    console.log('❌ ERROR: Service Role Key not set!');
    console.log('\n📋 HOW TO GET YOUR SERVICE ROLE KEY:');
    console.log('=' .repeat(60));
    console.log('1. Go to Supabase Dashboard');
    console.log('2. Select your project');
    console.log('3. Go to Settings > API');
    console.log('4. Copy the "service_role" key (NOT the anon key)');
    console.log('5. Replace "YOUR_SERVICE_ROLE_KEY_HERE" in this script');
    console.log('6. Run the script again');
    console.log('\n⚠️  IMPORTANT: Keep the service role key secret!');
    console.log('   Never commit it to version control.');
    return;
  }
  
  try {
    let successCount = 0;
    let errorCount = 0;
    const results = [];
    
    console.log('📋 Creating auth accounts and profiles...\n');
    
    for (const user of problemUsers) {
      console.log(`👤 Processing: ${user.name}`);
      console.log(`   IC: ${user.ic}`);
      console.log(`   Email: ${user.email}`);
      
      try {
        // Step 1: Create auth account using service role
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.ic, // Use IC as password
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            full_name: user.name,
            ic: user.ic
          }
        });
        
        if (authError) {
          console.log(`   ❌ Auth creation failed: ${authError.message}`);
          results.push({
            name: user.name,
            ic: user.ic,
            email: user.email,
            status: 'AUTH_ERROR',
            error: authError.message
          });
          errorCount++;
          continue;
        }
        
        console.log(`   ✅ Auth account created: ${authData.user.id}`);
        
        // Step 2: Get detailed user data from users table
        const { data: userData, error: userDataError } = await supabase
          .from('users')
          .select('*')
          .eq('ic', user.ic)
          .single();
        
        if (userDataError) {
          console.log(`   ⚠️  No detailed data found: ${userDataError.message}`);
        }
        
        // Step 3: Create profile with auth ID and detailed data
        const profileData = {
          id: authData.user.id, // Use the auth user ID
          email: user.email,
          full_name: user.name,
          ic: user.ic,
          role: 'user',
          tempat_bertugas: userData?.tempat_bertugas || null,
          jawatan: userData?.jawatan || null,
          bls_last_year: userData?.bls_last_year || null,
          alergik: userData?.alergik || false,
          alergik_details: userData?.alergik_details || null,
          asma: userData?.asma || false,
          hamil: userData?.hamil || false,
          hamil_weeks: userData?.hamil_weeks || null,
          gred: userData?.gred || null,
          alergik_terhadap: userData?.alergik_terhadap || null,
          phone_number: userData?.phone_number || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { data: profileDataResult, error: profileError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single();
        
        if (profileError) {
          console.log(`   ❌ Profile creation failed: ${profileError.message}`);
          results.push({
            name: user.name,
            ic: user.ic,
            email: user.email,
            status: 'PROFILE_ERROR',
            error: profileError.message,
            authId: authData.user.id
          });
          errorCount++;
        } else {
          console.log(`   ✅ Profile created successfully: ${profileDataResult.id}`);
          results.push({
            name: user.name,
            ic: user.ic,
            email: user.email,
            status: 'SUCCESS',
            authId: authData.user.id,
            profileId: profileDataResult.id
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
    console.log(`   ✅ Successfully created: ${successCount} users`);
    console.log(`   ❌ Errors: ${errorCount} users`);
    console.log(`   📊 Total processed: ${problemUsers.length} users`);
    
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
      console.log('\n❌ FAILED CREATIONS:');
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
    console.log('1. ✅ Auth accounts and profiles created');
    console.log('2. 🧪 Test login with any of the created users');
    console.log('3. 🔄 Update application code to use profiles only');
    console.log('4. 🗑️ Consider dropping users table after testing');
    
  } catch (error) {
    console.error('❌ Creation process failed:', error);
  }
}

// Run the creation process
createAuthAccountsAuto();
