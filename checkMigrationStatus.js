const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials (from supabase.js)
const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMigrationStatus() {
  try {
    console.log('🔍 Checking Quiz Score Migration Status...\n');

    // 1. Check if we can access the database
    console.log('1. Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('quiz_sessions')
      .select('id')
      .limit(1);

    if (testError) {
      console.log('❌ Cannot access quiz_sessions table:', testError.message);
      console.log('\nPossible causes:');
      console.log('- Wrong Supabase project URL or API key');
      console.log('- Database permissions issue');
      console.log('- Table does not exist');
      return;
    }

    console.log('✅ Database connection successful');

    // 2. Check if score columns exist
    console.log('\n2. Checking for score columns...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .limit(1);

    if (sessionsError) {
      console.log('❌ Error fetching sessions:', sessionsError.message);
      return;
    }

    if (sessions.length === 0) {
      console.log('⚠️  No quiz sessions found in database');
      console.log('This might mean:');
      console.log('- No quizzes have been taken yet');
      console.log('- Data is in a different environment');
      console.log('- Different Supabase project');
      return;
    }

    const sampleSession = sessions[0];
    const hasScoreColumn = 'score' in sampleSession;
    const hasTotalQuestionsColumn = 'total_questions' in sampleSession;
    const hasPercentageColumn = 'percentage' in sampleSession;

    console.log('Database schema check:');
    console.log(`  - score column: ${hasScoreColumn ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  - total_questions column: ${hasTotalQuestionsColumn ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  - percentage column: ${hasPercentageColumn ? '✅ EXISTS' : '❌ MISSING'}`);

    if (!hasScoreColumn || !hasTotalQuestionsColumn || !hasPercentageColumn) {
      console.log('\n❌ MIGRATION NEEDED');
      console.log('\nTo fix this issue:');
      console.log('1. Open your Supabase Dashboard');
      console.log('2. Go to SQL Editor');
      console.log('3. Run the migration script from database/add_quiz_score_columns.sql');
      console.log('4. Or copy and paste the SQL from QUIZ_SCORE_FIX_GUIDE.md');
      return;
    }

    // 3. Check for sessions with missing scores
    console.log('\n3. Checking for sessions with missing scores...');
    const { data: allSessions, error: allSessionsError } = await supabase
      .from('quiz_sessions')
      .select('id, quiz_key, status, score, total_questions, percentage')
      .eq('status', 'submitted');

    if (allSessionsError) {
      console.log('❌ Error fetching all sessions:', allSessionsError.message);
      return;
    }

    const sessionsWithMissingScores = allSessions.filter(session => 
      session.score === null || session.score === undefined || session.score === 0
    );

    console.log(`Found ${allSessions.length} submitted sessions`);
    console.log(`Sessions with missing scores: ${sessionsWithMissingScores.length}`);

    if (sessionsWithMissingScores.length > 0) {
      console.log('\n⚠️  SCORE CALCULATION NEEDED');
      console.log('\nTo fix this:');
      console.log('1. Run: node calculateAndUpdateScores.js');
      console.log('2. Or manually calculate scores in the database');
      console.log('\nSessions that need scores:');
      sessionsWithMissingScores.forEach((session, index) => {
        console.log(`  ${index + 1}. ${session.quiz_key} (ID: ${session.id})`);
      });
    } else {
      console.log('\n✅ ALL SESSIONS HAVE SCORES');
      console.log('The BLS Results screen should now display scores correctly.');
    }

    // 4. Show sample data
    console.log('\n4. Sample session data:');
    if (allSessions.length > 0) {
      const sample = allSessions[0];
      console.log(`  Quiz Key: ${sample.quiz_key}`);
      console.log(`  Status: ${sample.status}`);
      console.log(`  Score: ${sample.score || 'NULL'}`);
      console.log(`  Total Questions: ${sample.total_questions || 'NULL'}`);
      console.log(`  Percentage: ${sample.percentage || 'NULL'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the check
checkMigrationStatus();
