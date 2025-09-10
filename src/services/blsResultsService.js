// services/blsResultsService.js
import supabase from './supabase';

export class BLSResultsService {
  /**
   * Save BLS assessment results to the database (updated for combined structure)
   * @param {Object} results - The BLS assessment results
   * @param {number} results.preTestScore - Pre-test score (0-30)
   * @param {number} results.postTestScore - Post-test score (0-30)
   * @param {number} results.preTestPercentage - Pre-test percentage (0-100)
   * @param {number} results.postTestPercentage - Post-test percentage (0-100)
   * @param {string} results.participantName - Participant name
   * @param {string} results.participantIc - Participant IC number
   * @param {Object} results.checklistResults - Checklist pass/fail status
   * @param {Object} results.checklistDetails - Detailed checklist breakdown
   * @param {Object} results.preTestAnswers - Pre-test answers JSON
   * @param {Object} results.postTestAnswers - Post-test answers JSON
   * @param {string} results.preTestSessionId - Pre-test session ID
   * @param {string} results.postTestSessionId - Post-test session ID
   * @returns {Promise<Object>} - Saved result data
   */
  static async saveBLSResults(results) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Calculate checklist statistics
      const checklistTypes = ['one-man-cpr', 'two-man-cpr', 'adult-choking', 'infant-choking', 'infant-cpr'];
      let totalChecklistScore = 0;
      let totalChecklistItems = 0;
      let checklistPassCount = 0;
      const checklistResults = {};

      checklistTypes.forEach(type => {
        const result = results.checklistDetails[type];
        if (result) {
          checklistResults[type] = {
            score: result.score || 0,
            total_items: result.total_items || 0,
            status: result.status || 'FAIL',
            checklist_details: result.checklist_details || { performed: [], notPerformed: [] },
            comments: result.comments || null,
            assessment_date: result.assessment_date || new Date().toISOString(),
            duration_seconds: result.duration_seconds || null
          };
          
          totalChecklistScore += result.score || 0;
          totalChecklistItems += result.total_items || 0;
          if (result.status === 'PASS') checklistPassCount++;
        } else {
          checklistResults[type] = null;
        }
      });

      // Prepare the data for insertion
      const resultData = {
        user_id: user.id,
        participant_name: results.participantName || 'Unknown',
        participant_ic: results.participantIc || null,
        
        // Pre-test data
        pre_test_score: results.preTestScore || 0,
        pre_test_percentage: results.preTestPercentage || 0,
        pre_test_session_id: results.preTestSessionId || null,
        pre_test_answers: results.preTestAnswers || null,
        pre_test_started_at: results.preTestStartedAt || null,
        
        // Post-test data
        post_test_score: results.postTestScore || 0,
        post_test_percentage: results.postTestPercentage || 0,
        post_test_session_id: results.postTestSessionId || null,
        post_test_answers: results.postTestAnswers || null,
        post_test_started_at: results.postTestStartedAt || null,
        
        // Checklist data
        one_man_cpr_pass: results.checklistResults.oneManCprPass || false,
        two_man_cpr_pass: results.checklistResults.twoManCprPass || false,
        adult_choking_pass: results.checklistResults.adultChokingPass || false,
        infant_choking_pass: results.checklistResults.infantChokingPass || false,
        infant_cpr_pass: results.checklistResults.infantCprPass || false,
        
        // Checklist details
        one_man_cpr_details: results.checklistDetails['one-man-cpr']?.checklist_details || { performed: [], notPerformed: [] },
        two_man_cpr_details: results.checklistDetails['two-man-cpr']?.checklist_details || { performed: [], notPerformed: [] },
        adult_choking_details: results.checklistDetails['adult-choking']?.checklist_details || { performed: [], notPerformed: [] },
        infant_choking_details: results.checklistDetails['infant-choking']?.checklist_details || { performed: [], notPerformed: [] },
        infant_cpr_details: results.checklistDetails['infant-cpr']?.checklist_details || { performed: [], notPerformed: [] },
        
        // Combined checklist data
        checklist_results: checklistResults,
        total_checklist_score: totalChecklistScore,
        total_checklist_items: totalChecklistItems,
        checklist_pass_count: checklistPassCount,
        checklist_total_count: checklistTypes.length
      };

