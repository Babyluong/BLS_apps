const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Your Supabase credentials (from supabase.js)
const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkQuizScores() {
  try {
    console.log('🔍 Checking quiz_sessions table structure and data...\n');

    // 1. Check if score columns exist
    console.log('1. Checking table structure...');
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'quiz_sessions' });
    
    if (columnsError) {
      console.log('❌ Error checking table structure:', columnsError.message);
      console.log('Trying alternative approach...\n');
    } else {
      console.log('✅ Table columns:', columns);
    }

    // 2. Check current quiz sessions data
    console.log('\n2. Checking current quiz sessions data...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(10);

    if (sessionsError) {
      console.log('❌ Error fetching sessions:', sessionsError.message);
      return;
    }

    console.log(`Found ${sessions.length} quiz sessions:`);
    sessions.forEach((session, index) => {
      console.log(`\nSession ${index + 1}:`);
      console.log(`  ID: ${session.id}`);
      console.log(`  User ID: ${session.user_id}`);
      console.log(`  Quiz Key: ${session.quiz_key}`);
      console.log(`  Status: ${session.status}`);
      console.log(`  Score: ${session.score || 'NULL'}`);
      console.log(`  Total Questions: ${session.total_questions || 'NULL'}`);
      console.log(`  Percentage: ${session.percentage || 'NULL'}`);
      console.log(`  Updated At: ${session.updated_at}`);
    });

    // 3. Check specifically for pretest sessions
    console.log('\n3. Checking pretest sessions...');
    const { data: pretestSessions, error: pretestError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('quiz_key', 'pretest')
      .eq('status', 'submitted')
      .order('updated_at', { ascending: false });

    if (pretestError) {
      console.log('❌ Error fetching pretest sessions:', pretestError.message);
    } else {
      console.log(`Found ${pretestSessions.length} submitted pretest sessions:`);
      pretestSessions.forEach((session, index) => {
        console.log(`\nPretest Session ${index + 1}:`);
        console.log(`  User ID: ${session.user_id}`);
        console.log(`  Score: ${session.score || 'NULL'}`);
        console.log(`  Total Questions: ${session.total_questions || 'NULL'}`);
        console.log(`  Percentage: ${session.percentage || 'NULL'}`);
        console.log(`  Has Answers: ${session.answers ? 'Yes' : 'No'}`);
        if (session.answers) {
          const answerCount = Object.keys(session.answers).filter(key => key !== '_selected_set').length;
          console.log(`  Answer Count: ${answerCount}`);
        }
      });
    }

    // 4. Check if we need to run the migration
    console.log('\n4. Checking if migration is needed...');
    const hasScoreColumn = sessions.some(session => 'score' in session);
    const hasNullScores = sessions.some(session => session.score === null || session.score === undefined);
    
    console.log(`Has score column: ${hasScoreColumn}`);
    console.log(`Has null scores: ${hasNullScores}`);

    if (!hasScoreColumn) {
      console.log('❌ Score column does not exist. Migration needed.');
      console.log('Please run the add_quiz_score_columns.sql script in your Supabase dashboard.');
    } else if (hasNullScores) {
      console.log('⚠️  Score column exists but some records have null scores.');
      console.log('This might be why pretest scores show as N/A.');
    } else {
      console.log('✅ Score column exists and all records have scores.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the check
checkQuizScores();
