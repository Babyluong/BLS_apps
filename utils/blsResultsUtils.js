import { Alert } from 'react-native';

// Get jawatan with fallback logic
export const getJawatanWithFallback = (userData, participantName, user_id, participantIc = null) => {
  if (!userData) {
    console.warn(`⚠️ No user data found for user_id: ${user_id}, participant: ${participantName}`);
    
    // Try to find user by name and IC in the users table as fallback
    if (participantName && participantIc) {
      console.log(`🔍 Attempting to find user by name and IC: ${participantName}, ${participantIc}`);
      // This will be handled by the improved data fetching logic
      return 'N/A - User not found in users table';
    }
    
    return 'N/A - No user data';
  }
  
  const jawatan = userData.jawatan || '';
  if (!jawatan || jawatan.trim() === '') {
    console.warn(`⚠️ Empty jawatan for ${participantName} (${user_id}), source: ${userData.source}`);
    return 'N/A - No jawatan data';
  }
  
  console.log(`✅ Jawatan found for ${participantName}:`, {
    jawatan,
    source: userData.source,
    user_id
  });
  
  return jawatan;
};

// Calculate remedial allowed status
export const calculateRemedialAllowed = (postTestScore, category = 'non-clinical') => {
  if (postTestScore === null) {
    return false; // No post-test taken, not allowed
  }
  return isPostTestPassing(postTestScore, category); // Only allowed if passing (green score)
};

// Get score color based on category and score
export const getScoreColor = (score, category, testType) => {
  if (score === null) return '#8a7f6a'; // N/A color
  
  const isClinical = category === 'clinical';
  const threshold = isClinical ? 25 : 20;
  
  return score < threshold ? '#dc3545' : '#28a745'; // Red if below threshold, green if above
};

// Get score text color for display
export const getScoreTextColor = (score, category, testType) => {
  if (score === null) return '#8a7f6a'; // N/A color
  
  const isClinical = category === 'clinical';
  const threshold = isClinical ? 25 : 20;
  
  return score < threshold ? '#dc3545' : '#28a745'; // Red if below threshold, green if above
};

// Check if pre-test score is passing (green) based on category thresholds
export const isPreTestPassing = (score, category) => {
  if (score === null) return false; // No score means not passing
  
  const isClinical = category === 'clinical';
  const threshold = isClinical ? 25 : 20;
  
  return score >= threshold; // Pass if score meets or exceeds threshold
};

// Check if post-test score is passing (green) based on category thresholds
export const isPostTestPassing = (score, category) => {
  if (score === null) return false; // No score means not passing
  
  const isClinical = category === 'clinical';
  const threshold = isClinical ? 25 : 20;
  
  return score >= threshold; // Pass if score meets or exceeds threshold
};

// Calculate certification status based on all checklists passed AND post-test passing (green score)
export const calculateCertified = (result) => {
  // Check if all required assessments are available using latestResults
  const hasAllChecklists = result.latestResults && 
                          result.latestResults['one-man-cpr'] && result.latestResults['one-man-cpr'].status &&
                          result.latestResults['two-man-cpr'] && result.latestResults['two-man-cpr'].status &&
                          result.latestResults['adult-choking'] && result.latestResults['adult-choking'].status &&
                          result.latestResults['infant-choking'] && result.latestResults['infant-choking'].status &&
                          result.latestResults['infant-cpr'] && result.latestResults['infant-cpr'].status;
  
  const hasPostTest = result.postTestScore !== null;
  
  // Only calculate certification if all assessments are available
  if (!hasAllChecklists || !hasPostTest) {
    return null; // Not enough data to determine certification
  }
  
  const allChecklistsPassed = result.oneManCprPass && 
                             result.twoManCprPass && 
                             result.adultChokingPass && 
                             result.infantChokingPass && 
                             result.infantCprPass;
  
  const postTestPassed = isPostTestPassing(result.postTestScore, result.category);
  
  return allChecklistsPassed && postTestPassed;
};

// Get checklist display name
export const getChecklistDisplayName = (checklistType) => {
  const displayNames = {
    'one-man-cpr': 'One Man CPR',
    'two-man-cpr': 'Two Man CPR',
    'adult-choking': 'Adult Choking',
    'infant-choking': 'Infant Choking',
    'infant-cpr': 'Infant CPR'
  };
  return displayNames[checklistType] || checklistType;
};