      const { data, error } = await supabase
        .from('bls_results')
        .insert(resultData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error saving BLS results:', error);
      throw error;
    }
  }

  /**
   * Get BLS results for the current user (updated for combined structure)
   * @returns {Promise<Array>} - Array of BLS results
   */
  static async getUserBLSResults() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get the combined BLS results
      const { data: results, error: resultsError } = await supabase
        .from('bls_results')
        .select(`
          id,
          created_at,
          updated_at,
          user_id,
          participant_name,
          participant_ic,
          pre_test_score,
          pre_test_percentage,
          pre_test_session_id,
          pre_test_answers,
          pre_test_started_at,
          post_test_score,
          post_test_percentage,
          post_test_session_id,
          post_test_answers,
          post_test_started_at,
          one_man_cpr_pass,
          two_man_cpr_pass,
          adult_choking_pass,
          infant_choking_pass,
          infant_cpr_pass,
          one_man_cpr_details,
          two_man_cpr_details,
          adult_choking_details,
          infant_choking_details,
          infant_cpr_details,
          checklist_results,
          total_checklist_score,
          total_checklist_items,
          checklist_pass_count,
          checklist_total_count
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (resultsError) {
        throw resultsError;
      }

      if (!results || results.length === 0) {
        return [];
      }

      // Get the user profile information
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // If profile doesn't exist, create a default one
      const profileData = profile || {
        full_name: 'Unknown User',
        id_number: 'N/A'
      };

      // Ensure all required fields exist with fallback values
      const safeProfileData = {
        full_name: profileData.full_name || 'Unknown User',
        id_number: profileData.id_number || 'N/A'
      };

      // Combine the data
      const combinedResults = results.map(result => ({
        ...result,
        profiles: safeProfileData
      }));

      return combinedResults;
    } catch (error) {
      console.error('Error fetching BLS results:', error);
      throw error;
    }
  }

  /**
   * Get all BLS results (admin only) - updated for combined structure
   * @returns {Promise<Array>} - Array of all BLS results
   */
  static async getAllBLSResults() {
    try {
      // Get all combined BLS results
      const { data: results, error: resultsError } = await supabase
        .from('bls_results')
        .select(`
          id,
          created_at,
          updated_at,
          user_id,
          participant_name,
          participant_ic,
          pre_test_score,
          pre_test_percentage,
          pre_test_session_id,
          pre_test_answers,
          pre_test_started_at,
          post_test_score,
          post_test_percentage,
          post_test_session_id,
          post_test_answers,
          post_test_started_at,
          one_man_cpr_pass,
          two_man_cpr_pass,
          adult_choking_pass,
          infant_choking_pass,
          infant_cpr_pass,
          one_man_cpr_details,
          two_man_cpr_details,
          adult_choking_details,
          infant_choking_details,
          infant_cpr_details,
          checklist_results,
          total_checklist_score,
          total_checklist_items,
          checklist_pass_count,
          checklist_total_count
        `)
        .order('created_at', { ascending: false });

      if (resultsError) {
        throw resultsError;
      }

      if (!results || results.length === 0) {
        return [];
      }

      // Get unique user IDs
      const userIds = [...new Set(results.map(result => result.user_id))];

      // Get all profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profilesError) {
        console.warn('Error fetching profiles:', profilesError);
      }

      // Create a map of user profiles
      const profileMap = new Map();
      if (profiles) {
        profiles.forEach(profile => {
          profileMap.set(profile.id, {
            full_name: profile.full_name || 'Unknown User',
            id_number: profile.id_number || 'N/A'
          });
        });
      }

      // Combine the data
      const combinedResults = results.map(result => ({
        ...result,
        profiles: profileMap.get(result.user_id) || {
          full_name: result.participant_name || 'Unknown User',
          id_number: result.participant_ic || 'N/A'
        }
      }));

      return combinedResults;
    } catch (error) {
      console.error('Error fetching all BLS results:', error);
      throw error;
    }
  }

  /**
   * Update user profile information
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} - Updated profile data
   */
  static async updateUserProfile(profileData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profileData.fullName,
          id_number: profileData.idNumber,
          role: profileData.role || 'user'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Get user profile information
   * @returns {Promise<Object>} - User profile data
   */
  static async getUserProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * Delete a BLS result
   * @param {string} resultId - ID of the result to delete
   * @returns {Promise<boolean>} - Success status
   */
  static async deleteBLSResult(resultId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('bls_results')
        .delete()
        .eq('id', resultId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting BLS result:', error);
      throw error;
    }
  }

  /**
   * Get combined BLS results from quiz sessions and checklist results
   * This method combines data from quiz_sessions and checklist_results tables
   * @param {string} userId - Optional user ID (defaults to current user)
   * @returns {Promise<Array>} - Array of combined BLS results
   */
  static async getCombinedBLSResults(userId = null) {
    try {
      let targetUserId = userId;
      
      if (!targetUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }
        targetUserId = user.id;
      }

      // Get quiz sessions for the user
      const { data: quizSessions, error: quizError } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('status', 'submitted')
        .order('created_at', { ascending: false });

      if (quizError) {
        throw quizError;
      }

      // Get checklist results for the user
      const { data: checklistResults, error: checklistError } = await supabase
        .from('checklist_results')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      if (checklistError) {
        throw checklistError;
      }

      // Group data by participant
      const groupedData = this.groupDataByParticipant(quizSessions || [], checklistResults || []);
      
      // Create combined results
      const combinedResults = this.createCombinedResults(groupedData);

      return combinedResults;
    } catch (error) {
      console.error('Error fetching combined BLS results:', error);
      throw error;
    }
  }

  /**
   * Group quiz sessions and checklist results by participant
   * @param {Array} quizSessions - Array of quiz sessions
   * @param {Array} checklistResults - Array of checklist results
   * @returns {Object} - Grouped data by participant
   */
  static groupDataByParticipant(quizSessions, checklistResults) {
    const grouped = {};

    // Group quiz sessions by participant
    quizSessions.forEach(session => {
      const key = `${session.user_id}_${session.participant_ic || 'no_ic'}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          user_id: session.user_id,
          participant_name: session.participant_name,
          participant_ic: session.participant_ic,
          quiz_sessions: [],
          checklist_results: []
        };
      }

      grouped[key].quiz_sessions.push(session);
    });

    // Group checklist results by participant
    checklistResults.forEach(result => {
      const key = `${result.user_id}_${result.participant_ic || 'no_ic'}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          user_id: result.user_id,
          participant_name: result.participant_name,
          participant_ic: result.participant_ic,
          quiz_sessions: [],
          checklist_results: []
        };
      }

      grouped[key].checklist_results.push(result);
    });

    return grouped;
  }

  /**
   * Create combined results from grouped data
   * @param {Object} groupedData - Grouped data by participant
   * @returns {Array} - Array of combined results
   */
  static createCombinedResults(groupedData) {
    const combinedResults = [];

    Object.values(groupedData).forEach(participant => {
      // Find pre-test and post-test sessions
      const preTestSession = participant.quiz_sessions.find(s => s.quiz_key === 'pre-test');
      const postTestSession = participant.quiz_sessions.find(s => s.quiz_key === 'post-test');

      // Group checklist results by type
      const checklistByType = {};
      participant.checklist_results.forEach(result => {
        checklistByType[result.checklist_type] = result;
      });

      // Calculate checklist statistics
      const checklistTypes = ['one-man-cpr', 'two-man-cpr', 'adult-choking', 'infant-choking', 'infant-cpr'];
      let totalChecklistScore = 0;
      let totalChecklistItems = 0;
      let checklistPassCount = 0;
      const checklistResults = {};

      checklistTypes.forEach(type => {
        const result = checklistByType[type];
        if (result) {
          checklistResults[type] = {
            id: result.id,
            score: result.score,
            total_items: result.total_items,
            status: result.status,
            checklist_details: result.checklist_details,
            comments: result.comments,
            assessment_date: result.assessment_date,
            duration_seconds: result.duration_seconds
          };
          
          totalChecklistScore += result.score;
          totalChecklistItems += result.total_items;
          if (result.status === 'PASS') checklistPassCount++;
        } else {
          checklistResults[type] = null;
        }
      });

      // Create combined result
      const combinedResult = {
        user_id: participant.user_id,
        participant_name: participant.participant_name,
        participant_ic: participant.participant_ic,
        
        // Pre-test data
        pre_test_score: preTestSession?.score || 0,
        pre_test_percentage: preTestSession?.percentage || 0,
        pre_test_session_id: preTestSession?.id || null,
        pre_test_answers: preTestSession?.answers || null,
        pre_test_started_at: preTestSession?.started_at || null,
        
        // Post-test data
        post_test_score: postTestSession?.score || 0,
        post_test_percentage: postTestSession?.percentage || 0,
        post_test_session_id: postTestSession?.id || null,
        post_test_answers: postTestSession?.answers || null,
        post_test_started_at: postTestSession?.started_at || null,
        
        // Checklist data
        one_man_cpr_pass: checklistResults['one-man-cpr']?.status === 'PASS' || false,
        two_man_cpr_pass: checklistResults['two-man-cpr']?.status === 'PASS' || false,
        adult_choking_pass: checklistResults['adult-choking']?.status === 'PASS' || false,
        infant_choking_pass: checklistResults['infant-choking']?.status === 'PASS' || false,
        infant_cpr_pass: checklistResults['infant-cpr']?.status === 'PASS' || false,
        
        // Checklist details
        one_man_cpr_details: checklistResults['one-man-cpr']?.checklist_details || { performed: [], notPerformed: [] },
        two_man_cpr_details: checklistResults['two-man-cpr']?.checklist_details || { performed: [], notPerformed: [] },
        adult_choking_details: checklistResults['adult-choking']?.checklist_details || { performed: [], notPerformed: [] },
        infant_choking_details: checklistResults['infant-choking']?.checklist_details || { performed: [], notPerformed: [] },
        infant_cpr_details: checklistResults['infant-cpr']?.checklist_details || { performed: [], notPerformed: [] },
        
        // Combined checklist data
        checklist_results: checklistResults,
        total_checklist_score: totalChecklistScore,
        total_checklist_items: totalChecklistItems,
        checklist_pass_count: checklistPassCount,
        checklist_total_count: checklistTypes.length,
        
        // Metadata
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      combinedResults.push(combinedResult);
    });

    return combinedResults;
  }

  /**
   * Get BLS results statistics for the current user
   * @returns {Promise<Object>} - Statistics object
   */
  static async getUserBLSStatistics() {
    try {
      const results = await this.getUserBLSResults();
      
      const stats = {
        totalAssessments: results.length,
        averagePreTestScore: 0,
        averagePostTestScore: 0,
        totalPassed: 0,
        totalFailed: 0,
        certificationRate: 0,
        checklistPassRates: {
          oneManCpr: 0,
          twoManCpr: 0,
          adultChoking: 0,
          infantChoking: 0,
          infantCpr: 0
        }
      };

      if (results.length === 0) {
        return stats;
      }

      // Calculate averages
      const preTestSum = results.reduce((sum, result) => sum + (result.pre_test_score || 0), 0);
      const postTestSum = results.reduce((sum, result) => sum + (result.post_test_score || 0), 0);
      
      stats.averagePreTestScore = Math.round(preTestSum / results.length);
      stats.averagePostTestScore = Math.round(postTestSum / results.length);

      // Calculate pass rates
      let totalPassed = 0;
      let totalFailed = 0;
      let certifiedCount = 0;

      const checklistCounts = {
        oneManCpr: { passed: 0, total: 0 },
        twoManCpr: { passed: 0, total: 0 },
        adultChoking: { passed: 0, total: 0 },
        infantChoking: { passed: 0, total: 0 },
        infantCpr: { passed: 0, total: 0 }
      };

      results.forEach(result => {
        // Check if all checklists passed
        const allPassed = result.one_man_cpr_pass && 
                         result.two_man_cpr_pass && 
                         result.adult_choking_pass && 
                         result.infant_choking_pass && 
                         result.infant_cpr_pass;
        
        if (allPassed && result.post_test_score > 20) {
          totalPassed++;
          certifiedCount++;
        } else {
          totalFailed++;
        }

        // Count individual checklist passes
        if (result.one_man_cpr_pass) checklistCounts.oneManCpr.passed++;
        if (result.two_man_cpr_pass) checklistCounts.twoManCpr.passed++;
        if (result.adult_choking_pass) checklistCounts.adultChoking.passed++;
        if (result.infant_choking_pass) checklistCounts.infantChoking.passed++;
        if (result.infant_cpr_pass) checklistCounts.infantCpr.passed++;

        checklistCounts.oneManCpr.total++;
        checklistCounts.twoManCpr.total++;
        checklistCounts.adultChoking.total++;
        checklistCounts.infantChoking.total++;
        checklistCounts.infantCpr.total++;
      });

      stats.totalPassed = totalPassed;
      stats.totalFailed = totalFailed;
      stats.certificationRate = Math.round((certifiedCount / results.length) * 100);

      // Calculate checklist pass rates
      Object.keys(checklistCounts).forEach(key => {
        const count = checklistCounts[key];
        stats.checklistPassRates[key] = count.total > 0 ? 
          Math.round((count.passed / count.total) * 100) : 0;
      });

      return stats;
    } catch (error) {
      console.error('Error calculating BLS statistics:', error);
      throw error;
    }
  }
}

export default BLSResultsService;
