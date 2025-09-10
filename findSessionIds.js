const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials (from supabase.js)
const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function findSessionIds() {
  try {
    console.log('🔍 Finding quiz session IDs...\n');

    // Step 1: Check if migration has been run
    console.log('1. Checking if migration has been run...');
    const { data: sampleSession, error: sampleError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.log('❌ Error accessing quiz_sessions table:', sampleError.message);
      return;
    }

    if (!sampleSession || sampleSession.length === 0) {
      console.log('⚠️  No quiz sessions found in database');
      return;
    }

    const hasScoreColumn = 'score' in sampleSession[0];
    console.log(`Migration status: ${hasScoreColumn ? '✅ COMPLETED' : '❌ NOT RUN'}`);

    if (!hasScoreColumn) {
      console.log('\n⚠️  MIGRATION NEEDED - Please run this SQL first:');
      console.log(`
ALTER TABLE quiz_sessions 
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS percentage INTEGER DEFAULT 0;
      `);
      return;
    }

    // Step 2: Find all submitted quiz sessions
    console.log('\n2. Finding submitted quiz sessions...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('quiz_sessions')
      .select('id, quiz_key, status, score, total_questions, percentage, updated_at, user_id')
      .eq('status', 'submitted')
      .in('quiz_key', ['pretest', 'posttest'])
      .order('updated_at', { ascending: false });

    if (sessionsError) {
      console.log('❌ Error fetching sessions:', sessionsError.message);
      return;
    }

    console.log(`Found ${sessions.length} submitted quiz sessions\n`);

    if (sessions.length === 0) {
      console.log('⚠️  No submitted quiz sessions found');
      return;
    }

    // Step 3: Display sessions
    console.log('📋 Quiz Sessions:');
    console.log('================');
    sessions.forEach((session, index) => {
      console.log(`${index + 1}. ID: ${session.id}`);
      console.log(`   Quiz: ${session.quiz_key}`);
      console.log(`   Status: ${session.status}`);
      console.log(`   Score: ${session.score || 'NULL'}/${session.total_questions || 'NULL'} (${session.percentage || 'NULL'}%)`);
      console.log(`   Updated: ${session.updated_at}`);
      console.log(`   User ID: ${session.user_id}`);
      console.log('');
    });

    // Step 4: Generate update commands for sessions with missing scores
    const sessionsWithMissingScores = sessions.filter(session => 
      session.score === null || session.score === undefined || session.score === 0
    );

    if (sessionsWithMissingScores.length > 0) {
      console.log('🔧 Sessions that need score updates:');
      console.log('=====================================');
      
      sessionsWithMissingScores.forEach((session, index) => {
        console.log(`-- Update session ${index + 1} (${session.quiz_key})`);
        console.log(`UPDATE quiz_sessions`);
        console.log(`SET score = 0, total_questions = 30, percentage = 0`);
        console.log(`WHERE id = '${session.id}';`);
        console.log('');
      });

      console.log('📝 Instructions:');
      console.log('1. Copy the UPDATE commands above');
      console.log('2. Paste them into your Supabase SQL Editor');
      console.log('3. Modify the score values as needed');
      console.log('4. Run the commands');
    } else {
      console.log('✅ All sessions already have scores!');
    }

    // Step 5: Show sample data
    console.log('\n📊 Sample data after potential updates:');
    console.log('=====================================');
    sessions.slice(0, 3).forEach(session => {
      console.log(`${session.quiz_key}: ${session.score || 'NULL'}/${session.total_questions || 'NULL'} (${session.percentage || 'NULL'}%)`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
findSessionIds();
