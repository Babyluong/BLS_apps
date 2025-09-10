// testBLSResultsScreen.js
// Test script to verify the updated BLS Results screen works with unified data

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBLSResultsScreen() {
  try {
    console.log('🧪 Testing BLS Results Screen with Unified Data...\n');

    // Test 1: Fetch unified BLS results (simulating the new loadResults function)
    console.log('1. Testing unified BLS results fetch...');
    const { data: blsResults, error: resultsError } = await supabase
      .from("bls_results")
      .select(`
        id,
        user_id,
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
      .order("created_at", { ascending: false })
      .limit(5);

    if (resultsError) {
      console.log('❌ Error fetching BLS results:', resultsError.message);
      return;
    }

    console.log(`✅ Fetched ${blsResults?.length || 0} BLS results`);

    // Test 2: Get user profiles
    console.log('\n2. Testing user profiles fetch...');
    const userIds = [...new Set(blsResults?.map(r => r.user_id) || [])];
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, ic, jawatan, role")
      .in("id", userIds);

    if (profilesError) {
      console.log('❌ Error fetching profiles:', profilesError.message);
      return;
    }

    console.log(`✅ Fetched ${profiles?.length || 0} profiles`);

    // Test 3: Process results (simulating the new data processing)
    console.log('\n3. Testing data processing...');
    const profileMap = new Map();
    if (profiles) {
      profiles.forEach(profile => {
        profileMap.set(profile.id, profile);
      });
    }

    const processedResults = (blsResults || []).map(result => {
      const profile = profileMap.get(result.user_id);
      
      return {
        id: result.id,
        user_id: result.user_id,
        participant_ic: profile?.ic || 'N/A',
        participant_name: profile?.full_name || 'Unknown',
        jawatan: profile?.jawatan || 'N/A',
        role: profile?.role || 'user',
        
        // Pre-test data
        pretest: result.pre_test_score !== null ? {
          score: result.pre_test_score,
          percentage: Math.round((result.pre_test_score / 30) * 100),
          date: result.created_at
        } : null,
        
        // Post-test data
        posttest: result.post_test_score !== null ? {
          score: result.post_test_score,
          percentage: Math.round((result.post_test_score / 30) * 100),
          date: result.created_at
        } : null,
        
        // Checklist results
        one_man_cpr: result.one_man_cpr_pass !== null ? {
          score: result.one_man_cpr_pass ? 10 : 0,
          status: result.one_man_cpr_pass ? 'PASS' : 'FAIL',
          details: result.one_man_cpr_details,
          date: result.created_at
        } : null,
        
        two_man_cpr: result.two_man_cpr_pass !== null ? {
          score: result.two_man_cpr_pass ? 10 : 0,
          status: result.two_man_cpr_pass ? 'PASS' : 'FAIL',
          details: result.two_man_cpr_details,
          date: result.created_at
        } : null,
        
        adult_choking: result.adult_choking_pass !== null ? {
          score: result.adult_choking_pass ? 10 : 0,
          status: result.adult_choking_pass ? 'PASS' : 'FAIL',
          details: result.adult_choking_details,
          date: result.created_at
        } : null,
        
        infant_choking: result.infant_choking_pass !== null ? {
          score: result.infant_choking_pass ? 10 : 0,
          status: result.infant_choking_pass ? 'PASS' : 'FAIL',
          details: result.infant_choking_details,
          date: result.created_at
        } : null,
        
        infant_cpr: result.infant_cpr_pass !== null ? {
          score: result.infant_cpr_pass ? 10 : 0,
          status: result.infant_cpr_pass ? 'PASS' : 'FAIL',
          details: result.infant_cpr_details,
          date: result.created_at
        } : null,
        
        // Metadata
        latest_date: result.updated_at || result.created_at,
        created_at: result.created_at,
        updated_at: result.updated_at
      };
    }).filter(result => result.role === 'user');

    console.log(`✅ Processed ${processedResults.length} results for user role participants`);

    // Test 4: Display sample processed results
    console.log('\n4. Sample processed results:');
    processedResults.slice(0, 3).forEach((result, index) => {
      console.log(`\nResult ${index + 1}:`);
      console.log(`  Participant: ${result.participant_name} (${result.participant_ic})`);
      console.log(`  Job Position: ${result.jawatan}`);
      console.log(`  Pre-test: ${result.pretest?.score || 'N/A'}/30 (${result.pretest?.percentage || 'N/A'}%)`);
      console.log(`  Post-test: ${result.posttest?.score || 'N/A'}/30 (${result.posttest?.percentage || 'N/A'}%)`);
      console.log(`  One-man CPR: ${result.one_man_cpr?.status || 'N/A'}`);
      console.log(`  Two-man CPR: ${result.two_man_cpr?.status || 'N/A'}`);
      console.log(`  Adult Choking: ${result.adult_choking?.status || 'N/A'}`);
      console.log(`  Infant Choking: ${result.infant_choking?.status || 'N/A'}`);
      console.log(`  Infant CPR: ${result.infant_cpr?.status || 'N/A'}`);
    });

    // Test 5: Test filtering functionality
    console.log('\n5. Testing filtering functionality...');
    
    // Test search filter
    const searchQuery = 'test';
    const searchFiltered = processedResults.filter(result =>
      result.participant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.participant_ic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.jawatan?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    console.log(`Search filter "${searchQuery}": ${searchFiltered.length} results`);

    // Test pre-test pass filter
    const preTestPassFiltered = processedResults.filter(r => 
      r.pretest?.score !== null && r.pretest?.score >= 20
    );
    console.log(`Pre-test pass filter (≥20): ${preTestPassFiltered.length} results`);

    // Test post-test pass filter
    const postTestPassFiltered = processedResults.filter(r => 
      r.posttest?.score !== null && r.posttest?.score >= 20
    );
    console.log(`Post-test pass filter (≥20): ${postTestPassFiltered.length} results`);

    // Test certified filter
    const certifiedFiltered = processedResults.filter(r => {
      const hasPassingPostTest = r.posttest?.score >= 20;
      const hasAllChecklists = r.one_man_cpr?.status === 'PASS' && 
                             r.two_man_cpr?.status === 'PASS' && 
                             r.adult_choking?.status === 'PASS' && 
                             r.infant_choking?.status === 'PASS' && 
                             r.infant_cpr?.status === 'PASS';
      return hasPassingPostTest && hasAllChecklists;
    });
    console.log(`Certified filter: ${certifiedFiltered.length} results`);

    console.log('\n✅ All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Total BLS results: ${blsResults?.length || 0}`);
    console.log(`- User role participants: ${processedResults.length}`);
    console.log(`- Pre-test pass rate: ${((preTestPassFiltered.length / processedResults.length) * 100).toFixed(1)}%`);
    console.log(`- Post-test pass rate: ${((postTestPassFiltered.length / processedResults.length) * 100).toFixed(1)}%`);
    console.log(`- Certification rate: ${((certifiedFiltered.length / processedResults.length) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testBLSResultsScreen();

