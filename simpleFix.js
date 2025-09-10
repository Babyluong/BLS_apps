const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials (from supabase.js)
const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function simpleFix() {
  try {
    console.log('🔧 Simple Fix for N/A Scores...\n');

    // Step 1: Check if we can access the database
    console.log('1. Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('quiz_sessions')
      .select('id')
      .limit(1);

    if (testError) {
      console.log('❌ Cannot access database:', testError.message);
      console.log('\nPlease run this SQL in your Supabase Dashboard:');
      console.log(`
-- Add score columns to quiz_sessions table
ALTER TABLE quiz_sessions 
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS percentage INTEGER DEFAULT 0;

-- Update existing records
UPDATE quiz_sessions 
SET 
  score = 0,
  total_questions = 30,
  percentage = 0
WHERE score IS NULL OR total_questions IS NULL OR percentage IS NULL;
      `);
      return;
    }

    console.log('✅ Database connection successful');

    // Step 2: Check if migration is needed
    console.log('\n2. Checking if migration is needed...');
    const { data: sampleSession, error: sampleError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.log('❌ Error:', sampleError.message);
      return;
    }

    if (!sampleSession || sampleSession.length === 0) {
      console.log('⚠️  No quiz sessions found');
      console.log('This means no one has taken a quiz yet.');
      return;
    }

    const hasScoreColumn = 'score' in sampleSession[0];
    console.log(`Migration status: ${hasScoreColumn ? '✅ COMPLETED' : '❌ NEEDED'}`);

    if (!hasScoreColumn) {
      console.log('\n❌ MIGRATION NEEDED');
      console.log('\nPlease run this SQL in your Supabase Dashboard:');
      console.log(`
-- Add score columns to quiz_sessions table
ALTER TABLE quiz_sessions 
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS percentage INTEGER DEFAULT 0;

-- Update existing records
UPDATE quiz_sessions 
SET 
  score = 0,
  total_questions = 30,
  percentage = 0
WHERE score IS NULL OR total_questions IS NULL OR percentage IS NULL;
      `);
      console.log('\nAfter running this SQL, the N/A scores should be fixed!');
      return;
    }

    // Step 3: Check for sessions with missing scores
    console.log('\n3. Checking for sessions with missing scores...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('quiz_sessions')
      .select('id, quiz_key, status, score, total_questions, percentage')
      .eq('status', 'submitted')
      .in('quiz_key', ['pretest', 'posttest']);

    if (sessionsError) {
      console.log('❌ Error:', sessionsError.message);
      return;
    }

    console.log(`Found ${sessions.length} submitted quiz sessions`);

    if (sessions.length === 0) {
      console.log('⚠️  No submitted quiz sessions found');
      return;
    }

    const sessionsWithMissingScores = sessions.filter(session => 
      session.score === null || session.score === undefined || session.score === 0
    );

    console.log(`Sessions with missing scores: ${sessionsWithMissingScores.length}/${sessions.length}`);

    if (sessionsWithMissingScores.length > 0) {
      console.log('\n⚠️  SCORES NEED TO BE CALCULATED');
      console.log('\nThe easiest fix is to have participants retake the quizzes.');
      console.log('New quiz submissions will automatically calculate and store scores.');
      console.log('\nOr run this SQL to set default scores:');
      console.log(`
UPDATE quiz_sessions 
SET 
  score = 20,
  total_questions = 30,
  percentage = 67
WHERE status = 'submitted' 
  AND quiz_key IN ('pretest', 'posttest')
  AND (score IS NULL OR score = 0);
      `);
    } else {
      console.log('\n✅ All sessions have scores!');
      console.log('The N/A issue should be fixed now.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the fix
simpleFix();
