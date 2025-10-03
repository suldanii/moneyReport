import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar, X, Filter } from 'lucide-react-native';

interface DateRangeFilterProps {
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
}

// Preset options untuk filter yang dinamis
const PRESET_OPTIONS = [
  { id: 'today', label: 'Hari Ini', getRange: () => {
    const today = new Date();
    return { start: today, end: today };
  }},
  { id: 'thisWeek', label: 'Minggu Ini', getRange: () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    return { start: startOfWeek, end: today };
  }},
  { id: 'thisMonth', label: 'Bulan Ini', getRange: () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    return { start: startOfMonth, end: today };
  }},
  { id: 'lastMonth', label: 'Bulan Lalu', getRange: () => {
    const today = new Date();
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    return { start: startOfLastMonth, end: endOfLastMonth };
  }},
  { id: 'custom', label: 'Kustom', getRange: () => null },
];

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ onDateRangeChange }) => {
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showStartPicker, setShowStartPicker] = useState<boolean>(false);
  const [showEndPicker, setShowEndPicker] = useState<boolean>(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('thisMonth');

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    
    if (presetId === 'custom') {
      // Untuk custom, biarkan user memilih tanggal manual
      return;
    }
    
    const preset = PRESET_OPTIONS.find(p => p.id === presetId);
    if (preset) {
      const range = preset.getRange();
      if (range) {
        setStartDate(range.start);
        setEndDate(range.end);
        onDateRangeChange(range.start, range.end);
      }
    }
  };

  const onChangeStartDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
      setSelectedPreset('custom'); // Otomatis pindah ke mode custom
      onDateRangeChange(selectedDate, endDate);
    }
  };

  const onChangeEndDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(selectedDate);
      setSelectedPreset('custom'); // Otomatis pindah ke mode custom
      onDateRangeChange(startDate, selectedDate);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const clearDates = (): void => {
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const today = new Date();
    
    setStartDate(firstDayOfMonth);
    setEndDate(today);
    setSelectedPreset('thisMonth');
    onDateRangeChange(firstDayOfMonth, today);
  };

  return (
    <View style={styles.dateFilterContainer}>
      <View style={styles.filterHeader}>
        <Filter size={16} color="#374151" />
        <Text style={styles.filterLabel}>Filter Tanggal:</Text>
      </View>
      
      {/* Preset Options */}
      <ScrollView
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.presetContainer}
      >
        {PRESET_OPTIONS.map((preset) => (
          <TouchableOpacity
            key={preset.id}
            style={[
              styles.presetButton,
              selectedPreset === preset.id && styles.presetButtonActive
            ]}
            onPress={() => handlePresetSelect(preset.id)}
          >
            <Text style={[
              styles.presetText,
              selectedPreset === preset.id && styles.presetTextActive
            ]}>
              {preset.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Date Inputs (hanya tampil jika custom atau untuk referensi) */}
      <View style={styles.dateInputsRow}>
        <View style={styles.dateInputContainer}>
          <Text style={styles.dateLabel}>Dari</Text>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowStartPicker(true)}
          >
            <Calendar size={16} color="#3B82F6" />
            <Text style={styles.dateText}>{formatDate(startDate)}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.dateInputContainer}>
          <Text style={styles.dateLabel}>Sampai</Text>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowEndPicker(true)}
          >
            <Calendar size={16} color="#3B82F6" />
            <Text style={styles.dateText}>{formatDate(endDate)}</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.clearButton} onPress={clearDates}>
          <X size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
      
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={onChangeStartDate}
          maximumDate={endDate}
        />
      )}
      
      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={onChangeEndDate}
          minimumDate={startDate}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dateFilterContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginLeft: 8,
  },
  presetContainer: {
    marginBottom: 12,
  },
  presetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },
  presetButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  presetText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  presetTextActive: {
    color: '#FFFFFF',
  },
  dateInputsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  dateInputContainer: {
    flex: 1,
    marginRight: 8,
  },
  dateLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    marginLeft: 8,
  },
  clearButton: {
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default DateRangeFilter;