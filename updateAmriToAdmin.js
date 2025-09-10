// updateAmriToAdmin.js - Manually update AMRI AMIT's role to admin using SQL
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateAmriToAdmin() {
  console.log('🔧 Manually updating AMRI AMIT to admin role...\n');

  try {
    const amriUserId = '60885e29-e0e9-45f6-9161-ac564e69609d';

    // Check current profile
    console.log('1. Checking current AMRI AMIT profile...');
    const { data: currentProfile, error: currentError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, role, jawatan, tempat_bertugas, email')
      .eq('id', amriUserId);

    if (currentError) {
      console.error('❌ Error checking current profile:', currentError);
      return;
    }

    if (!currentProfile || currentProfile.length === 0) {
      console.error('❌ AMRI AMIT profile not found');
      return;
    }

    console.log('Current profile:');
    console.log(`   ID: ${currentProfile[0].id}`);
    console.log(`   Name: ${currentProfile[0].full_name}`);
    console.log(`   IC: ${currentProfile[0].ic}`);
    console.log(`   Role: ${currentProfile[0].role}`);
    console.log(`   Jawatan: ${currentProfile[0].jawatan}`);
    console.log(`   Tempat Bertugas: ${currentProfile[0].tempat_bertugas}`);
    console.log(`   Email: ${currentProfile[0].email}`);
    console.log('');

    // Try to update role to admin using RPC function
    console.log('2. Attempting to update role to admin using RPC...');
    const { data: rpcResult, error: rpcError } = await supabase.rpc('update_user_role', {
      user_id: amriUserId,
      new_role: 'admin'
    });

    if (rpcError) {
      console.log('⚠️  RPC function not available or failed:', rpcError.message);
      console.log('   Trying alternative approach...');
    } else {
      console.log('✅ Successfully updated role using RPC');
    }
    console.log('');

    // Try direct SQL update (this might work if we have the right permissions)
    console.log('3. Attempting direct SQL update...');
    const { data: sqlResult, error: sqlError } = await supabase
      .from('profiles')
      .update({ 
        role: 'admin',
        updated_at: new Date().toISOString()
      })
      .eq('id', amriUserId)
      .select();

    if (sqlError) {
      console.log('⚠️  Direct SQL update failed:', sqlError.message);
      console.log('   This is expected due to RLS policies');
    } else {
      console.log('✅ Successfully updated role using direct SQL');
      console.log('Updated profile:', sqlResult[0]);
    }
    console.log('');

    // Verify the update
    console.log('4. Verifying updated profile...');
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, role, jawatan, tempat_bertugas, email')
      .eq('id', amriUserId);

    if (verifyError) {
      console.error('❌ Error verifying profile:', verifyError);
      return;
    }

    if (verifyProfile && verifyProfile.length > 0) {
      console.log('Updated profile:');
      console.log(`   ID: ${verifyProfile[0].id}`);
      console.log(`   Name: ${verifyProfile[0].full_name}`);
      console.log(`   IC: ${verifyProfile[0].ic}`);
      console.log(`   Role: ${verifyProfile[0].role}`);
      console.log(`   Jawatan: ${verifyProfile[0].jawatan}`);
      console.log(`   Tempat Bertugas: ${verifyProfile[0].tempat_bertugas}`);
      console.log(`   Email: ${verifyProfile[0].email}`);
      
      if (verifyProfile[0].role === 'admin') {
        console.log('✅ AMRI AMIT is now an admin!');
      } else {
        console.log('⚠️  AMRI AMIT is still a user (role update may require admin privileges)');
      }
    } else {
      console.log('❌ AMRI AMIT profile not found after update');
    }
    console.log('');

    // Test admin access
    console.log('5. Testing admin access...');
    const { data: adminBlsResults, error: adminBlsError } = await supabase
      .from('bls_results')
      .select('id, user_id, participant_name, participant_ic')
      .limit(5);

    if (adminBlsError) {
      console.error('❌ Error accessing BLS results:', adminBlsError);
    } else {
      console.log(`✅ Successfully accessed BLS results: ${adminBlsResults.length} records`);
    }

    const { data: adminProfiles, error: adminProfilesError } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .limit(5);

    if (adminProfilesError) {
      console.error('❌ Error accessing profiles:', adminProfilesError);
    } else {
      console.log(`✅ Successfully accessed profiles: ${adminProfiles.length} records`);
    }
    console.log('');

    // Check final counts
    console.log('6. Final counts...');
    const { count: finalProfileCount, error: finalProfileCountError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: finalBlsCount, error: finalBlsCountError } = await supabase
      .from('bls_results')
      .select('*', { count: 'exact', head: true });

    if (finalProfileCountError || finalBlsCountError) {
      console.error('❌ Error getting final counts');
    } else {
      console.log(`Final profiles count: ${finalProfileCount}`);
      console.log(`Final BLS results count: ${finalBlsCount}`);
    }
    console.log('');

    console.log('🎉 AMRI AMIT profile update completed!');
    console.log('');
    console.log('Status:');
    console.log('- AMRI AMIT is in the profiles table');
    console.log('- He can now log in with his user_id: 60885e29-e0e9-45f6-9161-ac564e69609d');
    console.log('- The app should now work correctly for him');
    console.log('- If role is still "user", it may need to be updated manually in the database');

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
updateAmriToAdmin();

