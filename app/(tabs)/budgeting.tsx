import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setBudget } from '@/store/budgetSlice';
import { saveBudgets, loadBudgets } from '@/utils/storage';
import { calculateBalance } from '@/utils/calculations';
import Card from '@/components/Card';
import FormattedInput from '@/components/FormattedInput';
import { parseFormattedNumber, formatCurrency } from '@/utils/formatNumber';
import { getCategorySpending } from '@/utils/calculations';
import { EXPENSE_CATEGORIES } from '@/constants/categories';
import { Target, TriangleAlert as AlertTriangle } from 'lucide-react-native';

export default function BudgetingScreen() {
  const dispatch = useDispatch();
  const transactions = useSelector(
    (state: RootState) => state.transactions.transactions
  );
  const budgets = useSelector((state: RootState) => state.budget.budgets);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [currentMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedBudgets = await loadBudgets();
        dispatch({ type: 'budget/setBudgets', payload: loadedBudgets });
      } catch (error) {
        console.error('Error loading budgets:', error);
      }
    };
    loadData();
  }, [dispatch]);

  const handleSetBudget = async () => {
    const amount = parseFormattedNumber(budgetAmount);

    if (!selectedCategory || !amount) {
      Alert.alert('Error', 'Harap pilih kategori dan masukkan jumlah budget');
      return;
    }

    // Calculate total available balance across all sources
    const totalBalance = ['Bank', 'Cash', 'E-Wallet'].reduce(
      (total, source) => {
        return total + calculateBalance(transactions, [], source as any);
      },
      0
    );

    if (amount > totalBalance) {
      Alert.alert(
        'Error',
        `Budget tidak boleh melebihi total saldo Anda (${formatCurrency(
          totalBalance
        )})`
      );
      return;
    }

    const budget = {
      category: selectedCategory,
      limit: amount,
      month: currentMonth,
    };

    try {
      dispatch(setBudget(budget));

      // Save to AsyncStorage
      const currentBudgets = await loadBudgets();
      const existingIndex = currentBudgets.findIndex(
        (b) => b.category === selectedCategory && b.month === currentMonth
      );

      if (existingIndex !== -1) {
        currentBudgets[existingIndex] = budget;
      } else {
        currentBudgets.push(budget);
      }

      await saveBudgets(currentBudgets);

      setBudgetAmount('');
      setSelectedCategory('');

      Alert.alert('Sukses', 'Budget berhasil ditetapkan');
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan budget');
    }
  };

  const currentMonthBudgets = budgets.filter((b) => b.month === currentMonth);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Budget Bulanan</Text>
        <Text style={styles.headerSubtitle}>
          {new Date().toLocaleDateString('id-ID', {
            month: 'long',
            year: 'numeric',
          })}
        </Text>
      </View>

      {/* Set Budget */}
      <Card>
        <Text style={styles.cardTitle}>Tetapkan Budget</Text>

        <View style={styles.categoryContainer}>
          <Text style={styles.label}>Kategori Pengeluaran</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {EXPENSE_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  selectedCategory === cat && styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === cat && styles.categoryButtonTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <FormattedInput
          label="Batas Budget"
          value={budgetAmount}
          onChangeText={setBudgetAmount}
          placeholder="0"
        />

        {/* Balance Info */}
        <View style={styles.balanceInfo}>
          <Text style={styles.balanceLabel}>Total Saldo Tersedia:</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(
              ['Bank', 'Cash', 'E-Wallet'].reduce((total, source) => {
                return (
                  total + calculateBalance(transactions, [], source as any)
                );
              }, 0)
            )}
          </Text>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSetBudget}>
          <Target color="#FFFFFF" size={20} />
          <Text style={styles.submitButtonText}>Tetapkan Budget</Text>
        </TouchableOpacity>
      </Card>

      {/* Budget Overview */}
      <Text style={styles.sectionTitle}>Status Budget Bulan Ini</Text>
      {currentMonthBudgets.length > 0 ? (
        currentMonthBudgets.map((budget) => {
          const spent = getCategorySpending(
            transactions,
            budget.category,
            budget.month
          );
          const percentage = (spent / budget.limit) * 100;
          const isOverBudget = spent > budget.limit;

          return (
            <Card key={`${budget.category}-${budget.month}`}>
              <View style={styles.budgetHeader}>
                <Text style={styles.budgetCategory}>{budget.category}</Text>
                {isOverBudget && <AlertTriangle color="#EF4444" size={20} />}
              </View>

              <View style={styles.budgetAmount}>
                <Text style={styles.budgetSpent}>{formatCurrency(spent)}</Text>
                <Text style={styles.budgetLimit}>
                  dari {formatCurrency(budget.limit)}
                </Text>
              </View>

              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: isOverBudget ? '#EF4444' : '#10B981',
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.progressText,
                    { color: isOverBudget ? '#EF4444' : '#6B7280' },
                  ]}
                >
                  {percentage.toFixed(1)}%
                </Text>
              </View>

              {isOverBudget && (
                <View style={styles.warningContainer}>
                  <Text style={styles.warningText}>
                    Budget terlampaui {formatCurrency(spent - budget.limit)}
                  </Text>
                </View>
              )}
            </Card>
          );
        })
      ) : (
        <Card>
          <View style={styles.emptyState}>
            <Target color="#9CA3AF" size={48} />
            <Text style={styles.emptyStateText}>
              Belum ada budget yang ditetapkan
            </Text>
          </View>
        </Card>
      )}
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
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  balanceInfo: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  balanceLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#0369A1',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#0369A1',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetCategory: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  budgetAmount: {
    marginBottom: 12,
  },
  budgetSpent: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  budgetLimit: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  warningContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
    marginHorizontal: -20,
    marginBottom: -20,
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  warningText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#EF4444',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginTop: 12,
  },
});
