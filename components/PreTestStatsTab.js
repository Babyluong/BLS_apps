import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from '../styles/blsResultsStyles';

const PreTestStatsTab = ({
  stats,
  dashboardStats,
  refreshing,
  onRefresh,
  onShowHighestScorers,
  onViewQuestionDetails
}) => {
  const renderQuestionCard = (question, index) => {
    const accuracy = question.accuracy || 0;
    const totalAttempts = question.totalAttempts || 0;
    const correctCount = question.correctCount || 0;
    const incorrectCount = question.incorrectCount || 0;
    
    const getAccuracyColor = (accuracy) => {
      if (accuracy >= 80) return '#34D399';
      if (accuracy >= 60) return '#FBBF24';
      return '#EF4444';
    };

    const getAccuracyLabel = (accuracy) => {
      if (accuracy >= 80) return 'Excellent';
      if (accuracy >= 60) return 'Good';
      if (accuracy >= 40) return 'Needs Improvement';
      return 'Critical';
    };

    return (
      <TouchableOpacity
        key={question.id || index}
        style={styles.questionCard}
        onPress={() => onViewQuestionDetails(question)}
        activeOpacity={0.8}
      >
        <View style={styles.questionHeader}>
          <View style={styles.questionNumber}>
            <Text style={styles.questionNumberText}>Q{question.questionNumber || index + 1}</Text>
          </View>
          <View style={styles.questionAccuracy}>
            <Text style={[styles.accuracyText, { color: getAccuracyColor(accuracy) }]}>
              {accuracy.toFixed(1)}%
            </Text>
            <Text style={styles.accuracyLabel}>
              {getAccuracyLabel(accuracy)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.questionText} numberOfLines={3}>
          {question.question || `Question ${index + 1}`}
        </Text>
        
        <View style={styles.questionStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValue}>{totalAttempts}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Correct</Text>
            <Text style={[styles.statValue, { color: '#34D399' }]}>{correctCount}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Wrong</Text>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>{incorrectCount}</Text>
          </View>
        </View>
        
        <View style={styles.questionProgressContainer}>
          <View style={styles.questionProgressBar}>
            <View 
              style={[
                styles.questionProgressFill, 
                { 
                  width: `${accuracy}%`,
                  backgroundColor: getAccuracyColor(accuracy)
                }
              ]} 
            />
          </View>
          <Text style={styles.questionProgressText}>
            {accuracy.toFixed(1)}% accuracy
          </Text>
        </View>
        
        {question.mostCommonWrong && (
          <View style={styles.wrongAnswerContainer}>
            <MaterialCommunityIcons name="alert-circle" size={16} color="#FBBF24" />
            <Text style={styles.wrongAnswerText}>
              Most common wrong answer: <Text style={styles.wrongAnswerValue}>{question.mostCommonWrong}</Text>
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderDonutChart = (title, passCount, failCount, total) => {
    const passPercentage = total > 0 ? Math.round((passCount / total) * 100) : 0;
    const failPercentage = total > 0 ? Math.round((failCount / total) * 100) : 0;

    return (
      <View style={styles.modernChartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>{title}</Text>
          <View style={styles.chartBadge}>
            <Text style={styles.chartBadgeText}>PRE</Text>
          </View>
        </View>
        <View style={styles.donutChartContainer}>
          <View style={styles.donutChart}>
            <View style={styles.donutChartInner}>
              <Text style={styles.donutPercentage}>{passPercentage}%</Text>
              <Text style={styles.donutLabel}>Pass Rate</Text>
            </View>
            <View style={[styles.donutRing, { borderTopColor: '#34D399' }]} />
            <View 
              style={[
                styles.donutSegment, 
                { 
                  borderTopColor: '#34D399',
                  transform: [{ rotate: `${(passPercentage / 100) * 360}deg` }]
                }
              ]} 
            />
          </View>
        </View>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#34D399' }]} />
            <Text style={styles.legendText}>Passed: {passCount}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Failed: {failCount}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (!stats || stats.length === 0) {
    return (
      <View style={styles.emptyStatsContainer}>
        <MaterialCommunityIcons name="chart-line" size={48} color="#8a7f6a" />
        <Text style={styles.emptyStatsText}>
          No pre-test data available yet.
        </Text>
      </View>
    );
  }

  const { passFailStats, highestScores } = dashboardStats || {};

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e9ddc4" />
      }
    >
      <View style={styles.futuristicStatsContainer}>
        {/* Header */}
        <View style={styles.futuristicStatsHeader}>
          <View style={styles.statsHeaderGlow} />
          <View style={styles.statsHeaderContent}>
            <View style={styles.statsLogoContainer}>
              <MaterialCommunityIcons 
                name="school" 
                size={32} 
                color="#00ffc8" 
              />
              <Text style={styles.futuristicStatsTitle}>
                PRE TEST ANALYTICS
              </Text>
            </View>
          </View>
          <Text style={styles.futuristicStatsSubtitle}>
            Advanced Performance Insights & Question Analysis
          </Text>
        </View>

        <View style={styles.futuristicStatsContent}>
          {/* Highest Scores Section */}
          <View style={styles.highestScoresSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.futuristicSectionTitle}>Peak Performance Scores</Text>
              <View style={styles.sectionGlow} />
            </View>
            <View style={styles.scoresGrid}>
              <TouchableOpacity 
                style={styles.scoreCard}
                onPress={() => onShowHighestScorers('clinical')}
                activeOpacity={0.8}
              >
                <View style={styles.scoreCardHeader}>
                  <MaterialCommunityIcons name="stethoscope" size={20} color="#00ffc8" />
                  <Text style={styles.scoreCardTitle}>Clinical Staff</Text>
                </View>
                <View style={styles.scoreValues}>
                  <View style={styles.scoreItem}>
                    <Text style={styles.scoreLabel}>Highest Score</Text>
                    <Text style={styles.scoreValue}>
                      {highestScores?.clinical?.preTest || 0}
                    </Text>
                  </View>
                </View>
                <Text style={styles.clickHint}>Tap to see top 3</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.scoreCard}
                onPress={() => onShowHighestScorers('non-clinical')}
                activeOpacity={0.8}
              >
                <View style={styles.scoreCardHeader}>
                  <MaterialCommunityIcons name="account-tie" size={20} color="#00ffc8" />
                  <Text style={styles.scoreCardTitle}>Non-Clinical Staff</Text>
                </View>
                <View style={styles.scoreValues}>
                  <View style={styles.scoreItem}>
                    <Text style={styles.scoreLabel}>Highest Score</Text>
                    <Text style={styles.scoreValue}>
                      {highestScores?.nonClinical?.preTest || 0}
                    </Text>
                  </View>
                </View>
                <Text style={styles.clickHint}>Tap to see top 3</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Pass/Fail Statistics */}
          {passFailStats && (
            <View style={styles.passFailSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.futuristicSectionTitle}>Pre-Test Results</Text>
                <View style={styles.sectionGlow} />
              </View>
              <View style={styles.chartsGrid}>
                {renderDonutChart(
                  'Pre-Test Results',
                  passFailStats.preTest.pass,
                  passFailStats.preTest.fail,
                  passFailStats.preTest.total
                )}
              </View>
            </View>
          )}

          {/* Question Analysis Section */}
          <View style={styles.questionAnalysisSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.futuristicSectionTitle}>Question Analysis</Text>
              <View style={styles.sectionGlow} />
            </View>
            <View style={styles.questionsList}>
              {stats.slice(0, 10).map((question, index) => renderQuestionCard(question, index))}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default PreTestStatsTab;
