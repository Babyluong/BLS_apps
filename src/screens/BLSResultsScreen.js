import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Modal,
  StyleSheet
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LuxuryShell from '../components/LuxuryShell';
import CertificateScreen from './CertificateScreen';
import supabase from '../services/supabase';
import { getUserCategory, getUserCategorySync } from '../utils/scoreUtils';
import { getJawatanCategory } from '../utils/jawatanCategoryUtils';

// Import new components
import AllResultsTab from '../components/AllResultsTab';
import DashboardTab from '../components/DashboardTab';
import PreTestStatsTab from '../components/PreTestStatsTab';
import PostTestStatsTab from '../components/PostTestStatsTab';
import DatePicker from '../components/DatePicker';
import SearchControls from '../components/SearchControls';
import PaginationControls from '../components/PaginationControls';
import ChecklistDetailsModal from '../components/ChecklistDetailsModal';
import QuizDetailsModal from '../components/QuizDetailsModal';

// Import utilities and styles
import { 
  getJawatanWithFallback,
  calculateRemedialAllowed,
  getScoreColor,
  getScoreTextColor,
  isPostTestPassing,
  calculateCertified,
  getChecklistDisplayName,
  processQuestionsFromDatabase,
  showHighestScorers,
  calculateDashboardStats,
  exportToCSV
} from '../utils/blsResultsUtils';
import { styles } from '../styles/blsResultsStyles';

