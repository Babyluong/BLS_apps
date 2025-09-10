const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials (from supabase.js)
const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function troubleshootScores() {
  try {
    console.log('🔍 Troubleshooting N/A Scores Issue...\n');

    // Step 1: Test database connection
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

    // Step 2: Check table structure
    console.log('\n2. Checking table structure...');
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
      console.log('This might mean:');
      console.log('- No quizzes have been taken yet');
      console.log('- Data is in a different environment');
      console.log('- Different Supabase project');
      return;
    }

    const session = sampleSession[0];
    console.log('📋 Available columns in quiz_sessions:');
    Object.keys(session).forEach(key => {
      console.log(`  - ${key}: ${typeof session[key]} (${session[key]})`);
    });

    // Step 3: Check if migration columns exist
    const hasScoreColumn = 'score' in session;
    const hasTotalQuestionsColumn = 'total_questions' in session;
    const hasPercentageColumn = 'percentage' in session;

    console.log('\n3. Migration status:');
    console.log(`  - score column: ${hasScoreColumn ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  - total_questions column: ${hasTotalQuestionsColumn ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  - percentage column: ${hasPercentageColumn ? '✅ EXISTS' : '❌ MISSING'}`);

    if (!hasScoreColumn || !hasTotalQuestionsColumn || !hasPercentageColumn) {
      console.log('\n❌ MIGRATION NOT COMPLETE');
      console.log('\nTo fix this, run this SQL in your Supabase Dashboard:');
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
    }

    // Step 4: Check for submitted sessions
    console.log('\n4. Checking for submitted quiz sessions...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('quiz_sessions')
      .select('id, quiz_key, status, score, total_questions, percentage, answers, user_id, updated_at')
      .eq('status', 'submitted')
      .in('quiz_key', ['pretest', 'posttest']);

    if (sessionsError) {
      console.log('❌ Error fetching sessions:', sessionsError.message);
      return;
    }

    console.log(`Found ${sessions.length} submitted quiz sessions`);

    if (sessions.length === 0) {
      console.log('⚠️  No submitted quiz sessions found');
      console.log('This means no one has completed a quiz yet, or the data is elsewhere.');
      return;
    }

    // Step 5: Check scores
    console.log('\n5. Checking scores...');
    const sessionsWithMissingScores = sessions.filter(session => 
      session.score === null || session.score === undefined || session.score === 0
    );

    console.log(`Sessions with missing scores: ${sessionsWithMissingScores.length}/${sessions.length}`);

    if (sessionsWithMissingScores.length > 0) {
      console.log('\n⚠️  SCORES NEED TO BE CALCULATED');
      console.log('\nSessions that need scores:');
      sessionsWithMissingScores.forEach((session, index) => {
        console.log(`  ${index + 1}. ${session.quiz_key} (ID: ${session.id}) - Score: ${session.score || 'NULL'}`);
      });

      console.log('\nTo fix this, you can:');
      console.log('1. Run the score calculation script');
      console.log('2. Or manually update scores in the database');
      console.log('3. Or have participants retake the quizzes');

      // Try to calculate scores automatically
      console.log('\n6. Attempting to calculate scores...');
      await calculateScores(sessionsWithMissingScores);
    } else {
      console.log('\n✅ All sessions have scores!');
    }

    // Step 6: Show final status
    console.log('\n7. Final status:');
    const { data: finalSessions, error: finalError } = await supabase
      .from('quiz_sessions')
      .select('id, quiz_key, status, score, total_questions, percentage')
      .eq('status', 'submitted')
      .in('quiz_key', ['pretest', 'posttest'])
      .order('updated_at', { ascending: false })
      .limit(3);

    if (!finalError && finalSessions) {
      console.log('Sample sessions:');
      finalSessions.forEach(session => {
        console.log(`  ${session.quiz_key}: ${session.score}/${session.total_questions} (${session.percentage}%)`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function calculateScores(sessions) {
  try {
    // Get questions for score calculation
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*');

    if (questionsError) {
      console.log('❌ Error fetching questions:', questionsError.message);
      return;
    }

    console.log(`Found ${questions.length} questions for score calculation`);

    let updatedCount = 0;
    for (const session of sessions) {
      try {
        // Calculate score from answers
        const answers = session.answers || {};
        let correctAnswers = 0;
        let totalQuestions = 0;

        // Group questions by quiz type
        const quizQuestions = questions.filter(q => {
          const questionSet = q.soalan_set || q.question_set || q.scaler_text || q.question_type || q.type || q.category;
          if (session.quiz_key === 'pretest') {
            return questionSet === 'Pre_Test' || questionSet === 'pretest' || questionSet === 'PreTest';
          } else if (session.quiz_key === 'posttest') {
            return questionSet === 'Post_Test' || questionSet === 'posttest' || questionSet === 'PostTest';
          }
          return false;
        });

        console.log(`Calculating score for ${session.quiz_key} session ${session.id} with ${quizQuestions.length} questions`);

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

  } catch (error) {
    console.log('❌ Error calculating scores:', error.message);
  }
}

// Run the troubleshooting
troubleshootScores();
