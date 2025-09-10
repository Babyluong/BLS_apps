// checkParticipantCount.js - Check the current participant count and verify AWANGKU MOHAMAD ZULFAZLI
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkParticipantCount() {
  console.log('🔍 Checking current participant count and verifying AWANGKU MOHAMAD ZULFAZLI...\n');

  try {
    // Check profiles table
    console.log('1. Checking profiles table...');
    const { data: allProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, ic, full_name, role')
      .order('full_name');

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }

    console.log(`Total profiles: ${allProfiles.length}`);
    
    const userProfiles = allProfiles.filter(p => p.role === 'user');
    console.log(`User role profiles (participants): ${userProfiles.length}`);
    console.log('');

    // Check for AWANGKU MOHAMAD ZULFAZLI
    console.log('2. Checking for AWANGKU MOHAMAD ZULFAZLI...');
    const awangkuProfile = allProfiles.find(p => p.ic === '950821136503');
    
    if (awangkuProfile) {
      console.log('✅ Found AWANGKU MOHAMAD ZULFAZLI in profiles:');
      console.log(`- Name: ${awangkuProfile.full_name}`);
      console.log(`- IC: ${awangkuProfile.ic}`);
      console.log(`- User ID: ${awangkuProfile.id}`);
      console.log(`- Role: ${awangkuProfile.role}`);
      console.log('');
    } else {
      console.log('❌ AWANGKU MOHAMAD ZULFAZLI not found in profiles');
      console.log('');
    }

    // Check bls_results table
    console.log('3. Checking bls_results table...');
    const { data: blsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('user_id, participant_name, participant_ic')
      .order('participant_name');

    if (blsError) {
      console.error('❌ Error fetching bls_results:', blsError);
      return;
    }

    console.log(`Total bls_results: ${blsResults.length}`);
    
    const awangkuBlsResult = blsResults.find(r => r.participant_ic === '950821136503');
    if (awangkuBlsResult) {
      console.log('✅ Found AWANGKU MOHAMAD ZULFAZLI in bls_results:');
      console.log(`- Name: ${awangkuBlsResult.participant_name}`);
      console.log(`- IC: ${awangkuBlsResult.participant_ic}`);
      console.log(`- User ID: ${awangkuBlsResult.user_id}`);
      console.log('');
    } else {
      console.log('❌ AWANGKU MOHAMAD ZULFAZLI not found in bls_results');
      console.log('');
    }

    // Check if the user_id matches between profiles and bls_results
    if (awangkuProfile && awangkuBlsResult) {
      if (awangkuProfile.id === awangkuBlsResult.user_id) {
        console.log('✅ User ID matches between profiles and bls_results');
      } else {
        console.log('⚠️  User ID mismatch:');
        console.log(`- Profiles: ${awangkuProfile.id}`);
        console.log(`- bls_results: ${awangkuBlsResult.user_id}`);
      }
    }

    // Show all participants
    console.log('\n4. All participants:');
    userProfiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.full_name} (${profile.ic}) - ${profile.id}`);
    });

    // Check if we have exactly 57 participants
    if (userProfiles.length === 57) {
      console.log('\n🎉 Perfect! We have exactly 57 participants');
    } else if (userProfiles.length > 57) {
      console.log(`\n⚠️  We have ${userProfiles.length} participants (expected 57)`);
    } else {
      console.log(`\n⚠️  We have ${userProfiles.length} participants (expected 57) - missing ${57 - userProfiles.length}`);
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
checkParticipantCount();

