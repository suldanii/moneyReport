import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { LineChart } from 'react-native-chart-kit';
import { RootState } from '@/store';
import { setTransactions } from '@/store/transactionSlice';
import { setBudgets } from '@/store/budgetSlice';
import { setTransfers } from '@/store/balanceSlice';
import Card from '@/components/Card';
import BalanceCard from '@/components/BalanceCard';
import { calculateBalance, getMonthlyData } from '@/utils/calculations';
import { loadTransactions, loadBudgets, loadTransfers } from '@/utils/storage';
import { formatCurrency } from '@/utils/formatNumber';
import { FUND_SOURCES } from '@/constants/categories';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const dispatch = useDispatch();
  const transactions = useSelector(
    (state: RootState) => state.transactions.transactions
  );
  const transfers = useSelector((state: RootState) => state.balance.transfers);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedTransactions, loadedBudgets, loadedTransfers] =
          await Promise.all([
            loadTransactions(),
            loadBudgets(),
            loadTransfers(),
          ]);

        dispatch(setTransactions(loadedTransactions));
        dispatch(setBudgets(loadedBudgets));
        dispatch(setTransfers(loadedTransfers));
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [dispatch]);

  // Get last 6 months data for chart
  const getChartData = () => {
    const months = [];
    const incomeData = [];
    const expenseData = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);

      const monthData = getMonthlyData(
        transactions,
        date.getFullYear(),
        date.getMonth()
      );

      months.push(date.toLocaleDateString('id-ID', { month: 'short' }));
      incomeData.push(monthData.income / 1000000); // Convert to millions for better chart display
      expenseData.push(monthData.expenses / 1000000);
    }

    return { months, incomeData, expenseData };
  };

  const chartData = getChartData();
  const currentDate = new Date();
  const currentMonth = getMonthlyData(
    transactions,
    currentDate.getFullYear(),
    currentDate.getMonth()
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          {currentDate.toLocaleDateString('id-ID', {
            month: 'long',
            year: 'numeric',
          })}
        </Text>
      </View>

      {/* Current Month Summary */}
      <Card>
        <Text style={styles.cardTitle}>Ringkasan Bulan Ini</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Pemasukan</Text>
            <Text style={[styles.summaryValue, { color: '#10B981' }]}>
              {formatCurrency(currentMonth.income)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Pengeluaran</Text>
            <Text style={[styles.summaryValue, { color: '#EF4444' }]}>
              {formatCurrency(currentMonth.expenses)}
            </Text>
          </View>
        </View>
        <View style={styles.netIncomeContainer}>
          <Text style={styles.summaryLabel}>Saldo Bersih</Text>
          <Text
            style={[
              styles.netIncomeValue,
              {
                color:
                  currentMonth.income - currentMonth.expenses >= 0
                    ? '#10B981'
                    : '#EF4444',
              },
            ]}
          >
            {formatCurrency(currentMonth.income - currentMonth.expenses)}
          </Text>
        </View>
      </Card>

      {/* Balance per Fund Source */}
      <Text style={styles.sectionTitle}>Saldo per Sumber Dana</Text>
      <View style={styles.balanceGrid}>
        {FUND_SOURCES.map((source) => (
          <BalanceCard
            key={source}
            source={source}
            balance={calculateBalance(transactions, transfers, source)}
          />
        ))}
      </View>

      {/* Chart */}
      <Card>
        <Text style={styles.cardTitle}>Tren 6 Bulan Terakhir</Text>
        {transactions.length > 0 ? (
          <LineChart
            data={{
              labels: chartData.months,
              datasets: [
                {
                  data: chartData.incomeData,
                  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
                  strokeWidth: 3,
                },
                {
                  data: chartData.expenseData,
                  color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                  strokeWidth: 3,
                },
              ],
              legend: ['Pemasukan (Juta)', 'Pengeluaran (Juta)'],
            }}
            width={screenWidth - 72}
            height={220}
            yAxisSuffix="M"
            chartConfig={{
              backgroundColor: '#FFFFFF',
              backgroundGradientFrom: '#FFFFFF',
              backgroundGradientTo: '#FFFFFF',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
              },
            }}
            bezier
            style={styles.chart}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Belum ada data transaksi</Text>
          </View>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingTop: 60,
  },
  scrollContent: {
    paddingBottom: 100,
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
  title: {
    fontSize: 28,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  netIncomeContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  netIncomeValue: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
  },
  balanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
});
