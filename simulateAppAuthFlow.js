// simulateAppAuthFlow.js - Simulate the exact authentication flow from the app
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function simulateAppAuthFlow() {
  console.log('🔍 Simulating the exact app authentication flow...\n');

  try {
    // Step 1: Simulate getting current user (as in the app)
    console.log('1. Simulating getCurrentUser()...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Error getting user:', userError);
      console.log('This would cause the app to show "User not logged in." error');
      return;
    }
    
    if (!user) {
      console.log('ℹ️  No user logged in - this would cause the app to show "User not logged in." error');
      return;
    }
    
    console.log(`✅ User logged in: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role || 'N/A'}`);
    console.log('');

    // Step 2: Simulate checking if user is admin (as in the app)
    console.log('2. Simulating admin check...');
    const { data: userData, error: userDataError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single();
    
    if (userDataError) {
      console.error('❌ Error checking user profile:', userDataError);
      console.log('This would cause the app to fail at the admin check step');
      return;
    }
    
    console.log(`✅ User profile found: ${userData.role}`);
    const isAdmin = userData?.role === 'admin';
    console.log(`   Is admin: ${isAdmin}`);
    console.log('');

    // Step 3: Simulate fetching BLS results (as in the app)
    console.log('3. Simulating BLS results fetch...');
    let resultsQuery = supabase
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

    if (!isAdmin) {
      resultsQuery = resultsQuery.eq('user_id', user.id);
    }

    const { data: blsResults, error: resultsError } = await resultsQuery;
    
    if (resultsError) {
      console.error('❌ Error fetching BLS results:', resultsError);
      return;
    }
    
    console.log(`✅ BLS results fetched: ${blsResults?.length || 0} records`);
    console.log('');

    // Step 4: Simulate fetching profiles (as in the app)
    console.log('4. Simulating profiles fetch...');
    const userIds = [...new Set(blsResults?.map(r => r.user_id) || [])];
    console.log(`   User IDs to fetch: ${userIds.length}`);
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, jawatan, role')
      .in('id', userIds);
    
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      console.log('This would cause the 406 error in the app');
      return;
    }
    
    console.log(`✅ Profiles fetched: ${profiles?.length || 0} records`);
    console.log('');

    // Step 5: Check for missing profiles
    console.log('5. Checking for missing profiles...');
    const missingProfiles = userIds.filter(userId => !profiles?.some(p => p.id === userId));
    
    if (missingProfiles.length > 0) {
      console.log(`❌ Found ${missingProfiles.length} user_ids in bls_results that don't exist in profiles:`);
      missingProfiles.forEach(userId => console.log(`  - ${userId}`));
    } else {
      console.log('✅ All user_ids in bls_results exist in profiles');
    }
    console.log('');

    // Step 6: Show final results
    console.log('6. Final results:');
    console.log(`   BLS Results: ${blsResults?.length || 0} records`);
    console.log(`   Profiles: ${profiles?.length || 0} records`);
    console.log(`   Missing Profiles: ${missingProfiles.length} records`);
    
    if (blsResults && blsResults.length > 0) {
      console.log('\n   Sample BLS Results:');
      blsResults.slice(0, 3).forEach((result, index) => {
        console.log(`     ${index + 1}. ${result.participant_name} (${result.participant_ic}) - ${result.user_id}`);
      });
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
simulateAppAuthFlow();

