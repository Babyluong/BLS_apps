// src/utils/jawatanCategoryUtils.js
// Utility functions for jawatan categorization using Supabase table

import supabase from '../services/supabase';

/**
 * Get jawatan category from Supabase table
 * @param {string} jawatan - User's job position
 * @returns {Promise<string>} - 'clinical' or 'non-clinical'
 */
export async function getJawatanCategory(jawatan) {
  if (!jawatan) return 'non-clinical';
  
  try {
    // First try exact match
    const { data: exactMatch, error: exactError } = await supabase
      .from('jawatan_categories')
      .select('category')
      .eq('jawatan_name', jawatan.toUpperCase().trim())
      .eq('is_active', true)
      .single();
    
    if (!exactError && exactMatch) {
      return exactMatch.category;
    }
    
    // If no exact match, try partial match
    const { data: partialMatch, error: partialError } = await supabase
      .from('jawatan_categories')
      .select('category')
      .ilike('jawatan_name', `%${jawatan.toUpperCase().trim()}%`)
      .eq('is_active', true)
      .limit(1)
      .single();
    
    if (!partialError && partialMatch) {
      return partialMatch.category;
    }
    
    // If still no match, use the database function
    const { data: functionResult, error: functionError } = await supabase
      .rpc('get_jawatan_category', { jawatan_input: jawatan });
    
    if (!functionError && functionResult) {
      return functionResult;
    }
    
    // Default to non-clinical if all else fails
    return 'non-clinical';
    
  } catch (error) {
    console.error('Error getting jawatan category:', error);
    return 'non-clinical';
  }
}

/**
 * Get all jawatan categories from the table
 * @returns {Promise<Array>} - Array of jawatan categories
 */
export async function getAllJawatanCategories() {
  try {
    const { data, error } = await supabase
      .from('jawatan_categories_view')
      .select('*')
      .order('category', { ascending: true })
      .order('jawatan_name', { ascending: true });
    
    if (error) {
      console.error('Error fetching jawatan categories:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching jawatan categories:', error);
    return [];
  }
}

/**
 * Get clinical jawatan only
 * @returns {Promise<Array>} - Array of clinical jawatan
 */
export async function getClinicalJawatan() {
  try {
    const { data, error } = await supabase
      .from('jawatan_categories_view')
      .select('jawatan_name, description')
      .eq('category', 'clinical')
      .order('jawatan_name', { ascending: true });
    
    if (error) {
      console.error('Error fetching clinical jawatan:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching clinical jawatan:', error);
    return [];
  }
}

/**
 * Get non-clinical jawatan only
 * @returns {Promise<Array>} - Array of non-clinical jawatan
 */
export async function getNonClinicalJawatan() {
  try {
    const { data, error } = await supabase
      .from('jawatan_categories_view')
      .select('jawatan_name, description')
      .eq('category', 'non-clinical')
      .order('jawatan_name', { ascending: true });
    
    if (error) {
      console.error('Error fetching non-clinical jawatan:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching non-clinical jawatan:', error);
    return [];
  }
}

/**
 * Add a new jawatan category (admin only)
 * @param {string} jawatanName - Name of the jawatan
 * @param {string} category - 'clinical' or 'non-clinical'
 * @param {string} description - Description of the jawatan
 * @returns {Promise<boolean>} - Success status
 */
export async function addJawatanCategory(jawatanName, category, description = '') {
  try {
    const { error } = await supabase
      .from('jawatan_categories')
      .insert({
        jawatan_name: jawatanName.toUpperCase().trim(),
        category: category.toLowerCase(),
        description: description
      });
    
    if (error) {
      console.error('Error adding jawatan category:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error adding jawatan category:', error);
    return false;
  }
}

/**
 * Update jawatan category (admin only)
 * @param {string} jawatanName - Name of the jawatan
 * @param {string} newCategory - New category ('clinical' or 'non-clinical')
 * @param {string} newDescription - New description
 * @returns {Promise<boolean>} - Success status
 */
export async function updateJawatanCategory(jawatanName, newCategory, newDescription = '') {
  try {
    const { error } = await supabase
      .from('jawatan_categories')
      .update({
        category: newCategory.toLowerCase(),
        description: newDescription,
        updated_at: new Date().toISOString()
      })
      .eq('jawatan_name', jawatanName.toUpperCase().trim());
    
    if (error) {
      console.error('Error updating jawatan category:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating jawatan category:', error);
    return false;
  }
}

/**
 * Deactivate jawatan category (admin only)
 * @param {string} jawatanName - Name of the jawatan
 * @returns {Promise<boolean>} - Success status
 */
export async function deactivateJawatanCategory(jawatanName) {
  try {
    const { error } = await supabase
      .from('jawatan_categories')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('jawatan_name', jawatanName.toUpperCase().trim());
    
    if (error) {
      console.error('Error deactivating jawatan category:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deactivating jawatan category:', error);
    return false;
  }
}

/**
 * Sync existing profiles with new jawatan categories
 * This function can be used to update existing profiles with correct categories
 * @returns {Promise<Object>} - Sync results
 */
export async function syncProfilesWithJawatanCategories() {
  try {
    // Get all profiles with jawatan
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, jawatan')
      .not('jawatan', 'is', null);
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return { success: false, error: profilesError };
    }
    
    let updated = 0;
    let errors = 0;
    
    // Update each profile with correct category
    for (const profile of profiles) {
      try {
        const category = await getJawatanCategory(profile.jawatan);
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            category: category,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);
        
        if (updateError) {
          console.error(`Error updating profile ${profile.id}:`, updateError);
          errors++;
        } else {
          updated++;
        }
      } catch (error) {
        console.error(`Error processing profile ${profile.id}:`, error);
        errors++;
      }
    }
    
    return {
      success: true,
      updated,
      errors,
      total: profiles.length
    };
    
  } catch (error) {
    console.error('Error syncing profiles with jawatan categories:', error);
    return { success: false, error };
  }
}
