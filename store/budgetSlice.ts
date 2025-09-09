import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Budget {
  category: string;
  limit: number;
  month: string; // YYYY-MM format
}

interface BudgetState {
  budgets: Budget[];
}

const initialState: BudgetState = {
  budgets: [],
};

export const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    setBudget: (state, action: PayloadAction<Budget>) => {
      const existingIndex = state.budgets.findIndex(
        b => b.category === action.payload.category && b.month === action.payload.month
      );
      
      if (existingIndex !== -1) {
        state.budgets[existingIndex] = action.payload;
      } else {
        state.budgets.push(action.payload);
      }
    },
    removeBudget: (state, action: PayloadAction<{ category: string; month: string }>) => {
      state.budgets = state.budgets.filter(
        b => !(b.category === action.payload.category && b.month === action.payload.month)
      );
    },
    setBudgets: (state, action: PayloadAction<Budget[]>) => {
      state.budgets = action.payload;
    },
  },
});

export const { setBudget, removeBudget, setBudgets } = budgetSlice.actions;
export default budgetSlice.reducer;