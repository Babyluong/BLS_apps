import React from 'react';
import {
  View,
  Text,
  TouchableOpacity
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from '../styles/blsResultsStyles';

const PaginationControls = ({
  currentPage,
  totalPages,
  resultsPerPage,
  totalResults,
  onPageChange,
  onResultsPerPageChange
}) => {
  const startResult = ((currentPage - 1) * resultsPerPage) + 1;
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleFirstPage = () => {
    onPageChange(1);
  };

  const handleLastPage = () => {
    onPageChange(totalPages);
  };

  if (totalResults === 0) {
    return null;
  }

  return (
    <View style={styles.paginationControls}>
      {/* Results per page controls */}
      <View style={styles.resultsPerPageContainer}>
        <Text style={styles.resultsPerPageLabel}>Show:</Text>
        <View style={styles.resultsPerPageButtons}>
          {[20, 50, 100].map((count) => (
            <TouchableOpacity
              key={count}
              style={[
                styles.resultsPerPageButton,
                resultsPerPage === count && styles.resultsPerPageButtonActive
              ]}
              onPress={() => onResultsPerPageChange(count)}
            >
              <Text style={[
                styles.resultsPerPageButtonText,
                resultsPerPage === count && styles.resultsPerPageButtonTextActive
              ]}>
                {count}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Page navigation */}
      <View style={styles.pageNavigation}>
        {/* First page button */}
        <TouchableOpacity
          style={[
            styles.pageButton,
            currentPage === 1 && styles.pageButtonDisabled
          ]}
          onPress={handleFirstPage}
          disabled={currentPage === 1}
        >
          <MaterialCommunityIcons 
            name="chevron-double-left" 
            size={16} 
            color={currentPage === 1 ? "#8a7f6a" : "#e9ddc4"} 
          />
        </TouchableOpacity>

        {/* Previous page button */}
        <TouchableOpacity
          style={[
            styles.pageButton,
            currentPage === 1 && styles.pageButtonDisabled
          ]}
          onPress={handlePreviousPage}
          disabled={currentPage === 1}
        >
          <MaterialCommunityIcons 
            name="chevron-left" 
            size={16} 
            color={currentPage === 1 ? "#8a7f6a" : "#e9ddc4"} 
          />
        </TouchableOpacity>

        {/* Page info */}
        <Text style={styles.pageInfo}>
          {currentPage} / {totalPages}
        </Text>

        {/* Next page button */}
        <TouchableOpacity
          style={[
            styles.pageButton,
            currentPage === totalPages && styles.pageButtonDisabled
          ]}
          onPress={handleNextPage}
          disabled={currentPage === totalPages}
        >
          <MaterialCommunityIcons 
            name="chevron-right" 
            size={16} 
            color={currentPage === totalPages ? "#8a7f6a" : "#e9ddc4"} 
          />
        </TouchableOpacity>

        {/* Last page button */}
        <TouchableOpacity
          style={[
            styles.pageButton,
            currentPage === totalPages && styles.pageButtonDisabled
          ]}
          onPress={handleLastPage}
          disabled={currentPage === totalPages}
        >
          <MaterialCommunityIcons 
            name="chevron-double-right" 
            size={16} 
            color={currentPage === totalPages ? "#8a7f6a" : "#e9ddc4"} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PaginationControls;
