import { store } from '@/store';
import { addExpense, updateExpense, removeExpense, resetToDefaultExpenses } from '@/store/expenseSlice';
export const INCOME_CATEGORIES = [
  'Gaji',
  'Freelance',
  'Investasi',
  'Bonus',
  'Lainnya',
];

// Kategori default
const DEFAULT_EXPENSES = [
  'Makanan',
  'Transport',
  'Hiburan',
  'Belanja',
  'Tagihan',
  'Kesehatan',
  'Pendidikan',
  'Lainnya',
];
export const FUND_SOURCES = ['Bank', 'Cash', 'E-Wallet'] as const;

// Fungsi untuk mendapatkan expenses dari Redux store
export const getExpenses = (): string[] => {
  const state = store.getState();
  return state.expense.expenses.map(expense => expense.name);
};

// Fungsi untuk mendapatkan semua data expenses (termasuk metadata)
export const getExpensesData = () => {
  const state = store.getState();
  return state.expense.expenses;
};

// Fungsi untuk menambah expense
export const addExpenseToStore = (expenseName: string): void => {
  const newExpense = {
    id: Date.now().toString(),
    name: expenseName,
    isDefault: false,
  };
  store.dispatch(addExpense(newExpense));
};

// Fungsi untuk mengubah nama expense (hanya untuk custom expenses)
export const renameExpenseInStore = (oldName: string, newName: string): void => {
  const state = store.getState();
  const expense = state.expense.expenses.find(e => e.name === oldName);
  
  // Hanya bisa rename custom expenses
  if (expense && !expense.isDefault) {
    store.dispatch(updateExpense({ oldName, newName }));
  }
};

// Fungsi untuk menghapus expense (hanya untuk custom expenses)
export const removeExpenseFromStore = (expenseName: string): void => {
  const state = store.getState();
  const expense = state.expense.expenses.find(e => e.name === expenseName);
  
  // Hanya bisa hapus custom expenses
  if (expense && !expense.isDefault) {
    store.dispatch(removeExpense(expenseName));
  }
};

// Fungsi untuk mengatur ulang ke default expenses + custom expenses
export const resetExpensesToDefault = (): void => {
  store.dispatch(resetToDefaultExpenses());
};