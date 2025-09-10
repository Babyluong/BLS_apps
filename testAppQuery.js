// testAppQuery.js - Test the exact query the BLS app is making
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAppQuery() {
  console.log('🔍 Testing the exact BLS app query...\n');

  try {
    // Step 1: Get all user_ids from bls_results
    console.log('1. Getting all user_ids from bls_results...');
    const { data: blsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('user_id')
      .not('user_id', 'is', null);

    if (blsError) {
      console.error('❌ Error getting bls_results:', blsError);
      return;
    }

    const userIds = [...new Set(blsResults.map(r => r.user_id))];
    console.log(`Found ${userIds.length} unique user_ids in bls_results`);
    console.log('');

    // Step 2: Test the profiles query that's causing the 406 error
    console.log('2. Testing profiles query with all user_ids...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, jawatan, role')
      .in('id', userIds);

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      console.log('This is the error causing the 406!');
      
      // Let's try to identify which user_id is causing the issue
      console.log('\n3. Testing individual user_ids to find the problematic one...');
      
      for (let i = 0; i < Math.min(5, userIds.length); i++) {
        const userId = userIds[i];
        console.log(`Testing user_id ${i + 1}/${Math.min(5, userIds.length)}: ${userId}`);
        
        const { data: singleProfile, error: singleProfileError } = await supabase
          .from('profiles')
          .select('id, jawatan, role')
          .eq('id', userId);
        
        if (singleProfileError) {
          console.log(`❌ Error with user_id ${userId}: ${singleProfileError.message}`);
        } else {
          console.log(`✅ Success with user_id ${userId}: ${singleProfile.length} records`);
        }
      }
      
      return;
    }

    console.log(`✅ Profiles query successful: ${profiles.length} records found`);
    console.log('');

    // Step 3: Test the full app query
    console.log('3. Testing full app query...');
    const { data: appResults, error: appError } = await supabase
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

    if (appError) {
      console.error('❌ App query failed:', appError);
    } else {
      console.log(`✅ App query successful: ${appResults.length} records`);
      
      // Show sample results
      if (appResults.length > 0) {
        console.log('\nSample results:');
        appResults.slice(0, 3).forEach((result, index) => {
          console.log(`${index + 1}. ${result.participant_name} (${result.participant_ic})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
testAppQuery();

