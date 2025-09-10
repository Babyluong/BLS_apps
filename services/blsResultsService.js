// services/blsResultsService.js
import supabase from './supabase';

export class BLSResultsService {
  /**
   * Save BLS assessment results to the database
   * @param {Object} results - The BLS assessment results
   * @param {number} results.preTestScore - Pre-test score (0-30)
   * @param {number} results.postTestScore - Post-test score (0-30)
   * @param {Object} results.checklistResults - Checklist pass/fail status
   * @param {Object} results.checklistDetails - Detailed checklist breakdown
   * @returns {Promise<Object>} - Saved result data
   */
  static async saveBLSResults(results) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Prepare the data for insertion
      const resultData = {
        user_id: user.id,
        pre_test_score: results.preTestScore,
        post_test_score: results.postTestScore,
        one_man_cpr_pass: results.checklistResults.oneManCprPass || false,
        two_man_cpr_pass: results.checklistResults.twoManCprPass || false,
        adult_choking_pass: results.checklistResults.adultChokingPass || false,
        infant_choking_pass: results.checklistResults.infantChokingPass || false,
        infant_cpr_pass: results.checklistResults.infantCprPass || false,
        one_man_cpr_details: results.checklistDetails['one-man-cpr'] || { performed: [], notPerformed: [] },
        two_man_cpr_details: results.checklistDetails['two-man-cpr'] || { performed: [], notPerformed: [] },
        adult_choking_details: results.checklistDetails['adult-choking'] || { performed: [], notPerformed: [] },
        infant_choking_details: results.checklistDetails['infant-choking'] || { performed: [], notPerformed: [] },
        infant_cpr_details: results.checklistDetails['infant-cpr'] || { performed: [], notPerformed: [] }
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
   * Get BLS results for the current user
   * @returns {Promise<Array>} - Array of BLS results
   */
  static async getUserBLSResults() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // First, get the BLS results
      const { data: results, error: resultsError } = await supabase
        .from('bls_results')
        .select(`
          id,
          created_at,
          user_id,
          pre_test_score,
          post_test_score,
          one_man_cpr_pass,
          two_man_cpr_pass,
          adult_choking_pass,
          infant_choking_pass,
          infant_cpr_pass,
          one_man_cpr_details,
          two_man_cpr_details,
          adult_choking_details,
          infant_choking_details,
          infant_cpr_details
        `)
        .eq('user_id', user.id)
        .not('pre_test_score', 'is', null)
        .not('post_test_score', 'is', null)
        .order('created_at', { ascending: false });

      if (resultsError) {
        throw resultsError;
      }

      if (!results || results.length === 0) {
        return [];
      }

      // Then, get the user profile information
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
   * Get all BLS results (admin only)
   * @returns {Promise<Array>} - Array of all BLS results
   */
  static async getAllBLSResults() {
    try {
      // First, get all BLS results
      const { data: results, error: resultsError } = await supabase
        .from('bls_results')
        .select(`
          id,
          created_at,
          user_id,
          pre_test_score,
          post_test_score,
          one_man_cpr_pass,
          two_man_cpr_pass,
          adult_choking_pass,
          infant_choking_pass,
          infant_cpr_pass,
          one_man_cpr_details,
          two_man_cpr_details,
          adult_choking_details,
          infant_choking_details,
          infant_cpr_details
        `)
        .not('pre_test_score', 'is', null)
        .not('post_test_score', 'is', null)
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
          full_name: 'Unknown User',
          id_number: 'N/A'
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
