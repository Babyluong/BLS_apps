// checkRemainingAmriReferences.js - Check for any remaining references to AMRI AMIT's user_id
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ymajroaavaptafmoqciq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRemainingAmriReferences() {
  console.log('🔍 Checking for any remaining references to AMRI AMIT...\n');

  try {
    const amriUserId = '60885e29-e0e9-45f6-9161-ac564e69609d';

    // Check 1: bls_results table
    console.log('1. Checking bls_results table...');
    const { data: blsResults, error: blsError } = await supabase
      .from('bls_results')
      .select('id, user_id, participant_name, participant_ic')
      .eq('user_id', amriUserId);

    if (blsError) {
      console.error('❌ Error checking bls_results:', blsError);
    } else {
      console.log(`bls_results: ${blsResults.length} records found`);
      if (blsResults.length > 0) {
        blsResults.forEach((record, index) => {
          console.log(`  ${index + 1}. ID: ${record.id}, Name: ${record.participant_name}, IC: ${record.participant_ic}`);
        });
      }
    }
    console.log('');

    // Check 2: profiles table
    console.log('2. Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, ic, role')
      .eq('id', amriUserId);

    if (profilesError) {
      console.error('❌ Error checking profiles:', profilesError);
    } else {
      console.log(`profiles: ${profiles.length} records found`);
      if (profiles.length > 0) {
        profiles.forEach((record, index) => {
          console.log(`  ${index + 1}. Name: ${record.full_name}, IC: ${record.ic}, Role: ${record.role}`);
        });
      }
    }
    console.log('');

    // Check 3: quiz_sessions table
    console.log('3. Checking quiz_sessions table...');
    const { data: quizSessions, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('id, user_id, participant_name, participant_ic')
      .eq('user_id', amriUserId);

    if (quizError) {
      console.error('❌ Error checking quiz_sessions:', quizError);
    } else {
      console.log(`quiz_sessions: ${quizSessions.length} records found`);
      if (quizSessions.length > 0) {
        quizSessions.forEach((record, index) => {
          console.log(`  ${index + 1}. ID: ${record.id}, Name: ${record.participant_name}, IC: ${record.participant_ic}`);
        });
      }
    }
    console.log('');

    // Check 4: checklist_results table
    console.log('4. Checking checklist_results table...');
    const { data: checklistResults, error: checklistError } = await supabase
      .from('checklist_results')
      .select('id, user_id, participant_name, participant_ic')
      .eq('user_id', amriUserId);

    if (checklistError) {
      console.error('❌ Error checking checklist_results:', checklistError);
    } else {
      console.log(`checklist_results: ${checklistResults.length} records found`);
      if (checklistResults.length > 0) {
        checklistResults.forEach((record, index) => {
          console.log(`  ${index + 1}. ID: ${record.id}, Name: ${record.participant_name}, IC: ${record.participant_ic}`);
        });
      }
    }
    console.log('');

    // Check 5: Check if this user_id exists anywhere in the database
    console.log('5. Checking if user_id exists anywhere...');
    const { data: allBlsResults, error: allBlsError } = await supabase
      .from('bls_results')
      .select('user_id')
      .not('user_id', 'is', null);

    if (allBlsError) {
      console.error('❌ Error checking all bls_results:', allBlsError);
    } else {
      const allUserIds = [...new Set(allBlsResults.map(r => r.user_id))];
      const hasAmriUserId = allUserIds.includes(amriUserId);
      console.log(`AMRI AMIT's user_id found in bls_results: ${hasAmriUserId}`);
      
      if (hasAmriUserId) {
        console.log('❌ This is the problem! AMRI AMIT\'s user_id is still in bls_results');
      } else {
        console.log('✅ AMRI AMIT\'s user_id not found in bls_results');
      }
    }
    console.log('');

    // Check 6: Test the exact query that's failing
    console.log('6. Testing the exact failing query...');
    const { data: testProfile, error: testProfileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', amriUserId);

    if (testProfileError) {
      console.error('❌ Test profile query failed:', testProfileError);
      console.log('This is the exact error causing the 406!');
    } else {
      console.log(`✅ Test profile query successful: ${testProfile.length} records`);
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the script
checkRemainingAmriReferences();

