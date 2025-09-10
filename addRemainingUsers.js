// addRemainingUsers.js
// Add the 8 remaining users by creating auth accounts first, then profiles

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

async function addRemainingUsers() {
  console.log('🚀 Adding the 8 Remaining Users\n');
  console.log('=' .repeat(60));
  
  try {
    console.log('📋 Step 1: Getting detailed user data from users table...');
    
    // Get the detailed user data from users table
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .in('ic', problemUsers.map(u => u.ic));
    
    if (usersError) {
      console.log('❌ Error fetching users data:', usersError.message);
      return;
    }
    
    console.log(`   ✅ Found ${usersData.length} users with detailed data`);
    
    // Create a map for easy lookup
    const usersMap = new Map();
    usersData.forEach(user => {
      usersMap.set(user.ic, user);
    });
    
    console.log('\n📋 Step 2: Creating profiles for remaining users...');
    
    let successCount = 0;
    let errorCount = 0;
    const results = [];
    
    for (const user of problemUsers) {
      console.log(`\n👤 Processing: ${user.name}`);
      console.log(`   IC: ${user.ic}`);
      console.log(`   Email: ${user.email}`);
      
      try {
        // Get detailed user data
        const detailedUser = usersMap.get(user.ic);
        
        if (!detailedUser) {
          console.log(`   ⚠️  No detailed data found for ${user.name}`);
          continue;
        }
        
        // Create profile with all the detailed data
        const profileData = {
          email: user.email,
          full_name: user.name,
          ic: user.ic,
          role: 'user',
          tempat_bertugas: detailedUser.tempat_bertugas,
          jawatan: detailedUser.jawatan,
          bls_last_year: detailedUser.bls_last_year,
          alergik: detailedUser.alergik || false,
          alergik_details: detailedUser.alergik_details,
          asma: detailedUser.asma || false,
          hamil: detailedUser.hamil || false,
          hamil_weeks: detailedUser.hamil_weeks,
          gred: detailedUser.gred,
          alergik_terhadap: detailedUser.alergik_terhadap,
          phone_number: detailedUser.phone_number,
          created_at: detailedUser.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Try to create profile (this will fail due to foreign key constraint)
        const { data: profileDataResult, error: profileError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single();
        
        if (profileError) {
          console.log(`   ❌ Profile creation failed: ${profileError.message}`);
          
          // If it's a foreign key constraint error, we need to create auth account first
          if (profileError.message.includes('foreign key constraint')) {
            console.log(`   💡 Need to create auth account first`);
            console.log(`   📝 Manual steps required:`);
            console.log(`      1. Go to Supabase Dashboard > Authentication > Users`);
            console.log(`      2. Click "Add user"`);
            console.log(`      3. Email: ${user.email}`);
            console.log(`      4. Password: ${user.ic}`);
            console.log(`      5. Confirm email: Yes`);
            console.log(`      6. Copy the User ID`);
            console.log(`      7. Run the profile creation script with that ID`);
            
            results.push({
              name: user.name,
              ic: user.ic,
              email: user.email,
              status: 'NEEDS_AUTH_ACCOUNT',
              detailedData: detailedUser,
              profileData: profileData
            });
            errorCount++;
          } else {
            results.push({
              name: user.name,
              ic: user.ic,
              email: user.email,
              status: 'PROFILE_ERROR',
              error: profileError.message
            });
            errorCount++;
          }
        } else {
          console.log(`   ✅ Profile created successfully: ${profileDataResult.id}`);
          results.push({
            name: user.name,
            ic: user.ic,
            email: user.email,
            status: 'SUCCESS',
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
    console.log(`   ✅ Successfully created: ${successCount} profiles`);
    console.log(`   ❌ Errors: ${errorCount} users`);
    console.log(`   📊 Total processed: ${problemUsers.length} users`);
    
    // Show what needs manual work
    const needsAuth = results.filter(r => r.status === 'NEEDS_AUTH_ACCOUNT');
    if (needsAuth.length > 0) {
      console.log('\n📋 USERS NEEDING MANUAL AUTH CREATION:');
      console.log('=' .repeat(60));
      
      needsAuth.forEach((result, index) => {
        console.log(`\n${index + 1}. ${result.name}`);
        console.log(`   IC: ${result.ic}`);
        console.log(`   Email: ${result.email}`);
        console.log(`   Password: ${result.ic}`);
        console.log(`   Detailed data available: Yes`);
      });
      
      console.log('\n🛠️ MANUAL STEPS:');
      console.log('=' .repeat(60));
      console.log('1. Go to Supabase Dashboard > Authentication > Users');
      console.log('2. Click "Add user" for each user above');
      console.log('3. Use the email and IC as password');
      console.log('4. Confirm email: Yes');
      console.log('5. Copy the User ID for each user');
      console.log('6. Run the profile creation script with those IDs');
    }
    
    // Generate SQL script for manual execution
    console.log('\n📝 ALTERNATIVE: SQL SCRIPT APPROACH');
    console.log('=' .repeat(60));
    console.log('If you want to try a different approach, run this SQL in Supabase SQL Editor:');
    console.log('');
    console.log('-- First, create auth users manually in Dashboard');
    console.log('-- Then run this to create profiles:');
    console.log('');
    
    needsAuth.forEach((result, index) => {
      console.log(`-- ${result.name}`);
      console.log(`-- Auth User ID needed: [GET_FROM_DASHBOARD]`);
      console.log(`-- Email: ${result.email}`);
      console.log(`-- Password: ${result.ic}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Process failed:', error);
  }
}

// Run the process
addRemainingUsers();
