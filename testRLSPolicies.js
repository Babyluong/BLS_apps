// testRLSPolicies.js - Test if RLS policies are causing the 406 error
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRLSPolicies() {
  console.log('🔍 Testing RLS policies and query issues...\n');

  try {
    // Test 1: Simple profiles query
    console.log('1. Testing simple profiles query...');
    const { data: simpleProfiles, error: simpleProfilesError } = await supabase
      .from('profiles')
      .select('id, role')
      .limit(5);

    if (simpleProfilesError) {
      console.error('❌ Simple profiles query failed:', simpleProfilesError);
    } else {
      console.log(`✅ Simple profiles query successful: ${simpleProfiles.length} records`);
    }
    console.log('');

    // Test 2: Test with specific user_ids that we know exist
    console.log('2. Testing with known user_ids...');
    const knownUserIds = [
      '1543357e-7c30-4f74-9b0f-333843e42a15', // EMILY AKUP
      'eb8d80f8-749c-4384-ba42-8a85985b9926', // SYAMSUL HARDY
      '4ee73fc9-f993-45de-93d8-01b5ac92fa0e'  // METHDIOUSE
    ];

    const { data: knownProfiles, error: knownProfilesError } = await supabase
      .from('profiles')
      .select('id, jawatan, role')
      .in('id', knownUserIds);

    if (knownProfilesError) {
      console.error('❌ Known profiles query failed:', knownProfilesError);
    } else {
      console.log(`✅ Known profiles query successful: ${knownProfiles.length} records`);
    }
    console.log('');

    // Test 3: Test the exact query format from the error
    console.log('3. Testing exact query format from error...');
    const { data: exactProfiles, error: exactProfilesError } = await supabase
      .from('profiles')
      .select('id,role')
      .in('id', knownUserIds);

    if (exactProfilesError) {
      console.error('❌ Exact profiles query failed:', exactProfilesError);
    } else {
      console.log(`✅ Exact profiles query successful: ${exactProfiles.length} records`);
    }
    console.log('');

    // Test 4: Test with a single user_id (like the error shows)
    console.log('4. Testing with single user_id...');
    const { data: singleProfile, error: singleProfileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', '1543357e-7c30-4f74-9b0f-333843e42a15');

    if (singleProfileError) {
      console.error('❌ Single profile query failed:', singleProfileError);
    } else {
      console.log(`✅ Single profile query successful: ${singleProfile.length} records`);
    }
    console.log('');

    // Test 5: Test the problematic user_id from the error
    console.log('5. Testing problematic user_id from error...');
    const { data: problematicProfile, error: problematicProfileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', '60885e29-e0e9-45f6-9161-ac564e69609d');

    if (problematicProfileError) {
      console.error('❌ Problematic profile query failed:', problematicProfileError);
    } else {
      console.log(`✅ Problematic profile query successful: ${problematicProfile.length} records`);
    }
    console.log('');

    // Test 6: Test with different select formats
    console.log('6. Testing different select formats...');
    
    // Test with spaces
    const { data: spacedProfiles, error: spacedProfilesError } = await supabase
      .from('profiles')
      .select('id, role')
      .in('id', knownUserIds);

    if (spacedProfilesError) {
      console.error('❌ Spaced profiles query failed:', spacedProfilesError);
    } else {
      console.log(`✅ Spaced profiles query successful: ${spacedProfiles.length} records`);
    }

    // Test without spaces
    const { data: noSpacedProfiles, error: noSpacedProfilesError } = await supabase
      .from('profiles')
      .select('id,role')
      .in('id', knownUserIds);

    if (noSpacedProfilesError) {
      console.error('❌ No-spaced profiles query failed:', noSpacedProfilesError);
    } else {
      console.log(`✅ No-spaced profiles query successful: ${noSpacedProfiles.length} records`);
    }
    console.log('');

    // Test 7: Check if there are any RLS policies
    console.log('7. Checking for RLS policies...');
    
    // Try to get all profiles (this might be blocked by RLS)
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('profiles')
      .select('id, role')
      .limit(10);

    if (allProfilesError) {
      console.error('❌ All profiles query failed (possible RLS issue):', allProfilesError);
    } else {
      console.log(`✅ All profiles query successful: ${allProfiles.length} records`);
    }
    console.log('');

    // Test 8: Test the exact URL from the error
    console.log('8. Testing exact URL from error...');
    const { data: urlProfiles, error: urlProfilesError } = await supabase
      .from('profiles')
      .select('id,role')
      .eq('id', '60885e29-e0e9-45f6-9161-ac564e69609d');

    if (urlProfilesError) {
      console.error('❌ URL profiles query failed:', urlProfilesError);
      console.log('This matches the 406 error in the app!');
    } else {
      console.log(`✅ URL profiles query successful: ${urlProfiles.length} records`);
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
testRLSPolicies();

