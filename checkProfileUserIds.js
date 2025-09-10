// checkProfileUserIds.js - Check what user_ids exist in profiles table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfileUserIds() {
  console.log('🔍 Checking user_ids in profiles table...\n');

  try {
    // Get all profiles
    console.log('1. Getting all profiles...');
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, role')
      .order('full_name');

    if (allProfilesError) {
      console.error('❌ Error getting profiles:', allProfilesError);
      return;
    }

    console.log(`✅ Found ${allProfiles.length} profiles`);
    console.log('');

    // Check for admin profiles
    console.log('2. Checking admin profiles...');
    const adminProfiles = allProfiles.filter(p => p.role === 'admin');
    console.log(`Admin profiles: ${adminProfiles.length}`);
    
    if (adminProfiles.length > 0) {
      adminProfiles.forEach((profile, index) => {
        console.log(`  ${index + 1}. ${profile.full_name} (${profile.id}) - ${profile.role}`);
      });
    } else {
      console.log('  No admin profiles found');
    }
    console.log('');

    // Check for user profiles
    console.log('3. Checking user profiles...');
    const userProfiles = allProfiles.filter(p => p.role === 'user');
    console.log(`User profiles: ${userProfiles.length}`);
    
    if (userProfiles.length > 0) {
      console.log('  First 10 user profiles:');
      userProfiles.slice(0, 10).forEach((profile, index) => {
        console.log(`    ${index + 1}. ${profile.full_name} (${profile.id}) - ${profile.role}`);
      });
    }
    console.log('');

    // Check for any profiles with problematic user_ids
    console.log('4. Checking for problematic user_ids...');
    const problematicUserIds = [
      '60885e29-e0e9-45f6-9161-ac564e69609d', // AMRI AMIT
      'cfd91af0-0181-4616-875b-a732691dadb7'  // NORLINA BINTI ALI
    ];

    problematicUserIds.forEach(userId => {
      const profile = allProfiles.find(p => p.id === userId);
      if (profile) {
        console.log(`❌ Found problematic user_id ${userId}: ${profile.full_name} (${profile.role})`);
      } else {
        console.log(`✅ User_id ${userId} not found in profiles`);
      }
    });
    console.log('');

    // Check for any profiles with null or invalid user_ids
    console.log('5. Checking for null or invalid user_ids...');
    const nullProfiles = allProfiles.filter(p => !p.id || p.id === null || p.id === '');
    console.log(`Null profiles: ${nullProfiles.length}`);
    
    if (nullProfiles.length > 0) {
      nullProfiles.forEach((profile, index) => {
        console.log(`  ${index + 1}. ${profile.full_name} - ID: ${profile.id}`);
      });
    }
    console.log('');

    // Check for any profiles with duplicate user_ids
    console.log('6. Checking for duplicate user_ids...');
    const userIds = allProfiles.map(p => p.id);
    const duplicateUserIds = userIds.filter((id, index) => userIds.indexOf(id) !== index);
    
    if (duplicateUserIds.length > 0) {
      console.log(`❌ Found ${duplicateUserIds.length} duplicate user_ids:`);
      duplicateUserIds.forEach(userId => {
        const profiles = allProfiles.filter(p => p.id === userId);
        console.log(`  ${userId}: ${profiles.length} profiles`);
        profiles.forEach((profile, index) => {
          console.log(`    ${index + 1}. ${profile.full_name} (${profile.role})`);
        });
      });
    } else {
      console.log('✅ No duplicate user_ids found');
    }
    console.log('');

    // Check for any profiles with invalid UUID format
    console.log('7. Checking for invalid UUID format...');
    const invalidUuidProfiles = allProfiles.filter(p => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      return !uuidRegex.test(p.id);
    });
    
    if (invalidUuidProfiles.length > 0) {
      console.log(`❌ Found ${invalidUuidProfiles.length} profiles with invalid UUID format:`);
      invalidUuidProfiles.forEach((profile, index) => {
        console.log(`  ${index + 1}. ${profile.full_name} - ID: ${profile.id}`);
      });
    } else {
      console.log('✅ All profiles have valid UUID format');
    }
    console.log('');

    // Show summary
    console.log('8. Summary:');
    console.log(`   Total profiles: ${allProfiles.length}`);
    console.log(`   Admin profiles: ${adminProfiles.length}`);
    console.log(`   User profiles: ${userProfiles.length}`);
    console.log(`   Null profiles: ${nullProfiles.length}`);
    console.log(`   Duplicate user_ids: ${duplicateUserIds.length}`);
    console.log(`   Invalid UUID format: ${invalidUuidProfiles.length}`);

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
checkProfileUserIds();

