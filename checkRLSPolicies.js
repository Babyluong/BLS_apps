// checkRLSPolicies.js - Check if there are RLS policies blocking access
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLSPolicies() {
  console.log('🔍 Checking RLS policies and access issues...\n');

  try {
    // Test 1: Check if we can access bls_results with different contexts
    console.log('1. Testing bls_results access with different contexts...');
    
    // Test as anonymous user
    const { data: anonymousBlsResults, error: anonymousBlsError } = await supabase
      .from('bls_results')
      .select('id, user_id, participant_name')
      .limit(5);

    if (anonymousBlsError) {
      console.error('❌ Anonymous bls_results query failed:', anonymousBlsError);
    } else {
      console.log(`✅ Anonymous bls_results query successful: ${anonymousBlsResults.length} records`);
    }
    console.log('');

    // Test 2: Check if there's a specific issue with the order by clause
    console.log('2. Testing with different order by clauses...');
    
    // Test with created_at ascending
    const { data: ascBlsResults, error: ascBlsError } = await supabase
      .from('bls_results')
      .select('id, user_id, participant_name, created_at')
      .order('created_at', { ascending: true })
      .limit(5);

    if (ascBlsError) {
      console.error('❌ ASC bls_results query failed:', ascBlsError);
    } else {
      console.log(`✅ ASC bls_results query successful: ${ascBlsResults.length} records`);
    }

    // Test with created_at descending
    const { data: descBlsResults, error: descBlsError } = await supabase
      .from('bls_results')
      .select('id, user_id, participant_name, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (descBlsError) {
      console.error('❌ DESC bls_results query failed:', descBlsError);
    } else {
      console.log(`✅ DESC bls_results query successful: ${descBlsResults.length} records`);
    }
    console.log('');

    // Test 3: Check if there's a specific issue with the select clause
    console.log('3. Testing with different select clauses...');
    
    // Test with minimal select
    const { data: minimalBlsResults, error: minimalBlsError } = await supabase
      .from('bls_results')
      .select('id, user_id')
      .limit(5);

    if (minimalBlsError) {
      console.error('❌ Minimal bls_results query failed:', minimalBlsError);
    } else {
      console.log(`✅ Minimal bls_results query successful: ${minimalBlsResults.length} records`);
    }

    // Test with full select (as in the app)
    const { data: fullBlsResults, error: fullBlsError } = await supabase
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
      .limit(5);

    if (fullBlsError) {
      console.error('❌ Full bls_results query failed:', fullBlsError);
    } else {
      console.log(`✅ Full bls_results query successful: ${fullBlsResults.length} records`);
    }
    console.log('');

    // Test 4: Check if there's a specific issue with the created_at column
    console.log('4. Testing created_at column...');
    
    // Test if created_at column exists and is accessible
    const { data: createdAtBlsResults, error: createdAtBlsError } = await supabase
      .from('bls_results')
      .select('id, user_id, created_at')
      .limit(5);

    if (createdAtBlsError) {
      console.error('❌ Created_at bls_results query failed:', createdAtBlsError);
    } else {
      console.log(`✅ Created_at bls_results query successful: ${createdAtBlsResults.length} records`);
    }
    console.log('');

    // Test 5: Check if there's a specific issue with the updated_at column
    console.log('5. Testing updated_at column...');
    
    // Test if updated_at column exists and is accessible
    const { data: updatedAtBlsResults, error: updatedAtBlsError } = await supabase
      .from('bls_results')
      .select('id, user_id, updated_at')
      .limit(5);

    if (updatedAtBlsError) {
      console.error('❌ Updated_at bls_results query failed:', updatedAtBlsError);
    } else {
      console.log(`✅ Updated_at bls_results query successful: ${updatedAtBlsResults.length} records`);
    }
    console.log('');

    // Test 6: Check if there's a specific issue with the checklist details columns
    console.log('6. Testing checklist details columns...');
    
    // Test if checklist details columns exist and are accessible
    const { data: checklistDetailsBlsResults, error: checklistDetailsBlsError } = await supabase
      .from('bls_results')
      .select('id, user_id, one_man_cpr_details, two_man_cpr_details')
      .limit(5);

    if (checklistDetailsBlsError) {
      console.error('❌ Checklist details bls_results query failed:', checklistDetailsBlsError);
    } else {
      console.log(`✅ Checklist details bls_results query successful: ${checklistDetailsBlsResults.length} records`);
    }
    console.log('');

    // Test 7: Check if there's a specific issue with the checklist pass columns
    console.log('7. Testing checklist pass columns...');
    
    // Test if checklist pass columns exist and are accessible
    const { data: checklistPassBlsResults, error: checklistPassBlsError } = await supabase
      .from('bls_results')
      .select('id, user_id, one_man_cpr_pass, two_man_cpr_pass')
      .limit(5);

    if (checklistPassBlsError) {
      console.error('❌ Checklist pass bls_results query failed:', checklistPassBlsError);
    } else {
      console.log(`✅ Checklist pass bls_results query successful: ${checklistPassBlsResults.length} records`);
    }
    console.log('');

    // Test 8: Check if there's a specific issue with the quiz score columns
    console.log('8. Testing quiz score columns...');
    
    // Test if quiz score columns exist and are accessible
    const { data: quizScoreBlsResults, error: quizScoreBlsError } = await supabase
      .from('bls_results')
      .select('id, user_id, pre_test_score, post_test_score')
      .limit(5);

    if (quizScoreBlsError) {
      console.error('❌ Quiz score bls_results query failed:', quizScoreBlsError);
    } else {
      console.log(`✅ Quiz score bls_results query successful: ${quizScoreBlsResults.length} records`);
    }
    console.log('');

    // Test 9: Check if there's a specific issue with the participant columns
    console.log('9. Testing participant columns...');
    
    // Test if participant columns exist and are accessible
    const { data: participantBlsResults, error: participantBlsError } = await supabase
      .from('bls_results')
      .select('id, user_id, participant_name, participant_ic')
      .limit(5);

    if (participantBlsError) {
      console.error('❌ Participant bls_results query failed:', participantBlsError);
    } else {
      console.log(`✅ Participant bls_results query successful: ${participantBlsResults.length} records`);
    }
    console.log('');

    // Test 10: Check if there's a specific issue with the full query
    console.log('10. Testing full query (exactly as in the app)...');
    
    // Test the exact query from the app
    const { data: appBlsResults, error: appBlsError } = await supabase
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

    if (appBlsError) {
      console.error('❌ App bls_results query failed:', appBlsError);
    } else {
      console.log(`✅ App bls_results query successful: ${appBlsResults.length} records`);
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
checkRLSPolicies();

