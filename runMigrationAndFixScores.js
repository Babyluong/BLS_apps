const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials (from supabase.js)
const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrationAndFixScores() {
  try {
    console.log('🚀 Running Database Migration and Score Fix...\n');

    // Step 1: Run the migration
    console.log('1. Running database migration...');
    
    // Check if score columns exist by looking at a sample record
    const { data: sampleSession, error: sampleError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.log('❌ Error accessing quiz_sessions table:', sampleError.message);
      return;
    }

    if (sampleSession && sampleSession.length > 0) {
      const hasScoreColumn = 'score' in sampleSession[0];
      const hasTotalQuestionsColumn = 'total_questions' in sampleSession[0];
      const hasPercentageColumn = 'percentage' in sampleSession[0];

      console.log('Current table structure:');
      console.log(`  - score column: ${hasScoreColumn ? '✅ EXISTS' : '❌ MISSING'}`);
      console.log(`  - total_questions column: ${hasTotalQuestionsColumn ? '✅ EXISTS' : '❌ MISSING'}`);
      console.log(`  - percentage column: ${hasPercentageColumn ? '✅ EXISTS' : '❌ MISSING'}`);

      if (!hasScoreColumn || !hasTotalQuestionsColumn || !hasPercentageColumn) {
        console.log('\n⚠️  MIGRATION NEEDED - Please run the migration manually:');
        console.log('1. Go to your Supabase Dashboard');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Run the migration script from database/add_quiz_score_columns.sql');
        console.log('\nOr copy and paste this SQL:');
        console.log(`
-- Add score-related columns to quiz_sessions table
ALTER TABLE quiz_sessions 
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS percentage INTEGER DEFAULT 0;

-- Update existing records to have valid values
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
        `);
        return;
      } else {
        console.log('✅ Migration already completed');
      }
    } else {
      console.log('⚠️  No quiz sessions found in database');
      console.log('This might mean:');
      console.log('- No quizzes have been taken yet');
      console.log('- Data is in a different environment');
      console.log('- Different Supabase project');
      return;
    }

    // Step 2: Get all submitted quiz sessions
    console.log('\n2. Fetching submitted quiz sessions...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('status', 'submitted')
      .in('quiz_key', ['pretest', 'posttest']);

    if (sessionsError) {
      console.log('❌ Error fetching sessions:', sessionsError.message);
      return;
    }

    console.log(`Found ${sessions.length} submitted quiz sessions`);

    if (sessions.length === 0) {
      console.log('⚠️  No submitted quiz sessions found');
      return;
    }

    // Step 3: Get questions for score calculation
    console.log('\n3. Fetching questions for score calculation...');
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*');

    if (questionsError) {
      console.log('❌ Error fetching questions:', questionsError.message);
      return;
    }

    console.log(`Found ${questions.length} questions`);

    // Step 4: Calculate and update scores
    console.log('\n4. Calculating and updating scores...');
    let updatedCount = 0;

    for (const session of sessions) {
      try {
        // Skip if already has a valid score
        if (session.score && session.score > 0) {
          console.log(`⏭️  Skipping session ${session.id} - already has score ${session.score}`);
          continue;
        }

        // Calculate score from answers
        const answers = session.answers || {};
        let correctAnswers = 0;
        let totalQuestions = 0;

        // Group questions by quiz type
        const quizQuestions = questions.filter(q => {
          // Try different possible ways to identify quiz type
          const questionSet = q.soalan_set || q.question_set || q.scaler_text || q.question_type || q.type || q.category;
          if (session.quiz_key === 'pretest') {
            return questionSet === 'Pre_Test' || questionSet === 'pretest' || questionSet === 'PreTest';
          } else if (session.quiz_key === 'posttest') {
            return questionSet === 'Post_Test' || questionSet === 'posttest' || questionSet === 'PostTest';
          }
          return false;
        });

        console.log(`Processing ${session.quiz_key} session ${session.id} with ${quizQuestions.length} questions`);

        quizQuestions.forEach(question => {
          totalQuestions++;
          
          // Get user's answer
          const userAnswer = answers[question.id];
          
          // Get correct answer - try multiple possible field names
          const correctAnswer = question.correctAnswer || 
                               question.raw?.correct_option || 
                               question.raw?.correct_option_en ||
                               question.raw?.correct_answer ||
                               question.correct_option ||
                               question.correct_option_en;
          
          // Check if answer is correct
          if (userAnswer && correctAnswer && userAnswer === correctAnswer) {
            correctAnswers++;
          }
        });

        const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

        console.log(`  Calculated: ${correctAnswers}/${totalQuestions} (${percentage}%)`);

        // Update the session with calculated score
        const { error: updateError } = await supabase
          .from('quiz_sessions')
          .update({
            score: correctAnswers,
            total_questions: totalQuestions,
            percentage: percentage
          })
          .eq('id', session.id);

        if (updateError) {
          console.log(`❌ Error updating session ${session.id}:`, updateError.message);
        } else {
          console.log(`✅ Updated session ${session.id}: ${correctAnswers}/${totalQuestions} (${percentage}%)`);
          updatedCount++;
        }

      } catch (error) {
        console.log(`❌ Error processing session ${session.id}:`, error.message);
      }
    }

    console.log(`\n🎉 Successfully updated ${updatedCount} quiz sessions`);

    // Step 5: Verify the fix
    console.log('\n5. Verifying the fix...');
    const { data: updatedSessions, error: verifyError } = await supabase
      .from('quiz_sessions')
      .select('id, quiz_key, status, score, total_questions, percentage')
      .eq('status', 'submitted')
      .in('quiz_key', ['pretest', 'posttest'])
      .order('updated_at', { ascending: false })
      .limit(5);

    if (verifyError) {
      console.log('❌ Error verifying results:', verifyError.message);
    } else {
      console.log('Sample updated sessions:');
      updatedSessions.forEach(session => {
        console.log(`  ${session.quiz_key}: ${session.score}/${session.total_questions} (${session.percentage}%)`);
      });
    }

    console.log('\n✅ Migration and score calculation completed!');
    console.log('The BLS Results screen should now display scores correctly instead of "N/A".');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the migration and fix
runMigrationAndFixScores();
