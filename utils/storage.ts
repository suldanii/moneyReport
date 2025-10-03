import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '@/store/transactionSlice';
import { Budget } from '@/store/budgetSlice';
import { Transfer } from '@/store/balanceSlice';
import { Expense } from '@/store/expenseSlice';

const STORAGE_KEYS = {
  TRANSACTIONS: 'budgeting_transactions',
  BUDGETS: 'budgeting_budgets',
  TRANSFERS: 'budgeting_transfers',
  EXPENSES: 'expenses', // Key baru untuk expenses
};

export const saveTransactions = async (transactions: Transaction[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transactions:', error);
  }
};

export const loadTransactions = async (): Promise<Transaction[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading transactions:', error);
    return [];
  }
};

export const saveBudgets = async (budgets: Budget[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  } catch (error) {
    console.error('Error saving budgets:', error);
  }
};

export const loadBudgets = async (): Promise<Budget[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.BUDGETS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading budgets:', error);
    return [];
  }
};

// Default expenses untuk inisialisasi
const DEFAULT_EXPENSES: Expense[] = [
  { id: '1', name: 'Makanan', isDefault: true },
  { id: '2', name: 'Transport', isDefault: true },
  { id: '3', name: 'Hiburan', isDefault: true },
  { id: '4', name: 'Belanja', isDefault: true },
  { id: '5', name: 'Tagihan', isDefault: true },
  { id: '6', name: 'Kesehatan', isDefault: true },
  { id: '7', name: 'Pendidikan', isDefault: true },
  { id: '8', name: 'Lainnya', isDefault: true },
];

export const saveExpenses = async (expenses: Expense[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (error) {
    console.error('Error saving expenses:', error);
  }
};

export const loadExpenses = async (): Promise<Expense[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (data) {
      return JSON.parse(data);
    } else {
      // Jika pertama kali, simpan default expenses
      await saveExpenses(DEFAULT_EXPENSES);
      return DEFAULT_EXPENSES;
    }
  } catch (error) {
    console.error('Error loading expenses:', error);
    return DEFAULT_EXPENSES;
  }
};

export const saveTransfers = async (transfers: Transfer[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(transfers));
  } catch (error) {
    console.error('Error saving transfers:', error);
  }
};

export const loadTransfers = async (): Promise<Transfer[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TRANSFERS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading transfers:', error);
    return [];
  }
};

export const exportData = async () => {
  try {
    const transactions = await loadTransactions();
    const budgets = await loadBudgets();
    const transfers = await loadTransfers();
    
    return {
      transactions,
      budgets,
      transfers,
      exportDate: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
};

export const importData = async (data: any) => {
  try {
    if (data.transactions) await saveTransactions(data.transactions);
    if (data.budgets) await saveBudgets(data.budgets);
    if (data.transfers) await saveTransfers(data.transfers);
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
};