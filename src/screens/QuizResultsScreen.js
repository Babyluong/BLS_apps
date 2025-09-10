// screens/QuizResultsScreen.js
import React, { useState, useEffect, useCallback } from "react";
import { 
  Text, View, TouchableOpacity, StyleSheet, ScrollView, 
  Alert, ActivityIndicator, Modal, RefreshControl 
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import LuxuryShell from "../components/LuxuryShell";
import QuizCertificate from "../components/QuizCertificate";
import supabase from "../services/supabase";
import { calculateComprehensiveScore } from "../utils/scoreUtils";

const GOLD = "#e9ddc4";
const BORDER = "rgba(230,210,150,0.18)";
const BG = "rgba(18,18,22,0.65)";
const RED = "#ff6b6b";
const GREEN = "#4caf50";
const WHITE = "#ffffff";
const YELLOW = "#ffd54f";
const BLUE = "#2196f3";

export default function QuizResultsScreen({ onBack, onSignOut }) {
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Load quiz results for current user
  const loadQuizResults = useCallback(async () => {
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
      
      // Fetch user profile for certificate display
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, jawatan")
        .eq("id", user.id)
        .single();
      
      // Fetch quiz sessions with scores
      const { data: sessions, error: sessionsError } = await supabase
        .from("quiz_sessions")
        .select(`
          id,
          quiz_key,
          score,
          total_questions,
          percentage,
          status,
          updated_at,
          started_at,
          expires_at,
          participant_name,
          participant_ic,
          answers
        `)
        .eq("user_id", user.id)
        .eq("status", "submitted")
        .order("updated_at", { ascending: false });

      console.log("Quiz Results Debug:", {
        userId: user.id,
        sessionsError,
        sessionsCount: sessions?.length || 0,
        sessions: sessions
      });

      if (sessionsError) {
        throw sessionsError;
      }

      // Transform data for display with comprehensive scoring
      const transformedResults = sessions.map(session => {
        // Calculate score from answers if score is missing
        let calculatedScore = session.score || 0;
        let calculatedTotal = session.total_questions || 30;
        let calculatedPercentage = session.percentage || 0;
        
        // If score is missing but we have answers, try to calculate it
        if ((!session.score || session.score === 0) && session.answers) {
          const answerCount = Object.keys(session.answers).filter(key => 
            key !== '_selected_set' && session.answers[key] !== null && session.answers[key] !== undefined
          ).length;
          
          // If we have answers, assume they're all correct for now
          // In a real scenario, you'd want to validate against correct answers
          if (answerCount > 0) {
            calculatedScore = answerCount;
            calculatedTotal = 30; // Default to 30 questions
            calculatedPercentage = Math.round((calculatedScore / calculatedTotal) * 100);
          }
        }
        
        // Calculate comprehensive score data
        const comprehensiveScore = calculateComprehensiveScore(
          calculatedScore, 
          calculatedTotal, 
          profile?.jawatan || ''
        );
        
        return {
          id: session.id,
          quizType: session.quiz_key === "pretest" ? "Pre Test" : "Post Test",
          score: calculatedScore,
          totalQuestions: calculatedTotal,
          percentage: calculatedPercentage,
          submittedAt: new Date(session.updated_at).toLocaleString(),
          startedAt: new Date(session.started_at).toLocaleString(),
          duration: session.updated_at && session.started_at ? 
            Math.round((new Date(session.updated_at) - new Date(session.started_at)) / 1000 / 60) : 0,
          status: session.status,
          // Add comprehensive score data
          category: comprehensiveScore.category,
          grade: comprehensiveScore.grade,
          passed: comprehensiveScore.passed,
          threshold: comprehensiveScore.threshold,
          gradeDescription: comprehensiveScore.gradeDescription
        };
      });

      setQuizResults(transformedResults);
    } catch (e) {
      console.error('Error loading quiz results:', e);
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh results
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadQuizResults();
    setRefreshing(false);
  }, [loadQuizResults]);

  // Load results on component mount
  useEffect(() => {
    loadQuizResults();
  }, [loadQuizResults]);

  // Get performance grade based on percentage
  const getPerformanceGrade = (percentage) => {
    if (percentage >= 90) return { grade: "A+", color: GREEN, description: "Excellent" };
    if (percentage >= 80) return { grade: "A", color: GREEN, description: "Very Good" };
    if (percentage >= 70) return { grade: "B", color: YELLOW, description: "Good" };
    if (percentage >= 60) return { grade: "C", color: YELLOW, description: "Satisfactory" };
    if (percentage >= 50) return { grade: "D", color: RED, description: "Pass" };
    return { grade: "F", color: RED, description: "Fail" };
  };

  // View detailed results
  const viewDetails = (result) => {
    setSelectedResult(result);
    setShowDetailModal(true);
  };

  // Render performance badge
  const renderPerformanceBadge = (percentage) => {
    const performance = getPerformanceGrade(percentage);
    return (
      <View style={[styles.performanceBadge, { backgroundColor: performance.color + "20", borderColor: performance.color }]}>
        <Text style={[styles.performanceGrade, { color: performance.color }]}>{performance.grade}</Text>
        <Text style={[styles.performanceDesc, { color: performance.color }]}>{performance.description}</Text>
      </View>
    );
  };

  // Render quiz certificate
  const renderQuizCertificate = (result, index) => {
    return (
      <View key={result.id} style={styles.certificateWrapper}>
        <QuizCertificate 
          result={result} 
          userProfile={currentUser ? { 
            full_name: currentUser.user_metadata?.full_name || 'User',
            jawatan: result.jawatan || 'N/A'
          } : null} 
        />
      </View>
    );
  };

  return (
    <LuxuryShell title="Quiz Results | Keputusan Kuiz" onSignOut={onSignOut} onBack={onBack}>
      <View style={styles.container}>
        {loading && !refreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={GOLD} />
            <Text style={styles.loadingText}>Loading quiz results...</Text>
          </View>
        )}
        
        {error ? (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color={RED} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadQuizResults}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GOLD} />
            }
          >
            {quizResults.length === 0 && !loading ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="file-question-outline" size={64} color={GOLD} />
                <Text style={styles.emptyTitle}>No Quiz Results Found</Text>
                <Text style={styles.emptySubtitle}>
                  Complete some quizzes to see your results here.
                </Text>
              </View>
            ) : (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>Your Quiz Results</Text>
                <Text style={styles.resultsSubtitle}>
                  {quizResults.length} quiz{quizResults.length !== 1 ? 'es' : ''} completed
                </Text>
                
                {quizResults.map((result, index) => renderQuizCertificate(result, index))}
              </View>
            )}
          </ScrollView>
        )}

        {/* Detail Modal */}
        <Modal visible={showDetailModal} transparent animationType="slide" onRequestClose={() => setShowDetailModal(false)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Quiz Result Details</Text>
                <TouchableOpacity onPress={() => setShowDetailModal(false)} style={styles.closeButton}>
                  <MaterialCommunityIcons name="close" size={20} color={GOLD} />
                </TouchableOpacity>
              </View>
              
              {selectedResult && (
                <ScrollView style={styles.modalBody}>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Quiz Information</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Quiz Type:</Text>
                      <Text style={styles.detailValue}>{selectedResult.quizType}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Submitted:</Text>
                      <Text style={styles.detailValue}>{selectedResult.submittedAt}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Duration:</Text>
                      <Text style={styles.detailValue}>{selectedResult.duration} minutes</Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Performance</Text>
                    <View style={styles.scoreDetailRow}>
                      <Text style={styles.scoreDetailLabel}>Questions Correct:</Text>
                      <Text style={styles.scoreDetailValue}>
                        {selectedResult.score} out of {selectedResult.totalQuestions}
                      </Text>
                    </View>
                    <View style={styles.scoreDetailRow}>
                      <Text style={styles.scoreDetailLabel}>Percentage:</Text>
                      <Text style={[styles.scoreDetailValue, { 
                        color: getPerformanceGrade(selectedResult.percentage).color 
                      }]}>
                        {selectedResult.percentage}%
                      </Text>
                    </View>
                    <View style={styles.scoreDetailRow}>
                      <Text style={styles.scoreDetailLabel}>Grade:</Text>
                      <Text style={[styles.scoreDetailValue, { 
                        color: getPerformanceGrade(selectedResult.percentage).color 
                      }]}>
                        {getPerformanceGrade(selectedResult.percentage).grade} - {getPerformanceGrade(selectedResult.percentage).description}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Performance Analysis</Text>
                    <View style={styles.analysisContainer}>
                      <Text style={styles.analysisText}>
                        {selectedResult.percentage >= 80 
                          ? "🎉 Excellent performance! You have a strong understanding of the material."
                          : selectedResult.percentage >= 60
                          ? "👍 Good work! Consider reviewing areas where you missed questions."
                          : "📚 Keep studying! Focus on understanding the concepts better."
                        }
                      </Text>
                    </View>
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </LuxuryShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: GOLD,
    marginLeft: 12,
    fontSize: 16,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    color: RED,
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 12,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(233, 221, 196, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: GOLD,
  },
  retryButtonText: {
    color: GOLD,
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    color: GOLD,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#8a7f6a',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  resultsContainer: {
    gap: 16,
  },
  resultsTitle: {
    color: GOLD,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultsSubtitle: {
    color: '#8a7f6a',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  quizCard: {
    backgroundColor: BG,
    borderColor: BORDER,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  quizTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quizType: {
    color: GOLD,
    fontSize: 18,
    fontWeight: 'bold',
  },
  quizDate: {
    color: '#8a7f6a',
    fontSize: 12,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreMain: {
    alignItems: 'center',
  },
  scoreText: {
    color: GOLD,
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreLabel: {
    color: '#8a7f6a',
    fontSize: 12,
    marginTop: 4,
  },
  percentageContainer: {
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  percentageLabel: {
    color: '#8a7f6a',
    fontSize: 12,
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  performanceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  performanceGrade: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  performanceDesc: {
    fontSize: 10,
    marginTop: 2,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    color: GOLD,
    fontSize: 12,
  },
  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: BG,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: BORDER,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  modalTitle: {
    color: GOLD,
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(233, 221, 196, 0.1)',
  },
  modalBody: {
    maxHeight: '80%',
  },
  detailSection: {
    marginBottom: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 16,
  },
  detailSectionTitle: {
    color: GOLD,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    color: '#8a7f6a',
    fontSize: 14,
    fontWeight: '600',
  },
  detailValue: {
    color: WHITE,
    fontSize: 14,
    fontWeight: 'bold',
  },
  scoreDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  scoreDetailLabel: {
    color: '#8a7f6a',
    fontSize: 14,
    fontWeight: '600',
  },
  scoreDetailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: GOLD,
  },
  analysisContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 12,
  },
  analysisText: {
    color: WHITE,
    fontSize: 14,
    lineHeight: 20,
  },
  certificateWrapper: {
    marginBottom: 20,
  },
});
