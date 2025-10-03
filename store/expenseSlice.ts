import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Expense {
  id: string;
  name: string;
  isDefault?: boolean;
}

interface ExpenseState {
  expenses: Expense[];
}

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

const initialState: ExpenseState = {
  expenses: DEFAULT_EXPENSES,
};

export const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    addExpense: (state, action: PayloadAction<Expense>) => {
      const existingIndex = state.expenses.findIndex(
        expense => expense.name.toLowerCase() === action.payload.name.toLowerCase()
      );
      
      if (existingIndex === -1) {
        const newExpense = { ...action.payload, isDefault: false };
        state.expenses.push(newExpense);
      }
    },
    removeExpense: (state, action: PayloadAction<string>) => {
      state.expenses = state.expenses.filter(
        expense => !(expense.name === action.payload && !expense.isDefault)
      );
    },
    updateExpense: (state, action: PayloadAction<{ oldName: string; newName: string }>) => {
      const index = state.expenses.findIndex(
        expense => expense.name === action.payload.oldName
      );
      
      if (index !== -1 && !state.expenses[index].isDefault) {
        state.expenses[index].name = action.payload.newName;
      }
    },
    setExpenses: (state, action: PayloadAction<Expense[]>) => {
      state.expenses = action.payload;
    },
    resetToDefaultExpenses: (state) => {
      const customExpenses = state.expenses.filter(expense => !expense.isDefault);
      state.expenses = [...DEFAULT_EXPENSES, ...customExpenses];
    },
  },
});

export const { 
  addExpense, 
  removeExpense, 
  updateExpense, 
  setExpenses,
  resetToDefaultExpenses 
} = expenseSlice.actions;

export default expenseSlice.reducer;