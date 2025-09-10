// debugBLSAppIssue.js - Debug why BLS app shows 0 results
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugBLSAppIssue() {
  console.log('🔍 Debugging BLS app issue...\n');

  try {
    // Test 1: Check if bls_results table is accessible
    console.log('1. Testing bls_results table access...');
    const { data: blsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('*')
      .limit(5);

    if (blsError) {
      console.error('❌ Error accessing bls_results:', blsError);
    } else {
      console.log(`✅ bls_results accessible: ${blsResults.length} records found`);
      if (blsResults.length > 0) {
        console.log('Sample record:', JSON.stringify(blsResults[0], null, 2));
      }
    }
    console.log('');

    // Test 2: Check the exact query the app is using
    console.log('2. Testing app\'s exact query...');
    const { data: appQueryResults, error: appQueryError } = await supabase
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
      .order('created_at', { ascending: false })
      .limit(5);

    if (appQueryError) {
      console.error('❌ Error with app query:', appQueryError);
    } else {
      console.log(`✅ App query works: ${appQueryResults.length} records found`);
    }
    console.log('');

    // Test 3: Check profiles table access
    console.log('3. Testing profiles table access...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, role')
      .limit(5);

    if (profilesError) {
      console.error('❌ Error accessing profiles:', profilesError);
    } else {
      console.log(`✅ profiles accessible: ${profiles.length} records found`);
    }
    console.log('');

    // Test 4: Check specific user_id that's causing 406 error
    console.log('4. Testing specific user_id that caused 406 error...');
    const problemUserId = '60885e29-e0e9-45f6-9161-ac564e69609d';
    
    const { data: specificProfile, error: specificProfileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', problemUserId);

    if (specificProfileError) {
      console.error(`❌ Error accessing profile ${problemUserId}:`, specificProfileError);
    } else {
      console.log(`✅ Profile ${problemUserId} accessible:`, specificProfile);
    }
    console.log('');

    // Test 5: Check if there are any RLS (Row Level Security) issues
    console.log('5. Checking RLS and permissions...');
    
    // Try to get all user_ids from bls_results
    const { data: allBlsResults, error: allBlsError } = await supabase
      .from('bls_results')
      .select('user_id')
      .not('user_id', 'is', null);

    if (allBlsError) {
      console.error('❌ Error getting all user_ids from bls_results:', allBlsError);
    } else {
      const uniqueUserIds = [...new Set(allBlsResults.map(r => r.user_id))];
      console.log(`✅ Found ${uniqueUserIds.length} unique user_ids in bls_results`);
      
      // Test a few user_ids
      for (let i = 0; i < Math.min(3, uniqueUserIds.length); i++) {
        const userId = uniqueUserIds[i];
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', userId);
        
        if (profileError) {
          console.log(`❌ Error accessing profile ${userId}: ${profileError.message}`);
        } else {
          console.log(`✅ Profile ${userId} accessible: role=${profile[0]?.role}`);
        }
      }
    }
    console.log('');

    // Test 6: Check if there are any data type issues
    console.log('6. Checking data types and structure...');
    const { data: sampleBls, error: sampleBlsError } = await supabase
      .from('bls_results')
      .select('*')
      .limit(1);

    if (sampleBlsError) {
      console.error('❌ Error getting sample bls_result:', sampleBlsError);
    } else if (sampleBls.length > 0) {
      console.log('✅ Sample bls_result structure:');
      const sample = sampleBls[0];
      Object.keys(sample).forEach(key => {
        const value = sample[key];
        const type = typeof value;
        console.log(`  ${key}: ${type} = ${value}`);
      });
    }
    console.log('');

    // Test 7: Check if the issue is with the order by clause
    console.log('7. Testing without order by clause...');
    const { data: noOrderResults, error: noOrderError } = await supabase
      .from('bls_results')
      .select('id, user_id, participant_name, created_at');

    if (noOrderError) {
      console.error('❌ Error without order by:', noOrderError);
    } else {
      console.log(`✅ Without order by: ${noOrderResults.length} records found`);
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
debugBLSAppIssue();

