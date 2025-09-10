const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials (from supabase.js)
const supabaseUrl = "https://ymajroaavaptafmoqciq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYWpyb2FhdmFwdGFmbW9xY2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNzAwMTIsImV4cCI6MjA3MDc0NjAxMn0.ERIAqngqn7lhjKxfF2PrSkP0sWCdghiXeaKa5aa1V3E";

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to calculate score from answers
function calculateScoreFromAnswers(answers, questions) {
  if (!answers || !questions) return { score: 0, total: 0, percentage: 0 };
  
  let correctAnswers = 0;
  let totalQuestions = 0;

  questions.forEach(question => {
    totalQuestions++;
    
    // Get user's answer
    const userAnswer = answers[question.id];
    
    // Get correct answer
    const correctAnswer = question.correctAnswer;
    
    // Check if correct
    if (userAnswer && correctAnswer && userAnswer === correctAnswer) {
      correctAnswers++;
    }
  });

  return {
    score: correctAnswers,
    total: totalQuestions,
    percentage: totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
  };
}

async function calculateAndUpdateScores() {
  try {
    console.log('🔍 Calculating and updating quiz scores...\n');

    // 1. First, let's check if we can access any data
    console.log('1. Checking database access...');
    
    // Try to get questions first
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .limit(5);

    if (questionsError) {
      console.log('❌ Error accessing questions table:', questionsError.message);
      console.log('This might indicate a permissions issue or the database is not accessible.');
      return;
    }

    console.log(`✅ Successfully accessed questions table. Found ${questions.length} questions.`);

    // 2. Check quiz sessions
    console.log('\n2. Checking quiz sessions...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .order('updated_at', { ascending: false });

    if (sessionsError) {
      console.log('❌ Error accessing quiz_sessions:', sessionsError.message);
      return;
    }

    console.log(`Found ${sessions.length} quiz sessions`);

    if (sessions.length === 0) {
      console.log('⚠️  No quiz sessions found. This might mean:');
      console.log('   - The data is in a different environment');
      console.log('   - There are permission issues');
      console.log('   - The user is looking at a different Supabase project');
      console.log('\nPlease check:');
      console.log('1. Are you looking at the correct Supabase project?');
      console.log('2. Are the Supabase credentials correct?');
      console.log('3. Is the data in a different environment (staging vs production)?');
      return;
    }

    // 3. Process each session
    console.log('\n3. Processing quiz sessions...');
    
    for (const session of sessions) {
      console.log(`\nProcessing session ${session.id}:`);
      console.log(`  Quiz Key: ${session.quiz_key}`);
      console.log(`  Status: ${session.status}`);
      console.log(`  Current Score: ${session.score || 'NULL'}`);
      
      if (session.status === 'submitted' && session.answers) {
        // Get questions for this quiz type
        const { data: quizQuestions, error: quizQuestionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('quiz_type', session.quiz_key);

        if (quizQuestionsError) {
          console.log(`  ❌ Error getting questions for ${session.quiz_key}:`, quizQuestionsError.message);
          continue;
        }

        // Calculate score
        const scoreData = calculateScoreFromAnswers(session.answers, quizQuestions);
        console.log(`  Calculated Score: ${scoreData.score}/${scoreData.total} (${scoreData.percentage}%)`);

        // Update the session with calculated score
        const { error: updateError } = await supabase
          .from('quiz_sessions')
          .update({
            score: scoreData.score,
            total_questions: scoreData.total,
            percentage: scoreData.percentage,
            updated_at: new Date().toISOString()
          })
          .eq('id', session.id);

        if (updateError) {
          console.log(`  ❌ Error updating session:`, updateError.message);
        } else {
          console.log(`  ✅ Updated session with score: ${scoreData.score}/${scoreData.total}`);
        }
      } else {
        console.log(`  ⏭️  Skipping session (not submitted or no answers)`);
      }
    }

    // 4. Final check
    console.log('\n4. Final verification...');
    const { data: updatedSessions, error: finalError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('status', 'submitted')
      .not('score', 'is', null)
      .order('updated_at', { ascending: false });

    if (finalError) {
      console.log('❌ Error in final check:', finalError.message);
    } else {
      console.log(`✅ Found ${updatedSessions.length} sessions with scores:`);
      updatedSessions.forEach((session, index) => {
        console.log(`  ${index + 1}. ${session.quiz_key}: ${session.score}/${session.total_questions} (${session.percentage}%)`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the calculation and update
calculateAndUpdateScores();
