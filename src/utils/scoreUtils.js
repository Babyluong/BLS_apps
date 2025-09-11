// utils/scoreUtils.js
// Utility functions for quiz scoring and categorization

import { getJawatanCategory } from './jawatanCategoryUtils';
import { APP_CONFIG, JOB_POSITIONS } from '../config/appConfig';

/**
 * Clinical job positions that require higher pass threshold (25+)
 * Only these 7 positions are considered clinical
 * NOTE: This is now maintained in the database table 'jawatan_categories'
 * DEPRECATED: Use JOB_POSITIONS.CLINICAL from appConfig.js
 */
const CLINICAL_JAWATAN = JOB_POSITIONS.CLINICAL;

/**
 * Determine if a user is clinical or non-clinical based on jawatan
 * Uses database table for accurate categorization
 * @param {string} jawatan - User's job position
 * @returns {Promise<string>} - 'clinical' or 'non-clinical'
 */
export async function getUserCategory(jawatan) {
  if (!jawatan) return 'non-clinical';
  
  try {
    // Use database table for accurate categorization
    return await getJawatanCategory(jawatan);
  } catch (error) {
    console.error('Error getting user category from database, using fallback:', error);
    
    // Fallback to local logic if database fails
    const jawatanUpper = String(jawatan).toUpperCase().trim();
    const isClinical = CLINICAL_JAWATAN.some(clinicalJawatan => 
      jawatanUpper.includes(clinicalJawatan)
    );
    
    return isClinical ? 'clinical' : 'non-clinical';
  }
}

/**
 * Synchronous version for backward compatibility
 * @param {string} jawatan - User's job position
 * @returns {string} - 'clinical' or 'non-clinical'
 */
export function getUserCategorySync(jawatan) {
  if (!jawatan) return 'non-clinical';
  
  const jawatanUpper = String(jawatan).toUpperCase().trim();
  const isClinical = CLINICAL_JAWATAN.some(clinicalJawatan => 
    jawatanUpper.includes(clinicalJawatan)
  );
  
  return isClinical ? 'clinical' : 'non-clinical';
}

/**
 * Get pass threshold based on user category
 * @param {string} category - 'clinical' or 'non-clinical'
 * @returns {number} - Pass threshold score
 */
export function getPassThreshold(category) {
  return category === 'clinical' 
    ? APP_CONFIG.SCORING.CLINICAL_PASS_THRESHOLD 
    : APP_CONFIG.SCORING.NON_CLINICAL_PASS_THRESHOLD;
}

/**
 * Calculate grade based on score and category
 * @param {number} score - User's score (0-30)
 * @param {string} category - 'clinical' or 'non-clinical'
 * @returns {string} - Grade (A, B, C, D, F)
 */
export function calculateGrade(score, category) {
  const threshold = getPassThreshold(category);
  
  if (score < threshold) {
    return 'F'; // Fail
  }
  
  // Grade ranges based on category
  if (category === 'clinical') {
    const grades = APP_CONFIG.SCORING.CLINICAL_GRADES;
    if (score >= grades.A) return 'A';
    if (score >= grades.B) return 'B';
    if (score >= grades.C) return 'C';
    return 'D';
  } else {
    // Non-clinical
    const grades = APP_CONFIG.SCORING.NON_CLINICAL_GRADES;
    if (score >= grades.A) return 'A';
    if (score >= grades.B) return 'B';
    if (score >= grades.C) return 'C';
    return 'D';
  }
}

/**
 * Get grade description
 * @param {string} grade - Grade letter
 * @returns {string} - Grade description
 */
export function getGradeDescription(grade) {
  const descriptions = {
    'A': 'Cemerlang | Excellent',
    'B': 'Baik | Good', 
    'C': 'Memuaskan | Satisfactory',
    'D': 'Lulus | Pass',
    'F': 'Gagal | Fail'
  };
  return descriptions[grade] || 'Tidak Diketahui | Unknown';
}

/**
 * Calculate comprehensive score data
 * @param {number} score - User's score
 * @param {number} total - Total questions
 * @param {string} jawatan - User's job position
 * @returns {Object} - Complete score data
 */
export function calculateComprehensiveScore(score, total, jawatan) {
  const category = getUserCategory(jawatan);
  const threshold = getPassThreshold(category);
  const percentage = Math.round((score / total) * 100);
  const grade = calculateGrade(score, category);
  const passed = score >= threshold;
  
  return {
    score,
    total,
    percentage,
    category,
    threshold,
    grade,
    passed,
    gradeDescription: getGradeDescription(grade)
  };
}