export default function BLSResultsScreen({ onBack, onSignOut, onNavigate }) {
  // State management
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState(null);
  const [dateFilterType, setDateFilterType] = useState('all');
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(20);
  
  // Modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  
  // Statistics state
  const [pretestStats, setPretestStats] = useState([]);
  const [posttestStats, setPosttestStats] = useState([]);
  const [users, setUsers] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [uniqueParticipantCount, setUniqueParticipantCount] = useState(0);

  // Load results - Updated to use unified bls_results table
  const loadResults = useCallback(async () => {
    console.log("=== loadResults function called (using unified bls_results) ===");
    setLoading(true);
    setError("");
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("User not logged in.");
        setLoading(false);
        return;
      }
      
      setCurrentUser(user);
      
      // Check if user is admin
      const { data: userData } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .single();
      
      const isAdmin = userData?.role === 'admin';
      
      // Fetch unified BLS results from bls_results table
      console.log("Fetching unified BLS results...");
      let resultsQuery = supabase
        .from("bls_results")
        .select(`
          id,
          user_id,
          participant_name,
          participant_ic,
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
          infant_cpr_details,
          created_at,
          updated_at
        `)
        .order("created_at", { ascending: false });

      if (!isAdmin) {
        resultsQuery = resultsQuery.eq("user_id", user.id);
      }

      const { data: blsResults, error: resultsError } = await resultsQuery;
      if (resultsError) {
        console.error("Error fetching BLS results:", resultsError);
        throw new Error(`Failed to fetch results: ${resultsError.message}`);
      }

      console.log("BLS results fetched successfully:", blsResults?.length || 0, "records");

      // Get user profiles for additional information (jawatan, role)
      const userIds = [...new Set(blsResults?.map(r => r.user_id) || [])];
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, jawatan, role")
        .in("id", userIds);

      if (profilesError) {
        console.warn("Error fetching profiles:", profilesError);
      }

      // Create profile map
      const profileMap = new Map();
      if (profiles) {
        profiles.forEach(profile => {
          profileMap.set(profile.id, profile);
        });
      }

      // Process results into the expected format
      const processedResults = await Promise.all((blsResults || []).map(async (result) => {
        const profile = profileMap.get(result.user_id);
        const jawatan = profile?.jawatan || 'N/A';
        
        // Use database categorization with fallback to sync version
        let category = 'non-clinical';
        try {
          category = await getJawatanCategory(jawatan);
        } catch (error) {
          console.warn('Error getting category from database, using fallback:', error);
          category = getUserCategorySync(jawatan);
        }
        
        return {
          id: result.id,
          user_id: result.user_id,
          participant_ic: result.participant_ic || 'N/A',
          participant_name: result.participant_name || 'Unknown',
          participantName: result.participant_name || 'Unknown', // For component compatibility
          participantIc: result.participant_ic || 'N/A', // For component compatibility
          jawatan: jawatan,
          role: profile?.role || 'user',
          category: category,
          date: result.created_at ? new Date(result.created_at).toLocaleDateString() : 'N/A',
          
          // Pre-test data
          preTestScore: result.pre_test_score,
          pretest: result.pre_test_score !== null ? {
            score: result.pre_test_score,
            percentage: Math.round((result.pre_test_score / 30) * 100),
            date: result.created_at
          } : null,
          
          // Post-test data
          postTestScore: result.post_test_score,
          posttest: result.post_test_score !== null ? {
            score: result.post_test_score,
            percentage: Math.round((result.post_test_score / 30) * 100),
            date: result.created_at
          } : null,
          
          // Checklist results - for component compatibility
          oneManCprPass: result.one_man_cpr_pass,
          twoManCprPass: result.two_man_cpr_pass,
          adultChokingPass: result.adult_choking_pass,
          infantChokingPass: result.infant_choking_pass,
          infantCprPass: result.infant_cpr_pass,
          
          // Checklist results - detailed format
          one_man_cpr: result.one_man_cpr_pass !== null ? {
            score: result.one_man_cpr_pass ? 10 : 0,
            status: result.one_man_cpr_pass ? 'PASS' : 'FAIL',
            details: result.one_man_cpr_details,
            date: result.created_at
          } : null,
          
          two_man_cpr: result.two_man_cpr_pass !== null ? {
            score: result.two_man_cpr_pass ? 10 : 0,
            status: result.two_man_cpr_pass ? 'PASS' : 'FAIL',
            details: result.two_man_cpr_details,
            date: result.created_at
          } : null,
          
          adult_choking: result.adult_choking_pass !== null ? {
            score: result.adult_choking_pass ? 10 : 0,
            status: result.adult_choking_pass ? 'PASS' : 'FAIL',
            details: result.adult_choking_details,
            date: result.created_at
          } : null,
          
          infant_choking: result.infant_choking_pass !== null ? {
            score: result.infant_choking_pass ? 10 : 0,
            status: result.infant_choking_pass ? 'PASS' : 'FAIL',
            details: result.infant_choking_details,
            date: result.created_at
          } : null,
          
          infant_cpr: result.infant_cpr_pass !== null ? {
            score: result.infant_cpr_pass ? 10 : 0,
            status: result.infant_cpr_pass ? 'PASS' : 'FAIL',
            details: result.infant_cpr_details,
            date: result.created_at
          } : null,
          
          // Metadata
          latest_date: result.updated_at || result.created_at,
          created_at: result.created_at,
          updated_at: result.updated_at
        };
      });
      
      console.log("Processed results:", processedResults.length, "participants");
      
      // Debug: Show sample data
      if (processedResults.length > 0) {
        console.log("Sample processed result:", JSON.stringify(processedResults[0], null, 2));
      }
      
      setResults(processedResults);
      setUniqueParticipantCount(processedResults.length);
      
    } catch (e) {
      console.error('Error loading results:', e);
      setError(String(e?.message || e));
      setResults([]);
    } finally {
      console.log("=== loadResults function completed ===");
      setLoading(false);
    }
  }, []);

  // Load question statistics
  const loadQuestionStatistics = useCallback(async () => {
    try {
      console.log('🔍 DEBUG: loadQuestionStatistics called');
      
      // Load pretest questions
      const { data: pretestQuestions } = await supabase
        .from("questions")
        .select("*")
        .eq("soalan_set", "Pre_Test")
        .limit(30);
        
      console.log(`🔍 DEBUG: Found ${pretestQuestions?.length || 0} pretest questions`);
      
      // Load posttest questions - get all sets first, then filter based on actual usage
      const { data: allPosttestQuestions } = await supabase
        .from("questions")
        .select("*")
        .in("soalan_set", ["SET_A", "SET_B", "SET_C"])
        .limit(90);

      // Get all quiz sessions to determine which sets were actually used
      const { data: allQuizSessions } = await supabase
        .from("quiz_sessions")
        .select("answers")
        .eq("quiz_key", "posttest")
        .eq("status", "submitted");

      // Extract which sets were actually answered
      const usedSets = new Set();
      if (allQuizSessions) {
        allQuizSessions.forEach(session => {
          if (session.answers?._selected_set) {
            usedSets.add(session.answers._selected_set);
          }
        });
      }

      // Filter questions to only include sets that were actually answered
      const posttestQuestions = allPosttestQuestions?.filter(q => 
        usedSets.has(q.soalan_set)
      ) || [];

      // Calculate statistics for pretest
      if (pretestQuestions && pretestQuestions.length > 0) {
        console.log('🔍 DEBUG: About to calculate pretest statistics');
        const pretestStats = await calculateQuestionStatistics('pretest', pretestQuestions);
        console.log('🔍 DEBUG: Pretest statistics calculated:', pretestStats.length);
        setPretestStats(pretestStats);
      } else {
        console.log('🔍 DEBUG: No pretest questions found or questions array is empty');
        setPretestStats([]);
      }

      // Calculate statistics for posttest
      if (posttestQuestions && posttestQuestions.length > 0) {
        console.log('🔍 DEBUG: About to calculate posttest statistics');
        const posttestStats = await calculateQuestionStatistics('posttest', posttestQuestions);
        console.log('🔍 DEBUG: Posttest statistics calculated:', posttestStats.length);
        setPosttestStats(posttestStats);
      } else {
        console.log('🔍 DEBUG: No posttest questions found or questions array is empty');
        setPosttestStats([]);
      }
    } catch (err) {
      console.error('Error loading question statistics:', err);
      setPretestStats([]);
      setPosttestStats([]);
    }
  }, []);

  // Calculate statistics for questions
  const calculateQuestionStatistics = async (quizType, questions) => {
    try {
      console.log(`🔍 DEBUG: calculateQuestionStatistics called for ${quizType} with ${questions.length} questions`);
      
      // Get all quiz sessions for this quiz type
      const { data: quizSessions } = await supabase
        .from("quiz_sessions")
        .select("answers, score, total_questions")
        .eq("quiz_key", quizType)
        .eq("status", "submitted");

      if (!quizSessions || quizSessions.length === 0) {
        console.log(`🔍 DEBUG: No quiz sessions found for ${quizType}`);
        return [];
      }

      console.log(`🔍 DEBUG: Found ${quizSessions.length} quiz sessions for ${quizType}`);

      // Process each question
      const questionStats = questions.map(question => {
        let correctCount = 0;
        let incorrectCount = 0;
        let totalAttempts = 0;

        quizSessions.forEach(session => {
          if (session.answers && session.answers[question.id]) {
            totalAttempts++;
            if (session.answers[question.id] === question.correct_answer) {
              correctCount++;
            } else {
              incorrectCount++;
            }
          }
        });

        const accuracy = totalAttempts > 0 ? (correctCount / totalAttempts) * 100 : 0;

        return {
          id: question.id,
          questionNumber: question.question_number,
          question: question.question,
          correctAnswer: question.correct_answer,
          correctCount,
          incorrectCount,
          totalAttempts,
          accuracy: Math.round(accuracy * 100) / 100
        };
      });

      console.log(`🔍 DEBUG: Calculated statistics for ${questionStats.length} questions in ${quizType}`);
      return questionStats;

    } catch (error) {
      console.error(`Error calculating question statistics for ${quizType}:`, error);
      return [];
    }
  };

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadResults();
    await loadQuestionStatistics();
    setRefreshing(false);
  }, [loadResults, loadQuestionStatistics]);

  // Filter results based on search and date
  const getFilteredResults = useCallback(() => {
    let filtered = [...results];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(result =>
        result.participant_name?.toLowerCase().includes(query) ||
        result.participant_ic?.toLowerCase().includes(query) ||
        result.jawatan?.toLowerCase().includes(query)
      );
    }

    // Apply date filter
    if (dateFilterType === 'today') {
      const today = new Date().toDateString();
      filtered = filtered.filter(result => new Date(result.latest_date).toDateString() === today);
    } else if (dateFilterType === '7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = filtered.filter(result => new Date(result.latest_date) >= sevenDaysAgo);
    } else if (dateFilterType === 'custom' && dateFilter) {
      const filterDate = new Date(dateFilter).toDateString();
      filtered = filtered.filter(result => new Date(result.latest_date).toDateString() === filterDate);
    }

    return filtered;
  }, [results, searchQuery, dateFilter, dateFilterType]);

  // Get paginated results
  const getPaginatedResults = useCallback(() => {
    const filtered = getFilteredResults();
    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    return filtered.slice(startIndex, endIndex);
  }, [getFilteredResults, currentPage, resultsPerPage]);

  // Get total pages
  const getTotalPages = useCallback(() => {
    const filtered = getFilteredResults();
    return Math.ceil(filtered.length / resultsPerPage);
  }, [getFilteredResults, resultsPerPage]);

  // Calculate dashboard statistics
  const getNewDashboardStats = useCallback(() => {
    const allResults = getFilteredResults();
    return calculateDashboardStats(allResults);
  }, [getFilteredResults]);

  // Event handlers
  const handleResultsPerPageChange = (newResultsPerPage) => {
    setResultsPerPage(newResultsPerPage);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleMetricCardClick = (category, filterType) => {
    const allResults = getFilteredResults();
    let filtered = [];

    switch (filterType) {
      case 'clinical':
        filtered = allResults.filter(r => r.category === 'clinical');
        setSelectedCategory('Clinical Staff');
        break;
      case 'non-clinical':
        filtered = allResults.filter(r => r.category === 'non-clinical');
        setSelectedCategory('Non-Clinical Staff');
        break;
      case 'pre-test-pass':
        filtered = allResults.filter(r => 
          r.pretest?.score !== null && r.pretest?.score >= 20
        );
        setSelectedCategory('Pre-Test Pass');
        break;
      case 'post-test-pass':
        filtered = allResults.filter(r => 
          r.posttest?.score !== null && r.posttest?.score >= 20
        );
        setSelectedCategory('Post-Test Pass');
        break;
      case 'certified':
        filtered = allResults.filter(r => {
          const hasPassingPostTest = r.posttest?.score >= 20;
          const hasAllChecklists = r.one_man_cpr?.status === 'PASS' && 
                                 r.two_man_cpr?.status === 'PASS' && 
                                 r.adult_choking?.status === 'PASS' && 
                                 r.infant_choking?.status === 'PASS' && 
                                 r.infant_cpr?.status === 'PASS';
          return hasPassingPostTest && hasAllChecklists;
        });
        setSelectedCategory('Certified Participants');
        break;
      default:
        filtered = allResults;
        setSelectedCategory('All Participants');
    }

    setShowParticipantModal(filtered);
  };

  const handleShowHighestScorers = (category) => {
    const allResults = getFilteredResults();
    showHighestScorers(category, allResults, activeTab, setSelectedCategory, setShowParticipantModal);
  };

  const handleViewDetails = (result) => {
    setSelectedResult(result);
    setShowDetailModal(true);
  };

  const handleViewChecklistDetails = (result, checklistType) => {
    // Map checklist type to data key (hyphens to underscores)
    const dataKeyMap = {
      'one-man-cpr': 'one_man_cpr',
      'two-man-cpr': 'two_man_cpr',
      'adult-choking': 'adult_choking',
      'infant-choking': 'infant_choking',
      'infant-cpr': 'infant_cpr'
    };
    
    const dataKey = dataKeyMap[checklistType];
    const checklistData = result[dataKey];
    
    if (checklistData && checklistData.details) {
      setSelectedChecklist({
        participantName: result.participant_name,
        participantId: result.participant_ic,
        checklistType,
        details: checklistData,
        displayName: getChecklistDisplayName(checklistType)
      });
      setShowChecklistModal(true);
    }
  };

  const handleViewQuizDetails = async (result, testType) => {
    try {
      // Fetch quiz data from quiz_sessions table
      const { data: quizData, error } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('participant_ic', result.participant_ic)
        .eq('quiz_key', testType === 'preTest' ? 'pretest' : 'posttest')
        .single();

      if (error || !quizData) {
        console.error('Error fetching quiz data:', error);
        return;
      }

      // Process quiz data for display
      const questions = await processQuizQuestions(quizData.answers, quizData.score, testType, quizData);
      
      const processedQuizData = {
        participantName: result.participant_name,
        participantId: result.participant_ic,
        testType: testType,
        score: quizData.score,
        totalQuestions: quizData.total_questions,
        answers: quizData.answers,
        questions: questions,
        setIdentifier: quizData.set_identifier || quizData.answers?._selected_set?.replace('SET_', '')
      };

      setSelectedQuiz(processedQuizData);
      setShowQuizModal(true);
    } catch (error) {
      console.error('Error handling quiz details:', error);
    }
  };

  const processQuizQuestions = async (answers, score, testType, quizData) => {
    try {
      let questionSet, answerPrefix;
      
      if (testType === 'preTest') {
        // Pre-test uses Pre_Test questions with malay-1, malay-2 format
        questionSet = 'Pre_Test';
        answerPrefix = 'malay';
      } else {
        // Post-test uses SET_A, SET_B, SET_C based on participant's set_identifier
        const setIdentifier = quizData?.set_identifier || quizData?.answers?._selected_set?.replace('SET_', '');
        questionSet = setIdentifier ? `SET_${setIdentifier}` : 'SET_A'; // Default to SET_A if no identifier
        answerPrefix = 'post-test';
      }

      // Fetch real questions from the questions table
      const { data: questionsData, error } = await supabase
        .from('questions')
        .select('*')
        .eq('soalan_set', questionSet)
        .order('id');

      if (error || !questionsData) {
        console.error('Error fetching questions:', error);
        return [];
      }

      const processedQuestions = [];
      
      // Process questions based on test type
      for (let i = 1; i <= 30; i++) {
        const userAnswer = answers[`${answerPrefix}-${i}`];
        const questionData = questionsData[i - 1]; // questionsData is 0-indexed
        
        if (questionData) {
          processedQuestions.push({
            question: questionData.question_text,
            questionEn: questionData.question_text_en,
            choices: [
              questionData.option_a,
              questionData.option_b,
              questionData.option_c,
              questionData.option_d
            ],
            choicesEn: [
              questionData.option_a_en,
              questionData.option_b_en,
              questionData.option_c_en,
              questionData.option_d_en
            ],
            correctAnswer: questionData.correct_option.charCodeAt(0) - 65, // Convert A,B,C,D to 0,1,2,3
            userAnswer: userAnswer ? userAnswer.charCodeAt(0) - 65 : null,
            isCorrect: userAnswer === questionData.correct_option
          });
        }
      }

      return processedQuestions;
    } catch (error) {
      console.error('Error processing quiz questions:', error);
      return [];
    }
  };

  const handleShowCertificate = (result) => {
    setCertificateData(result);
    setShowCertificate(true);
  };

  const handleExportToCSV = () => {
    exportToCSV(getFilteredResults, getNewDashboardStats);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateFilter, dateFilterType]);

  // Load data on mount
  useEffect(() => {
    loadResults();
    loadQuestionStatistics();
  }, [loadResults, loadQuestionStatistics]);

  // Render tab content
  const renderTabContent = () => {
    const filteredResults = getFilteredResults();
    const paginatedResults = getPaginatedResults();
    const dashboardStats = getNewDashboardStats();

    switch (activeTab) {
      case 'all':
        return (
          <AllResultsTab
            results={paginatedResults}
            loading={loading}
            error={error}
            onRetry={loadResults}
            onViewDetails={handleViewDetails}
            onViewChecklistDetails={handleViewChecklistDetails}
            onViewQuizDetails={handleViewQuizDetails}
            onShowCertificate={handleShowCertificate}
            currentPage={currentPage}
            resultsPerPage={resultsPerPage}
            totalResults={filteredResults.length}
            onPageChange={handlePageChange}
            onResultsPerPageChange={handleResultsPerPageChange}
          />
        );
      
      case 'dashboard':
        return (
          <DashboardTab
            dashboardStats={dashboardStats}
            refreshing={refreshing}
            onRefresh={onRefresh}
            onMetricCardClick={handleMetricCardClick}
            onShowHighestScorers={handleShowHighestScorers}
          />
        );
      
      case 'pretest':
        return (
          <PreTestStatsTab
            stats={pretestStats}
            dashboardStats={dashboardStats}
            refreshing={refreshing}
            onRefresh={onRefresh}
            onShowHighestScorers={handleShowHighestScorers}
            onViewQuestionDetails={(question) => {
              // Handle question details view
              console.log('View question details:', question);
            }}
          />
        );
      
      case 'posttest':
        return (
          <PostTestStatsTab
            stats={posttestStats}
            dashboardStats={dashboardStats}
            refreshing={refreshing}
            onRefresh={onRefresh}
            onShowHighestScorers={handleShowHighestScorers}
            onViewQuestionDetails={(question) => {
              // Handle question details view
              console.log('View question details:', question);
            }}
          />
        );
      
      default:
        return null;
    }
  };

  // If showing certificate, render it as a full screen
  if (showCertificate && certificateData) {
    return (
      <CertificateScreen 
        participantData={certificateData}
        onBack={() => setShowCertificate(false)}
      />
    );
  }

  return (
    <LuxuryShell title="BLS Results - All Participants" onSignOut={onSignOut} onBack={onBack}>
      <View style={styles.container}>
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              ALL RESULTS
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]}
            onPress={() => setActiveTab('dashboard')}
          >
            <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>
              DASHBOARD
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'pretest' && styles.activeTab]}
            onPress={() => setActiveTab('pretest')}
          >
            <Text style={[styles.tabText, activeTab === 'pretest' && styles.activeTabText]}>
              PRE TEST STATS
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posttest' && styles.activeTab]}
            onPress={() => setActiveTab('posttest')}
          >
            <Text style={[styles.tabText, activeTab === 'posttest' && styles.activeTabText]}>
              POST TEST STATS
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search and Filter Controls */}
        {(activeTab === 'all' || activeTab === 'pretest' || activeTab === 'posttest') && (
          <SearchControls
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClearSearch={() => setSearchQuery('')}
            dateFilterType={dateFilterType}
            onDateFilterPress={() => setShowDatePicker(true)}
            showExportButton={activeTab === 'all'}
            onExportPress={handleExportToCSV}
          />
        )}

        {/* Pagination Controls - Only for All Results tab */}
        {activeTab === 'all' && getFilteredResults().length > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={getTotalPages()}
            resultsPerPage={resultsPerPage}
            totalResults={getFilteredResults().length}
            onPageChange={handlePageChange}
            onResultsPerPageChange={handleResultsPerPageChange}
          />
        )}

        {/* Summary Header */}
        {getFilteredResults().length > 0 && (
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryText}>
              {activeTab === 'all' && `Total Participants: ${uniqueParticipantCount}`}
              {activeTab === 'pretest' && `Pre-Test Participants: ${getNewDashboardStats().passFailStats.preTest.total}`}
              {activeTab === 'posttest' && `Post-Test Participants: ${getNewDashboardStats().passFailStats.postTest.total}`}
              {searchQuery && ` (filtered by "${searchQuery}")`}
              {dateFilterType === 'today' && ' (Today)'}
              {dateFilterType === '7days' && ' (Last 7 days)'}
              {dateFilterType === 'custom' && dateFilter && ` (${new Date(dateFilter).toLocaleDateString()})`}
            </Text>
            {activeTab === 'all' && (
              <Text style={styles.paginationInfo}>
                Showing {((currentPage - 1) * resultsPerPage) + 1}-{Math.min(currentPage * resultsPerPage, getFilteredResults().length)} of {getFilteredResults().length}
              </Text>
            )}
          </View>
        )}

        {/* Tab Content */}
        {renderTabContent()}

        {/* Date Picker Modal */}
        <DatePicker
          visible={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onSelectDate={setDateFilter}
          onSelectFilterType={setDateFilterType}
          selectedDate={dateFilter || new Date()}
          dateFilterType={dateFilterType}
          customDate={dateFilter}
        />

        {/* Checklist Details Modal */}
        <ChecklistDetailsModal
          visible={showChecklistModal}
          onClose={() => setShowChecklistModal(false)}
          checklistData={selectedChecklist}
        />

        {/* Quiz Details Modal */}
        <QuizDetailsModal
          visible={showQuizModal}
          onClose={() => setShowQuizModal(false)}
          quizData={selectedQuiz}
        />

        {/* Highest Scorers Modal */}
        <Modal
          visible={showParticipantModal !== false}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowParticipantModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedCategory}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowParticipantModal(false)}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalBody}>
                {Array.isArray(showParticipantModal) && showParticipantModal.length > 0 ? (
                  showParticipantModal.map((participant, index) => {
                    const testType = activeTab === 'pretest' ? 'preTest' : 'postTest';
                    const scoreField = testType === 'preTest' ? 'preTestScore' : 'postTestScore';
                    const score = participant[scoreField] || 0;
                    
                    return (
                      <View key={participant.id || index} style={styles.scorerItem}>
                        <View style={styles.rankContainer}>
                          <Text style={styles.rankText}>#{index + 1}</Text>
                        </View>
                        <View style={styles.scorerInfo}>
                          <Text style={styles.scorerName}>{participant.participantName || 'Unknown'}</Text>
                          <Text style={styles.scorerScore}>Score: {score}%</Text>
                          <Text style={styles.scorerCategory}>
                            {participant.category === 'clinical' ? 'Clinical' : 'Non-Clinical'}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>
                      {selectedCategory || 'No data available'}
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Add other modals here as needed */}
      </View>
    </LuxuryShell>
  );
}