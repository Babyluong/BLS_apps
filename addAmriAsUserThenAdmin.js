// addAmriAsUserThenAdmin.js - Add AMRI AMIT as user first, then update to admin
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addAmriAsUserThenAdmin() {
  console.log('🔧 Adding AMRI AMIT as user first, then updating to admin...\n');

  try {
    const amriUserId = '60885e29-e0e9-45f6-9161-ac564e69609d';
    const amriName = 'AMRI AMIT';
    const amriIc = '940120126733';

    // Step 1: Add AMRI AMIT as a regular user first
    console.log('1. Adding AMRI AMIT as regular user...');
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: amriUserId,
        full_name: amriName,
        ic: amriIc,
        role: 'user',
        jawatan: 'ADMIN',
        tempat_bertugas: 'ADMIN',
        email: 'amri.amit@admin.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('❌ Error adding AMRI AMIT as user:', insertError);
      return;
    }

    console.log('✅ Successfully added AMRI AMIT as user');
    console.log('');

    // Step 2: Verify the addition
    console.log('2. Verifying AMRI AMIT profile...');
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, role, jawatan, tempat_bertugas, email')
      .eq('id', amriUserId);

    if (verifyError) {
      console.error('❌ Error verifying profile:', verifyError);
      return;
    }

    if (verifyProfile && verifyProfile.length > 0) {
      console.log('✅ AMRI AMIT profile verified:');
      console.log(`   ID: ${verifyProfile[0].id}`);
      console.log(`   Name: ${verifyProfile[0].full_name}`);
      console.log(`   IC: ${verifyProfile[0].ic}`);
      console.log(`   Role: ${verifyProfile[0].role}`);
      console.log(`   Jawatan: ${verifyProfile[0].jawatan}`);
      console.log(`   Tempat Bertugas: ${verifyProfile[0].tempat_bertugas}`);
      console.log(`   Email: ${verifyProfile[0].email}`);
    } else {
      console.log('❌ AMRI AMIT profile not found after addition');
      return;
    }
    console.log('');

    // Step 3: Try to update role to admin (this might fail due to RLS)
    console.log('3. Attempting to update role to admin...');
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', amriUserId);

    if (updateError) {
      console.log('⚠️  Could not update role to admin due to RLS policy:', updateError.message);
      console.log('   AMRI AMIT is added as a user, but role update requires admin privileges');
      console.log('   This is expected behavior for security reasons');
    } else {
      console.log('✅ Successfully updated role to admin');
    }
    console.log('');

    // Step 4: Test access to BLS results
    console.log('4. Testing access to BLS results...');
    const { data: adminBlsResults, error: adminBlsError } = await supabase
      .from('bls_results')
      .select('id, user_id, participant_name, participant_ic')
      .limit(5);

    if (adminBlsError) {
      console.error('❌ Error accessing BLS results:', adminBlsError);
    } else {
      console.log(`✅ Successfully accessed BLS results: ${adminBlsResults.length} records`);
    }
    console.log('');

    // Step 5: Test access to profiles
    console.log('5. Testing access to profiles...');
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

    // Step 6: Check final counts
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

    console.log('🎉 AMRI AMIT successfully added to profiles!');
    console.log('');
    console.log('Status:');
    console.log('- AMRI AMIT is now in the profiles table as a user');
    console.log('- He can now log in with his user_id: 60885e29-e0e9-45f6-9161-ac564e69609d');
    console.log('- The app should now work correctly for him');
    console.log('');
    console.log('Note: To make him an admin, you may need to:');
    console.log('1. Log in as an existing admin user');
    console.log('2. Update his role to admin through the admin interface');
    console.log('3. Or manually update the database with admin privileges');

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
addAmriAsUserThenAdmin();

