// checkProblemUsers.js
// Check the 8 users that couldn't be migrated

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ymajroaavaptafmoqciq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkProblemUsers() {
  console.log('🔍 Checking the 8 Problem Users\n');
  console.log('=' .repeat(60));
  
  try {
    // Get all users data
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.log('❌ Error fetching users data:', usersError.message);
      return;
    }
    
    // Get all profiles data
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.log('❌ Error fetching profiles data:', profilesError.message);
      return;
    }
    
    // Create lookup maps
    const profilesByIC = new Map();
    const profilesByEmail = new Map();
    const profilesByName = new Map();
    
    profilesData.forEach(profile => {
      if (profile.ic) profilesByIC.set(profile.ic, profile);
      if (profile.email) profilesByEmail.set(profile.email, profile);
      if (profile.full_name) profilesByName.set(profile.full_name.toLowerCase(), profile);
    });
    
    console.log('📋 PROBLEM USERS ANALYSIS:\n');
    
    let problemUsers = [];
    let migratedUsers = [];
    
    // Check each user
    for (const user of usersData) {
      const existingProfile = profilesByIC.get(user.ic) || 
                            profilesByEmail.get(user.email) || 
                            profilesByName.get(user.full_name?.toLowerCase());
      
      if (existingProfile) {
        migratedUsers.push({
          name: user.full_name,
          ic: user.ic,
          email: user.email,
          reason: 'Found matching profile',
          profileId: existingProfile.id
        });
      } else {
        problemUsers.push({
          name: user.full_name,
          ic: user.ic,
          email: user.email,
          reason: 'No matching profile found',
          details: {
            hasIC: !!user.ic,
            hasEmail: !!user.email,
            hasName: !!user.full_name,
            icInProfiles: profilesByIC.has(user.ic),
            emailInProfiles: profilesByEmail.has(user.email),
            nameInProfiles: profilesByName.has(user.full_name?.toLowerCase())
          }
        });
      }
    }
    
    console.log(`✅ MIGRATED USERS: ${migratedUsers.length}`);
    console.log('=' .repeat(40));
    migratedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   IC: ${user.ic}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Status: ${user.reason}`);
      console.log('');
    });
    
    console.log(`❌ PROBLEM USERS: ${problemUsers.length}`);
    console.log('=' .repeat(40));
    
    problemUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   IC: ${user.ic}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Reason: ${user.reason}`);
      console.log(`   Details:`);
      console.log(`     - Has IC: ${user.details.hasIC}`);
      console.log(`     - Has Email: ${user.details.hasEmail}`);
      console.log(`     - Has Name: ${user.details.hasName}`);
      console.log(`     - IC exists in profiles: ${user.details.icInProfiles}`);
      console.log(`     - Email exists in profiles: ${user.details.emailInProfiles}`);
      console.log(`     - Name exists in profiles: ${user.details.nameInProfiles}`);
      console.log('');
    });
    
    // Analyze the problem
    console.log('🔍 PROBLEM ANALYSIS:');
    console.log('=' .repeat(60));
    
    const noIC = problemUsers.filter(u => !u.details.hasIC).length;
    const noEmail = problemUsers.filter(u => !u.details.hasEmail).length;
    const noName = problemUsers.filter(u => !u.details.hasName).length;
    
    console.log(`Users without IC: ${noIC}`);
    console.log(`Users without Email: ${noEmail}`);
    console.log(`Users without Name: ${noName}`);
    
    console.log('\n💡 SOLUTIONS:');
    console.log('=' .repeat(60));
    console.log('1. These users likely don\'t have authentication accounts');
    console.log('2. They might be test data or old records');
    console.log('3. You can either:');
    console.log('   - Create auth accounts for them (if needed)');
    console.log('   - Delete them from users table (if test data)');
    console.log('   - Leave them as-is (they won\'t affect the app)');
    
    console.log('\n📊 SUMMARY:');
    console.log('=' .repeat(60));
    console.log(`Total users: ${usersData.length}`);
    console.log(`Successfully migrated: ${migratedUsers.length} (${Math.round(migratedUsers.length/usersData.length*100)}%)`);
    console.log(`Problem users: ${problemUsers.length} (${Math.round(problemUsers.length/usersData.length*100)}%)`);
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  }
}

// Run the analysis
checkProblemUsers();
