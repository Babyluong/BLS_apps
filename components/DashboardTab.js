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

const DashboardTab = ({
  dashboardStats,
  refreshing,
  onRefresh,
  onMetricCardClick,
  onShowHighestScorers
}) => {
  const renderMetricCard = (title, value, icon, color, onPress) => (
    <TouchableOpacity
      style={[styles.metricCard, { borderColor: color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.metricIconContainer, { borderColor: color }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{title}</Text>
    </TouchableOpacity>
  );

  const renderOverviewCard = (title, stats, icon, color) => (
    <View style={[styles.overviewCard, { borderColor: color }]}>
      <View style={styles.overviewHeader}>
        <Text style={styles.overviewTitle}>{title}</Text>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, { backgroundColor: color }]} />
          <Text style={styles.statusText}>Active</Text>
        </View>
      </View>
      <View style={styles.overviewStats}>
        <View style={styles.overviewStat}>
          <Text style={styles.overviewValue}>Total</Text>
          <Text style={styles.overviewNumber}>{stats.total}</Text>
        </View>
        <View style={styles.overviewStat}>
          <Text style={styles.overviewValue}>Passed</Text>
          <Text style={[styles.overviewNumber, { color: '#34D399' }]}>{stats.pass}</Text>
        </View>
        <View style={styles.overviewStat}>
          <Text style={styles.overviewValue}>Failed</Text>
          <Text style={[styles.overviewNumber, { color: '#EF4444' }]}>{stats.fail}</Text>
        </View>
      </View>
    </View>
  );

  const renderDonutChart = (title, passCount, failCount, total) => {
    const passPercentage = total > 0 ? Math.round((passCount / total) * 100) : 0;
    const failPercentage = total > 0 ? Math.round((failCount / total) * 100) : 0;

    return (
      <View style={styles.donutChartContainer}>
        <View style={styles.donutChartHeader}>
          <Text style={styles.donutChartTitle}>{title}</Text>
        </View>
        <View style={styles.donutChartWrapper}>
          <View style={styles.donutChart}>
            <View style={styles.donutChartInner}>
              <Text style={styles.donutChartPercentage}>{passPercentage}%</Text>
              <Text style={styles.donutChartLabel}>Pass Rate</Text>
            </View>
            <View style={[styles.donutChartRing, { borderTopColor: '#34D399' }]} />
            <View 
              style={[
                styles.donutChartSegment, 
                { 
                  borderTopColor: '#34D399',
                  transform: [{ rotate: `${(passPercentage / 100) * 360}deg` }]
                }
              ]} 
            />
          </View>
        </View>
        <View style={styles.donutChartStats}>
          <View style={styles.donutStatItem}>
            <View style={[styles.donutStatDot, { backgroundColor: '#34D399' }]} />
            <Text style={styles.donutStatText}>Passed: {passCount}</Text>
          </View>
          <View style={styles.donutStatItem}>
            <View style={[styles.donutStatDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.donutStatText}>Failed: {failCount}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (!dashboardStats) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <MaterialCommunityIcons name="chart-line" size={48} color="#8B5CF6" />
        </View>
        <Text style={styles.emptyTitle}>No Data Available</Text>
        <Text style={styles.emptyDescription}>
          Start collecting BLS training data to see analytics here
        </Text>
      </View>
    );
  }

  const { highestScores, passFailStats } = dashboardStats;

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollViewContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e9ddc4" />
      }
    >
      <View style={styles.dashboardContainer}>
        {/* Modern Header */}
        <View style={styles.modernHeader}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <MaterialCommunityIcons name="chart-line-variant" size={28} color="#8B5CF6" />
              </View>
              <Text style={styles.modernTitle}>BLS Analytics</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerButton}>
                <MaterialCommunityIcons name="refresh" size={20} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <MaterialCommunityIcons name="cog" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.modernSubtitle}>Real-time performance insights and analytics</Text>
        </View>

        <View style={styles.modernContent}>
          {/* Key Metrics Row */}
          <View style={styles.metricsRow}>
            {renderMetricCard(
              'Total Participants',
              dashboardStats.totalParticipants || 0,
              'account-group',
              '#93C5FD',
              () => onMetricCardClick('all', 'total')
            )}
            {renderMetricCard(
              'Clinical Staff',
              dashboardStats.clinicalCount || 0,
              'stethoscope',
              '#34D399',
              () => onMetricCardClick('clinical', 'clinical')
            )}
            {renderMetricCard(
              'Non-Clinical Staff',
              dashboardStats.nonClinicalCount || 0,
              'account-tie',
              '#FBBF24',
              () => onMetricCardClick('non-clinical', 'non-clinical')
            )}
            {renderMetricCard(
              'Certified',
              dashboardStats.certifiedCount || 0,
              'certificate',
              '#60A5FA',
              () => onMetricCardClick('certified', 'certified')
            )}
          </View>

          {/* Overview Section */}
          <View style={styles.overviewSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Test Performance Overview</Text>
            </View>
            <View style={styles.overviewCards}>
              {renderOverviewCard(
                'Pre-Test',
                passFailStats.preTest,
                'school',
                '#93C5FD'
              )}
              {renderOverviewCard(
                'Post-Test',
                passFailStats.postTest,
                'chart-line-variant',
                '#34D399'
              )}
            </View>
          </View>

          {/* Charts Section */}
          <View style={styles.chartsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Performance Charts</Text>
            </View>
            <View style={styles.chartsRow}>
              {renderDonutChart(
                'Pre-Test Results',
                passFailStats.preTest.pass,
                passFailStats.preTest.fail,
                passFailStats.preTest.total
              )}
              {renderDonutChart(
                'Post-Test Results',
                passFailStats.postTest.pass,
                passFailStats.postTest.fail,
                passFailStats.postTest.total
              )}
            </View>
          </View>

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
                      {highestScores.clinical.preTest}
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
                      {highestScores.nonClinical.preTest}
                    </Text>
                  </View>
                </View>
                <Text style={styles.clickHint}>Tap to see top 3</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default DashboardTab;
