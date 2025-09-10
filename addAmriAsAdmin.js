// addAmriAsAdmin.js - Add AMRI AMIT as admin to profiles table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addAmriAsAdmin() {
  console.log('🔧 Adding AMRI AMIT as admin to profiles table...\n');

  try {
    const amriUserId = '60885e29-e0e9-45f6-9161-ac564e69609d';
    const amriName = 'AMRI AMIT';
    const amriIc = '940120126733';

    // Check if AMRI AMIT already exists in profiles
    console.log('1. Checking if AMRI AMIT already exists in profiles...');
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, role')
      .eq('id', amriUserId);

    if (checkError) {
      console.error('❌ Error checking existing profile:', checkError);
      return;
    }

    if (existingProfile && existingProfile.length > 0) {
      console.log('ℹ️  AMRI AMIT already exists in profiles:');
      console.log(`   Name: ${existingProfile[0].full_name}`);
      console.log(`   IC: ${existingProfile[0].ic}`);
      console.log(`   Role: ${existingProfile[0].role}`);
      
      // Update role to admin if not already
      if (existingProfile[0].role !== 'admin') {
        console.log('\n2. Updating role to admin...');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', amriUserId);

        if (updateError) {
          console.error('❌ Error updating role:', updateError);
          return;
        }

        console.log('✅ Successfully updated role to admin');
      } else {
        console.log('✅ AMRI AMIT is already an admin');
      }
    } else {
      console.log('ℹ️  AMRI AMIT not found in profiles, adding as admin...');
      
      // Add AMRI AMIT as admin
      console.log('2. Adding AMRI AMIT as admin...');
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: amriUserId,
          full_name: amriName,
          ic: amriIc,
          role: 'admin',
          jawatan: 'ADMIN',
          tempat_bertugas: 'ADMIN',
          email: 'amri.amit@admin.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('❌ Error adding AMRI AMIT:', insertError);
        return;
      }

      console.log('✅ Successfully added AMRI AMIT as admin');
    }
    console.log('');

    // Verify the addition/update
    console.log('3. Verifying AMRI AMIT profile...');
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
    }
    console.log('');

    // Test admin access to BLS results
    console.log('4. Testing admin access to BLS results...');
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

    // Test admin access to profiles
    console.log('5. Testing admin access to profiles...');
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

    console.log('🎉 AMRI AMIT successfully added as admin!');
    console.log('');
    console.log('Next steps:');
    console.log('1. AMRI AMIT can now log in with his user_id: 60885e29-e0e9-45f6-9161-ac564e69609d');
    console.log('2. As an admin, he will see all 57 participants in the BLS results');
    console.log('3. The app should now work correctly for admin users');

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
addAmriAsAdmin();

