// Fix Jawatan Data in BLS Results Table
// This script updates existing BLS results with jawatan data from profiles

import supabase from './services/supabase.js';

async function fixJawatanData() {
  console.log('🔧 Fixing Jawatan Data in BLS Results Table...\n');
  
  try {
    // 1. Check current state
    console.log('1️⃣ Checking current BLS results with missing jawatan...');
    const { data: blsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('id, user_id, jawatan, participant_name')
      .or('jawatan.is.null,jawatan.eq.Unknown Position');
    
    if (blsError) throw blsError;
    
    console.log(`Found ${blsResults.length} BLS results with missing jawatan data`);
    
    if (blsResults.length === 0) {
      console.log('✅ All BLS results already have jawatan data!');
      return;
    }
    
    // 2. Get user IDs that need updating
    const userIds = [...new Set(blsResults.map(r => r.user_id))];
    console.log(`\n2️⃣ Fetching profile data for ${userIds.length} users...`);
    
    // 3. Fetch profiles for these users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, jawatan, role')
      .in('id', userIds);
    
    if (profilesError) throw profilesError;
    
    console.log(`Found ${profiles.length} profiles`);
    
    // 4. Create profile map
    const profileMap = new Map();
    profiles.forEach(profile => {
      profileMap.set(profile.id, profile);
    });
    
    // 5. Update BLS results with jawatan data
    console.log('\n3️⃣ Updating BLS results with jawatan data...');
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const result of blsResults) {
      const profile = profileMap.get(result.user_id);
      
      if (!profile) {
        console.warn(`⚠️  No profile found for user ${result.user_id} (${result.participant_name})`);
        errorCount++;
        continue;
      }
      
      // Determine jawatan from profile data
      const jawatan = profile.jawatan || 'Unknown Position';
      
      // Update the BLS result
      const { error: updateError } = await supabase
        .from('bls_results')
        .update({ jawatan: jawatan })
        .eq('id', result.id);
      
      if (updateError) {
        console.error(`❌ Failed to update BLS result ${result.id}:`, updateError);
        errorCount++;
      } else {
        console.log(`✅ Updated ${result.participant_name}: ${jawatan}`);
        updatedCount++;
      }
    }
    
    // 6. Summary
    console.log('\n📊 UPDATE SUMMARY');
    console.log('=' * 30);
    console.log(`✅ Successfully updated: ${updatedCount} records`);
    console.log(`❌ Failed to update: ${errorCount} records`);
    console.log(`📝 Total processed: ${blsResults.length} records`);
    
    // 7. Verify the fix
    console.log('\n4️⃣ Verifying the fix...');
    const { data: verifyResults, error: verifyError } = await supabase
      .from('bls_results')
      .select('id, jawatan')
      .or('jawatan.is.null,jawatan.eq.Unknown Position');
    
    if (verifyError) throw verifyError;
    
    if (verifyResults.length === 0) {
      console.log('🎉 All BLS results now have jawatan data!');
    } else {
      console.log(`⚠️  Still ${verifyResults.length} records without proper jawatan data`);
    }
    
  } catch (error) {
    console.error('❌ Error fixing jawatan data:', error);
  }
}

// Run the fix
fixJawatanData();
