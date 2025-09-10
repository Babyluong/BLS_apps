// checkExistingTables.js
// Check what tables exist in the database

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkExistingTables() {
  try {
    console.log('🔍 Checking existing tables...\n');

    // Check quiz_sessions table
    console.log('1. Checking quiz_sessions table...');
    const { data: quizData, error: quizError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .limit(1);

    if (quizError) {
      console.log('❌ quiz_sessions error:', quizError.message);
    } else {
      console.log('✅ quiz_sessions exists');
      if (quizData && quizData.length > 0) {
        console.log('Columns:', Object.keys(quizData[0]));
        console.log('Sample data:', {
          id: quizData[0].id,
          user_id: quizData[0].user_id,
          quiz_key: quizData[0].quiz_key,
          status: quizData[0].status,
          score: quizData[0].score,
          participant_name: quizData[0].participant_name,
          participant_ic: quizData[0].participant_ic
        });
      }
    }

    // Check checklist_results table
    console.log('\n2. Checking checklist_results table...');
    const { data: checklistData, error: checklistError } = await supabase
      .from('checklist_results')
      .select('*')
      .limit(1);

    if (checklistError) {
      console.log('❌ checklist_results error:', checklistError.message);
    } else {
      console.log('✅ checklist_results exists');
      if (checklistData && checklistData.length > 0) {
        console.log('Columns:', Object.keys(checklistData[0]));
        console.log('Sample data:', {
          id: checklistData[0].id,
          user_id: checklistData[0].user_id,
          checklist_type: checklistData[0].checklist_type,
          status: checklistData[0].status,
          score: checklistData[0].score,
          participant_name: checklistData[0].participant_name,
          participant_ic: checklistData[0].participant_ic
        });
      }
    }

    // Check if bls_results table exists (with 's')
    console.log('\n3. Checking bls_results table (with s)...');
    const { data: blsData, error: blsError } = await supabase
      .from('bls_results')
      .select('*')
      .limit(1);

    if (blsError) {
      console.log('❌ bls_results error:', blsError.message);
    } else {
      console.log('✅ bls_results exists');
      if (blsData && blsData.length > 0) {
        console.log('Columns:', Object.keys(blsData[0]));
      }
    }

  } catch (error) {
    console.error('❌ Error checking tables:', error);
  }
}

checkExistingTables();

