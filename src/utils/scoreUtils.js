// src/utils/scoreUtils.js
// Utility functions for scoring and categorization

import { APP_CONFIG, JOB_POSITIONS } from '../config/appConfig.js';

// Clinical job positions - centralized from appConfig
const CLINICAL_JAWATAN = JOB_POSITIONS.CLINICAL;

// Get user category (clinical or non-clinical) - synchronous version
export function getUserCategorySync(jawatan) {
  if (!jawatan) return 'non-clinical';
  
  const normalizedJawatan = jawatan.toUpperCase().trim();
  return CLINICAL_JAWATAN.includes(normalizedJawatan) ? 'clinical' : 'non-clinical';
}

// Get user category (clinical or non-clinical) - async version with database fallback
export async function getUserCategory(jawatan) {
  try {
    // Try to get from database first
    const { getJawatanCategory } = await import('./jawatanCategoryUtils.js');
    return await getJawatanCategory(jawatan);
  } catch (error) {
    console.warn('Error getting category from database, using fallback:', error);
    return getUserCategorySync(jawatan);
  }
}

// Get pass threshold based on category
export function getPassThreshold(category) {
  if (category === 'clinical') {
    return APP_CONFIG.SCORING.CLINICAL_PASS_THRESHOLD;
  }
  return APP_CONFIG.SCORING.NON_CLINICAL_PASS_THRESHOLD;
}

// Calculate grade based on score and category
export function calculateGrade(score, category) {
  const grades = category === 'clinical' 
    ? APP_CONFIG.SCORING.CLINICAL_GRADES 
    : APP_CONFIG.SCORING.NON_CLINICAL_GRADES;
  
  if (score >= grades.A) return 'A';
  if (score >= grades.B) return 'B';
  if (score >= grades.C) return 'C';
  if (score >= grades.D) return 'D';
  return 'F';
}

// Check if post test is passing
export function isPostTestPassing(score, category) {
  const threshold = getPassThreshold(category);
  return score >= threshold;
}

// Get score color based on score and category
export function getScoreColor(score, category) {
  const threshold = getPassThreshold(category);
  
  if (score >= threshold) {
    if (score >= (threshold + 5)) return '#4CAF50'; // Green
    return '#8BC34A'; // Light Green
  }
  return '#F44336'; // Red
}

// Get score text color based on score and category
export function getScoreTextColor(score, category) {
  const threshold = getPassThreshold(category);
  
  if (score >= threshold) {
    return '#FFFFFF'; // White
  }
  return '#FFFFFF'; // White
}

// Calculate if remedial is allowed
export function calculateRemedialAllowed(score, category) {
  const threshold = getPassThreshold(category);
  return score < threshold;
}

// Calculate if certified
export function calculateCertified(postTestScore, category, checklistResults) {
  const hasPassingPostTest = isPostTestPassing(postTestScore, category);
  const hasAllChecklists = checklistResults && 
    checklistResults.one_man_cpr?.status === 'PASS' && 
    checklistResults.two_man_cpr?.status === 'PASS' && 
    checklistResults.adult_choking?.status === 'PASS' && 
    checklistResults.infant_choking?.status === 'PASS' && 
    checklistResults.infant_cpr?.status === 'PASS';
  
  return hasPassingPostTest && hasAllChecklists;
}