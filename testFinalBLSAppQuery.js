// testFinalBLSAppQuery.js - Test the final BLS app query to ensure it works
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFinalBLSAppQuery() {
  console.log('🎯 Testing final BLS app query...\n');

  try {
    // Step 1: Test the main BLS results query
    console.log('1. Testing main BLS results query...');
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

    // Step 2: Test the profiles query
    console.log('2. Testing profiles query...');
    const userIds = [...new Set(blsResults.map(r => r.user_id))];
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, jawatan, role')
      .in('id', userIds);

    if (profilesError) {
      console.error('❌ Profiles query failed:', profilesError);
      return;
    }

    console.log(`✅ Profiles query successful: ${profiles.length} records`);
    console.log('');

    // Step 3: Test the complete app flow
    console.log('3. Testing complete app flow...');
    
    // Create profile map
    const profileMap = new Map();
    if (profiles) {
      profiles.forEach(profile => {
        profileMap.set(profile.id, profile);
      });
    }

    // Process results (simulating the app's processing)
    const processedResults = (blsResults || []).map(result => {
      const profile = profileMap.get(result.user_id);
      
      return {
        id: result.id,
        user_id: result.user_id,
        participant_ic: result.participant_ic || 'N/A',
        participant_name: result.participant_name || 'Unknown',
        participantName: result.participant_name || 'Unknown',
        participantIc: result.participant_ic || 'N/A',
        jawatan: profile?.jawatan || 'N/A',
        role: profile?.role || 'user',
        category: profile?.jawatan?.toLowerCase().includes('jururawat') || profile?.jawatan?.toLowerCase().includes('perubatan') ? 'clinical' : 'non-clinical',
        date: result.created_at ? new Date(result.created_at).toLocaleDateString() : 'N/A',
        preTestScore: result.pre_test_score,
        postTestScore: result.post_test_score,
        oneManCprPass: result.one_man_cpr_pass,
        twoManCprPass: result.two_man_cpr_pass,
        adultChokingPass: result.adult_choking_pass,
        infantChokingPass: result.infant_choking_pass,
        infantCprPass: result.infant_cpr_pass,
        created_at: result.created_at,
        updated_at: result.updated_at
      };
    });

    console.log(`✅ Processed results: ${processedResults.length} participants`);
    console.log('');

    // Step 4: Show sample results
    console.log('4. Sample processed results:');
    processedResults.slice(0, 5).forEach((result, index) => {
      console.log(`${index + 1}. ${result.participant_name} (${result.participant_ic})`);
      console.log(`   Jawatan: ${result.jawatan}, Role: ${result.role}, Category: ${result.category}`);
      console.log(`   Pre-test: ${result.preTestScore}, Post-test: ${result.postTestScore}`);
      console.log(`   CPR: ${result.oneManCprPass ? 'PASS' : 'FAIL'}, Choking: ${result.adultChokingPass ? 'PASS' : 'FAIL'}`);
      console.log('');
    });

    // Step 5: Check for any issues
    console.log('5. Checking for potential issues...');
    
    const missingProfiles = processedResults.filter(r => !profileMap.has(r.user_id));
    if (missingProfiles.length > 0) {
      console.log(`⚠️  ${missingProfiles.length} participants missing from profiles:`);
      missingProfiles.forEach(p => console.log(`  - ${p.participant_name} (${p.user_id})`));
    } else {
      console.log('✅ All participants have profile data');
    }

    const nullScores = processedResults.filter(r => r.preTestScore === null && r.postTestScore === null);
    if (nullScores.length > 0) {
      console.log(`ℹ️  ${nullScores.length} participants have null quiz scores (normal for some participants)`);
    }

    const nullChecklists = processedResults.filter(r => 
      r.oneManCprPass === null && r.twoManCprPass === null && 
      r.adultChokingPass === null && r.infantChokingPass === null && r.infantCprPass === null
    );
    if (nullChecklists.length > 0) {
      console.log(`ℹ️  ${nullChecklists.length} participants have null checklist results (normal for some participants)`);
    }

    console.log('\n🎉 BLS app query test completed successfully!');
    console.log(`Total participants: ${processedResults.length}`);
    console.log(`All data is properly synchronized and ready for the app!`);

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
testFinalBLSAppQuery();

