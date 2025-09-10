import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Use the actual data structure from Supabase instead of hardcoded grouping

const ChecklistDetailsModal = ({ 
  visible, 
  onClose, 
  checklistData 
}) => {
  if (!checklistData) return null;

  const { participantName, participantId, checklistType, details, displayName } = checklistData;

  // Extract the nested details object - this contains the actual data from bls_results
  const checklistDetails = details?.details;

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-MY', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Group items by the actual data structure from Supabase
  const groupItemsByCategory = () => {
    if (!checklistDetails || !checklistDetails.standardized_items) {
      return null;
    }

    const groupedItems = {};
    const standardizedItems = checklistDetails.standardized_items;

    // Group items by their actual categories from the database
    Object.keys(standardizedItems).forEach(itemKey => {
      const item = standardizedItems[itemKey];
      const category = item.category || 'Other';
      
      if (!groupedItems[category]) {
        groupedItems[category] = {
          performed: [],
          notPerformed: []
        };
      }

      // Check if this item was performed or not
      if (item.completed) {
        groupedItems[category].performed.push({
          key: itemKey,
          text: item.text,
          compulsory: item.compulsory
        });
      } else {
        groupedItems[category].notPerformed.push({
          key: itemKey,
          text: item.text,
          compulsory: item.compulsory
        });
      }
    });

    return groupedItems;
  };

  const renderGroupedChecklistItems = () => {
    if (!checklistDetails || !checklistDetails.standardized_items) {
      return (
        <View style={styles.noDataContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color="#ff6b6b" />
          <Text style={styles.noDataText}>No checklist details available</Text>
        </View>
      );
    }

    const groupedItems = groupItemsByCategory();
    if (!groupedItems) return null;

    return (
      <View style={styles.itemsContainer}>
        {Object.keys(groupedItems).map(category => {
          const categoryData = groupedItems[category];
          const totalItems = categoryData.performed.length + categoryData.notPerformed.length;
          
          if (totalItems === 0) return null;

          return (
            <View key={category} style={styles.categoryContainer}>
              <View style={styles.categoryHeader}>
                <MaterialCommunityIcons name="folder" size={20} color="#00ffc8" />
                <Text style={styles.categoryTitle}>{category}</Text>
                <Text style={styles.categoryCount}>
                  ({categoryData.performed.length}/{totalItems} completed)
                </Text>
              </View>

              {/* Performed Items in this category */}
              {categoryData.performed.length > 0 && (
                <View style={styles.subSectionContainer}>
                  <View style={styles.subSectionHeader}>
                    <MaterialCommunityIcons name="check-circle" size={16} color="#28a745" />
                    <Text style={styles.subSectionTitle}>
                      Performed ({categoryData.performed.length})
                    </Text>
                  </View>
                  <View style={styles.itemsList}>
                    {categoryData.performed.map((item, index) => (
                      <View key={index} style={styles.itemRow}>
                        <MaterialCommunityIcons name="check" size={14} color="#28a745" />
                        <Text style={styles.itemText}>{item.text}</Text>
                        {item.compulsory && (
                          <MaterialCommunityIcons name="star" size={12} color="#ffc107" />
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Not Performed Items in this category */}
              {categoryData.notPerformed.length > 0 && (
                <View style={styles.subSectionContainer}>
                  <View style={styles.subSectionHeader}>
                    <MaterialCommunityIcons name="close-circle" size={16} color="#dc3545" />
                    <Text style={styles.subSectionTitle}>
                      Not Performed ({categoryData.notPerformed.length})
                    </Text>
                  </View>
                  <View style={styles.itemsList}>
                    {categoryData.notPerformed.map((item, index) => (
                      <View key={index} style={styles.itemRow}>
                        <MaterialCommunityIcons name="close" size={14} color="#dc3545" />
                        <Text style={styles.itemText}>{item.text}</Text>
                        {item.compulsory && (
                          <MaterialCommunityIcons name="star" size={12} color="#ffc107" />
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <MaterialCommunityIcons name="clipboard-check" size={24} color="#00ffc8" />
              <Text style={styles.headerTitle}>{displayName}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color="#8a7f6a" />
            </TouchableOpacity>
          </View>

          {/* Participant Info */}
          <View style={styles.participantInfo}>
            <Text style={styles.participantName}>{participantName}</Text>
            <Text style={styles.participantId}>IC: {participantId}</Text>
          </View>

          {/* Timestamp */}
          <View style={styles.timestampContainer}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#8a7f6a" />
            <Text style={styles.timestampText}>
              Performed on: {formatTimestamp(details?.date || details?.created_at || details?.updated_at)}
            </Text>
          </View>

          {/* Examiner Info - Only show if available */}
          {checklistDetails?.examinerName && (
            <View style={styles.examinerContainer}>
              <View style={styles.examinerInfo}>
                <MaterialCommunityIcons name="account" size={16} color="#8a7f6a" />
                <Text style={styles.examinerLabel}>Examiner: </Text>
                <Text style={styles.examinerName}>
                  {checklistDetails.examinerName}
                </Text>
              </View>
            </View>
          )}

          {/* Status and Score */}
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: checklistDetails?.status === 'PASS' ? '#28a745' : '#dc3545' }
            ]}>
              <Text style={styles.statusText}>{checklistDetails?.status || 'N/A'}</Text>
            </View>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>
                Score: {checklistDetails?.score || 0}/{checklistDetails?.totalItems || 10}
              </Text>
              <Text style={styles.percentageText}>
                ({checklistDetails?.percentage || 0}%)
              </Text>
            </View>
          </View>

          {/* Examiner Comments - Only show if available */}
          {(checklistDetails?.comments || checklistDetails?.examinerComments) && (
            <View style={styles.commentsContainer}>
              <View style={styles.commentsHeader}>
                <MaterialCommunityIcons name="comment-text" size={16} color="#00ffc8" />
                <Text style={styles.commentsTitle}>Examiner Comments</Text>
              </View>
              <Text style={styles.commentsText}>
                {checklistDetails.comments || checklistDetails.examinerComments || 'No comments available'}
              </Text>
            </View>
          )}

          {/* Checklist Items */}
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={true}>
            {renderGroupedChecklistItems()}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.doneButton}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 10,
  },
  closeButton: {
    padding: 5,
  },
  participantInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  participantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  participantId: {
    fontSize: 14,
    color: '#8a7f6a',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00ffc8',
  },
  percentageText: {
    fontSize: 14,
    color: '#8a7f6a',
  },
  scrollContainer: {
    maxHeight: 300,
  },
  itemsContainer: {
    padding: 20,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 8,
  },
  itemsList: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 15,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemText: {
    fontSize: 14,
    color: '#ffffff',
    marginLeft: 10,
    flex: 1,
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noDataText: {
    fontSize: 16,
    color: '#8a7f6a',
    marginTop: 10,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  doneButton: {
    backgroundColor: '#00ffc8',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // New styles for enhanced modal
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#2a2a2a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  timestampText: {
    fontSize: 14,
    color: '#8a7f6a',
    marginLeft: 8,
  },
  examinerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#2a2a2a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  examinerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  examinerLabel: {
    fontSize: 14,
    color: '#8a7f6a',
    marginLeft: 8,
  },
  examinerName: {
    fontSize: 14,
    color: '#00ffc8',
    fontWeight: '600',
  },
  commentsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2a2a2a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  commentsTitle: {
    fontSize: 14,
    color: '#00ffc8',
    fontWeight: '600',
    marginLeft: 8,
  },
  commentsText: {
    fontSize: 14,
    color: '#e9ddc4',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  // Grouped checklist styles
  categoryContainer: {
    marginBottom: 20,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 15,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00ffc8',
    marginLeft: 8,
    flex: 1,
  },
  categoryCount: {
    fontSize: 12,
    color: '#8a7f6a',
  },
  subSectionContainer: {
    marginBottom: 15,
  },
  subSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  itemsList: {
    paddingLeft: 20,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemText: {
    fontSize: 13,
    color: '#e9ddc4',
    marginLeft: 8,
    flex: 1,
  },
});

export default ChecklistDetailsModal;
