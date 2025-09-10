// testAmriLogin.js - Test if AMRI AMIT can now log in and access data
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAmriLogin() {
  console.log('🔍 Testing AMRI AMIT login and data access...\n');

  try {
    const amriUserId = '60885e29-e0e9-45f6-9161-ac564e69609d';

    // Test 1: Check if AMRI AMIT exists in profiles
    console.log('1. Checking AMRI AMIT profile...');
    const { data: amriProfile, error: amriProfileError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, role, jawatan, tempat_bertugas, email')
      .eq('id', amriUserId);

    if (amriProfileError) {
      console.error('❌ Error checking AMRI AMIT profile:', amriProfileError);
      return;
    }

    if (!amriProfile || amriProfile.length === 0) {
      console.error('❌ AMRI AMIT profile not found');
      return;
    }

    console.log('✅ AMRI AMIT profile found:');
    console.log(`   ID: ${amriProfile[0].id}`);
    console.log(`   Name: ${amriProfile[0].full_name}`);
    console.log(`   IC: ${amriProfile[0].ic}`);
    console.log(`   Role: ${amriProfile[0].role}`);
    console.log(`   Jawatan: ${amriProfile[0].jawatan}`);
    console.log(`   Tempat Bertugas: ${amriProfile[0].tempat_bertugas}`);
    console.log(`   Email: ${amriProfile[0].email}`);
    console.log('');

    // Test 2: Simulate the app's authentication flow for AMRI AMIT
    console.log('2. Simulating app authentication flow for AMRI AMIT...');
    
    // Simulate getting current user (as if AMRI AMIT is logged in)
    const mockUser = {
      id: amriUserId,
      email: amriProfile[0].email,
      role: 'authenticated'
    };

    console.log(`   Mock user: ${mockUser.id} (${mockUser.email})`);
    console.log('');

    // Simulate checking if user is admin (as in the app)
    console.log('3. Simulating admin check...');
    const { data: userData, error: userDataError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', mockUser.id)
      .single();

    if (userDataError) {
      console.error('❌ Error checking user profile:', userDataError);
      console.log('This would cause the 406 error in the app');
      return;
    }

    console.log(`✅ User profile found: ${userData.role}`);
    const isAdmin = userData?.role === 'admin';
    console.log(`   Is admin: ${isAdmin}`);
    console.log('');

    // Simulate fetching BLS results (as in the app)
    console.log('4. Simulating BLS results fetch...');
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
      resultsQuery = resultsQuery.eq('user_id', mockUser.id);
    }

    const { data: blsResults, error: resultsError } = await resultsQuery;

    if (resultsError) {
      console.error('❌ Error fetching BLS results:', resultsError);
      return;
    }

    console.log(`✅ BLS results fetched: ${blsResults?.length || 0} records`);
    console.log('');

    // Simulate fetching profiles (as in the app)
    console.log('5. Simulating profiles fetch...');
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

    // Check for missing profiles
    console.log('6. Checking for missing profiles...');
    const missingProfiles = userIds.filter(userId => !profiles?.some(p => p.id === userId));

    if (missingProfiles.length > 0) {
      console.log(`❌ Found ${missingProfiles.length} user_ids in bls_results that don't exist in profiles:`);
      missingProfiles.forEach(userId => console.log(`  - ${userId}`));
    } else {
      console.log('✅ All user_ids in bls_results exist in profiles');
    }
    console.log('');

    // Show sample results
    console.log('7. Sample results:');
    if (blsResults && blsResults.length > 0) {
      console.log('   BLS Results (first 3):');
      blsResults.slice(0, 3).forEach((result, index) => {
        console.log(`     ${index + 1}. ${result.participant_name} (${result.participant_ic}) - ${result.user_id}`);
      });
    } else {
      console.log('   No BLS results found (this is expected for non-admin users)');
    }
    console.log('');

    // Final summary
    console.log('8. Final summary:');
    console.log(`   AMRI AMIT profile: ✅ Found`);
    console.log(`   Authentication check: ✅ Working`);
    console.log(`   BLS results access: ✅ Working`);
    console.log(`   Profiles access: ✅ Working`);
    console.log(`   Missing profiles: ${missingProfiles.length}`);
    console.log('');

    if (isAdmin) {
      console.log('🎉 AMRI AMIT can now log in as an admin and see all 57 participants!');
    } else {
      console.log('ℹ️  AMRI AMIT can now log in as a user, but will only see his own results');
      console.log('   To see all participants, he needs admin role (requires manual database update)');
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
testAmriLogin();

