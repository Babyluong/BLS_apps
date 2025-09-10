// checkUsersTableBeforeDrop.js
// Final check before dropping users table

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE3MDAxMiwiZXhwIjoyMDcwNzQ2MDEyfQ.y5cYn-U6t9KPcN94Hc-t8LfyfMJnOhpb200qENK8apE";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkUsersTableBeforeDrop() {
  console.log('🔍 Final Check Before Dropping Users Table\n');
  console.log('=' .repeat(60));
  
  try {
    // Check users table
    console.log('📋 Checking USERS table...');
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('full_name');
    
    if (usersError) {
      console.log(`❌ Error accessing users table: ${usersError.message}`);
      return;
    }
    
    console.log(`   📊 Users table has ${usersData.length} records`);
    
    // Check profiles table
    console.log('\n📋 Checking PROFILES table...');
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name');
    
    if (profilesError) {
      console.log(`❌ Error accessing profiles table: ${profilesError.message}`);
      return;
    }
    
    console.log(`   📊 Profiles table has ${profilesData.length} records`);
    
    // Compare the data
    console.log('\n🔍 Data Comparison:');
    console.log('=' .repeat(60));
    
    if (usersData.length === profilesData.length) {
      console.log('✅ Record counts match!');
    } else {
      console.log(`⚠️  Record count mismatch: Users(${usersData.length}) vs Profiles(${profilesData.length})`);
    }
    
    // Check for any users that might not be in profiles
    console.log('\n🔍 Checking for missing users in profiles...');
    const missingUsers = [];
    
    for (const user of usersData) {
      const existsInProfiles = profilesData.some(profile => 
        profile.ic === user.ic || 
        profile.email === user.email ||
        profile.full_name === user.full_name
      );
      
      if (!existsInProfiles) {
        missingUsers.push(user);
      }
    }
    
    if (missingUsers.length === 0) {
      console.log('✅ All users from users table exist in profiles table!');
    } else {
      console.log(`❌ Found ${missingUsers.length} users missing from profiles table:`);
      missingUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.full_name} (IC: ${user.ic})`);
      });
    }
    
    // Check for any profiles that might not be in users
    console.log('\n🔍 Checking for profiles not in users table...');
    const extraProfiles = [];
    
    for (const profile of profilesData) {
      const existsInUsers = usersData.some(user => 
        user.ic === profile.ic || 
        user.email === profile.email ||
        user.full_name === profile.full_name
      );
      
      if (!existsInUsers) {
        extraProfiles.push(profile);
      }
    }
    
    if (extraProfiles.length === 0) {
      console.log('✅ All profiles from profiles table exist in users table!');
    } else {
      console.log(`ℹ️  Found ${extraProfiles.length} profiles not in users table (these are likely auth-created profiles):`);
      extraProfiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.full_name} (IC: ${profile.ic}) - Auth ID: ${profile.id}`);
      });
    }
    
    // Summary
    console.log('\n📊 FINAL SUMMARY:');
    console.log('=' .repeat(60));
    console.log(`   Users table records: ${usersData.length}`);
    console.log(`   Profiles table records: ${profilesData.length}`);
    console.log(`   Missing users in profiles: ${missingUsers.length}`);
    console.log(`   Extra profiles (auth-created): ${extraProfiles.length}`);
    
    if (missingUsers.length === 0) {
      console.log('\n✅ SAFE TO DROP USERS TABLE!');
      console.log('   All users have been successfully migrated to profiles table.');
      console.log('   No data will be lost.');
    } else {
      console.log('\n❌ NOT SAFE TO DROP USERS TABLE!');
      console.log('   Some users are missing from profiles table.');
      console.log('   Please complete the migration first.');
    }
    
    // Show sample data from both tables
    console.log('\n📋 Sample Users Table Data:');
    console.log('=' .repeat(60));
    usersData.slice(0, 3).forEach((user, index) => {
      console.log(`${index + 1}. ${user.full_name}`);
      console.log(`   IC: ${user.ic}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Jawatan: ${user.jawatan || 'N/A'}`);
      console.log('');
    });
    
    console.log('\n📋 Sample Profiles Table Data:');
    console.log('=' .repeat(60));
    profilesData.slice(0, 3).forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.full_name}`);
      console.log(`   IC: ${profile.ic}`);
      console.log(`   Email: ${profile.email}`);
      console.log(`   Auth ID: ${profile.id}`);
      console.log(`   Role: ${profile.role || 'N/A'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

// Run the check
checkUsersTableBeforeDrop();
