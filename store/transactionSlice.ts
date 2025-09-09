import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  source: 'Bank' | 'Cash' | 'E-Wallet';
  date: string;
  description?: string;
}

interface TransactionState {
  transactions: Transaction[];
}

const initialState: TransactionState = {
  transactions: [],
};

export const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.push(action.payload);
    },
    removeTransaction: (state, action: PayloadAction<string>) => {
      state.transactions = state.transactions.filter(t => t.id !== action.payload);
    },
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
    },
  },
});

export const { addTransaction, removeTransaction, setTransactions } = transactionSlice.actions;
export default transactionSlice.reducer;