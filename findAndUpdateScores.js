const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials (from supabase.js)
const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

async function findAndUpdateScores() {
  try {
    console.log('🔍 Finding and updating quiz scores...\n');

    // Step 1: First, let's check if the migration has been run
    console.log('1. Checking if migration has been run...');
    const { data: sampleSession, error: sampleError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.log('❌ Error accessing quiz_sessions table:', sampleError.message);
      console.log('\nPlease run the migration first:');
      console.log('1. Go to your Supabase Dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Run this SQL:');
      console.log(`
ALTER TABLE quiz_sessions 
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS percentage INTEGER DEFAULT 0;
      `);
      return;
    }

    if (!sampleSession || sampleSession.length === 0) {
      console.log('⚠️  No quiz sessions found in database');
      return;
    }

    const hasScoreColumn = 'score' in sampleSession[0];
    if (!hasScoreColumn) {
      console.log('❌ Migration not run yet. Please run the migration first.');
      console.log('\nGo to your Supabase Dashboard > SQL Editor and run:');
      console.log(`
ALTER TABLE quiz_sessions 
ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS percentage INTEGER DEFAULT 0;
      `);
      return;
    }

    console.log('✅ Migration appears to be complete');

    // Step 2: Find all submitted quiz sessions
    console.log('\n2. Finding submitted quiz sessions...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('quiz_sessions')
      .select('id, quiz_key, status, score, total_questions, percentage, answers, user_id')
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
    console.log('\n3. Fetching questions...');
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*');

    if (questionsError) {
      console.log('❌ Error fetching questions:', questionsError.message);
      return;
    }

    console.log(`Found ${questions.length} questions`);

    // Step 4: Process each session
    console.log('\n4. Processing sessions...');
    let updatedCount = 0;
    const updateQueries = [];

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

        // Prepare update query
        updateQueries.push({
          id: session.id,
          score: correctAnswers,
          total_questions: totalQuestions,
          percentage: percentage
        });

      } catch (error) {
        console.log(`❌ Error processing session ${session.id}:`, error.message);
      }
    }

    // Step 5: Execute all updates
    console.log(`\n5. Updating ${updateQueries.length} sessions...`);
    
    for (const update of updateQueries) {
      try {
        const { error: updateError } = await supabase
          .from('quiz_sessions')
          .update({
            score: update.score,
            total_questions: update.total_questions,
            percentage: update.percentage
          })
          .eq('id', update.id);

        if (updateError) {
          console.log(`❌ Error updating session ${update.id}:`, updateError.message);
        } else {
          console.log(`✅ Updated session ${update.id}: ${update.score}/${update.total_questions} (${update.percentage}%)`);
          updatedCount++;
        }
      } catch (error) {
        console.log(`❌ Error updating session ${update.id}:`, error.message);
      }
    }

    console.log(`\n🎉 Successfully updated ${updatedCount} quiz sessions`);

    // Step 6: Show sample of updated data
    console.log('\n6. Sample of updated sessions:');
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
      updatedSessions.forEach(session => {
        console.log(`  ${session.quiz_key}: ${session.score}/${session.total_questions} (${session.percentage}%)`);
      });
    }

    console.log('\n✅ Score calculation completed!');
    console.log('The BLS Results screen should now display scores correctly instead of "N/A".');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
findAndUpdateScores();
