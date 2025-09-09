import React from 'react';
import { TextInput, Text, View, StyleSheet } from 'react-native';
import { formatNumber } from '@/utils/formatNumber';

interface FormattedInputProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
}

export default function FormattedInput({ 
  label, 
  value, 
  onChangeText, 
  placeholder = '0' 
}: FormattedInputProps) {
  const handleChange = (text: string) => {
    const formatted = formatNumber(text);
    onChangeText(formatted);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Text style={styles.currency}>Rp</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder}
          keyboardType="numeric"
          placeholderTextColor="#9CA3AF"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  currency: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
});