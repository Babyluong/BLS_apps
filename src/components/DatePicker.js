import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from '../styles/blsResultsStyles';

const DatePicker = ({ 
  visible, 
  onClose, 
  onSelectDate, 
  onSelectFilterType, 
  selectedDate, 
  dateFilterType, 
  customDate 
}) => {
  const [tempSelectedDate, setTempSelectedDate] = useState(selectedDate);
  const [tempDateFilterType, setTempDateFilterType] = useState(dateFilterType);
  const [tempCustomDate, setTempCustomDate] = useState(customDate);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction) => {
    const newDate = new Date(tempSelectedDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setTempSelectedDate(newDate);
  };

  const selectDate = (day) => {
    const newDate = new Date(tempSelectedDate);
    newDate.setDate(day);
    setTempSelectedDate(newDate);
  };

  const renderCalendarDays = () => {
    const year = tempSelectedDate.getFullYear();
    const month = tempSelectedDate.getMonth();
    const day = tempSelectedDate.getDate();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.calendarDayEmpty} />
      );
    }
    
    // Days of the month
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const isSelected = dayNum === day;
      const isToday = new Date().toDateString() === new Date(year, month, dayNum).toDateString();
      
      days.push(
        <TouchableOpacity
          key={dayNum}
          style={[
            styles.calendarDay,
            isSelected && styles.calendarDaySelected,
            isToday && styles.calendarDayToday
          ]}
          onPress={() => selectDate(dayNum)}
        >
          <Text style={[
            styles.calendarDayText,
            isSelected && styles.calendarDayTextSelected,
            isToday && styles.calendarDayTextToday
          ]}>
            {dayNum}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return days;
  };

  const handleApply = () => {
    if (tempDateFilterType === 'custom' && !tempCustomDate) {
      Alert.alert('Error', 'Please select a custom date');
      return;
    }
    
    onSelectFilterType(tempDateFilterType);
    onSelectDate(tempSelectedDate);
    if (tempDateFilterType === 'custom') {
      onSelectDate(tempCustomDate);
    }
    onClose();
  };

  const handleCancel = () => {
    setTempSelectedDate(selectedDate);
    setTempDateFilterType(dateFilterType);
    setTempCustomDate(customDate);
    onClose();
  };

  const formatCustomDate = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const handleCustomDateChange = (text) => {
    const date = new Date(text);
    if (!isNaN(date.getTime())) {
      setTempCustomDate(date);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Date Filter</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <MaterialCommunityIcons name="close" size={24} color="#e9ddc4" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Filter Type Selection */}
            <View style={styles.filterTypeContainer}>
              <Text style={styles.filterTypeTitle}>Filter Type</Text>
              
              {['all', 'today', '7days', 'custom'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterTypeButton,
                    tempDateFilterType === type && styles.filterTypeButtonActive
                  ]}
                  onPress={() => setTempDateFilterType(type)}
                >
                  <MaterialCommunityIcons
                    name={
                      type === 'all' ? 'calendar-multiple' :
                      type === 'today' ? 'calendar-today' :
                      type === '7days' ? 'calendar-week' :
                      'calendar-edit'
                    }
                    size={20}
                    color={tempDateFilterType === type ? '#1a1a2e' : '#00ffc8'}
                  />
                  <Text style={[
                    styles.filterTypeText,
                    tempDateFilterType === type && styles.filterTypeTextActive
                  ]}>
                    {type === 'all' ? 'All Time' :
                     type === 'today' ? 'Today' :
                     type === '7days' ? 'Last 7 Days' :
                     'Custom Date'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Date Selection */}
            {tempDateFilterType === 'custom' && (
              <View style={styles.customDateContainer}>
                <Text style={styles.customDateTitle}>Select Custom Date</Text>
                <TextInput
                  style={styles.dateInput}
                  value={formatCustomDate(tempCustomDate)}
                  onChangeText={handleCustomDateChange}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#8a7f6a"
                />
                
                {/* Calendar */}
                <View style={styles.calendarContainer}>
                  <View style={styles.calendarHeader}>
                    <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.calendarNavButton}>
                      <MaterialCommunityIcons name="chevron-left" size={24} color="#00ffc8" />
                    </TouchableOpacity>
                    <Text style={styles.calendarMonthYear}>
                      {monthNames[tempSelectedDate.getMonth()]} {tempSelectedDate.getFullYear()}
                    </Text>
                    <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.calendarNavButton}>
                      <MaterialCommunityIcons name="chevron-right" size={24} color="#00ffc8" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.calendarDayNames}>
                    {dayNames.map((dayName) => (
                      <Text key={dayName} style={styles.calendarDayName}>
                        {dayName}
                      </Text>
                    ))}
                  </View>

                  <View style={styles.calendarDays}>
                    {renderCalendarDays()}
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.datePickerButtons}>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={handleCancel}
            >
              <Text style={styles.datePickerButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.datePickerButton, styles.datePickerButtonPrimary]}
              onPress={handleApply}
            >
              <Text style={[styles.datePickerButtonText, styles.datePickerButtonTextPrimary]}>
                Apply
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DatePicker;
