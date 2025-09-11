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
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [showTestDetailsModal, setShowTestDetailsModal] = useState(false);
  const [selectedTestDetails, setSelectedTestDetails] = useState(null);

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
      
      const isAdmin = userData?.role === 'admin';
      console.log("🔍 DEBUG: User role check:", { user_id: user.id, role: userData?.role, isAdmin });
      
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

      if (!isAdmin) {
        resultsQuery = resultsQuery.eq("user_id", user.id);
      }

      const { data: blsResults, error: resultsError } = await resultsQuery;
      if (resultsError) {
        console.error("Error fetching BLS results:", resultsError);
        throw new Error(`Failed to fetch results: ${resultsError.message}`);
      }

      console.log("BLS results fetched successfully:", blsResults?.length || 0, "records");

      // No need to fetch profiles anymore - jawatan is now stored in bls_results table
      console.log("Using jawatan data directly from bls_results table");

      // Transform the data to match the expected format - SIMPLE VERSION
      const transformedResults = (blsResults || []).map(result => {
        // Use jawatan directly from bls_results table
        const jawatan = result.jawatan || 'Unknown Position';
        const category = getUserCategory(jawatan);
        
        console.log(`🔍 DEBUG: User ${result.user_id} - jawatan:`, {
          result_jawatan: result.jawatan,
          final_jawatan: jawatan,
          category
        });
        
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
          certified: calculateCertified({
            postTestScore: result.post_test_score || 0,
            category: category,
            oneManCprPass: result.one_man_cpr_pass,
            twoManCprPass: result.two_man_cpr_pass,
            adultChokingPass: result.adult_choking_pass,
            infantChokingPass: result.infant_choking_pass,
            infantCprPass: result.infant_cpr_pass
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

  // Get total pages
  const getTotalPages = useCallback(() => {
    const filtered = getFilteredResults();
    return Math.ceil(filtered.length / resultsPerPage);
  }, [getFilteredResults, resultsPerPage]);

  // Calculate dashboard statistics
  const getNewDashboardStats = useCallback(() => {
    const allResults = getFilteredResults();
    const stats = calculateDashboardStats(allResults);
    return stats;
  }, [getFilteredResults]);

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
    
    // Get the checklist details from the result
    const checklistDetails = result.checklistDetails?.[checklistType] || null;
    
    if (checklistDetails) {
      setSelectedChecklist({
        participantName: result.participantName,
        participantId: result.participantId,
        checklistType: checklistType,
        details: checklistDetails,
        displayName: getChecklistDisplayName(checklistType),
        status: result[`${checklistType.replace('-', '')}Pass`] ? 'PASS' : 'FAIL'
      });
      setShowChecklistModal(true);
    } else {
      // Show basic info if no detailed data available
      setSelectedChecklist({
        participantName: result.participantName,
        participantId: result.participantId,
        checklistType: checklistType,
        details: { performed: [], notPerformed: [] },
        displayName: getChecklistDisplayName(checklistType),
        status: result[`${checklistType.replace('-', '')}Pass`] ? 'PASS' : 'FAIL'
      });
      setShowChecklistModal(true);
    }
  };

  const handleShowCertificate = (result) => {
    setSelectedResult(result);
    setShowCertificate(true);
  };

  const handleViewTestDetails = (result, testType) => {
    // Handle test score details view
    console.log('View test details:', result, testType);
    
    setSelectedTestDetails({
      participantName: result.participantName,
      participantId: result.participantId,
      testType: testType,
      score: testType === 'preTest' ? result.preTestScore : result.postTestScore,
      percentage: testType === 'preTest' ? result.preTestPercentage : result.postTestPercentage,
      date: result.date,
      category: result.category,
      jawatan: result.jawatan
    });
    setShowTestDetailsModal(true);
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
            onViewQuizDetails={handleViewTestDetails}
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

        {/* Checklist Details Modal */}
        {showChecklistModal && selectedChecklist && (
          <Modal
            visible={showChecklistModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowChecklistModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {selectedChecklist.displayName} Details
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowChecklistModal(false)}
                    style={styles.closeButton}
                  >
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.modalBody}>
                  <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>{selectedChecklist.participantName}</Text>
                    <Text style={styles.participantId}>ID: {selectedChecklist.participantId}</Text>
                  </View>
                  
                  <View style={styles.statusContainer}>
                    <Text style={[
                      styles.statusText,
                      { color: selectedChecklist.status === 'PASS' ? '#28a745' : '#dc3545' }
                    ]}>
                      Status: {selectedChecklist.status}
                    </Text>
                  </View>
                  
                  <View style={styles.detailsContainer}>
                    <Text style={styles.detailsTitle}>Checklist Details:</Text>
                    {selectedChecklist.details.performed && selectedChecklist.details.performed.length > 0 && (
                      <View style={styles.detailsSection}>
                        <Text style={styles.detailsSubtitle}>✅ Performed:</Text>
                        {selectedChecklist.details.performed.map((item, index) => (
                          <Text key={index} style={styles.detailsItem}>• {item}</Text>
                        ))}
                      </View>
                    )}
                    
                    {selectedChecklist.details.notPerformed && selectedChecklist.details.notPerformed.length > 0 && (
                      <View style={styles.detailsSection}>
                        <Text style={styles.detailsSubtitle}>❌ Not Performed:</Text>
                        {selectedChecklist.details.notPerformed.map((item, index) => (
                          <Text key={index} style={styles.detailsItem}>• {item}</Text>
                        ))}
                      </View>
                    )}
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>
        )}

        {/* Test Details Modal */}
        {showTestDetailsModal && selectedTestDetails && (
          <Modal
            visible={showTestDetailsModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowTestDetailsModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {selectedTestDetails.testType === 'preTest' ? 'Pre-Test' : 'Post-Test'} Details
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowTestDetailsModal(false)}
                    style={styles.closeButton}
                  >
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.modalBody}>
                  <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>{selectedTestDetails.participantName}</Text>
                    <Text style={styles.participantId}>ID: {selectedTestDetails.participantId}</Text>
                    <Text style={styles.participantJawatan}>Jawatan: {selectedTestDetails.jawatan}</Text>
                    <Text style={styles.participantCategory}>Category: {selectedTestDetails.category}</Text>
                  </View>
                  
                  <View style={styles.scoreContainer}>
                    <Text style={styles.scoreTitle}>
                      {selectedTestDetails.testType === 'preTest' ? 'Pre-Test' : 'Post-Test'} Score
                    </Text>
                    <Text style={styles.scoreValue}>
                      {selectedTestDetails.score}/30 ({selectedTestDetails.percentage}%)
                    </Text>
                    <Text style={styles.scoreDate}>Date: {selectedTestDetails.date}</Text>
                  </View>
                  
                  <View style={styles.scoreAnalysis}>
                    <Text style={styles.analysisTitle}>Score Analysis:</Text>
                    <Text style={styles.analysisText}>
                      {selectedTestDetails.score >= 20 ? 
                        '✅ Passing Score' : 
                        '❌ Failing Score - Remedial Required'
                      }
                    </Text>
                    {selectedTestDetails.category === 'clinical' && (
                      <Text style={styles.analysisNote}>
                        Note: Clinical staff require 25/30 or higher to pass
                      </Text>
                    )}
                    {selectedTestDetails.category === 'non-clinical' && (
                      <Text style={styles.analysisNote}>
                        Note: Non-clinical staff require 20/30 or higher to pass
                      </Text>
                    )}
                  </View>
                </ScrollView>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </LuxuryShell>
  );
}
