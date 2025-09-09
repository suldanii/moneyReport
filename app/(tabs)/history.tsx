import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Card from '@/components/Card';
import { formatCurrency } from '@/utils/formatNumber';
import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react-native';

export default function HistoryScreen() {
  const transactions = useSelector(
    (state: RootState) => state.transactions.transactions
  );
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const date = new Date(t.date);
        return (
          date.getFullYear() === selectedYear &&
          date.getMonth() === selectedMonth
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedMonth, selectedYear]);

  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: typeof transactions } = {};

    filteredTransactions.forEach((transaction) => {
      const date = new Date(transaction.date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
    });

    return Object.entries(groups).sort(
      (a, b) =>
        new Date(b[1][0].date).getTime() - new Date(a[1][0].date).getTime()
    );
  }, [filteredTransactions]);

  const renderTransaction = ({ item: transaction }: { item: any }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        {transaction.type === 'income' ? (
          <TrendingUp color="#10B981" size={20} />
        ) : (
          <TrendingDown color="#EF4444" size={20} />
        )}
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionCategory}>{transaction.category}</Text>
        <Text style={styles.transactionSource}>{transaction.source}</Text>
        {transaction.description && (
          <Text style={styles.transactionDescription}>
            {transaction.description}
          </Text>
        )}
      </View>
      <Text
        style={[
          styles.transactionAmount,
          { color: transaction.type === 'income' ? '#10B981' : '#EF4444' },
        ]}
      >
        {transaction.type === 'income' ? '+' : '-'}
        {formatCurrency(transaction.amount)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History Transaksi</Text>
      </View>

      <View style={styles.headerSelect}>
        <TouchableOpacity
          style={styles.monthPicker}
          onPress={() => setShowMonthPicker(!showMonthPicker)}
        >
          <Text style={styles.monthPickerText}>
            {months[selectedMonth]} {selectedYear}
          </Text>
          <ChevronDown color="#6B7280" size={20} />
        </TouchableOpacity>
      </View>

      {showMonthPicker && (
        <Card style={styles.pickerCard}>
          <Text style={styles.pickerTitle}>Pilih Bulan & Tahun</Text>

          <View style={styles.yearRow}>
            <TouchableOpacity
              style={styles.yearButton}
              onPress={() => setSelectedYear(selectedYear - 1)}
            >
              <Text style={styles.yearButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.yearText}>{selectedYear}</Text>
            <TouchableOpacity
              style={styles.yearButton}
              onPress={() => setSelectedYear(selectedYear + 1)}
            >
              <Text style={styles.yearButtonText}>→</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.monthGrid}>
            {months.map((month, index) => (
              <TouchableOpacity
                key={month}
                style={[
                  styles.monthButton,
                  selectedMonth === index && styles.monthButtonActive,
                ]}
                onPress={() => {
                  setSelectedMonth(index);
                  setShowMonthPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.monthButtonText,
                    selectedMonth === index && styles.monthButtonTextActive,
                  ]}
                >
                  {month.slice(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      )}

      {/* Transactions List */}
      <ScrollView
        style={styles.transactionsList}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {groupedTransactions.length > 0 ? (
          groupedTransactions.map(([date, dayTransactions]) => (
            <Card key={date}>
              <Text style={styles.dateHeader}>{date}</Text>
              {dayTransactions.map((transaction, index) => (
                <View key={transaction.id}>
                  {renderTransaction({ item: transaction })}
                  {index < dayTransactions.length - 1 && (
                    <View style={styles.separator} />
                  )}
                </View>
              ))}
            </Card>
          ))
        ) : (
          <Card>
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Tidak ada transaksi untuk {months[selectedMonth]} {selectedYear}
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16, // 🔹 tambahin biar ada tinggi header
    marginBottom: 24,
    backgroundColor: '#FCC61D',
    borderBottomLeftRadius: 16, // 🔹 kasih rounded bawah biar manis
    borderBottomRightRadius: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#3338A0',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#3338A0',
    opacity: 0.9,
    marginTop: 4,
  },
  headerSelect: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  monthPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  monthPickerText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#111827',
  },
  pickerCard: {
    marginHorizontal: 20,
  },
  pickerTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  yearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  yearButtonText: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6',
  },
  yearText: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginHorizontal: 24,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monthButton: {
    width: '30%',
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 8,
  },
  monthButtonActive: {
    backgroundColor: '#3B82F6',
  },
  monthButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  monthButtonTextActive: {
    color: '#FFFFFF',
  },
  transactionsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  dateHeader: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  transactionSource: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginTop: 2,
  },
  transactionDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
