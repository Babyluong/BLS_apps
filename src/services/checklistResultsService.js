// services/checklistResultsService.js
import supabase from './supabase';

export class ChecklistResultsService {
  /**
   * Save individual checklist results to the database
   * @param {Object} results - The checklist assessment results
   * @param {string} results.checklistType - Type of checklist (infant-choking, one-man-cpr, etc.)
   * @param {string} results.participantName - Name of the participant
   * @param {string} results.participantIc - IC number of the participant
   * @param {number} results.score - Number of items completed correctly
   * @param {number} results.totalItems - Total number of items in checklist
   * @param {string} results.status - PASS or FAIL
   * @param {Object} results.checklistDetails - Detailed checklist breakdown
   * @param {string} results.comments - Additional comments
   * @param {number} results.durationSeconds - Time taken for assessment
   * @returns {Promise<Object>} - Saved result data
   */
  static async saveChecklistResults(results) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Prepare the data for insertion
      const resultData = {
        user_id: user.id,
        participant_name: results.participantName,
        participant_ic: results.participantIc || null,
        checklist_type: results.checklistType,
        score: results.score,
        total_items: results.totalItems,
        status: results.status,
        checklist_details: results.checklistDetails || {},
        comments: results.comments || null,
        duration_seconds: results.durationSeconds || null,
        assessment_date: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('checklist_results')
        .insert(resultData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error saving checklist results:', error);
      throw error;
    }
  }

  /**
   * Get checklist results for the current user
   * @param {string} checklistType - Optional filter by checklist type
   * @returns {Promise<Array>} - Array of checklist results
   */
  static async getUserChecklistResults(checklistType = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('checklist_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (checklistType) {
        query = query.eq('checklist_type', checklistType);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching checklist results:', error);
      throw error;
    }
  }

  /**
   * Get all checklist results (admin only)
   * @param {string} checklistType - Optional filter by checklist type
   * @returns {Promise<Array>} - Array of all checklist results
   */
  static async getAllChecklistResults(checklistType = null) {
    try {
      let query = supabase
        .from('checklist_results')
        .select(`
          *,
          profiles!inner(full_name, id_number)
        `)
        .order('created_at', { ascending: false });

      if (checklistType) {
        query = query.eq('checklist_type', checklistType);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching all checklist results:', error);
      throw error;
    }
  }

  /**
   * Get checklist results statistics for a user
   * @param {string} userId - User ID (optional, defaults to current user)
   * @returns {Promise<Object>} - Statistics object
   */
  static async getChecklistStatistics(userId = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user && !userId) {
        throw new Error('User not authenticated');
      }

      const targetUserId = userId || user.id;

      const { data, error } = await supabase
        .from('checklist_results')
        .select('checklist_type, status, score, total_items, created_at')
        .eq('user_id', targetUserId);

      if (error) {
        throw error;
      }

      // Calculate statistics
      const stats = {
        totalAssessments: data.length,
        totalPassed: data.filter(r => r.status === 'PASS').length,
        totalFailed: data.filter(r => r.status === 'FAIL').length,
        averageScore: 0,
        byChecklistType: {},
        recentAssessments: data.slice(0, 10)
      };

      if (data.length > 0) {
        const totalScore = data.reduce((sum, r) => sum + r.score, 0);
        const totalPossible = data.reduce((sum, r) => sum + r.total_items, 0);
        stats.averageScore = totalPossible > 0 ? (totalScore / totalPossible * 100).toFixed(1) : 0;

        // Group by checklist type
        data.forEach(result => {
          if (!stats.byChecklistType[result.checklist_type]) {
            stats.byChecklistType[result.checklist_type] = {
              total: 0,
              passed: 0,
              failed: 0,
              averageScore: 0
            };
          }
          stats.byChecklistType[result.checklist_type].total++;
          if (result.status === 'PASS') {
            stats.byChecklistType[result.checklist_type].passed++;
          } else {
            stats.byChecklistType[result.checklist_type].failed++;
          }
        });

        // Calculate average scores per checklist type
        Object.keys(stats.byChecklistType).forEach(type => {
          const typeResults = data.filter(r => r.checklist_type === type);
          const typeTotalScore = typeResults.reduce((sum, r) => sum + r.score, 0);
          const typeTotalPossible = typeResults.reduce((sum, r) => sum + r.total_items, 0);
          stats.byChecklistType[type].averageScore = typeTotalPossible > 0 
            ? (typeTotalScore / typeTotalPossible * 100).toFixed(1) 
            : 0;
        });
      }

      return stats;
    } catch (error) {
      console.error('Error fetching checklist statistics:', error);
      throw error;
    }
  }

  /**
   * Delete a checklist result
   * @param {string} resultId - ID of the result to delete
   * @returns {Promise<boolean>} - Success status
   */
  static async deleteChecklistResult(resultId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('checklist_results')
        .delete()
        .eq('id', resultId)
        .eq('user_id', user.id); // Ensure user can only delete their own results

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error deleting checklist result:', error);
      throw error;
    }
  }
}
