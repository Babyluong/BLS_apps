// testAppAuthentication.js - Test if there's an authentication or RLS issue
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAppAuthentication() {
  console.log('🔍 Testing app authentication and RLS issues...\n');

  try {
    // Test 1: Check if we can access bls_results at all
    console.log('1. Testing basic bls_results access...');
    const { data: basicBlsResults, error: basicBlsError } = await supabase
      .from('bls_results')
      .select('count(*)')
      .limit(1);

    if (basicBlsError) {
      console.error('❌ Basic bls_results query failed:', basicBlsError);
    } else {
      console.log('✅ Basic bls_results query successful');
    }
    console.log('');

    // Test 2: Test the exact query the app is making
    console.log('2. Testing exact app query...');
    const { data: appBlsResults, error: appBlsError } = await supabase
      .from('bls_results')
      .select(`
        id,
        user_id,
        participant_name,
        participant_ic,
        pre_test_score,
        post_test_score,
        one_man_cpr_pass,
        two_man_cpr_pass,
        adult_choking_pass,
        infant_choking_pass,
        infant_cpr_pass,
        one_man_cpr_details,
        two_man_cpr_details,
        adult_choking_details,
        infant_choking_details,
        infant_cpr_details,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (appBlsError) {
      console.error('❌ App bls_results query failed:', appBlsError);
    } else {
      console.log(`✅ App bls_results query successful: ${appBlsResults.length} records`);
    }
    console.log('');

    // Test 3: Check if there are any RLS policies blocking access
    console.log('3. Testing RLS policies...');
    
    // Try to get all bls_results (this might be blocked by RLS)
    const { data: allBlsResults, error: allBlsError } = await supabase
      .from('bls_results')
      .select('id, user_id, participant_name')
      .limit(10);

    if (allBlsError) {
      console.error('❌ All bls_results query failed (possible RLS issue):', allBlsError);
    } else {
      console.log(`✅ All bls_results query successful: ${allBlsResults.length} records`);
    }
    console.log('');

    // Test 4: Check if there's a specific user context issue
    console.log('4. Testing user context...');
    
    // Check if there's a current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Error getting user:', userError);
    } else {
      console.log(`User: ${user ? 'Logged in' : 'Not logged in'}`);
      if (user) {
        console.log(`User ID: ${user.id}`);
        console.log(`User Role: ${user.role || 'N/A'}`);
      }
    }
    console.log('');

    // Test 5: Test with different authentication contexts
    console.log('5. Testing different authentication contexts...');
    
    // Test as anonymous user
    const { data: anonymousBlsResults, error: anonymousBlsError } = await supabase
      .from('bls_results')
      .select('id, user_id, participant_name')
      .limit(5);

    if (anonymousBlsError) {
      console.error('❌ Anonymous bls_results query failed:', anonymousBlsError);
    } else {
      console.log(`✅ Anonymous bls_results query successful: ${anonymousBlsResults.length} records`);
    }
    console.log('');

    // Test 6: Check if there's a specific issue with the order by clause
    console.log('6. Testing without order by clause...');
    const { data: noOrderBlsResults, error: noOrderBlsError } = await supabase
      .from('bls_results')
      .select('id, user_id, participant_name, created_at')
      .limit(5);

    if (noOrderBlsError) {
      console.error('❌ No order bls_results query failed:', noOrderBlsError);
    } else {
      console.log(`✅ No order bls_results query successful: ${noOrderBlsResults.length} records`);
    }
    console.log('');

    // Test 7: Check if there's a specific issue with the select clause
    console.log('7. Testing with minimal select clause...');
    const { data: minimalBlsResults, error: minimalBlsError } = await supabase
      .from('bls_results')
      .select('id, user_id')
      .limit(5);

    if (minimalBlsError) {
      console.error('❌ Minimal bls_results query failed:', minimalBlsError);
    } else {
      console.log(`✅ Minimal bls_results query successful: ${minimalBlsResults.length} records`);
    }
    console.log('');

    // Test 8: Check if there's a specific issue with the created_at column
    console.log('8. Testing created_at column...');
    const { data: createdAtBlsResults, error: createdAtBlsError } = await supabase
      .from('bls_results')
      .select('id, user_id, created_at')
      .limit(5);

    if (createdAtBlsError) {
      console.error('❌ Created_at bls_results query failed:', createdAtBlsError);
    } else {
      console.log(`✅ Created_at bls_results query successful: ${createdAtBlsResults.length} records`);
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
testAppAuthentication();

