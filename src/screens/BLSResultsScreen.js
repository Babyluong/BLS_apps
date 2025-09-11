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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('start');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(20);

  // Statistics state
  const [dashboardStats, setDashboardStats] = useState({});
  const [pretestStats, setPretestStats] = useState([]);
  const [posttestStats, setPosttestStats] = useState([]);
  const [quizByUser, setQuizByUser] = useState({});

  // Modal state
  const [showCertificate, setShowCertificate] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [selectedCategoryForModal, setSelectedCategoryForModal] = useState('');

  // Load results - UPDATED TO USE bls_results TABLE DIRECTLY
  const loadResults = useCallback(async () => {
    console.log("=== loadResults function called (using bls_results table) ===");
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
      
      const adminStatus = userData?.role === 'admin';
      setIsAdmin(adminStatus);
      
      // Fetch BLS results from bls_results table - SIMPLE VERSION
      console.log("Fetching BLS results from bls_results table...");
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
          created_at
        `)
        .order("created_at", { ascending: false });

      if (!adminStatus) {
        resultsQuery = resultsQuery.eq("user_id", user.id);
      }

      const { data: blsResults, error: resultsError } = await resultsQuery;
      if (resultsError) {
        console.error("Error fetching BLS results:", resultsError);
        throw new Error(`Failed to fetch results: ${resultsError.message}`);
      }

      console.log("BLS results fetched successfully:", blsResults?.length || 0, "records");

      // Get user profiles for jawatan/category information only
      const userIds = [...new Set((blsResults || []).map(result => result.user_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, jawatan, job_position, gred")
        .in("id", userIds);

      if (profilesError) {
        console.warn("Error fetching profiles:", profilesError);
      }

      // Create profile map for jawatan only
      const profileMap = new Map();
      (profiles || []).forEach(profile => {
        profileMap.set(profile.id, profile);
      });

      // Transform the data to match the expected format - SIMPLE VERSION
      const transformedResults = (blsResults || []).map(result => {
        const profile = profileMap.get(result.user_id);
        const jawatan = profile?.jawatan || profile?.job_position || profile?.gred || 'N/A';
        const category = getUserCategory(jawatan);
        
        return {
          id: result.id,
          participantId: result.user_id,
          participantName: result.participant_name || 'Unknown',
          participantIc: result.participant_ic || 'N/A',
          category: category,
          jawatan: jawatan,
          preTestScore: result.pre_test_score || 0,
          postTestScore: result.post_test_score || 0,
          preTestPercentage: Math.round(((result.pre_test_score || 0) / 30) * 100),
          postTestPercentage: Math.round(((result.post_test_score || 0) / 30) * 100),
          oneManCprPass: result.one_man_cpr_pass,
          twoManCprPass: result.two_man_cpr_pass,
          adultChokingPass: result.adult_choking_pass,
          infantChokingPass: result.infant_choking_pass,
          infantCprPass: result.infant_cpr_pass,
          date: new Date(result.created_at).toLocaleDateString('en-MY'),
          createdAt: result.created_at,
          // Add required fields for compatibility
          remedialAllowed: calculateRemedialAllowed(result.post_test_score || 0, category),
          certified: calculateCertified(result.post_test_score || 0, category, {
            one_man_cpr: { status: result.one_man_cpr_pass ? 'PASS' : 'FAIL' },
            two_man_cpr: { status: result.two_man_cpr_pass ? 'PASS' : 'FAIL' },
            adult_choking: { status: result.adult_choking_pass ? 'PASS' : 'FAIL' },
            infant_choking: { status: result.infant_choking_pass ? 'PASS' : 'FAIL' },
            infant_cpr: { status: result.infant_cpr_pass ? 'PASS' : 'FAIL' }
          })
        };
      });

      setResults(transformedResults);
      console.log(`Loaded ${transformedResults.length} BLS results`);

      // Calculate statistics
      const stats = calculateDashboardStats(transformedResults);
      setDashboardStats(stats);

      // Process quiz statistics
      const { pretestStats: preStats, posttestStats: postStats, quizByUser: quizData } = 
        processQuestionsFromDatabase(transformedResults);
      
      setPretestStats(preStats);
      setPosttestStats(postStats);
      setQuizByUser(quizData);

    } catch (err) {
      console.error("Error loading results:", err);
      setError(err.message || "Failed to load results");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load question statistics
  const loadQuestionStatistics = useCallback(async () => {
    // This function can be expanded if needed for question-level statistics
    console.log("Question statistics loaded from results data");
  }, []);

  // Filter results based on search and filters
  const getFilteredResults = useCallback(() => {
    let filtered = results;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(result => 
        result.participantName.toLowerCase().includes(query) ||
        result.participantIc.toLowerCase().includes(query) ||
        result.jawatan.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(result => result.category === selectedCategory);
    }

    // Date range filter
    if (selectedDateRange !== 'all' && startDate && endDate) {
      filtered = filtered.filter(result => {
        const resultDate = new Date(result.createdAt);
        return resultDate >= startDate && resultDate <= endDate;
      });
    }

    return filtered;
  }, [results, searchQuery, selectedCategory, selectedDateRange, startDate, endDate]);

  // Get paginated results
  const getPaginatedResults = useCallback(() => {
    const filtered = getFilteredResults();
    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    return filtered.slice(startIndex, endIndex);
  }, [getFilteredResults, currentPage, resultsPerPage]);

  // Event handlers
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadResults();
  }, [loadResults]);

  const handleViewDetails = (result) => {
    setSelectedResult(result);
    // You can add a details modal here if needed
  };

  const handleViewChecklistDetails = (result, checklistType) => {
    // Handle checklist details view
    console.log('View checklist details:', result, checklistType);
  };

  const handleShowCertificate = (result) => {
    setSelectedResult(result);
    setShowCertificate(true);
  };

  const handleMetricCardClick = (metric) => {
    console.log('Metric card clicked:', metric);
  };

  const handleShowHighestScorers = (category) => {
    setSelectedCategoryForModal(category);
    setShowParticipantModal(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleResultsPerPageChange = (perPage) => {
    setResultsPerPage(perPage);
    setCurrentPage(1);
  };

  const handleDateSelect = (date) => {
    if (datePickerMode === 'start') {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
    setShowDatePicker(false);
  };

  const handleExport = () => {
    const filteredResults = getFilteredResults();
    exportToCSV(filteredResults, 'bls_results');
  };

  // Load data on component mount
  useEffect(() => {
    loadResults();
  }, [loadResults]);

  useEffect(() => {
    loadQuestionStatistics();
  }, [loadQuestionStatistics]);

  // Render tab content
  const renderTabContent = () => {
    const filteredResults = getFilteredResults();
    const paginatedResults = getPaginatedResults();

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
            onViewQuizDetails={(result, testType) => {
              console.log('View quiz details:', result, testType);
            }}
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

  // Render certificate modal
  const renderCertificateModal = () => {
    if (!showCertificate || !selectedResult) return null;

    return (
      <CertificateScreen
        result={selectedResult}
        onBack={() => setShowCertificate(false)}
      />
    );
  };

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
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedDateRange={selectedDateRange}
            onDateRangeChange={setSelectedDateRange}
            startDate={startDate}
            endDate={endDate}
            onStartDatePress={() => {
              setDatePickerMode('start');
              setShowDatePicker(true);
            }}
            onEndDatePress={() => {
              setDatePickerMode('end');
              setShowDatePicker(true);
            }}
            onExport={handleExport}
          />
        )}

        {/* Date Picker Modal */}
        <DatePicker
          visible={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onDateSelect={handleDateSelect}
          mode={datePickerMode}
        />

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {renderTabContent()}
        </View>

        {/* Certificate Modal */}
        {renderCertificateModal()}
      </View>
    </LuxuryShell>
  );
}