// Process questions from database
export const processQuestionsFromDatabase = (data, isPostTest = false) => {
  if (!data || !Array.isArray(data)) return [];
  
  return data.map((item, index) => {
    const question = item.question || `Question ${index + 1}`;
    const choices = item.choices || [];
    const correctAnswer = item.correct_answer;
    const userAnswer = item.user_answer;
    
    return {
      id: item.id || index,
      question,
      choices: choices.map((choice, choiceIndex) => ({
        id: choiceIndex,
        text: choice,
        isCorrect: choiceIndex === correctAnswer,
        isUserAnswer: choiceIndex === userAnswer
      })),
      correctAnswer,
      userAnswer,
      isCorrect: userAnswer === correctAnswer
    };
  });
};

// Show highest scorers modal
export const showHighestScorers = (category, allResults, activeTab, setSelectedCategory, setShowParticipantModal) => {
  try {
    const testType = activeTab === 'pretest' ? 'preTest' : 'postTest';
    const scoreField = testType === 'preTest' ? 'preTestScore' : 'postTestScore';
    
    console.log('🔍 DEBUG: showHighestScorers called', { category, testType, scoreField });
    console.log('🔍 DEBUG: allResults length:', allResults.length);
    
    const categoryResults = allResults.filter(r => r.category === category);
    console.log('🔍 DEBUG: categoryResults length:', categoryResults.length);
    
    // Filter participants who actually took the test
    const testParticipants = categoryResults.filter(r => r[scoreField] !== null && r[scoreField] !== undefined);
    console.log('🔍 DEBUG: testParticipants length:', testParticipants.length);
    
    if (testParticipants.length === 0) {
      Alert.alert(
        `Top ${category === 'clinical' ? 'Clinical' : 'Non-Clinical'} Scorers`,
        `No ${category} participants have taken the ${testType === 'preTest' ? 'pre-test' : 'post-test'} yet.`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Sort by score (highest first)
    const sortedParticipants = testParticipants.sort((a, b) => (b[scoreField] || 0) - (a[scoreField] || 0));
    
    // Get top 3
    const top3 = sortedParticipants.slice(0, 3);
    
    console.log('🔍 DEBUG: Top 3 participants:', top3.map(p => ({ name: p.participantName, score: p[scoreField] })));
    
    // Set the filtered results and show modal
    setSelectedCategory(`Top 3 ${category === 'clinical' ? 'Clinical' : 'Non-Clinical'} Scorers`);
    setShowParticipantModal(top3);
    
  } catch (error) {
    console.error('❌ Error in showHighestScorers:', error);
    Alert.alert('Error', 'Failed to load highest scorers. Please try again.');
  }
};

// Calculate dashboard statistics
export const calculateDashboardStats = (allResults) => {
  alert(`🔍 DEBUG: calculateDashboardStats called with allResults.length: ${allResults.length}`);
  console.log("🔍 DEBUG: calculateDashboardStats called with allResults:", allResults);
  console.log("🔍 DEBUG: allResults.length:", allResults.length);
  console.log("🔍 DEBUG: allResults sample:", allResults.slice(0, 2));
  
  const totalParticipants = allResults.length;

  if (totalParticipants === 0) {
    return {
      totalParticipants: 0,
      clinicalCount: 0,
      nonClinicalCount: 0,
      certifiedCount: 0,
      highestScores: { 
        clinical: { preTest: 0, postTest: 0 }, 
        nonClinical: { preTest: 0, postTest: 0 } 
      },
      passFailStats: { 
        preTest: { pass: 0, fail: 0, total: 0 }, 
        postTest: { pass: 0, fail: 0, total: 0 } 
      },
      questionAnalysis: []
    };
  }

  // Calculate highest scores by category and test type
  const clinicalResults = allResults.filter(r => r.category === 'clinical');
  const nonClinicalResults = allResults.filter(r => r.category === 'non-clinical');

  const clinicalPreTestScores = clinicalResults.filter(r => r.preTestScore !== null).map(r => r.preTestScore);
  const clinicalPostTestScores = clinicalResults.filter(r => r.postTestScore !== null).map(r => r.postTestScore);
  const nonClinicalPreTestScores = nonClinicalResults.filter(r => r.preTestScore !== null).map(r => r.preTestScore);
  const nonClinicalPostTestScores = nonClinicalResults.filter(r => r.postTestScore !== null).map(r => r.postTestScore);

  const highestScores = {
    clinical: {
      preTest: clinicalPreTestScores.length > 0 ? Math.max(...clinicalPreTestScores) : 0,
      postTest: clinicalPostTestScores.length > 0 ? Math.max(...clinicalPostTestScores) : 0
    },
    nonClinical: {
      preTest: nonClinicalPreTestScores.length > 0 ? Math.max(...nonClinicalPreTestScores) : 0,
      postTest: nonClinicalPostTestScores.length > 0 ? Math.max(...nonClinicalPostTestScores) : 0
    }
  };

  // Calculate pass/fail statistics
  const passFailStats = {
    preTest: {
      pass: allResults.filter(r => r.preTestScore !== null && isPreTestPassing(r.preTestScore, r.category)).length,
      fail: allResults.filter(r => r.preTestScore !== null && !isPreTestPassing(r.preTestScore, r.category)).length,
      total: allResults.filter(r => r.preTestScore !== null).length
    },
    postTest: {
      pass: allResults.filter(r => r.postTestScore !== null && isPostTestPassing(r.postTestScore, r.category)).length,
      fail: allResults.filter(r => r.postTestScore !== null && !isPostTestPassing(r.postTestScore, r.category)).length,
      total: allResults.filter(r => r.postTestScore !== null).length
    }
  };

  // Calculate additional dashboard metrics
  const clinicalCount = allResults.filter(r => r.category === 'clinical').length;
  const nonClinicalCount = allResults.filter(r => r.category === 'non-clinical').length;
  
  // Calculate certified count safely
  let certifiedCount = 0;
  try {
    certifiedCount = allResults.filter(r => {
      try {
        return calculateCertified(r);
      } catch (error) {
        console.warn('Error calculating certification for result:', r, error);
        return false;
      }
    }).length;
  } catch (error) {
    console.error('Error calculating certified count:', error);
    certifiedCount = 0;
  }

  const result = {
    totalParticipants: allResults.length,
    clinicalCount,
    nonClinicalCount,
    certifiedCount,
    highestScores,
    passFailStats,
    questionAnalysis: []
  };
  
  console.log("📊 calculateDashboardStats result:", result);
  console.log("🔍 DEBUG: Final counts - totalParticipants:", result.totalParticipants, "clinicalCount:", result.clinicalCount, "nonClinicalCount:", result.nonClinicalCount, "certifiedCount:", result.certifiedCount);
  console.log("🔍 DEBUG: PassFailStats - preTest.total:", result.passFailStats.preTest.total, "postTest.total:", result.passFailStats.postTest.total);
  return result;
};

// Export to CSV
export const exportToCSV = async (getFilteredResults, getNewDashboardStats) => {
  try {
    const results = getFilteredResults();
    const stats = getNewDashboardStats();
    
    // Create CSV headers
    const headers = [
      'Participant Name',
      'IC Number',
      'Category',
      'Jawatan',
      'Date',
      'Pre-Test Score',
      'Post-Test Score',
      'One Man CPR',
      'Two Man CPR',
      'Adult Choking',
      'Infant Choking',
      'Infant CPR',
      'Certified',
      'Remedial Allowed'
    ];
    
    // Create CSV rows
    const rows = results.map(result => [
      result.participantName || '',
      result.participantIc || '',
      result.category || '',
      result.jawatan || '',
      result.date || '',
      result.preTestScore || '',
      result.postTestScore || '',
      result.oneManCprPass ? 'PASS' : 'FAIL',
      result.twoManCprPass ? 'PASS' : 'FAIL',
      result.adultChokingPass ? 'PASS' : 'FAIL',
      result.infantChokingPass ? 'PASS' : 'FAIL',
      result.infantCprPass ? 'PASS' : 'FAIL',
      calculateCertified(result) ? 'YES' : 'NO',
      calculateRemedialAllowed(result.postTestScore, result.category) ? 'YES' : 'NO'
    ]);
    
    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bls_results_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    Alert.alert('Success', 'Results exported to CSV successfully!');
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    Alert.alert('Error', 'Failed to export results. Please try again.');
  }
};
