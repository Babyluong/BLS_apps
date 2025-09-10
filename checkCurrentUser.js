// checkCurrentUser.js - Check what user is currently logged in and their profile
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCurrentUser() {
  console.log('🔍 Checking current user and their profile...\n');

  try {
    // Check 1: Get current user
    console.log('1. Getting current user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Error getting user:', userError);
    } else if (!user) {
      console.log('ℹ️  No user logged in (this is expected for script)');
    } else {
      console.log(`✅ User logged in: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role || 'N/A'}`);
    }
    console.log('');

    // Check 2: Check if the problematic user_id exists in profiles
    console.log('2. Checking problematic user_id in profiles...');
    const problematicUserId = '60885e29-e0e9-45f6-9161-ac564e69609d';
    const { data: problematicProfile, error: problematicProfileError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, role')
      .eq('id', problematicUserId);

    if (problematicProfileError) {
      console.error('❌ Error checking problematic profile:', problematicProfileError);
    } else {
      console.log(`Problematic profile: ${problematicProfile.length} records found`);
      if (problematicProfile.length > 0) {
        console.log(`  Name: ${problematicProfile[0].full_name}, IC: ${problematicProfile[0].ic}, Role: ${problematicProfile[0].role}`);
      }
    }
    console.log('');

    // Check 3: Check if there are any profiles with this user_id
    console.log('3. Checking all profiles for this user_id...');
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, role')
      .eq('id', problematicUserId);

    if (allProfilesError) {
      console.error('❌ Error checking all profiles:', allProfilesError);
    } else {
      console.log(`All profiles with this user_id: ${allProfiles.length} records`);
    }
    console.log('');

    // Check 4: Check if there are any profiles that might be causing issues
    console.log('4. Checking for profiles that might be causing issues...');
    const { data: adminProfiles, error: adminProfilesError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, role')
      .eq('role', 'admin');

    if (adminProfilesError) {
      console.error('❌ Error checking admin profiles:', adminProfilesError);
    } else {
      console.log(`Admin profiles: ${adminProfiles.length} records`);
      adminProfiles.forEach((profile, index) => {
        console.log(`  ${index + 1}. ${profile.full_name} (${profile.id}) - ${profile.role}`);
      });
    }
    console.log('');

    // Check 5: Check if there are any profiles with null or invalid user_ids
    console.log('5. Checking for profiles with null or invalid user_ids...');
    const { data: nullProfiles, error: nullProfilesError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, role')
      .is('id', null);

    if (nullProfilesError) {
      console.error('❌ Error checking null profiles:', nullProfilesError);
    } else {
      console.log(`Null profiles: ${nullProfiles.length} records`);
    }
    console.log('');

    // Check 6: Test the exact query that's failing in the app
    console.log('6. Testing the exact failing query...');
    const { data: testProfile, error: testProfileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', problematicUserId);

    if (testProfileError) {
      console.error('❌ Test profile query failed:', testProfileError);
      console.log('This is the exact error causing the 406!');
    } else {
      console.log(`✅ Test profile query successful: ${testProfile.length} records`);
    }
    console.log('');

    // Check 7: Check if there are any RLS policies that might be blocking this
    console.log('7. Testing RLS policies...');
    
    // Try to get a profile that we know exists
    const { data: knownProfile, error: knownProfileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', '1543357e-7c30-4f74-9b0f-333843e42a15'); // EMILY AKUP's ID

    if (knownProfileError) {
      console.error('❌ Known profile query failed:', knownProfileError);
    } else {
      console.log(`✅ Known profile query successful: ${knownProfile.length} records`);
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
checkCurrentUser();

