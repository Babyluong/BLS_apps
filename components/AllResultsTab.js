import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from '../styles/blsResultsStyles';
import { 
  getScoreColor, 
  getScoreTextColor, 
  calculateRemedialAllowed, 
  calculateCertified,
  getChecklistDisplayName 
} from '../utils/blsResultsUtils';

const AllResultsTab = ({
  results,
  loading,
  error,
  onRetry,
  onViewDetails,
  onViewChecklistDetails,
  onShowCertificate,
  currentPage,
  resultsPerPage,
  totalResults,
  onPageChange,
  onResultsPerPageChange
}) => {
  const renderStatusButton = (isPassed, result, checklistType) => {
    if (isPassed === null || isPassed === undefined) {
      return (
        <View style={[styles.statusButton, { backgroundColor: "#6c757d" }]}>
          <Text style={styles.statusText}>N/A</Text>
        </View>
      );
    }
    
    return (
      <TouchableOpacity 
        style={[styles.statusButton, { backgroundColor: isPassed ? "#28a745" : "#dc3545" }]}
        onPress={() => onViewChecklistDetails(result, checklistType)}
        activeOpacity={0.7}
      >
        <Text style={styles.statusText}>{isPassed ? "PASS" : "FAIL"}</Text>
      </TouchableOpacity>
    );
  };

  const renderRemedialStatus = (postTestScore, category = 'non-clinical') => {
    const isAllowed = calculateRemedialAllowed(postTestScore, category);
    return (
      <Text style={[styles.remedialText, { color: isAllowed ? "#00FFFF" : "#DC143C" }]}>
        {isAllowed ? "ALLOW" : "NOT ALLOW"}
      </Text>
    );
  };

  const renderCertifiedStatus = (result) => {
    const isCertified = calculateCertified(result);
    
    if (isCertified === null) {
      return (
        <View style={[styles.statusButton, { backgroundColor: "#6c757d" }]}>
          <Text style={styles.statusText}>N/A</Text>
        </View>
      );
    }
    
    if (isCertified) {
      return (
        <TouchableOpacity 
          style={[styles.certificateButton, { backgroundColor: "#28a745" }]}
          onPress={() => onShowCertificate(result)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="certificate" size={16} color="#ffffff" />
          <Text style={styles.certificateButtonText}>CERT</Text>
        </TouchableOpacity>
      );
    }
    
    return (
      <View style={[styles.statusButton, { backgroundColor: "#dc3545" }]}>
        <Text style={styles.statusText}>NO</Text>
      </View>
    );
  };

  const renderScore = (score, category, testType) => {
    if (score === null || score === undefined) {
      return (
        <Text style={[styles.cellScoreText, styles.disabledScore]}>N/A</Text>
      );
    }
    
    return (
      <Text style={[
        styles.cellScoreText,
        { color: getScoreTextColor(score, category, testType) }
      ]}>
        {score}
      </Text>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ffc8" />
        <Text style={styles.loadingText}>Loading results...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle" size={48} color="#ff4757" />
        <Text style={styles.errorText}>Failed to load results</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (results.length === 0) {
    return (
      <View style={styles.emptyRow}>
        <MaterialCommunityIcons name="inbox" size={48} color="#8a7f6a" />
        <Text style={styles.emptyText}>No results found</Text>
      </View>
    );
  }

  return (
    <View style={styles.scrollView}>
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.tableContainer}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.cellNo]}>NO</Text>
            <Text style={[styles.headerCell, styles.cellDate]}>DATE</Text>
            <Text style={[styles.headerCell, styles.cellName]}>NAME</Text>
            <Text style={[styles.headerCell, styles.cellIc]}>IC</Text>
            <Text style={[styles.headerCell, styles.cellJawatan]}>JAWATAN</Text>
            <Text style={[styles.headerCell, styles.cellStatus]}>ONE MAN CPR</Text>
            <Text style={[styles.headerCell, styles.cellStatus]}>TWO MAN CPR</Text>
            <Text style={[styles.headerCell, styles.cellStatus]}>ADULT CHOKING</Text>
            <Text style={[styles.headerCell, styles.cellStatus]}>INFANT CHOKING</Text>
            <Text style={[styles.headerCell, styles.cellStatus]}>INFANT CPR</Text>
            <Text style={[styles.headerCell, styles.cellScore]}>PRETEST</Text>
            <Text style={[styles.headerCell, styles.cellScore]}>POST TEST</Text>
            <Text style={[styles.headerCell, styles.cellStatus]}>REMEDIAL</Text>
            <Text style={[styles.headerCell, styles.cellStatus]}>CERTIFIED</Text>
          </View>

          {/* Table Rows */}
          {results.map((result, index) => {
            const globalIndex = ((currentPage - 1) * resultsPerPage) + index + 1;
            
            return (
              <TouchableOpacity
                key={result.id}
                style={styles.tableRow}
                onPress={() => onViewDetails(result)}
                activeOpacity={0.7}
              >
                <Text style={[styles.cell, styles.cellNo]}>{globalIndex}</Text>
                <Text style={[styles.cell, styles.cellDate]}>{result.date}</Text>
                <Text style={[styles.cell, styles.cellName]}>
                  {result.participantName}
                </Text>
                <Text style={[styles.cell, styles.cellIc]}>{result.participantIc}</Text>
                <View style={[styles.cell, styles.cellJawatan]}>
                  <Text style={styles.jawatanText}>{result.jawatan}</Text>
                </View>
                
                {/* Checklist Status Buttons */}
                <View style={[styles.cell, styles.cellStatus]}>
                  {renderStatusButton(result.oneManCprPass, result, 'one-man-cpr')}
                </View>
                <View style={[styles.cell, styles.cellStatus]}>
                  {renderStatusButton(result.twoManCprPass, result, 'two-man-cpr')}
                </View>
                <View style={[styles.cell, styles.cellStatus]}>
                  {renderStatusButton(result.adultChokingPass, result, 'adult-choking')}
                </View>
                <View style={[styles.cell, styles.cellStatus]}>
                  {renderStatusButton(result.infantChokingPass, result, 'infant-choking')}
                </View>
                <View style={[styles.cell, styles.cellStatus]}>
                  {renderStatusButton(result.infantCprPass, result, 'infant-cpr')}
                </View>
                
                {/* Test Scores */}
                <View style={[styles.cell, styles.cellScore]}>
                  {renderScore(result.preTestScore, result.category, 'preTest')}
                </View>
                <View style={[styles.cell, styles.cellScore]}>
                  {renderScore(result.postTestScore, result.category, 'postTest')}
                </View>
                
                {/* Remedial Status */}
                <View style={[styles.cell, styles.cellStatus]}>
                  {renderRemedialStatus(result.postTestScore, result.category)}
                </View>
                
                {/* Certified Status */}
                <View style={[styles.cell, styles.cellStatus]}>
                  {renderCertifiedStatus(result)}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default AllResultsTab;
