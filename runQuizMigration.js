const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials (from supabase.js)
const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function runQuizMigration() {
  try {
    console.log('🚀 Running quiz_sessions migration...\n');

    // 1. Add score columns if they don't exist
    console.log('1. Adding score columns to quiz_sessions table...');
    
    const migrationSQL = `
      -- Add score-related columns to quiz_sessions table
      ALTER TABLE quiz_sessions 
      ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS percentage INTEGER DEFAULT 0;

      -- Add comments to document the new columns
      COMMENT ON COLUMN quiz_sessions.score IS 'Number of correct answers';
      COMMENT ON COLUMN quiz_sessions.total_questions IS 'Total number of questions in the quiz';
      COMMENT ON COLUMN quiz_sessions.percentage IS 'Percentage score (0-100)';

      -- Update existing records to have valid values before adding constraints
      UPDATE quiz_sessions 
      SET 
        score = COALESCE(score, 0),
        total_questions = CASE 
          WHEN total_questions IS NULL OR total_questions = 0 THEN 30 
          ELSE total_questions 
        END,
        percentage = COALESCE(percentage, 0)
      WHERE score IS NULL OR total_questions IS NULL OR percentage IS NULL 
         OR total_questions = 0;

      -- Add constraints to ensure valid data (drop existing first to avoid conflicts)
      ALTER TABLE quiz_sessions DROP CONSTRAINT IF EXISTS valid_score;
      ALTER TABLE quiz_sessions DROP CONSTRAINT IF EXISTS valid_total_questions;
      ALTER TABLE quiz_sessions DROP CONSTRAINT IF EXISTS valid_percentage;

      ALTER TABLE quiz_sessions 
      ADD CONSTRAINT valid_score CHECK (score >= 0),
      ADD CONSTRAINT valid_total_questions CHECK (total_questions > 0),
      ADD CONSTRAINT valid_percentage CHECK (percentage >= 0 AND percentage <= 100);

      -- Create index for better query performance on score-related queries
      CREATE INDEX IF NOT EXISTS idx_quiz_sessions_score ON quiz_sessions(score);
      CREATE INDEX IF NOT EXISTS idx_quiz_sessions_percentage ON quiz_sessions(percentage);
      CREATE INDEX IF NOT EXISTS idx_quiz_sessions_quiz_key_status ON quiz_sessions(quiz_key, status);
    `;

    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.log('❌ Error running migration:', error.message);
      console.log('Trying individual statements...\n');
      
      // Try individual statements
      const statements = migrationSQL.split(';').filter(s => s.trim());
      for (const statement of statements) {
        if (statement.trim()) {
          console.log(`Executing: ${statement.trim().substring(0, 50)}...`);
          const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement });
          if (stmtError) {
            console.log(`❌ Error: ${stmtError.message}`);
          } else {
            console.log('✅ Success');
          }
        }
      }
    } else {
      console.log('✅ Migration completed successfully');
    }

    // 2. Check the current state
    console.log('\n2. Checking current state...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(5);

    if (sessionsError) {
      console.log('❌ Error fetching sessions:', sessionsError.message);
    } else {
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
    }

    // 3. Check for the specific user from the screenshot
    console.log('\n3. Checking for specific user (4edf507f-1672-442f-baa9-be4f1b678221)...');
    const { data: specificUser, error: userError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('user_id', '4edf507f-1672-442f-baa9-be4f1b678221');

    if (userError) {
      console.log('❌ Error fetching specific user:', userError.message);
    } else {
      console.log(`Found ${specificUser.length} sessions for this user:`);
      specificUser.forEach((session, index) => {
        console.log(`\nUser Session ${index + 1}:`);
        console.log(`  Quiz Key: ${session.quiz_key}`);
        console.log(`  Status: ${session.status}`);
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

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the migration
runQuizMigration();
