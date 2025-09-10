import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from '../styles/blsResultsStyles';

const SearchControls = ({
  searchQuery,
  onSearchChange,
  onClearSearch,
  dateFilterType,
  onDateFilterPress,
  showExportButton = false,
  onExportPress
}) => {
  const getDateFilterText = () => {
    switch (dateFilterType) {
      case 'today':
        return 'Today';
      case '7days':
        return 'Last 7 days';
      case 'custom':
        return 'Custom Date';
      default:
        return 'All Time';
    }
  };

  return (
    <View style={styles.controlsContainer}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#8a7f6a" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search participants..."
          placeholderTextColor="#8a7f6a"
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={onClearSearch} style={styles.clearButton}>
            <MaterialCommunityIcons name="close-circle" size={20} color="#8a7f6a" />
          </TouchableOpacity>
        )}
      </View>

      {/* Date Filter Button */}
      <TouchableOpacity
        style={styles.dateFilterButton}
        onPress={onDateFilterPress}
      >
        <MaterialCommunityIcons name="calendar" size={16} color="#00ffc8" />
        <Text style={styles.dateFilterText}>
          {getDateFilterText()}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={16} color="#00ffc8" style={styles.dropdownIcon} />
      </TouchableOpacity>

      {/* Export Button (conditional) */}
      {showExportButton && (
        <TouchableOpacity
          style={styles.exportButton}
          onPress={onExportPress}
        >
          <MaterialCommunityIcons name="download" size={16} color="#00ffc8" />
          <Text style={styles.exportButtonText}>Export</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchControls;
