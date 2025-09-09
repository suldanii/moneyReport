import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '@/store/transactionSlice';
import { Budget } from '@/store/budgetSlice';
import { Transfer } from '@/store/balanceSlice';

const STORAGE_KEYS = {
  TRANSACTIONS: 'budgeting_transactions',
  BUDGETS: 'budgeting_budgets',
  TRANSFERS: 'budgeting_transfers',
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