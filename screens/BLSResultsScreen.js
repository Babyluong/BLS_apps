import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Modal
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LuxuryShell from '../components/LuxuryShell';
import CertificateScreen from './CertificateScreen';
import supabase from '../services/supabase';
import { getUserCategory } from '../utils/scoreUtils';

// Import new components
import AllResultsTab from '../components/AllResultsTab';
import DashboardTab from '../components/DashboardTab';
import PreTestStatsTab from '../components/PreTestStatsTab';
import PostTestStatsTab from '../components/PostTestStatsTab';
import DatePicker from '../components/DatePicker';
import SearchControls from '../components/SearchControls';
import PaginationControls from '../components/PaginationControls';

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
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  
  // Statistics state
  const [pretestStats, setPretestStats] = useState([]);
  const [posttestStats, setPosttestStats] = useState([]);
  const [allQuestions, setAllQuestions] = useState({ pretest: [], posttest: [] });
  const [users, setUsers] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  // Load results
  const loadResults = useCallback(async () => {
    console.log("=== loadResults function called ===");
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
      console.log("🔍 DEBUG: User role check:", { user_id: user.id, role: userData?.role, isAdmin });
      
      // Fetch quiz sessions (pretest and posttest)
      console.log("Starting to fetch quiz sessions...");
      let quizQuery = supabase
        .from("quiz_sessions")
        .select(`
          id,
          user_id,
          quiz_key,
          score,
          total_questions,
          percentage,
          status,
          participant_name,
          participant_ic,
          answers,
          created_at,
          updated_at
        `)
        .in("quiz_key", ["pretest", "posttest"])
        .eq("status", "submitted")
        .order("created_at", { ascending: false });

      if (!isAdmin) {
        quizQuery = quizQuery.eq("user_id", user.id);
      }

      const { data: quizSessions, error: quizError } = await quizQuery;
      if (quizError) {
        console.error("Error fetching quiz sessions:", quizError);
      } else {
        console.log("🔍 DEBUG: Quiz sessions fetched successfully:", quizSessions?.length || 0);
        console.log("🔍 DEBUG: Sample quiz sessions:", quizSessions?.slice(0, 3));
        if (quizSessions && quizSessions.length > 0) {
          console.log("🔍 DEBUG: Quiz session user_ids:", quizSessions.map(s => s.user_id));
          console.log("🔍 DEBUG: Quiz session quiz_keys:", quizSessions.map(s => s.quiz_key));
        }
      }

      // Fetch checklist results
      let checklistQuery = supabase
        .from("checklist_results")
        .select(`
          id,
          user_id,
          participant_name,
          participant_ic,
          checklist_type,
          score,
          total_items,
          status,
          checklist_details,
          comments,
          created_at
        `)
        .in("status", ["PASS", "FAIL"])
        .order("created_at", { ascending: false });

      if (!isAdmin) {
        checklistQuery = checklistQuery.eq("user_id", user.id);
      }

      const { data: checklistResults, error: checklistError } = await checklistQuery;
      if (checklistError) {
        console.error("Error fetching checklist results:", checklistError);
      } else {
        console.log("🔍 DEBUG: Checklist results fetched successfully:", checklistResults?.length || 0);
        console.log("🔍 DEBUG: Sample checklist results:", checklistResults?.slice(0, 3));
        if (checklistResults && checklistResults.length > 0) {
          console.log("🔍 DEBUG: Checklist user_ids:", checklistResults.map(c => c.user_id));
          console.log("🔍 DEBUG: Checklist types:", checklistResults.map(c => c.checklist_type));
        }
      }

      // Fetch users data for category determination
      console.log("Fetching users data for category determination...");
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("id, full_name, ic, jawatan, job_position, gred, role")
        .order("full_name");
      
      if (usersError) {
        console.error("Error fetching users:", usersError);
      } else {
        console.log("🔍 DEBUG: Users fetched successfully:", usersData?.length || 0);
        console.log("🔍 DEBUG: Sample users data:", usersData?.slice(0, 3));
        if (usersData && usersData.length > 0) {
          console.log("🔍 DEBUG: User IDs:", usersData.map(u => u.id));
          console.log("🔍 DEBUG: User jawatan data:", usersData.map(u => ({ id: u.id, jawatan: u.jawatan, job_position: u.job_position, gred: u.gred })));
        }
        setUsers(usersData || []);
      }
      
      // Process and combine the data
      console.log("Processing quiz sessions and checklist results...");
      
      // Create a map of profiles for quick lookup
      const profileMap = new Map();
      (usersData || []).forEach(user => {
        profileMap.set(user.id, user);
      });
      
      // Group quiz sessions by user
      const quizByUser = {};
      if (quizSessions && quizSessions.length > 0) {
        quizSessions.forEach(session => {
          const userId = session.user_id;
          const profile = profileMap.get(userId);
          
          if (!quizByUser[userId]) {
            quizByUser[userId] = {
              user_id: userId,
              participantName: session.participant_name || profile?.full_name || 'Unknown',
              participantIc: session.participant_ic || profile?.ic || 'N/A',
              preTestScore: null,
              postTestScore: null,
              preTestDate: null,
              postTestDate: null
            };
          }
          
          if (session.quiz_key === 'pretest') {
            quizByUser[userId].preTestScore = session.score || 0;
            quizByUser[userId].preTestDate = session.created_at;
          } else if (session.quiz_key === 'posttest') {
            quizByUser[userId].postTestScore = session.score || 0;
            quizByUser[userId].postTestDate = session.created_at;
          }
        });
      }
      
      // Group checklist results by user
      const checklistByUser = {};
      if (checklistResults && checklistResults.length > 0) {
        checklistResults.forEach(result => {
          const userId = result.user_id;
          
          if (!checklistByUser[userId]) {
            checklistByUser[userId] = {
              user_id: userId,
              participantName: result.participant_name || 'Unknown',
              participantIc: result.participant_ic || 'N/A',
              checklists: {}
            };
          }
          
          checklistByUser[userId].checklists[result.checklist_type] = {
            status: result.status,
            score: result.score,
            totalItems: result.total_items,
            details: result.checklist_details,
            comments: result.comments,
            createdAt: result.created_at
          };
        });
      }
      
      // Get all unique user IDs
      const allUserIds = new Set([...Object.keys(quizByUser), ...Object.keys(checklistByUser)]);
      console.log("🔍 DEBUG: All unique user IDs:", Array.from(allUserIds));
      console.log("🔍 DEBUG: Quiz users:", Object.keys(quizByUser));
      console.log("🔍 DEBUG: Checklist users:", Object.keys(checklistByUser));
      
      // Create combined results
      const combinedResults = [];
      
      allUserIds.forEach(userId => {
        const quizData = quizByUser[userId] || { 
          user_id: userId, 
          participantName: 'Unknown', 
          participantIc: 'N/A',
          preTestScore: null,
          postTestScore: null,
          preTestDate: null,
          postTestDate: null
        };
        const checklistData = checklistByUser[userId] || { 
          user_id: userId, 
          participantName: 'Unknown', 
          participantIc: 'N/A', 
          checklists: {} 
        };
        
        // Get user profile for category determination
        const profile = profileMap.get(userId);
        const jawatan = profile?.jawatan || profile?.job_position || profile?.gred || null;
        const category = getUserCategory(jawatan);
        console.log(`🔍 DEBUG: User ${userId} - profile:`, { jawatan: profile?.jawatan, job_position: profile?.job_position, gred: profile?.gred, final_jawatan: jawatan, category });
        
        // Get checklist pass status
        const oneManCprPass = checklistData.checklists['one-man-cpr']?.status === 'PASS' || false;
        const twoManCprPass = checklistData.checklists['two-man-cpr']?.status === 'PASS' || false;
        const adultChokingPass = checklistData.checklists['adult-choking']?.status === 'PASS' || false;
        const infantChokingPass = checklistData.checklists['infant-choking']?.status === 'PASS' || false;
        const infantCprPass = checklistData.checklists['infant-cpr']?.status === 'PASS' || false;
        
        // Get jawatan with fallback
        const finalJawatan = getJawatanWithFallback(profile, quizData.participantName, userId, quizData.participantIc);
        
        // Determine the most recent date
        const dates = [quizData.preTestDate, quizData.postTestDate].filter(Boolean);
        const mostRecentDate = dates.length > 0 ? new Date(Math.max(...dates.map(d => new Date(d)))) : new Date();
        
        const combinedResult = {
          id: userId,
          participantId: userId,
          participantName: quizData.participantName || checklistData.participantName || 'Unknown',
          participantIc: quizData.participantIc || checklistData.participantIc || 'N/A',
          category: category,
          jawatan: finalJawatan,
          preTestScore: quizData.preTestScore,
          postTestScore: quizData.postTestScore,
          oneManCprPass: oneManCprPass,
          twoManCprPass: twoManCprPass,
          adultChokingPass: adultChokingPass,
          infantChokingPass: infantChokingPass,
          infantCprPass: infantCprPass,
          date: mostRecentDate.toISOString().split('T')[0],
          createdAt: mostRecentDate.toISOString(),
          // Store detailed checklist information
          checklistDetails: {
            'one-man-cpr': checklistData.checklists['one-man-cpr'] || null,
            'two-man-cpr': checklistData.checklists['two-man-cpr'] || null,
            'adult-choking': checklistData.checklists['adult-choking'] || null,
            'infant-choking': checklistData.checklists['infant-choking'] || null,
            'infant-cpr': checklistData.checklists['infant-cpr'] || null
          },
          // Store latest results for certification calculation
          latestResults: {
            'one-man-cpr': checklistData.checklists['one-man-cpr'] || { status: null },
            'two-man-cpr': checklistData.checklists['two-man-cpr'] || { status: null },
            'adult-choking': checklistData.checklists['adult-choking'] || { status: null },
            'infant-choking': checklistData.checklists['infant-choking'] || { status: null },
            'infant-cpr': checklistData.checklists['infant-cpr'] || { status: null }
          }
        };
        
        combinedResults.push(combinedResult);
        console.log(`✅ Created combined result for ${combinedResult.participantName} (${combinedResult.category})`);
      });
      
      console.log(`📊 Processed ${combinedResults.length} combined results`);
      console.log("🔍 DEBUG: Sample combined results:", combinedResults.slice(0, 2));
      console.log("🔍 DEBUG: Categories breakdown:", {
        clinical: combinedResults.filter(r => r.category === 'clinical').length,
        nonClinical: combinedResults.filter(r => r.category === 'non-clinical').length,
        total: combinedResults.length
      });
      
      // Debug: Check if we have any results with test scores
      const withPreTest = combinedResults.filter(r => r.preTestScore !== null).length;
      const withPostTest = combinedResults.filter(r => r.postTestScore !== null).length;
      console.log("🔍 DEBUG: Results with test scores:", { withPreTest, withPostTest });
      
      // Debug: Check if we have any results with checklist data
      const withChecklists = combinedResults.filter(r => 
        r.oneManCprPass || r.twoManCprPass || r.adultChokingPass || r.infantChokingPass || r.infantCprPass
      ).length;
      console.log("🔍 DEBUG: Results with checklist data:", withChecklists);
      
      // Debug: Show sample data structure
      if (combinedResults.length > 0) {
        const sample = combinedResults[0];
        console.log("🔍 DEBUG: Sample result structure:", {
          participantName: sample.participantName,
          category: sample.category,
          preTestScore: sample.preTestScore,
          postTestScore: sample.postTestScore,
          oneManCprPass: sample.oneManCprPass,
          twoManCprPass: sample.twoManCprPass
        });
      }
      
      alert(`🔍 DEBUG: LoadResults - Setting ${combinedResults.length} results`);
      setResults(combinedResults);
      
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

      setAllQuestions({
        pretest: pretestQuestions || [],
        posttest: posttestQuestions || []
      });

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
    console.log("🔍 DEBUG: getFilteredResults called with results:", results.length);
    let filtered = [...results];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(result =>
        result.participantName?.toLowerCase().includes(query) ||
        result.participantIc?.toLowerCase().includes(query) ||
        result.jawatan?.toLowerCase().includes(query)
      );
    }

    // Apply date filter
    if (dateFilterType === 'today') {
      const today = new Date().toDateString();
      filtered = filtered.filter(result => new Date(result.date).toDateString() === today);
    } else if (dateFilterType === '7days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = filtered.filter(result => new Date(result.date) >= sevenDaysAgo);
    } else if (dateFilterType === 'custom' && dateFilter) {
      const filterDate = new Date(dateFilter).toDateString();
      filtered = filtered.filter(result => new Date(result.date).toDateString() === filterDate);
    }

    console.log("🔍 DEBUG: getFilteredResults returning:", filtered.length, "results");
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
    alert(`🔍 DEBUG: getNewDashboardStats called with results.length: ${allResults.length}`);
    console.log("🔍 DEBUG: getNewDashboardStats called with results:", allResults.length);
    console.log("🔍 DEBUG: Sample results:", allResults.slice(0, 2));
    console.log("🔍 DEBUG: Results categories:", allResults.map(r => ({ name: r.participantName, category: r.category })));
    const stats = calculateDashboardStats(allResults);
    console.log("🔍 DEBUG: Calculated stats:", stats);
    console.log("🔍 DEBUG: Stats breakdown:", {
      totalParticipants: stats.totalParticipants,
      clinicalCount: stats.clinicalCount,
      nonClinicalCount: stats.nonClinicalCount,
      certifiedCount: stats.certifiedCount
    });
    return stats;
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
          r.preTestScore !== null && isPostTestPassing(r.preTestScore, r.category)
        );
        setSelectedCategory('Pre-Test Pass');
        break;
      case 'post-test-pass':
        filtered = allResults.filter(r => 
          r.postTestScore !== null && isPostTestPassing(r.postTestScore, r.category)
        );
        setSelectedCategory('Post-Test Pass');
        break;
      case 'certified':
        filtered = allResults.filter(r => calculateCertified(r));
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
    if (result.checklistDetails && result.checklistDetails[checklistType]) {
      const latestResult = result.latestResults?.[checklistType] || {};
      
      setSelectedChecklist({
        participantName: result.participantName,
        participantId: result.participantId,
        checklistType,
        details: latestResult,
        displayName: getChecklistDisplayName(checklistType)
      });
      setShowChecklistModal(true);
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
    
    // Debug: Log what we're passing to each tab
    console.log("🔍 DEBUG: renderTabContent called");
    console.log("🔍 DEBUG: activeTab:", activeTab);
    console.log("🔍 DEBUG: loading:", loading);
    console.log("🔍 DEBUG: results.length:", results.length);
    console.log("🔍 DEBUG: filteredResults.length:", filteredResults.length);
    console.log("🔍 DEBUG: dashboardStats:", dashboardStats);
    console.log("🔍 DEBUG: pretestStats.length:", pretestStats.length);
    console.log("🔍 DEBUG: posttestStats.length:", posttestStats.length);

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
      {/* DEBUG INFO */}
      <View style={{backgroundColor: 'red', padding: 10, margin: 5}}>
        <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>
          DEBUG: Results={results.length} | Loading={loading ? 'YES' : 'NO'} | Error={error || 'None'}
        </Text>
      </View>
      
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
              {activeTab === 'all' && `Total Participants: ${getFilteredResults().length}`}
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

        {/* Add other modals here as needed */}
      </View>
    </LuxuryShell>
  );
}
