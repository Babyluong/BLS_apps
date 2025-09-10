// debugAppIssue.js - Debug why the app is still getting 0 results
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAppIssue() {
  console.log('🔍 Debugging app issue - still getting 0 results...\n');

  try {
    // Check if the problematic user_id exists anywhere
    console.log('1. Checking for problematic user_id 60885e29-e0e9-45f6-9161-ac564e69609d...');
    
    // Check bls_results
    const { data: blsCheck, error: blsCheckError } = await supabase
      .from('bls_results')
      .select('id, user_id, participant_name')
      .eq('user_id', '60885e29-e0e9-45f6-9161-ac564e69609d');

    if (blsCheckError) {
      console.error('❌ Error checking bls_results:', blsCheckError);
    } else {
      console.log(`bls_results: ${blsCheck.length} records found`);
    }

    // Check profiles
    const { data: profileCheck, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('id', '60885e29-e0e9-45f6-9161-ac564e69609d');

    if (profileCheckError) {
      console.error('❌ Error checking profiles:', profileCheckError);
    } else {
      console.log(`profiles: ${profileCheck.length} records found`);
    }

    // Check quiz_sessions
    const { data: quizCheck, error: quizCheckError } = await supabase
      .from('quiz_sessions')
      .select('id, user_id, participant_name')
      .eq('user_id', '60885e29-e0e9-45f6-9161-ac564e69609d');

    if (quizCheckError) {
      console.error('❌ Error checking quiz_sessions:', quizCheckError);
    } else {
      console.log(`quiz_sessions: ${quizCheck.length} records found`);
    }
    console.log('');

    // Test the exact query the app is making
    console.log('2. Testing app query with admin user context...');
    
    // Simulate admin user query
    const { data: adminBlsResults, error: adminBlsError } = await supabase
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

    if (adminBlsError) {
      console.error('❌ Admin BLS query failed:', adminBlsError);
    } else {
      console.log(`✅ Admin BLS query successful: ${adminBlsResults.length} records`);
    }
    console.log('');

    // Test the profiles query that's failing
    console.log('3. Testing profiles query...');
    const userIds = [...new Set(adminBlsResults?.map(r => r.user_id) || [])];
    console.log(`Testing profiles query with ${userIds.length} user_ids...`);
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, jawatan, role')
      .in('id', userIds);

    if (profilesError) {
      console.error('❌ Profiles query failed:', profilesError);
      console.log('This is the error causing the 406!');
      
      // Check which specific user_id is causing the issue
      console.log('\n4. Checking individual user_ids...');
      for (let i = 0; i < Math.min(10, userIds.length); i++) {
        const userId = userIds[i];
        const { data: singleProfile, error: singleProfileError } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', userId);
        
        if (singleProfileError) {
          console.log(`❌ Error with user_id ${userId}: ${singleProfileError.message}`);
        } else {
          console.log(`✅ Success with user_id ${userId}: ${singleProfile.length} records`);
        }
      }
    } else {
      console.log(`✅ Profiles query successful: ${profiles.length} records`);
    }
    console.log('');

    // Check if there are any RLS policies affecting the query
    console.log('5. Checking for potential RLS issues...');
    
    // Try a simple query to see if RLS is blocking
    const { data: simpleBls, error: simpleBlsError } = await supabase
      .from('bls_results')
      .select('count(*)')
      .limit(1);

    if (simpleBlsError) {
      console.error('❌ Simple BLS query failed (possible RLS issue):', simpleBlsError);
    } else {
      console.log('✅ Simple BLS query works');
    }

    const { data: simpleProfiles, error: simpleProfilesError } = await supabase
      .from('profiles')
      .select('count(*)')
      .limit(1);

    if (simpleProfilesError) {
      console.error('❌ Simple profiles query failed (possible RLS issue):', simpleProfilesError);
    } else {
      console.log('✅ Simple profiles query works');
    }
    console.log('');

    // Check if the issue is with the order by clause
    console.log('6. Testing without order by clause...');
    const { data: noOrderResults, error: noOrderError } = await supabase
      .from('bls_results')
      .select('id, user_id, participant_name, created_at')
      .limit(10);

    if (noOrderError) {
      console.error('❌ Query without order by failed:', noOrderError);
    } else {
      console.log(`✅ Query without order by works: ${noOrderResults.length} records`);
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
debugAppIssue();

