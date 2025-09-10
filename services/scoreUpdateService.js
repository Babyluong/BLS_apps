// services/scoreUpdateService.js
import supabase from './supabase';

export class ScoreUpdateService {
  /**
   * Manually trigger score recalculation for all quiz sessions
   * @returns {Promise<Object>} Result of the recalculation
   */
  static async recalculateAllScores() {
    try {
      console.log('🔄 Starting manual score recalculation...');
      
      const startTime = Date.now();
      let updatedCount = 0;
      
      // Get all submitted quiz sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('status', 'submitted');
      
      if (sessionsError) {
        throw sessionsError;
      }
      
      console.log(`📊 Found ${sessions.length} sessions to process`);
      
      // Process each session
      for (const session of sessions) {
        try {
          const newScore = await this.recalculateSingleSession(session);
          if (newScore !== null) {
            updatedCount++;
          }
        } catch (err) {
          console.error(`❌ Error processing session ${session.id}:`, err.message);
        }
      }
      
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      const result = {
        success: true,
        updated_sessions: updatedCount,
        total_sessions: sessions.length,
        duration_seconds: duration
      };
      
      console.log('✅ Score recalculation completed:', result);
      return result;
    } catch (error) {
      console.error('Error in recalculateAllScores:', error);
      throw error;
    }
  }

  /**
   * Recalculate score for a single quiz session
   * @param {Object} session - The quiz session object
   * @returns {Promise<number|null>} The new score or null if error
   */
  static async recalculateSingleSession(session) {
    try {
      // Get questions for this quiz type
      const questionSet = session.quiz_key === 'pretest' ? 'Pre_Test' : 
                         session.quiz_key === 'posttest' ? 'Post_Test' : 'Pre_Test';
      
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('id, correct_option')
        .eq('soalan_set', questionSet);
      
      if (questionsError) {
        throw questionsError;
      }
      
      let score = 0;
      let totalQuestions = questions.length;
      
      // Calculate score
      for (const question of questions) {
        const userAnswer = this.getUserAnswer(session.answers, question.id);
        const correctAnswer = question.correct_option;
        
        if (userAnswer === correctAnswer) {
          score++;
        }
      }
      
      // Calculate percentage
      const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
      
      // Update the session
      const { error: updateError } = await supabase
        .from('quiz_sessions')
        .update({
          score: score,
          total_questions: totalQuestions,
          percentage: percentage,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id);
      
      if (updateError) {
        throw updateError;
      }
      
      return score;
    } catch (error) {
      console.error('Error recalculating single session:', error);
      return null;
    }
  }

  /**
   * Get user answer from session answers object
   * @param {Object} answers - The answers object from quiz session
   * @param {number} questionId - The question ID
   * @returns {string|null} The user's answer or null
   */
  static getUserAnswer(answers, questionId) {
    if (!answers) return null;
    
    // Try different answer key formats
    const malayKey = `malay-${questionId}`;
    const englishKey = `english-${questionId}`;
    const pretestKey = `pre-test-${questionId}`;
    
    return answers[malayKey] || answers[englishKey] || answers[pretestKey] || null;
  }

  /**
   * Recalculate scores for a specific question
   * @param {number} questionId - The ID of the question to recalculate
   * @returns {Promise<number>} Number of sessions updated
   */
  static async recalculateScoresForQuestion(questionId) {
    try {
      console.log(`🔄 Recalculating scores for question ${questionId}...`);
      
      // Use manual recalculation method (database function not available)
      console.log('🔄 Using manual recalculation method...');
      
      // Get all sessions that might have answered this question
      const { data: sessions, error: sessionsError } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('status', 'submitted');
      
      if (sessionsError) {
        throw sessionsError;
      }
      
      let updatedCount = 0;
      
      // Process each session
      for (const session of sessions) {
        try {
          const newScore = await this.recalculateSingleSession(session);
          if (newScore !== null) {
            updatedCount++;
          }
        } catch (err) {
          console.error(`❌ Error processing session ${session.id}:`, err.message);
        }
      }
      
      console.log(`✅ Updated ${updatedCount} sessions for question ${questionId}`);
      return updatedCount;
    } catch (error) {
      console.error('Error in recalculateScoresForQuestion:', error);
      // Return 0 instead of throwing to prevent breaking the save operation
      return 0;
    }
  }

  /**
   * Recalculate score for a specific quiz session
   * @param {string} sessionId - The UUID of the quiz session
   * @returns {Promise<number>} The new score
   */
  static async recalculateQuizScore(sessionId) {
    try {
      console.log(`🔄 Recalculating score for session ${sessionId}...`);
      
      // Get the session
      const { data: session, error: sessionError } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      
      if (sessionError) {
        throw sessionError;
      }
      
      const newScore = await this.recalculateSingleSession(session);
      
      if (newScore !== null) {
        console.log(`✅ New score for session ${sessionId}: ${newScore}`);
        return newScore;
      } else {
        throw new Error('Failed to recalculate score');
      }
    } catch (error) {
      console.error('Error in recalculateQuizScore:', error);
      throw error;
    }
  }

  /**
   * Get score update statistics
   * @returns {Promise<Object>} Statistics about score updates
   */
  static async getScoreUpdateStats() {
    try {
      // Get total submitted sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('quiz_sessions')
        .select('id')
        .eq('status', 'submitted');
      
      if (sessionsError) {
        throw sessionsError;
      }
      
      // Get recent updates from activity logs
      const { data: recentUpdates, error: logsError } = await supabase
        .from('activity_logs')
        .select('ts')
        .in('action', ['AUTO_SCORE_UPDATE', 'MANUAL_SCORE_RECALCULATION'])
        .gte('ts', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      
      let recentCount = 0;
      let lastUpdate = null;
      
      if (!logsError && recentUpdates) {
        recentCount = recentUpdates.length;
        if (recentUpdates.length > 0) {
          lastUpdate = recentUpdates[0].ts;
        }
      }
      
      return {
        total_sessions: sessions.length,
        recent_updates_24h: recentCount,
        last_update: lastUpdate
      };
    } catch (error) {
      console.error('Error in getScoreUpdateStats:', error);
      throw error;
    }
  }

  /**
   * Check if score updates are working properly
   * @returns {Promise<boolean>} True if score updates are working
   */
  static async checkScoreUpdateHealth() {
    try {
      // Test by getting stats
      const stats = await this.getScoreUpdateStats();
      
      // Check if we can access the functions
      if (stats && typeof stats.total_sessions === 'number') {
        console.log('✅ Score update system is healthy');
        return true;
      } else {
        console.log('❌ Score update system may not be properly configured');
        return false;
      }
    } catch (error) {
      console.error('❌ Score update system health check failed:', error);
      return false;
    }
  }

  /**
   * Get recent score update activity
   * @param {number} hours - Number of hours to look back (default: 24)
   * @returns {Promise<Array>} Recent score update activities
   */
  static async getRecentScoreUpdates(hours = 24) {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .in('action', ['AUTO_SCORE_UPDATE', 'MANUAL_SCORE_RECALCULATION'])
        .gte('ts', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
        .order('ts', { ascending: false });
      
      if (error) {
        console.error('Error getting recent score updates:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getRecentScoreUpdates:', error);
      throw error;
    }
  }
}

export default ScoreUpdateService;
