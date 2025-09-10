// debugAppQuery.js - Debug the exact query the app is making
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAppQuery() {
  console.log('🔍 Debugging the exact app query...\n');

  try {
    // Step 1: Test the BLS results query (this should work)
    console.log('1. Testing BLS results query...');
    const { data: blsResults, error: blsError } = await supabase
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

    if (blsError) {
      console.error('❌ BLS results query failed:', blsError);
      return;
    }

    console.log(`✅ BLS results query successful: ${blsResults.length} records`);
    console.log('');

    // Step 2: Get user_ids from BLS results
    const userIds = [...new Set(blsResults.map(r => r.user_id))];
    console.log(`2. Found ${userIds.length} unique user_ids in BLS results`);
    console.log('First 5 user_ids:', userIds.slice(0, 5));
    console.log('');

    // Step 3: Test the profiles query with these user_ids
    console.log('3. Testing profiles query with BLS user_ids...');
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
      return;
    }

    console.log(`✅ Profiles query successful: ${profiles.length} records`);
    console.log('');

    // Step 4: Check if all user_ids exist in profiles
    console.log('4. Checking user_id consistency...');
    const missingProfiles = userIds.filter(userId => !profiles.some(p => p.id === userId));
    
    if (missingProfiles.length > 0) {
      console.log(`❌ Found ${missingProfiles.length} user_ids in bls_results that don't exist in profiles:`);
      missingProfiles.forEach(userId => console.log(`  - ${userId}`));
    } else {
      console.log('✅ All user_ids in bls_results exist in profiles');
    }
    console.log('');

    // Step 5: Test the exact query format from the error
    console.log('5. Testing the exact query format from the error...');
    const { data: testProfiles, error: testProfilesError } = await supabase
      .from('profiles')
      .select('id,role')
      .in('id', userIds);

    if (testProfilesError) {
      console.error('❌ Test profiles query failed:', testProfilesError);
    } else {
      console.log(`✅ Test profiles query successful: ${testProfiles.length} records`);
    }
    console.log('');

    // Step 6: Check if there are any problematic user_ids
    console.log('6. Checking for problematic user_ids...');
    const problematicUserIds = [
      '60885e29-e0e9-45f6-9161-ac564e69609d', // AMRI AMIT
      'cfd91af0-0181-4616-875b-a732691dadb7'  // NORLINA BINTI ALI
    ];

    for (const userId of problematicUserIds) {
      if (userIds.includes(userId)) {
        console.log(`❌ Found problematic user_id ${userId} in BLS results!`);
        
        // Check if this user_id exists in profiles
        const { data: checkProfile, error: checkProfileError } = await supabase
          .from('profiles')
          .select('id, full_name, role')
          .eq('id', userId);
        
        if (checkProfileError) {
          console.log(`  - Profile query failed: ${checkProfileError.message}`);
        } else {
          console.log(`  - Profile exists: ${checkProfile.length} records`);
          if (checkProfile.length > 0) {
            console.log(`  - Profile name: ${checkProfile[0].full_name}, Role: ${checkProfile[0].role}`);
          }
        }
      } else {
        console.log(`✅ User_id ${userId} not found in BLS results`);
      }
    }
    console.log('');

    // Step 7: Show sample data
    console.log('7. Sample data:');
    console.log('BLS Results (first 3):');
    blsResults.slice(0, 3).forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.participant_name} (${result.participant_ic}) - ${result.user_id}`);
    });
    
    console.log('\nProfiles (first 3):');
    profiles.slice(0, 3).forEach((profile, index) => {
      console.log(`  ${index + 1}. ${profile.id} - Role: ${profile.role}`);
    });

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
debugAppQuery();

