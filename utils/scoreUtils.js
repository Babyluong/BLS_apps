// utils/scoreUtils.js
// Utility functions for quiz scoring and categorization

/**
 * Clinical job positions that require higher pass threshold (25+)
 * Only these 7 positions are considered clinical
 */
const CLINICAL_JAWATAN = [
  "PEGAWAI PERUBATAN",
  "PENOLONG PEGAWAI PERUBATAN",
  "JURURAWAT",
  "JURURAWAT MASYARAKAT",
  "PEMBANTU PERAWATAN KESIHATAN",
  "PEGAWAI PERGIGIAN",
  "JURUTERAPI PERGIGIAN"
];

/**
 * Determine if a user is clinical or non-clinical based on jawatan
 * @param {string} jawatan - User's job position
 * @returns {string} - 'clinical' or 'non-clinical'
 */
export function getUserCategory(jawatan) {
  if (!jawatan) return 'non-clinical';
  
  const jawatanUpper = String(jawatan).toUpperCase().trim();
  
  // Check if any clinical jawatan is contained in the user's jawatan
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
  return category === 'clinical' ? 25 : 20;
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
    if (score >= 28) return 'A';
    if (score >= 26) return 'B';
    if (score >= 25) return 'C';
    return 'D';
  } else {
    // Non-clinical
    if (score >= 27) return 'A';
    if (score >= 24) return 'B';
    if (score >= 21) return 'C';
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
