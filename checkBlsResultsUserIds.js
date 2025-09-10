// checkBlsResultsUserIds.js - Check what user_ids exist in bls_results table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBlsResultsUserIds() {
  console.log('🔍 Checking user_ids in bls_results table...\n');

  try {
    // Get all bls_results
    console.log('1. Getting all bls_results...');
    const { data: allBlsResults, error: allBlsError } = await supabase
      .from('bls_results')
      .select('id, user_id, participant_name, participant_ic')
      .order('participant_name');

    if (allBlsError) {
      console.error('❌ Error getting bls_results:', allBlsError);
      return;
    }

    console.log(`✅ Found ${allBlsResults.length} bls_results`);
    console.log('');

    // Get all profiles
    console.log('2. Getting all profiles...');
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, role')
      .order('full_name');

    if (allProfilesError) {
      console.error('❌ Error getting profiles:', allProfilesError);
      return;
    }

    console.log(`✅ Found ${allProfiles.length} profiles`);
    console.log('');

    // Check for user_ids in bls_results that don't exist in profiles
    console.log('3. Checking for user_ids in bls_results that don\'t exist in profiles...');
    const blsUserIds = [...new Set(allBlsResults.map(r => r.user_id))];
    const profileUserIds = [...new Set(allProfiles.map(p => p.id))];
    
    const missingUserIds = blsUserIds.filter(userId => !profileUserIds.includes(userId));
    
    if (missingUserIds.length > 0) {
      console.log(`❌ Found ${missingUserIds.length} user_ids in bls_results that don't exist in profiles:`);
      missingUserIds.forEach(userId => {
        const blsRecords = allBlsResults.filter(r => r.user_id === userId);
        console.log(`  ${userId}: ${blsRecords.length} bls_results`);
        blsRecords.forEach((record, index) => {
          console.log(`    ${index + 1}. ${record.participant_name} (${record.participant_ic})`);
        });
      });
    } else {
      console.log('✅ All user_ids in bls_results exist in profiles');
    }
    console.log('');

    // Check for user_ids in profiles that don't exist in bls_results
    console.log('4. Checking for user_ids in profiles that don\'t exist in bls_results...');
    const missingBlsUserIds = profileUserIds.filter(userId => !blsUserIds.includes(userId));
    
    if (missingBlsUserIds.length > 0) {
      console.log(`ℹ️  Found ${missingBlsUserIds.length} user_ids in profiles that don't exist in bls_results:`);
      missingBlsUserIds.forEach(userId => {
        const profile = allProfiles.find(p => p.id === userId);
        if (profile) {
          console.log(`  ${userId}: ${profile.full_name} (${profile.role})`);
        }
      });
    } else {
      console.log('✅ All user_ids in profiles exist in bls_results');
    }
    console.log('');

    // Check for any problematic user_ids
    console.log('5. Checking for problematic user_ids...');
    const problematicUserIds = [
      '60885e29-e0e9-45f6-9161-ac564e69609d', // AMRI AMIT
      'cfd91af0-0181-4616-875b-a732691dadb7'  // NORLINA BINTI ALI
    ];

    problematicUserIds.forEach(userId => {
      const blsRecords = allBlsResults.filter(r => r.user_id === userId);
      const profile = allProfiles.find(p => p.id === userId);
      
      console.log(`User ID: ${userId}`);
      console.log(`  bls_results: ${blsRecords.length} records`);
      if (blsRecords.length > 0) {
        blsRecords.forEach((record, index) => {
          console.log(`    ${index + 1}. ${record.participant_name} (${record.participant_ic})`);
        });
      }
      console.log(`  profiles: ${profile ? 'Found' : 'Not found'}`);
      if (profile) {
        console.log(`    ${profile.full_name} (${profile.role})`);
      }
      console.log('');
    });

    // Show summary
    console.log('6. Summary:');
    console.log(`   bls_results: ${allBlsResults.length} records`);
    console.log(`   profiles: ${allProfiles.length} records`);
    console.log(`   Unique bls_results user_ids: ${blsUserIds.length}`);
    console.log(`   Unique profile user_ids: ${profileUserIds.length}`);
    console.log(`   Missing from profiles: ${missingUserIds.length}`);
    console.log(`   Missing from bls_results: ${missingBlsUserIds.length}`);

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
checkBlsResultsUserIds();

